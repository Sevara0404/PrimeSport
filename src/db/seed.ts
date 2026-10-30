import type { SQLiteDatabase } from 'expo-sqlite';

import { toDateKey } from '@/lib/dates';

/**
 * SAMPLE DATA for the clickable MVP.
 *
 * Every event is flagged `is_sample = 1` and shown as "Sample event" in the app.
 * Organizers are fictional, coordinates are approximate demo locations, and the
 * verified flags only demonstrate the badge. Replace this with real organizer data
 * before launch: never ship invented verification.
 */

export const DEMO_USER_ID = 1;

const SPORTS: [number, string, string][] = [
  [1, 'Football', 'soccer'],
  [2, 'Basketball', 'basketball'],
  [3, 'Tennis', 'tennis'],
  [4, 'Volleyball', 'volleyball'],
  [5, 'Athletics', 'run-fast'],
  [6, 'Other', 'trophy-outline'],
];

const ORGANIZERS: [number, string, string, number][] = [
  [1, 'Hoops Tashkent (sample)', 'Community basketball club running city leagues and cups.', 1],
  [2, 'Capital Tennis Academy (sample)', 'Tennis coaching and open tournaments for all levels.', 1],
  [3, 'Prime Judo Club (sample)', 'Judo club hosting youth and adult championships.', 0],
  [4, 'Run Together Tashkent (sample)', 'Free weekly runs and athletics open days.', 0],
  [5, 'Chilanzar Football Community (sample)', 'Amateur five-a-side leagues and evening games.', 1],
  [6, 'Sand & Sun Volleyball (sample)', 'Social volleyball meetups and weekend tournaments.', 0],
  [7, 'Samarkand Runners (sample)', 'Running community organizing races in Samarkand.', 0],
];

type SeedEvent = {
  title: string;
  sport: number;
  organizer: number;
  dayOffset: number;
  time: string;
  location: string;
  city: string;
  lat: number;
  lng: number;
  price: number;
  verified: number;
  status?: string;
  description: string;
};

