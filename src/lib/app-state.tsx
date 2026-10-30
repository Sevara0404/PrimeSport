import * as Location from 'expo-location';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { DEMO_USER_ID } from '@/db/seed';

import { TASHKENT_CENTER, type Coords } from './geo';

export const CITY_CENTERS: Record<string, Coords> = {
  Tashkent: TASHKENT_CENTER,
  Samarkand: { latitude: 39.6542, longitude: 66.9597 },
};

export type UserLocation = {
  coords: Coords;
  /** False when we fell back to the selected city's centre. */
  isDevice: boolean;
};

type AppState = {
  /** Until sign-in exists, everyone uses the demo user (see the brief, section 9). */
  userId: number;
  city: string;
  setCity: (city: string) => void;
  /** Asks for location permission once, then reuses the answer. */
  getUserLocation: () => Promise<UserLocation>;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [city, setCity] = useState('Tashkent');
  const deviceCoords = useRef<Promise<Coords | null> | null>(null);

  const getUserLocation = useCallback(async (): Promise<UserLocation> => {
    deviceCoords.current ??= readDeviceCoords();
    const coords = await deviceCoords.current;
    if (coords) return { coords, isDevice: true };
    return { coords: CITY_CENTERS[city] ?? TASHKENT_CENTER, isDevice: false };
  }, [city]);

  const value = useMemo(
    () => ({ userId: DEMO_USER_ID, city, setCity, getUserLocation }),
    [city, getUserLocation],
  );
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

async function readDeviceCoords(): Promise<Coords | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    return null;
  }
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
