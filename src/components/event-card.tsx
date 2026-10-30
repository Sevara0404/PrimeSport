import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import type { EventListItem } from '@/db/types';
import { formatEventDate } from '@/lib/dates';
import { formatPrice } from '@/lib/format';

import { EventImage } from './event-image';
import { AppText, Button, Icon, StatusPill, VerifiedBadge } from './ui';

export function openEvent(eventId: number) {
  router.push({ pathname: '/event/[id]', params: { id: String(eventId) } });
}

function MetaRow({
  icon,
  text,
}: {
  icon: 'calendar-blank-outline' | 'map-marker-outline' | 'account-group-outline';
  text: string;
}) {
  return (
    <View style={styles.metaRow}>
      <Icon name={icon} size={15} color={Colors.textSecondary} />
      <AppText variant="secondary" numberOfLines={1} style={styles.metaText}>
        {text}
      </AppText>
    </View>
  );
}

function BookmarkButton({ saved, onPress }: { saved: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from saved' : 'Save event'}
      style={styles.bookmark}>
      <Icon name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={Colors.primary} />
    </Pressable>
  );
}

/** Full-width card used in the Events and Saved lists. */
export function EventCard({
  event,
  onToggleSave,
}: {
  event: EventListItem;
  onToggleSave?: (event: EventListItem) => void;
}) {
  return (
    <View>
      <Pressable
        onPress={() => openEvent(event.event_id)}
        accessibilityRole="button"
        accessibilityLabel={event.title}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View>
          <EventImage
            uri={event.image}
            sportId={event.sport_id}
            sportIcon={event.sport_icon}
            style={styles.cardImage}
            iconSize={40}
          />
          <View style={styles.imageOverlay}>
            <StatusPill status={event.status} />
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.rowBetween}>
            <AppText style={styles.sportLabel}>{event.sport_name.toUpperCase()}</AppText>
            <AppText style={styles.price}>{formatPrice(event.price)}</AppText>
          </View>
          <AppText variant="title" numberOfLines={2}>
            {event.title}
          </AppText>
          <MetaRow
            icon="calendar-blank-outline"
            text={`${formatEventDate(event.date)} · ${event.start_time}`}
          />
          <MetaRow icon="map-marker-outline" text={`${event.location}, ${event.city}`} />
          <View style={styles.rowBetween}>
            <MetaRow icon="account-group-outline" text={event.organizer_name} />
            {event.verified ? <VerifiedBadge small /> : null}
          </View>
        </View>
      </Pressable>
      {/* A sibling of the card, not a child, so the two buttons are never nested. */}
      {onToggleSave ? (
        <View style={styles.bookmarkSlot}>
          <BookmarkButton saved={!!event.is_saved} onPress={() => onToggleSave(event)} />
        </View>
      ) : null}
    </View>
  );
}

/** Compact card for the horizontal "Nearby" carousel. */
export function EventCardCompact({ event }: { event: EventListItem }) {
  return (
    <Pressable
      onPress={() => openEvent(event.event_id)}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      style={({ pressed }) => [styles.card, styles.compact, pressed && styles.pressed]}>
      <EventImage
        uri={event.image}
        sportId={event.sport_id}
        sportIcon={event.sport_icon}
        style={styles.compactImage}
        iconSize={32}
      />
      <View style={styles.compactBody}>
        <AppText style={styles.compactTitle} numberOfLines={2}>
          {event.title}
        </AppText>
        <MetaRow icon="calendar-blank-outline" text={formatEventDate(event.date)} />
        <MetaRow icon="map-marker-outline" text={event.location} />
      </View>
    </Pressable>
  );
}

/** Large highlighted card on the Home page. */
export function FeaturedEventCard({ event }: { event: EventListItem }) {
  return (
    <View style={[styles.card, styles.featured]}>
      <EventImage
        uri={event.image}
        sportId={event.sport_id}
        sportIcon={event.sport_icon}
        style={styles.featuredImage}
        iconSize={64}
      />
      <View style={styles.cardBody}>
        <View style={styles.rowBetween}>
          <AppText style={styles.sportLabel}>FEATURED · {event.sport_name.toUpperCase()}</AppText>
          {event.verified ? <VerifiedBadge small /> : null}
        </View>
        <AppText variant="title" style={styles.featuredTitle}>
          {event.title}
        </AppText>
        <MetaRow
          icon="calendar-blank-outline"
          text={`${formatEventDate(event.date)} · ${event.start_time}`}
        />
        <MetaRow icon="map-marker-outline" text={`${event.location}, ${event.city}`} />
        <Button label="View Event" onPress={() => openEvent(event.event_id)} style={styles.featuredButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow,
  },
  pressed: { opacity: 0.85 },
  cardImage: { height: 140 },
  imageOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookmarkSlot: { position: 'absolute', top: Spacing.md, right: Spacing.md },
  bookmark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: Spacing.lg, gap: 6 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sportLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  price: { fontSize: FontSize.sm, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  metaText: { flexShrink: 1 },
  compact: { width: 220 },
  compactImage: { height: 110 },
  compactBody: { padding: Spacing.md, gap: 4 },
  compactTitle: { fontSize: FontSize.md, fontWeight: '700', minHeight: 40 },
  featured: { marginHorizontal: Spacing.lg },
  featuredImage: { height: 180 },
  featuredTitle: { fontSize: FontSize.xl },
  featuredButton: { marginTop: Spacing.sm },
});
