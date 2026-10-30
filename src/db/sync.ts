import type { SQLiteDatabase } from 'expo-sqlite';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/backend';

/**
 * Pulls the shared event catalogue (sports, organizers, published events) from Supabase
 * into the on-device database. Screens keep reading SQLite, so the app works offline with
 * whatever it synced last (or the built-in sample data on a first offline launch).
 */

type RemoteSport = { sport_id: number; name: string; icon: string; status: string };
type RemoteOrganizer = {
  organizer_id: number;
  name: string;
  logo: string | null;
  description: string | null;
  verified: boolean;
};
type RemoteEvent = {
  event_id: number;
  title: string;
  sport_id: number;
  organizer_id: number;
  image: string | null;
  date: string;
  start_time: string;
  location: string;
  city: string;
  latitude: number;
  longitude: number;
  description: string;
  price: number;
  verified: boolean;
  status: string;
  is_sample: boolean;
  last_updated: string;
};

const TIMEOUT_MS = 10_000;

async function fetchTable<T>(path: string): Promise<T[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      // Publishable (sb_publishable_) keys go in the apikey header only; they are not JWTs.
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Supabase ${path.split('?')[0]} returned ${response.status}`);
    }
    return (await response.json()) as T[];
  } finally {
    clearTimeout(timer);
  }
}

export type SyncResult = { events: number } | { skipped: string };

export async function syncCatalog(db: SQLiteDatabase): Promise<SyncResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { skipped: 'not configured' };

  const [sports, organizers, events] = await Promise.all([
    fetchTable<RemoteSport>('sports?select=sport_id,name,icon,status'),
    fetchTable<RemoteOrganizer>('organizers?select=organizer_id,name,logo,description,verified'),
    fetchTable<RemoteEvent>(
      'events?select=event_id,title,sport_id,organizer_id,image,date,start_time,location,city,' +
        'latitude,longitude,description,price,verified,status,is_sample,last_updated',
    ),
  ]);
  // An empty catalogue almost certainly means a misconfigured backend, not "delete everything".
  if (events.length === 0) return { skipped: 'no remote events' };

  await db.withTransactionAsync(async () => {
    for (const s of sports) {
      await db.runAsync(
        `INSERT INTO sports (sport_id, name, icon, status) VALUES (?, ?, ?, ?)
         ON CONFLICT (sport_id) DO UPDATE SET name = excluded.name, icon = excluded.icon,
           status = excluded.status`,
        s.sport_id,
        s.name,
        s.icon,
        s.status,
      );
    }
    for (const o of organizers) {
      await db.runAsync(
        `INSERT INTO organizers (organizer_id, name, logo, description, verified) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (organizer_id) DO UPDATE SET name = excluded.name, logo = excluded.logo,
           description = excluded.description, verified = excluded.verified`,
        o.organizer_id,
        o.name,
        o.logo,
        o.description,
        o.verified ? 1 : 0,
      );
    }
    for (const e of events) {
      await db.runAsync(
        `INSERT INTO events (event_id, title, sport_id, organizer_id, image, date, start_time, location,
           city, latitude, longitude, description, price, verified, status, is_sample, last_updated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (event_id) DO UPDATE SET title = excluded.title, sport_id = excluded.sport_id,
           organizer_id = excluded.organizer_id, image = excluded.image, date = excluded.date,
           start_time = excluded.start_time, location = excluded.location, city = excluded.city,
           latitude = excluded.latitude, longitude = excluded.longitude,
           description = excluded.description, price = excluded.price, verified = excluded.verified,
           status = excluded.status, is_sample = excluded.is_sample, last_updated = excluded.last_updated`,
        e.event_id,
        e.title,
        e.sport_id,
        e.organizer_id,
        e.image,
        e.date,
        e.start_time.slice(0, 5), // Postgres sends HH:MM:SS
        e.location,
        e.city,
        e.latitude,
        e.longitude,
        e.description,
        e.price,
        e.verified ? 1 : 0,
        e.status,
        e.is_sample ? 1 : 0,
        e.last_updated,
      );
    }
    // Events removed or unpublished in the dashboard disappear from the app too
    // (their saved/registration rows cascade with them).
    const ids = events.map((e) => e.event_id);
    await db.runAsync(
      `DELETE FROM events WHERE event_id NOT IN (${ids.map(() => '?').join(', ')})`,
      ...ids,
    );
  });
  return { events: events.length };
}
