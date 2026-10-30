import { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';

import { Colors } from '@/constants/theme';

import type { EventMapProps } from './event-map.types';

const DELTA = 0.12;

export function EventMap({ events, center, selectedId, onSelect, style }: EventMapProps) {
  const map = useRef<MapView>(null);

  useEffect(() => {
    map.current?.animateToRegion({ ...center, latitudeDelta: DELTA, longitudeDelta: DELTA }, 300);
  }, [center]);

  return (
    <MapView
      ref={map}
      style={style}
      initialRegion={{ ...center, latitudeDelta: DELTA, longitudeDelta: DELTA }}
      showsUserLocation
      onPress={(e) => {
        // Tapping empty map closes the preview; marker taps are handled below.
        if (e.nativeEvent.action !== 'marker-press') onSelect(null);
      }}>
      {events.map((event) => (
        <Marker
          key={event.event_id}
          identifier={String(event.event_id)}
          coordinate={{ latitude: event.latitude, longitude: event.longitude }}
          pinColor={event.event_id === selectedId ? Colors.primaryDark : Colors.primary}
          onPress={(e) => {
            e.stopPropagation();
            onSelect(event.event_id);
          }}
          accessibilityLabel={event.title}
        />
      ))}
    </MapView>
  );
}
