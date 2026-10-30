import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EventImage } from '@/components/event-image';
import {
  AppText,
  Button,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  SampleTag,
  Screen,
  StatusPill,
  VerifiedBadge,
  type IconName,
} from '@/components/ui';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { getEvent, registerForEvent, setEventSaved } from '@/db/events';
import { useDbQuery } from '@/hooks/use-db-query';
import { useAppState } from '@/lib/app-state';
import { formatLongDate, formatTimestamp } from '@/lib/dates';
import { formatPrice } from '@/lib/format';

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.infoText}>
        <AppText variant="caption">{label}</AppText>
        <AppText style={styles.infoValue}>{value}</AppText>
      </View>
    </View>
  );
}

export default function EventDetailsPage() {
  const db = useSQLiteContext();
  const { userId } = useAppState();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const validId = Number.isInteger(eventId) && eventId > 0;

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'info'; text: string } | null>(null);

  const {
    data: event,
    error,
    loading,
    reload,
  } = useDbQuery(
    useCallback(
      (database) => (validId ? getEvent(database, userId, eventId) : Promise.resolve(null)),
      [userId, eventId, validId],
    ),
  );

  if (error) {
    return (
      <Screen edges={[]}>
        <ErrorState error={error} onRetry={reload} />
      </Screen>
    );
  }
  if (loading && event === undefined) {
    return (
      <Screen edges={[]}>
        <LoadingState />
      </Screen>
    );
  }
  if (!event) {
    return (
      <Screen edges={[]}>
        <EmptyState
          icon="calendar-remove-outline"
          title="Tadbir topilmadi"
          message="Bu tadbir tashkilotchi tomonidan olib tashlangan boʻlishi mumkin."
        />
      </Screen>
    );
  }

  const isOpen = event.status === 'upcoming' || event.status === 'ongoing';

  const toggleSave = async () => {
    setBusy(true);
    try {
      await setEventSaved(db, userId, event.event_id, !event.is_saved);
      setMessage(event.is_saved ? null : { tone: 'info', text: "Saqlandi. Uni \"Saqlangan\" boʻlimida topasiz." });
      reload();
    } finally {
      setBusy(false);
    }
  };

  const register = async () => {
    setBusy(true);
    try {
      const result = await registerForEvent(db, userId, event.event_id);
      if (result === 'registered') {
        setMessage({ tone: 'success', text: `Siz "${event.title}" tadbiriga roʻyxatdan oʻtdingiz. Koʻrishguncha!` });
      } else if (result === 'already_registered') {
        setMessage({ tone: 'info', text: "Siz bu tadbirga allaqachon roʻyxatdan oʻtgansiz." });
      } else {
        setMessage({ tone: 'info', text: "Bu tadbirga roʻyxatdan oʻtish yopilgan." });
      }
      reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: event.sport_name }} />
      <EventImage
        uri={event.image}
        sportId={event.sport_id}
        sportIcon={event.sport_icon}
        style={styles.hero}
        iconSize={72}
      />

      <View style={styles.body}>
        <View style={styles.tags}>
          <StatusPill status={event.status} />
          {event.verified ? <VerifiedBadge /> : null}
          {event.is_sample ? <SampleTag /> : null}
        </View>
        <AppText style={styles.sport}>{event.sport_name.toUpperCase()}</AppText>
        <AppText style={styles.title}>{event.title}</AppText>

        <View style={styles.card}>
          <InfoRow icon="calendar-blank-outline" label="Sana" value={formatLongDate(event.date)} />
          <InfoRow icon="clock-outline" label="Boshlanish vaqti" value={event.start_time} />
          <InfoRow icon="map-marker-outline" label="Manzil" value={`${event.location}, ${event.city}`} />
          <InfoRow icon="ticket-outline" label="Kirish" value={formatPrice(event.price)} />
        </View>

        <AppText variant="title">Tadbir haqida</AppText>
        <AppText style={styles.description}>{event.description || "Hozircha tavsif yoʻq."}</AppText>

        <AppText variant="title">Tashkilotchi</AppText>
        <View style={[styles.card, styles.organizer]}>
          <View style={styles.organizerLogo}>
            <Icon name="account-group" size={24} color={Colors.primary} />
          </View>
          <View style={styles.infoText}>
            <View style={styles.organizerName}>
              <AppText style={styles.infoValue}>{event.organizer_name}</AppText>
              {event.organizer_verified ? <VerifiedBadge small /> : null}
            </View>
            {event.organizer_description ? (
              <AppText variant="secondary">{event.organizer_description}</AppText>
            ) : null}
          </View>
        </View>

        <AppText variant="caption">Oxirgi yangilanish: {formatTimestamp(event.last_updated)}</AppText>
        {event.is_sample ? (
          <AppText variant="caption">
            Namuna tadbir. Tashkilotchi, manzil va tasdiq haqiqiy emas.
          </AppText>
        ) : null}

        {message ? (
          <View
            style={[styles.message, message.tone === 'success' ? styles.messageSuccess : styles.messageInfo]}>
            <Icon
              name={message.tone === 'success' ? 'check-circle' : 'information'}
              size={20}
              color={message.tone === 'success' ? Colors.verifiedText : Colors.primaryDark}
            />
            <AppText style={styles.messageText}>{message.text}</AppText>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button
            label={event.is_saved ? 'Saqlangan' : 'Saqlash'}
            icon={event.is_saved ? 'bookmark' : 'bookmark-outline'}
            variant="secondary"
            onPress={toggleSave}
            disabled={busy}
            style={styles.action}
          />
          {event.is_registered ? (
            <Button label="Roʻyxatdan oʻtilgan" icon="check" variant="success" disabled style={styles.action} />
          ) : (
            <Button
              label={isOpen ? "Roʻyxatdan oʻtish" : event.status === 'cancelled' ? 'Bekor qilingan' : 'Tadbir tugagan'}
              icon={isOpen ? 'account-plus-outline' : undefined}
              onPress={register}
              disabled={busy || !isOpen}
              style={styles.action}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 220 },
  body: { padding: Spacing.lg, gap: Spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  sport: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginTop: -Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1, gap: 2 },
  infoValue: { fontWeight: '600' },
  description: { lineHeight: 24 },
  organizer: { flexDirection: 'row', alignItems: 'flex-start' },
  organizerLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerName: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  messageSuccess: { backgroundColor: Colors.verifiedBg },
  messageInfo: { backgroundColor: Colors.primarySoft },
  messageText: { flex: 1, fontSize: FontSize.sm },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  action: { flex: 1 },
});
