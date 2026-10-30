# Prime Sport

**Discover. Participate. Enjoy.**

Sports event discovery and participation app for Tashkent and Uzbekistan. Built with Expo (React Native), so one codebase ships to iOS, Android and the web.

## MVP features

- **Home**: location, brand, search, quick filters (Today, This Week, Near Me, Free), featured event, nearby events, sports grid, call to action.
- **Events**: database-driven list with title search and combinable filters (sport, date, city, Near Me, Free) and an empty state.
- **Event details**: one page for every event, with Save and Register (no duplicates).
- **Map**: event markers with a preview card that opens the event.
- **Saved**: saved events for the current user, which persist across restarts.
- **Profile**: demo user, My Events (registrations), Settings and About.

## Data

Data lives in an on-device SQLite database (`src/db/`). The schema follows the product brief: `sports`, `organizers`, `events`, `users`, `saved_events` and `registrations`, with foreign keys, unique constraints and indexes. Events also have `price` (for the Free filter) and `city` (for city selection).

The app ships with **sample data** (`src/db/seed.ts`): fictional organizers, approximate demo coordinates, and demo verification flags. Every sample event is marked `is_sample` and labelled "Sample event" in the app. Replace this data with real organizer data before launch.

Until sign-in exists, everyone uses a single demo user.

## Run it

```bash
npm install
npx expo start        # scan the QR code with Expo Go on your phone
npx expo start --web  # browser preview
```

Checks: `npx tsc --noEmit` and `npx expo lint`.

## Next steps

1. Move events to a hosted database so organizers can update them without an app release.
2. Add the logo and app icon.
3. Store preparation: privacy policy, store listing, a Google Maps API key for Android, then build and submit with EAS.
