import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { CityPicker } from '@/components/city-picker';
import { EventCardCompact, FeaturedEventCard } from '@/components/event-card';
import { QuickFilterRow, SearchBar, type QuickFilter } from '@/components/filters';
import {
  AppText,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  SectionHeader,
  type IconName,
} from '@/components/ui';
import { Colors, FontSize, Radius, Shadow, SportColors, Spacing } from '@/constants/theme';
import { listCities, listEvents, listSports } from '@/db/events';
import { useDbQuery } from '@/hooks/use-db-query';
import { CITY_CENTERS, useAppState } from '@/lib/app-state';
import { distanceKm, TASHKENT_CENTER } from '@/lib/geo';

const NEARBY_COUNT = 6;

function goToEvents(params: Record<string, string>) {
  router.navigate({ pathname: '/events', params });
}

export default function HomePage() {
  const { userId, city, setCity } = useAppState();
  const [query, setQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data, error, loading, reload } = useDbQuery(
    useCallback(
      async (db) => {
        const [events, sports, cities] = await Promise.all([
          listEvents(db, userId, { city }),
          listSports(db),
          listCities(db),
        ]);
        const active = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing');
        const featured = active.find((e) => e.verified) ?? active[0] ?? null;
        const center = CITY_CENTERS[city] ?? TASHKENT_CENTER;
        const nearby = active
          .filter((e) => e.event_id !== featured?.event_id)
          .sort((a, b) => distanceKm(center, a) - distanceKm(center, b))
          .slice(0, NEARBY_COUNT);
        return { featured, nearby, sports, cities };
      },
      [userId, city],
    ),
  );

  const submitSearch = () => {
    goToEvents({ q: query.trim() });
  };

  const applyQuickFilter = (key: QuickFilter) => {
    goToEvents({ filter: key, q: query.trim() });
  };

  return (
    <Screen>
      {/* HeaderSection */}
      <View style={styles.header}>
        <Pressable
          onPress={() => setPickerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Joylashuv: ${city}. Shaharni oʻzgartirish`}
          style={styles.location}>
          <Icon name="map-marker" size={20} color={Colors.primary} />
          <AppText style={styles.locationText}>{city}</AppText>
          <Icon name="chevron-down" size={18} color={Colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Profil"
          style={styles.avatar}>
          <Icon name="account" size={24} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* BrandSection */}
      <View style={styles.brand}>
        <AppText variant="heading" style={styles.brandName}>
          PRIME{' '}
          <AppText variant="heading" style={styles.brandAccent}>
            SPORT
          </AppText>
        </AppText>
        <AppText variant="secondary">Discover. Participate. Enjoy.</AppText>
      </View>

      {/* SearchSection */}
      <SearchBar value={query} onChangeText={setQuery} onSubmit={submitSearch} />

      {/* FilterSection */}
      <View style={styles.filters}>
        <QuickFilterRow isActive={() => false} onToggle={applyQuickFilter} />
      </View>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <LoadingState />
      ) : data ? (
        <>
          {/* FeaturedSection */}
          <SectionHeader title="Tavsiya etilgan tadbir" action="Barchasini koʻrish" onAction={() => goToEvents({})} />
          {data.featured ? (
            <FeaturedEventCard event={data.featured} />
          ) : (
            <EmptyState
              icon="calendar-blank-outline"
              title={`${city} shahrida hozircha tadbirlar yoʻq`}
              message="Boshqa shaharni tanlang yoki keyinroq qayting."
            />
          )}

          {/* NearbySection */}
          {data.nearby.length > 0 ? (
            <>
              <SectionHeader title="Yaqin atrofdagi tadbirlar" action="Barchasini koʻrish" onAction={() => goToEvents({})} />
              <FlatList
                horizontal
                data={data.nearby}
                keyExtractor={(e) => String(e.event_id)}
                renderItem={({ item }) => <EventCardCompact event={item} />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              />
            </>
          ) : null}

          {/* SportsSection */}
          <SectionHeader title="Sport turlari" action="Barchasini koʻrish" onAction={() => goToEvents({})} />
          <View style={styles.sportsGrid}>
            {data.sports.map((sport) => (
              <Pressable
                key={sport.sport_id}
                onPress={() => goToEvents({ sport: String(sport.sport_id) })}
                accessibilityRole="button"
                accessibilityLabel={`${sport.name} tadbirlari`}
                style={({ pressed }) => [styles.sportTile, pressed && styles.pressed]}>
                <Icon
                  name={sport.icon as IconName}
                  size={26}
                  color={SportColors[sport.sport_id] ?? Colors.primary}
                />
                <AppText style={styles.sportName}>{sport.name}</AppText>
              </Pressable>
            ))}
          </View>

          <CityPicker
            visible={pickerOpen}
            cities={data.cities}
            selected={city}
            onSelect={setCity}
            onClose={() => setPickerOpen(false)}
          />
        </>
      ) : null}

      {/* CTASection */}
      <View style={styles.cta}>
        <View style={styles.ctaCopy}>
          <AppText style={styles.ctaTitle}>Sport tadbirlarini kashf eting</AppText>
          <AppText style={styles.ctaText}>
            Yaqiningizdagi musobaqalar, turnirlar va sport tadbirlarini toping.
          </AppText>
        </View>
        <Pressable
          onPress={() => goToEvents({})}
          accessibilityRole="button"
          style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}>
          <AppText style={styles.ctaButtonText}>Tadbirlarni koʻrish</AppText>
          <Icon name="chevron-right" size={18} color={Colors.primary} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: Spacing.sm },
  locationText: { fontWeight: '700' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg, gap: 2 },
  brandName: { color: Colors.text },
  brandAccent: { color: Colors.primary },
  filters: { marginTop: Spacing.md },
  carousel: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  sportTile: {
    // Two columns: half the row minus half the gap.
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow,
  },
  sportName: { fontWeight: '600', flexShrink: 1 },
  pressed: { opacity: 0.75 },
  cta: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  ctaCopy: { flexGrow: 1, flexBasis: 200, gap: Spacing.xs },
  ctaTitle: { color: Colors.surface, fontSize: FontSize.lg, fontWeight: '800' },
  ctaText: { color: Colors.ctaMuted, fontSize: FontSize.sm },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.lg,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  ctaButtonText: { color: Colors.primary, fontWeight: '700' },
});
