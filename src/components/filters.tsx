import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import type { Sport } from '@/db/types';

import { Chip, Icon, type IconName } from './ui';

export type QuickFilter = 'today' | 'week' | 'near' | 'free';

export const QUICK_FILTERS: { key: QuickFilter; label: string; icon: IconName }[] = [
  { key: 'today', label: 'Bugun', icon: 'calendar-today' },
  { key: 'week', label: 'Shu hafta', icon: 'calendar-week' },
  { key: 'near', label: 'Yaqinimda', icon: 'crosshairs-gps' },
  { key: 'free', label: 'Bepul', icon: 'ticket-outline' },
];

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  autoFocus,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
}) {
  return (
    <View style={styles.search}>
      <Icon name="magnify" size={22} color={Colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Sport, tadbir yoki joy qidiring..."
        placeholderTextColor={Colors.textSecondary}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
        maxLength={80}
        accessibilityLabel="Tadbirlarni qidirish"
        style={styles.input}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Qidiruvni tozalash">
          <Icon name="close-circle" size={18} color={Colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function QuickFilterRow({
  isActive,
  onToggle,
}: {
  isActive: (key: QuickFilter) => boolean;
  onToggle: (key: QuickFilter) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {QUICK_FILTERS.map((f) => (
        <Chip
          key={f.key}
          label={f.label}
          icon={f.icon}
          selected={isActive(f.key)}
          onPress={() => onToggle(f.key)}
        />
      ))}
    </ScrollView>
  );
}

export function SportFilterRow({
  sports,
  selected,
  onSelect,
}: {
  sports: Sport[];
  selected: number | null;
  onSelect: (sportId: number | null) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip label="Barcha sportlar" selected={selected === null} onPress={() => onSelect(null)} />
      {sports.map((s) => (
        <Chip
          key={s.sport_id}
          label={s.name}
          icon={s.icon as IconName}
          selected={selected === s.sport_id}
          onPress={() => onSelect(selected === s.sport_id ? null : s.sport_id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 48,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: FontSize.md,
    color: Colors.text,
    height: '100%',
    // The search box already shows focus; drop the browser's default outline on web.
    outlineWidth: 0,
  },
  row: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
});
