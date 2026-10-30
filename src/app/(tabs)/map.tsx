import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { openEvent } from '@/components/event-card';
import { EventImage } from '@/components/event-image';
import { EventMap } from '@/components/event-map';
import { SportFilterRow } from '@/components/filters';
import { AppText, Button, ErrorState, Icon, LoadingState, Screen, VerifiedBadge } from '@/components/ui';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { listEvents, listSports } from '@/db/events';
import { useDbQuery } from '@/hooks/use-db-query';
import { CITY_CENTERS, useAppState } from '@/lib/app-state';
import { formatEventDate } from '@/lib/dates';
import { TASHKENT_CENTER } from '@/lib/geo';

export default function MapPage() {
  const { userId, city } = useAppState();
  const [sportId, setSportId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, error, reload } = useDbQuery(
    useCallback(
      async (db) => {
        const [events, sports] = await Promise.all([
          // The map shows everything you can still attend, in every city.
          listEvents(db, userId, { sportId }),
          listSports(db),
        ]);
        return {
          events: events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing'),
          sports,
        };
      },
      [userId, sportId],
    ),
  );

  const center = useMemo(() => CITY_CENTERS[city] ?? TASHKENT_CENTER, [city]);
  const selected = data?.events.find((e) => e.event_id === selectedId) ?? null;
  const hasSample = data?.events.some((e) => e.is_sample);

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <AppText variant="heading">Map</AppText>
        {hasSample ? <AppText variant="caption">Sample events at approximate demo locations.</AppText> : null}
      </View>
      {data ? (
        <View style={styles.filters}>
          <SportFilterRow
            sports={data.sports}
            selected={sportId}
            onSelect={(id) => {
              setSportId(id);
              setSelectedId(null);
            }}
          />
        </View>
      ) : null}

      <View style={styles.mapFrame}>
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data ? (
          <LoadingState />
        ) : (
          <EventMap
            events={data.events}
            center={center}
            selectedId={selectedId}
            onSelect={setSelectedId}
            style={styles.map}
          />
        )}

        {selected ? (
          <View style={styles.preview}>
            <Pressable
              onPress={() => setSelectedId(null)}
              hitSlop={10}
              accessibilityLabel="Close preview"
              style={styles.close}>
              <Icon name="close" size={18} color={Colors.textSecondary} />
            </Pressable>
            <View style={styles.previewRow}>
              <EventImage
                uri={selected.image}
                sportId={selected.sport_id}
                sportIcon={selected.sport_icon}
                style={styles.previewImage}
                iconSize={28}
              />
              <View style={styles.previewText}>
                <AppText variant="title" numberOfLines={2}>
                  {selected.title}
                </AppText>
                <AppText variant="secondary">
                  {formatEventDate(selected.date)} · {selected.start_time}
                </AppText>
                <AppText variant="secondary" numberOfLines={1}>
                  {selected.location}, {selected.city}
                </AppText>
                {selected.verified ? <VerifiedBadge small /> : null}
              </View>
            </View>
            <Button label="View Details" onPress={() => openEvent(selected.event_id)} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 2 },
  filters: { paddingVertical: Spacing.md },
  mapFrame: { flex: 1, overflow: 'hidden' },
  map: { flex: 1, width: '100%', height: '100%' },
  preview: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    zIndex: 1000,
    ...Shadow,
  },
  close: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, zIndex: 1, padding: 4 },
  previewRow: { flexDirection: 'row', gap: Spacing.md, paddingRight: Spacing.lg },
  previewImage: { width: 72, height: 72, borderRadius: Radius.md },
  previewText: { flex: 1, gap: 2 },
});
