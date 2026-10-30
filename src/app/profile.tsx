import Constants from 'expo-constants';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EventCardCompact } from '@/components/event-card';
import { AppText, Icon, LoadingState, Screen, SectionHeader, type IconName } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { getUser, listRegisteredEvents } from '@/db/events';
import { useDbQuery } from '@/hooks/use-db-query';
import { useAppState } from '@/lib/app-state';

function MenuRow({
  icon,
  label,
  open,
  onPress,
}: {
  icon: IconName;
  label: string;
  open: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Icon name={icon} size={22} color={Colors.primary} />
      <AppText style={styles.rowLabel}>{label}</AppText>
      <Icon name={open ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function ProfilePage() {
  const { userId } = useAppState();
  const [openSection, setOpenSection] = useState<'settings' | 'about' | null>(null);
  const { data } = useDbQuery(
    useCallback(
      async (db) => {
        const [user, registered] = await Promise.all([getUser(db, userId), listRegisteredEvents(db, userId)]);
        return { user, registered };
      },
      [userId],
    ),
  );

  if (!data) {
    return (
      <Screen edges={['bottom']}>
        <LoadingState />
      </Screen>
    );
  }
  const { user, registered } = data;
  const toggle = (section: 'settings' | 'about') =>
    setOpenSection((current) => (current === section ? null : section));

  return (
    <Screen edges={['bottom']}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Icon name="account" size={44} color={Colors.primary} />
        </View>
        <AppText variant="title">{user?.name ?? 'Mehmon'}</AppText>
        <AppText variant="secondary">{user?.email ?? ''}</AppText>
        <View style={styles.demoNote}>
          <AppText variant="caption" style={styles.center}>
            Demo akkaunt. Tizimga kirish keyingi versiyada qoʻshiladi.
          </AppText>
        </View>
      </View>

      <SectionHeader title="Mening tadbirlarim" />
      {registered.length === 0 ? (
        <AppText variant="secondary" style={styles.inset}>
          Roʻyxatdan oʻtgan tadbirlaringiz shu yerda koʻrinadi.
        </AppText>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.myEvents}>
          {registered.map((event) => (
            <EventCardCompact key={event.event_id} event={event} />
          ))}
        </ScrollView>
      )}

      <View style={styles.menu}>
        <MenuRow
          icon="cog-outline"
          label="Sozlamalar"
          open={openSection === 'settings'}
          onPress={() => toggle('settings')}
        />
        {openSection === 'settings' ? (
          <AppText variant="secondary" style={styles.panel}>
            Bildirishnomalar, til va akkaunt sozlamalari tizimga kirish qoʻshilgach paydo boʻladi.
          </AppText>
        ) : null}
        <View style={styles.divider} />
        <MenuRow
          icon="information-outline"
          label="Ilova haqida"
          open={openSection === 'about'}
          onPress={() => toggle('about')}
        />
        {openSection === 'about' ? (
          <View style={styles.panel}>
            <AppText style={styles.bold}>PRIME SPORT</AppText>
            <AppText variant="secondary">Discover. Participate. Enjoy.</AppText>
            <AppText variant="secondary">
              Toshkent va butun Oʻzbekiston boʻylab sport tadbirlari, musobaqalar va mashgʻulotlarni toping.
            </AppText>
            <AppText variant="caption">Versiya {Constants.expoConfig?.version ?? '1.0.0'}</AppText>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.xl, paddingHorizontal: Spacing.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  demoNote: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.warningBg,
  },
  center: { textAlign: 'center', color: Colors.warningText },
  inset: { paddingHorizontal: Spacing.lg },
  myEvents: { gap: Spacing.md, paddingHorizontal: Spacing.lg },
  menu: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  rowLabel: { flex: 1, fontWeight: '600' },
  pressed: { backgroundColor: Colors.background },
  panel: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: 4 },
  bold: { fontWeight: '800' },
  divider: { height: 1, backgroundColor: Colors.border },
});
