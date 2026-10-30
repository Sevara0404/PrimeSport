import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { CityPicker } from '@/components/city-picker';
import { EventCard } from '@/components/event-card';
import { QuickFilterRow, SearchBar, SportFilterRow, type QuickFilter } from '@/components/filters';
import { AppText, Button, EmptyState, ErrorState, Icon, LoadingState, Screen } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { listCities, listEvents, listSports, setEventSaved, type EventFilters } from '@/db/events';
import type { EventListItem } from '@/db/types';
import { useDbQuery } from '@/hooks/use-db-query';
import { useAppState } from '@/lib/app-state';
import { NEAR_ME_RADIUS_KM } from '@/lib/geo';

type Params = { q?: string; filter?: string; sport?: string };

const QUICK_KEYS: QuickFilter[] = ['today', 'week', 'near', 'free'];

export default function EventsPage() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<Params>();
  const { userId, city, setCity, getUserLocation } = useAppState();

  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Set<QuickFilter>>(new Set());
  const [sportId, setSportId] = useState<number | null>(null);
  const [allCities, setAllCities] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);

  // Arriving from Home (search, a quick filter or a sport tile) starts a fresh filter set.
  // Applied during render (not in an effect) so the first query already uses them.
  const hasParams = params.q !== undefined || params.filter !== undefined || params.sport !== undefined;
  const paramsKey = hasParams ? `${params.q}|${params.filter}|${params.sport}` : null;
  const [appliedKey, setAppliedKey] = useState<string | null>(null);
  if (paramsKey !== appliedKey) {
    setAppliedKey(paramsKey);
    if (paramsKey !== null) {
      setQuery(params.q ?? '');
      const quick = QUICK_KEYS.find((k) => k === params.filter);
      setActive(new Set(quick ? [quick] : []));
      const sport = Number(params.sport);
      setSportId(Number.isInteger(sport) && sport > 0 ? sport : null);
      setAllCities(false);
    }
  }
  // Clear the URL params once applied, so the same shortcut from Home works again later.
  useEffect(() => {
    if (hasParams) router.setParams({ q: undefined, filter: undefined, sport: undefined });
  }, [hasParams]);

  const nearMe = active.has('near');
  const dateFilter = active.has('today') ? 'today' : active.has('week') ? 'week' : null;
  const freeOnly = active.has('free');

  const { data, error, loading, reload } = useDbQuery(
    useCallback(
      async (database) => {
        const filters: EventFilters = {
          query,
          sportId,
          date: dateFilter,
          freeOnly,
          city: allCities ? null : city,
        };
        if (nearMe) {
          const location = await getUserLocation();
          filters.near = { origin: location.coords, radiusKm: NEAR_ME_RADIUS_KM };
          // Near Me already narrows by distance, so it searches across all cities.
          filters.city = null;
          setLocationNote(
            location.isDevice
              ? `Within ${NEAR_ME_RADIUS_KM} km of you`
              : `Location is off, showing events within ${NEAR_ME_RADIUS_KM} km of central ${city}`,
          );
        } else {
          setLocationNote(null);
        }
        const [events, sports, cities] = await Promise.all([
          listEvents(database, userId, filters),
          listSports(database),
          listCities(database),
        ]);
        return { events, sports, cities };
      },
      [userId, query, sportId, dateFilter, freeOnly, nearMe, city, allCities, getUserLocation],
    ),
  );

  const toggleQuick = (key: QuickFilter) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        // Today and This Week are alternatives, not a combination.
        if (key === 'today') next.delete('week');
        if (key === 'week') next.delete('today');
      }
      return next;
    });
  };

  const hasFilters = query.trim() !== '' || active.size > 0 || sportId !== null || allCities;
  const clearFilters = () => {
    setQuery('');
    setActive(new Set());
    setSportId(null);
    setAllCities(false);
  };

  const toggleSave = async (event: EventListItem) => {
    await setEventSaved(db, userId, event.event_id, !event.is_saved);
    reload();
  };

  const header = (
    <View style={styles.header}>
      <AppText variant="heading" style={styles.inset}>
        Events
      </AppText>
      <SearchBar value={query} onChangeText={setQuery} />
      <View style={styles.filterBlock}>
        <QuickFilterRow isActive={(k) => active.has(k)} onToggle={toggleQuick} />
        {data ? <SportFilterRow sports={data.sports} selected={sportId} onSelect={setSportId} /> : null}
      </View>
      <View style={styles.summary}>
        <Pressable
          onPress={() => setPickerOpen(true)}
          disabled={nearMe}
          accessibilityRole="button"
          accessibilityLabel="Change city"
          style={styles.cityButton}>
          <Icon name="map-marker-outline" size={16} color={nearMe ? Colors.textSecondary : Colors.primary} />
          <AppText variant="link" style={nearMe && styles.muted}>
            {nearMe ? 'Near you' : allCities ? 'All cities' : city}
          </AppText>
        </Pressable>
        <AppText variant="secondary">
          {data ? `${data.events.length} ${data.events.length === 1 ? 'event' : 'events'}` : ''}
        </AppText>
        {hasFilters ? (
          <Pressable onPress={clearFilters} hitSlop={8} accessibilityRole="button">
            <AppText variant="link">Clear filters</AppText>
          </Pressable>
        ) : null}
      </View>
      {locationNote ? (
        <AppText variant="caption" style={styles.inset}>
          {locationNote}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <Screen scroll={false}>
      <FlatList
        data={error ? [] : (data?.events ?? [])}
        keyExtractor={(e) => String(e.event_id)}
        renderItem={({ item }) => (
          <View style={styles.inset}>
            <EventCard event={item} onToggleSave={toggleSave} />
          </View>
        )}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : loading || !data ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon="calendar-search"
              title="No events match"
              message={
                hasFilters
                  ? 'Try removing a filter or searching for something else.'
                  : `There are no events in ${city} yet.`
              }
              action={
                hasFilters ? (
                  <Button label="Clear filters" variant="secondary" onPress={clearFilters} />
                ) : !allCities ? (
                  <Button label="Show all cities" variant="secondary" onPress={() => setAllCities(true)} />
                ) : undefined
              }
            />
          )
        }
      />
      {data ? (
        <CityPicker
          visible={pickerOpen}
          cities={['All cities', ...data.cities]}
          selected={allCities ? 'All cities' : city}
          onSelect={(choice) => {
            if (choice === 'All cities') {
              setAllCities(true);
            } else {
              setAllCities(false);
              setCity(choice);
            }
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: Spacing.xxl },
  header: { gap: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  filterBlock: { gap: Spacing.sm },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  cityButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 'auto' },
  muted: { color: Colors.textSecondary },
  inset: { paddingHorizontal: Spacing.lg },
  separator: { height: Spacing.lg },
});
