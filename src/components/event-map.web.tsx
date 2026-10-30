import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { Colors } from '@/constants/theme';

import type { EventMapProps } from './event-map.types';

const ZOOM = 12;

// Browser preview of the map, using OpenStreetMap tiles via Leaflet.
export function EventMap({ events, center, selectedId, onSelect, style }: EventMapProps) {
  const container = useRef<HTMLElement | null>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const instance = L.map(element, { zoomControl: true }).setView([center.latitude, center.longitude], ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(instance);
    instance.on('click', () => onSelectRef.current(null));
    layer.current = L.layerGroup().addTo(instance);
    map.current = instance;
    return () => {
      instance.remove();
      map.current = null;
    };
    // The map is created once; centre changes are applied by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    map.current?.setView([center.latitude, center.longitude], ZOOM);
  }, [center]);

  useEffect(() => {
    const group = layer.current;
    if (!group) return;
    group.clearLayers();
    for (const event of events) {
      const selected = event.event_id === selectedId;
      L.circleMarker([event.latitude, event.longitude], {
        radius: selected ? 12 : 9,
        color: Colors.surface,
        weight: 3,
        fillColor: selected ? Colors.primaryDark : Colors.primary,
        fillOpacity: 1,
        // Keep marker clicks from also reaching the map's "close preview" handler.
        bubblingMouseEvents: false,
      })
        .bindTooltip(event.title)
        .on('click', () => onSelectRef.current(event.event_id))
        .addTo(group);
    }
  }, [events, selectedId]);

  return (
    <View
      ref={(node: unknown) => {
        // On web a View renders a DOM element, which Leaflet draws into.
        container.current = node as HTMLElement | null;
      }}
      style={style}
    />
  );
}
