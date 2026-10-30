import type { SQLiteDatabase } from 'expo-sqlite';

import { seedSampleData } from './seed';

const SCHEMA_VERSION = 1;

// Mirrors the relational model in the product brief. Kept portable so it can move
// to a hosted Postgres database (e.g. Supabase) when organizers start adding events.
const SCHEMA_V1 = `
CREATE TABLE sports (
  sport_id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE organizers (
  organizer_id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  logo TEXT,
  description TEXT,
  verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0, 1))
);

CREATE TABLE events (
  event_id INTEGER PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  sport_id INTEGER NOT NULL REFERENCES sports (sport_id),
  organizer_id INTEGER NOT NULL REFERENCES organizers (organizer_id),
  image TEXT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude REAL NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude REAL NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  is_sample INTEGER NOT NULL DEFAULT 0 CHECK (is_sample IN (0, 1)),
  last_updated TEXT NOT NULL
);
CREATE INDEX idx_events_date ON events (date);
CREATE INDEX idx_events_sport ON events (sport_id);
CREATE INDEX idx_events_city ON events (city);
CREATE INDEX idx_events_organizer ON events (organizer_id);

CREATE TABLE users (
  user_id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  profile_image TEXT
);

CREATE TABLE saved_events (
  saved_event_id INTEGER PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events (event_id) ON DELETE CASCADE,
  saved_at TEXT NOT NULL,
  UNIQUE (user_id, event_id)
);
CREATE INDEX idx_saved_events_user ON saved_events (user_id);

CREATE TABLE registrations (
  registration_id INTEGER PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events (event_id) ON DELETE CASCADE,
  registration_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  UNIQUE (user_id, event_id)
);
CREATE INDEX idx_registrations_user ON registrations (user_id);
`;

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if (version === null) {
    throw new Error('Could not read the database schema version');
  }
  if (version.user_version > SCHEMA_VERSION) {
    throw new Error('Database schema is newer than this app supports');
  }
  if (version.user_version === SCHEMA_VERSION) {
    return;
  }

  await db.withTransactionAsync(async () => {
    if (version.user_version < 1) {
      await db.execAsync(SCHEMA_V1);
      await seedSampleData(db);
    }
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}
