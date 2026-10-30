import type { SQLiteDatabase } from 'expo-sqlite';

import { thisWeekRange, toDateKey } from '@/lib/dates';
import { distanceKm, type Coords } from '@/lib/geo';

import type { EventDetails, EventListItem, Sport, User } from './types';

export type DateFilter = 'today' | 'week';

export type EventFilters = {
  query?: string;
  sportId?: number | null;
  date?: DateFilter | null;
  city?: string | null;
  freeOnly?: boolean;
  /** Keep events within `radiusKm` of `origin`. */
  near?: { origin: Coords; radiusKm: number } | null;
};

const EVENT_COLUMNS = `
  e.event_id, e.title, e.sport_id, s.name AS sport_name, s.icon AS sport_icon,
  e.organizer_id, o.name AS organizer_name, o.verified AS organizer_verified,
  e.image, e.date, e.start_time, e.location, e.city, e.latitude, e.longitude,
  e.price, e.verified, e.status, e.is_sample,
  EXISTS (SELECT 1 FROM saved_events se WHERE se.event_id = e.event_id AND se.user_id = $userId) AS is_saved,
  EXISTS (SELECT 1 FROM registrations r WHERE r.event_id = e.event_id AND r.user_id = $userId
          AND r.status = 'confirmed') AS is_registered
`;

const EVENT_FROM = `
  FROM events e
  JOIN sports s ON s.sport_id = e.sport_id
  JOIN organizers o ON o.organizer_id = e.organizer_id
`;

// Active events first (soonest at the top), then finished or cancelled ones.
const EVENT_ORDER = `
  ORDER BY CASE WHEN e.status IN ('upcoming', 'ongoing') THEN 0 ELSE 1 END,
    CASE WHEN e.status IN ('upcoming', 'ongoing') THEN e.date END ASC,
    e.date DESC, e.start_time ASC
`;

type Params = Record<string, string | number>;

export async function listEvents(
  db: SQLiteDatabase,
  userId: number,
  filters: EventFilters = {},
): Promise<EventListItem[]> {
  const where: string[] = [];
  const params: Params = { $userId: userId };

  const query = filters.query?.trim();
  if (query) {
    // Escape LIKE wildcards so "%" or "_" in a search are matched literally.
    where.push(`e.title LIKE $query ESCAPE '\\'`);
    params.$query = `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  }
  if (filters.sportId) {
    where.push('e.sport_id = $sportId');
    params.$sportId = filters.sportId;
  }
  if (filters.date === 'today') {
    where.push('e.date = $today');
    params.$today = toDateKey(new Date());
  } else if (filters.date === 'week') {
    const { from, to } = thisWeekRange();
    where.push('e.date BETWEEN $from AND $to');
    params.$from = from;
    params.$to = to;
  }
  if (filters.date) {
    // Date filters are about things you can still attend.
    where.push(`e.status IN ('upcoming', 'ongoing')`);
  }
  if (filters.city) {
    where.push('e.city = $city');
    params.$city = filters.city;
  }
  if (filters.freeOnly) {
    where.push('e.price = 0');
  }

  const sql = `SELECT ${EVENT_COLUMNS} ${EVENT_FROM}
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ${EVENT_ORDER}`;
  const rows = await db.getAllAsync<EventListItem>(sql, params);

  const near = filters.near;
  if (!near) return rows;
  return rows.filter((row) => distanceKm(near.origin, row) <= near.radiusKm);
}

export async function getEvent(
  db: SQLiteDatabase,
  userId: number,
  eventId: number,
): Promise<EventDetails | null> {
  return db.getFirstAsync<EventDetails>(
    `SELECT ${EVENT_COLUMNS}, e.description, e.last_updated,
       o.description AS organizer_description, o.logo AS organizer_logo
     ${EVENT_FROM}
     WHERE e.event_id = $eventId`,
    { $userId: userId, $eventId: eventId },
  );
}

export async function listSavedEvents(db: SQLiteDatabase, userId: number) {
  return db.getAllAsync<EventListItem>(
    `SELECT ${EVENT_COLUMNS} ${EVENT_FROM}
     JOIN saved_events saved ON saved.event_id = e.event_id AND saved.user_id = $userId
     ORDER BY saved.saved_at DESC`,
    { $userId: userId },
  );
}

export async function listRegisteredEvents(db: SQLiteDatabase, userId: number) {
  return db.getAllAsync<EventListItem>(
    `SELECT ${EVENT_COLUMNS} ${EVENT_FROM}
     JOIN registrations reg ON reg.event_id = e.event_id AND reg.user_id = $userId
       AND reg.status = 'confirmed'
     ${EVENT_ORDER}`,
    { $userId: userId },
  );
}

export async function setEventSaved(db: SQLiteDatabase, userId: number, eventId: number, saved: boolean) {
  if (saved) {
    // The UNIQUE (user_id, event_id) constraint makes repeated saves a no-op.
    await db.runAsync(
      'INSERT OR IGNORE INTO saved_events (user_id, event_id, saved_at) VALUES (?, ?, ?)',
      userId,
      eventId,
      new Date().toISOString(),
    );
  } else {
    await db.runAsync('DELETE FROM saved_events WHERE user_id = ? AND event_id = ?', userId, eventId);
  }
}

export type RegisterResult = 'registered' | 'already_registered' | 'not_open';

export async function registerForEvent(
  db: SQLiteDatabase,
  userId: number,
  eventId: number,
): Promise<RegisterResult> {
  const event = await db.getFirstAsync<{ status: string }>(
    'SELECT status FROM events WHERE event_id = ?',
    eventId,
  );
  if (!event || (event.status !== 'upcoming' && event.status !== 'ongoing')) {
    return 'not_open';
  }
  const result = await db.runAsync(
    `INSERT INTO registrations (user_id, event_id, registration_date, status)
     VALUES (?, ?, ?, 'confirmed')
     ON CONFLICT (user_id, event_id) DO UPDATE SET status = 'confirmed',
       registration_date = excluded.registration_date
     WHERE registrations.status <> 'confirmed'`,
    userId,
    eventId,
    new Date().toISOString(),
  );
  return result.changes > 0 ? 'registered' : 'already_registered';
}

export async function cancelRegistration(db: SQLiteDatabase, userId: number, eventId: number) {
  await db.runAsync(
    `UPDATE registrations SET status = 'cancelled' WHERE user_id = ? AND event_id = ?`,
    userId,
    eventId,
  );
}

/**
 * Active sports that have at least one event, busiest first. The catalogue can hold ~100
 * sports, so screens only list the ones people can actually find events for.
 */
export async function listSports(db: SQLiteDatabase) {
  return db.getAllAsync<Sport>(
    `SELECT s.sport_id, s.name, s.icon, s.status
     FROM sports s
     JOIN events e ON e.sport_id = s.sport_id
     WHERE s.status = 'active'
     GROUP BY s.sport_id
     ORDER BY SUM(CASE WHEN e.status IN ('upcoming', 'ongoing') THEN 1 ELSE 0 END) DESC, s.name`,
  );
}

export async function listCities(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{ city: string }>('SELECT DISTINCT city FROM events ORDER BY city');
  return rows.map((r) => r.city);
}

export async function getUser(db: SQLiteDatabase, userId: number) {
  return db.getFirstAsync<User>(
    'SELECT user_id, name, email, profile_image FROM users WHERE user_id = ?',
    userId,
  );
}
