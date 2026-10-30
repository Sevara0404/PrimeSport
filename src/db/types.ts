export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type Sport = {
  sport_id: number;
  name: string;
  icon: string;
  status: 'active' | 'inactive';
};

export type Organizer = {
  organizer_id: number;
  name: string;
  logo: string | null;
  description: string | null;
  verified: number;
};

/** An event joined with its sport and organizer, as the screens display it. */
export type EventListItem = {
  event_id: number;
  title: string;
  sport_id: number;
  sport_name: string;
  sport_icon: string;
  organizer_id: number;
  organizer_name: string;
  organizer_verified: number;
  image: string | null;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  location: string;
  city: string;
  latitude: number;
  longitude: number;
  price: number; // UZS, 0 = free
  verified: number;
  status: EventStatus;
  is_sample: number;
  is_saved: number;
  is_registered: number;
};

export type EventDetails = EventListItem & {
  description: string;
  organizer_description: string | null;
  organizer_logo: string | null;
  last_updated: string;
};

export type User = {
  user_id: number;
  name: string;
  email: string;
  profile_image: string | null;
};