const EVENTS: SeedEvent[] = [
  {
    title: 'Tashkent Basketball Cup',
    sport: 2,
    organizer: 1,
    dayOffset: 2,
    time: '18:00',
    location: 'Humo Arena',
    city: 'Tashkent',
    lat: 41.3404,
    lng: 69.2869,
    price: 50000,
    verified: 1,
    description:
      'A three-day amateur basketball cup for teams of 5 to 8 players. Group stage, knockouts and a final under the arena lights. Teams register as a group, spectators are welcome.',
  },
  {
    title: 'Tennis Open Tashkent',
    sport: 3,
    organizer: 2,
    dayOffset: 4,
    time: '09:00',
    location: 'Yunusabad Tennis Courts',
    city: 'Tashkent',
    lat: 41.364,
    lng: 69.286,
    price: 120000,
    verified: 1,
    description:
      'Open singles tournament with beginner, intermediate and advanced draws. Balls provided, bring your own racket. Every player gets at least two matches.',
  },
  {
    title: 'City Judo Championship',
    sport: 6,
    organizer: 3,
    dayOffset: 9,
    time: '10:00',
    location: 'Chilanzar Sports Complex',
    city: 'Tashkent',
    lat: 41.2756,
    lng: 69.2034,
    price: 0,
    verified: 0,
    description:
      'City championship for youth and adult judoka across weight categories. Weigh-in opens at 08:30. Free entry for spectators.',
  },
  {
    title: 'Sunday Park Run',
    sport: 5,
    organizer: 4,
    dayOffset: 0,
    time: '07:30',
    location: 'Central Park Loop',
    city: 'Tashkent',
    lat: 41.3138,
    lng: 69.2486,
    price: 0,
    verified: 0,
    description:
      'A free, friendly 5 km run around the park. Walkers and first-time runners are welcome. Meet at the main entrance ten minutes early.',
  },
  {
    title: 'Five-a-Side Evening League',
    sport: 1,
    organizer: 5,
    dayOffset: 1,
    time: '20:00',
    location: 'Chilanzar Mini Pitch',
    city: 'Tashkent',
    lat: 41.2822,
    lng: 69.2101,
    price: 30000,
    verified: 1,
    description:
      'Weekly five-a-side games for amateur players. Join solo and we will place you in a team, or bring your own squad of five.',
  },
  {
    title: 'Stadium Football Open Day',
    sport: 1,
    organizer: 5,
    dayOffset: 6,
    time: '16:00',
    location: 'Milliy Stadium area',
    city: 'Tashkent',
    lat: 41.2833,
    lng: 69.2036,
    price: 0,
    verified: 1,
    description:
      'Skills stations, small-sided games and a penalty challenge for all ages. A relaxed afternoon to try football with others.',
  },
  {
    title: 'Volleyball Social Mixer',
    sport: 4,
    organizer: 6,
    dayOffset: 0,
    time: '19:00',
    location: 'Magic City Courts',
    city: 'Tashkent',
    lat: 41.3036,
    lng: 69.246,
    price: 25000,
    verified: 0,
    description:
      'Mixed teams are drawn on the night, so come alone or with friends. All levels welcome, focus on fun rallies.',
  },
  {
    title: 'Weekend Volleyball Tournament',
    sport: 4,
    organizer: 6,
    dayOffset: 12,
    time: '11:00',
    location: 'Yunusabad Sports Park',
    city: 'Tashkent',
    lat: 41.3685,
    lng: 69.2848,
    price: 80000,
    verified: 0,
    description:
      'Teams of six compete in a one-day tournament with group matches and a final. Prizes for the top three teams.',
  },
  {
    title: 'Athletics Open Day',
    sport: 5,
    organizer: 4,
    dayOffset: 5,
    time: '09:30',
    location: 'Pakhtakor Stadium track',
    city: 'Tashkent',
    lat: 41.3153,
    lng: 69.2731,
    price: 0,
    verified: 0,
    description:
      'Try sprints, long jump and relays with volunteer coaches. Free for everyone aged 8 and over.',
  },
  {
    title: 'Junior Tennis Clinic',
    sport: 3,
    organizer: 2,
    dayOffset: 3,
    time: '15:00',
    location: 'Ankhor Tennis Club',
    city: 'Tashkent',
    lat: 41.326,
    lng: 69.255,
    price: 60000,
    verified: 1,
    description: 'Two-hour coaching session for players aged 8 to 14, followed by short practice matches.',
  },
  {
    title: '3x3 Street Basketball',
    sport: 2,
    organizer: 1,
    dayOffset: -3,
    time: '17:00',
    location: 'Tashkent City Park courts',
    city: 'Tashkent',
    lat: 41.3168,
    lng: 69.2426,
    price: 0,
    verified: 1,
    status: 'completed',
    description: 'Outdoor 3x3 tournament. This event has finished; results were shared by the organizer.',
  },
  {
    title: 'Registan Half Marathon',
    sport: 5,
    organizer: 7,
    dayOffset: 20,
    time: '07:00',
    location: 'Registan Square',
    city: 'Samarkand',
    lat: 39.6547,
    lng: 66.9758,
    price: 150000,
    verified: 0,
    description:
      'A 21 km course through the historic centre of Samarkand, with a 10 km option for newer runners.',
  },
  {
    title: 'Samarkand Football Friendly',
    sport: 1,
    organizer: 7,
    dayOffset: 8,
    time: '18:30',
    location: 'Dinamo Stadium area',
    city: 'Samarkand',
    lat: 39.6542,
    lng: 66.9597,
    price: 0,
    verified: 0,
    status: 'cancelled',
    description: 'This friendly match was cancelled by the organizer.',
  },
];

export async function seedSampleData(db: SQLiteDatabase) {
  const now = new Date().toISOString();

  for (const [id, name, icon] of SPORTS) {
    await db.runAsync('INSERT INTO sports (sport_id, name, icon) VALUES (?, ?, ?)', id, name, icon);
  }
  for (const [id, name, description, verified] of ORGANIZERS) {
    await db.runAsync(
      'INSERT INTO organizers (organizer_id, name, description, verified) VALUES (?, ?, ?, ?)',
      id,
      name,
      description,
      verified,
    );
  }

  const today = new Date();
  for (const e of EVENTS) {
    const date = new Date(today);
    date.setDate(today.getDate() + e.dayOffset);
    await db.runAsync(
      `INSERT INTO events (title, sport_id, organizer_id, image, date, start_time, location, city,
        latitude, longitude, description, price, verified, status, is_sample, last_updated)
       VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      e.title,
      e.sport,
      e.organizer,
      toDateKey(date),
      e.time,
      e.location,
      e.city,
      e.lat,
      e.lng,
      e.description,
      e.price,
      e.verified,
      e.status ?? 'upcoming',
      now,
    );
  }

  await db.runAsync(
    'INSERT INTO users (user_id, name, email) VALUES (?, ?, ?)',
    DEMO_USER_ID,
    'Demo User',
    'demo@example.com',
  );
}
