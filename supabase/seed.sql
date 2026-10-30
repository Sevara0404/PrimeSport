-- SAMPLE DATA, matching the app's built-in demo events (is_sample = true).
-- Organizers are fictional and verification flags only demonstrate the badge.
-- Delete these rows once real organizers and events are added.
insert into public.sports (sport_id, name, icon) values
  (1, 'Football', 'soccer'), (2, 'Basketball', 'basketball'), (3, 'Tennis', 'tennis'),
  (4, 'Volleyball', 'volleyball'), (5, 'Athletics', 'run-fast'), (6, 'Boshqa', 'dots-horizontal');

insert into public.organizers (organizer_id, name, description, verified) overriding system value values
  (1, 'Hoops Tashkent (sample)', 'Community basketball club running city leagues and cups.', true),
  (2, 'Capital Tennis Academy (sample)', 'Tennis coaching and open tournaments for all levels.', true),
  (3, 'Prime Judo Club (sample)', 'Judo club hosting youth and adult championships.', false),
  (4, 'Run Together Tashkent (sample)', 'Free weekly runs and athletics open days.', false),
  (5, 'Chilanzar Football Community (sample)', 'Amateur five-a-side leagues and evening games.', true),
  (6, 'Sand & Sun Volleyball (sample)', 'Social volleyball meetups and weekend tournaments.', false),
  (7, 'Samarkand Runners (sample)', 'Running community organizing races in Samarkand.', false);
select setval(pg_get_serial_sequence('public.organizers', 'organizer_id'), (select max(organizer_id) from public.organizers));

insert into public.events (event_id, title, sport_id, organizer_id, image, date, start_time, location, city,
  latitude, longitude, description, price, verified, status, is_sample) overriding system value values
  (1, 'Tashkent Basketball Cup', 2, 1, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=75&fm=jpg&fit=crop', current_date + 2, '18:00', 'Humo Arena', 'Tashkent',
   41.3404, 69.2869, 'A three-day amateur basketball cup for teams of 5 to 8 players. Group stage, knockouts and a final under the arena lights. Teams register as a group, spectators are welcome.', 50000, true, 'upcoming', true),
  (2, 'Tennis Open Tashkent', 3, 2, 'https://images.unsplash.com/photo-1632755898125-36cd72575dde?w=800&q=75&fm=jpg&fit=crop', current_date + 4, '09:00', 'Yunusabad Tennis Courts', 'Tashkent',
   41.364, 69.286, 'Open singles tournament with beginner, intermediate and advanced draws. Balls provided, bring your own racket. Every player gets at least two matches.', 120000, true, 'upcoming', true),
  (3, 'City Judo Championship', 6, 3, 'https://images.unsplash.com/photo-1603297430252-fdecb501149b?w=800&q=75&fm=jpg&fit=crop', current_date + 9, '10:00', 'Chilanzar Sports Complex', 'Tashkent',
   41.2756, 69.2034, 'City championship for youth and adult judoka across weight categories. Weigh-in opens at 08:30. Free entry for spectators.', 0, false, 'upcoming', true),
  (4, 'Sunday Park Run', 5, 4, 'https://images.unsplash.com/photo-1549896869-ca27eeffe4fb?w=800&q=75&fm=jpg&fit=crop', current_date + 0, '07:30', 'Central Park Loop', 'Tashkent',
   41.3138, 69.2486, 'A free, friendly 5 km run around the park. Walkers and first-time runners are welcome. Meet at the main entrance ten minutes early.', 0, false, 'upcoming', true),
  (5, 'Five-a-Side Evening League', 1, 5, 'https://images.unsplash.com/photo-1503753024571-3e39032c3807?w=800&q=75&fm=jpg&fit=crop', current_date + 1, '20:00', 'Chilanzar Mini Pitch', 'Tashkent',
   41.2822, 69.2101, 'Weekly five-a-side games for amateur players. Join solo and we will place you in a team, or bring your own squad of five.', 30000, true, 'upcoming', true),
  (6, 'Stadium Football Open Day', 1, 5, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=75&fm=jpg&fit=crop', current_date + 6, '16:00', 'Milliy Stadium area', 'Tashkent',
   41.2833, 69.2036, 'Skills stations, small-sided games and a penalty challenge for all ages. A relaxed afternoon to try football with others.', 0, true, 'upcoming', true),
  (7, 'Volleyball Social Mixer', 4, 6, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=75&fm=jpg&fit=crop', current_date + 0, '19:00', 'Magic City Courts', 'Tashkent',
   41.3036, 69.246, 'Mixed teams are drawn on the night, so come alone or with friends. All levels welcome, focus on fun rallies.', 25000, false, 'upcoming', true),
  (8, 'Weekend Volleyball Tournament', 4, 6, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=75&fm=jpg&fit=crop', current_date + 12, '11:00', 'Yunusabad Sports Park', 'Tashkent',
   41.3685, 69.2848, 'Teams of six compete in a one-day tournament with group matches and a final. Prizes for the top three teams.', 80000, false, 'upcoming', true),
  (9, 'Athletics Open Day', 5, 4, 'https://images.unsplash.com/photo-1549896869-ca27eeffe4fb?w=800&q=75&fm=jpg&fit=crop', current_date + 5, '09:30', 'Pakhtakor Stadium track', 'Tashkent',
   41.3153, 69.2731, 'Try sprints, long jump and relays with volunteer coaches. Free for everyone aged 8 and over.', 0, false, 'upcoming', true),
  (10, 'Junior Tennis Clinic', 3, 2, 'https://images.unsplash.com/photo-1632755898125-36cd72575dde?w=800&q=75&fm=jpg&fit=crop', current_date + 3, '15:00', 'Ankhor Tennis Club', 'Tashkent',
   41.326, 69.255, 'Two-hour coaching session for players aged 8 to 14, followed by short practice matches.', 60000, true, 'upcoming', true),
  (11, '3x3 Street Basketball', 2, 1, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=75&fm=jpg&fit=crop', current_date + -3, '17:00', 'Tashkent City Park courts', 'Tashkent',
   41.3168, 69.2426, 'Outdoor 3x3 tournament. This event has finished; results were shared by the organizer.', 0, true, 'completed', true),
  (12, 'Registan Half Marathon', 5, 7, 'https://images.unsplash.com/photo-1549896869-ca27eeffe4fb?w=800&q=75&fm=jpg&fit=crop', current_date + 20, '07:00', 'Registan Square', 'Samarkand',
   39.6547, 66.9758, 'A 21 km course through the historic centre of Samarkand, with a 10 km option for newer runners.', 150000, false, 'upcoming', true),
  (13, 'Samarkand Football Friendly', 1, 7, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=75&fm=jpg&fit=crop', current_date + 8, '18:30', 'Dinamo Stadium area', 'Samarkand',
   39.6542, 66.9597, 'This friendly match was cancelled by the organizer.', 0, false, 'cancelled', true);
select setval(pg_get_serial_sequence('public.events', 'event_id'), (select max(event_id) from public.events));
