import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Colors, FontSize, Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import type { EventStatus } from '@/db/types';
import { STATUS_LABELS } from '@/lib/format';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Icon(props: ComponentProps<typeof MaterialCommunityIcons>) {
  return <MaterialCommunityIcons {...props} />;
}

/**
 * Full-width screen with the brand background. Content is centred with a max width
 * on large screens but always fills a phone's width (no narrow-column layout).
 */
export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  contentStyle,
  ...scrollProps
}: PropsWithChildren<
  { scroll?: boolean; edges?: Edge[]; contentStyle?: StyleProp<ViewStyle> } & ScrollViewProps
>) {
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, styles.column, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function AppText({
  style,
  variant = 'body',
  ...props
}: ComponentProps<typeof Text> & { variant?: keyof typeof textVariants }) {
  return <Text style={[styles.text, textVariants[variant], style]} {...props} />;
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="title">{title}</AppText>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <AppText variant="link">{action}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Chip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}>
      {icon ? <Icon name={icon} size={16} color={selected ? Colors.surface : Colors.textSecondary} /> : null}
      <AppText style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</AppText>
    </Pressable>
  );
}

export function Button({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = buttonPalettes[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border },
        disabled && variant === 'primary' && styles.buttonDisabled,
        pressed && styles.pressed,
        style,
      ]}>
      {icon ? <Icon name={icon} size={20} color={palette.fg} /> : null}
      <AppText style={[styles.buttonText, { color: palette.fg }]}>{label}</AppText>
    </Pressable>
  );
}

export function VerifiedBadge({ small }: { small?: boolean }) {
  return (
    <View style={[styles.badge, { backgroundColor: Colors.verifiedBg }]}>
      <Icon name="check-decagram" size={small ? 12 : 14} color={Colors.verifiedText} />
      <AppText style={[styles.badgeText, { color: Colors.verifiedText }]}>Verified</AppText>
    </View>
  );
}

const STATUS_COLORS: Record<EventStatus, { bg: string; fg: string }> = {
  upcoming: { bg: Colors.primarySoft, fg: Colors.primaryDark },
  ongoing: { bg: Colors.verifiedBg, fg: Colors.verifiedText },
  completed: { bg: Colors.border, fg: Colors.textSecondary },
  cancelled: { bg: Colors.dangerBg, fg: Colors.danger },
};

export function StatusPill({ status }: { status: EventStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <AppText style={[styles.badgeText, { color: c.fg }]}>{STATUS_LABELS[status]}</AppText>
    </View>
  );
}

export function SampleTag() {
  return (
    <View style={[styles.badge, { backgroundColor: Colors.warningBg }]}>
      <AppText style={[styles.badgeText, { color: Colors.warningText }]}>Sample event</AppText>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: IconName;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={32} color={Colors.primary} />
      </View>
      <AppText variant="title" style={styles.centerText}>
        {title}
      </AppText>
      <AppText variant="secondary" style={styles.centerText}>
        {message}
      </AppText>
      {action}
    </View>
  );
}

export function LoadingState() {
  return (
    <View style={styles.empty}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      title="Something went wrong"
      message={error.message}
      action={<Button label="Try again" variant="secondary" onPress={onRetry} />}
    />
  );
}

const textVariants = StyleSheet.create({
  body: { fontSize: FontSize.md },
  secondary: { fontSize: FontSize.sm, color: Colors.textSecondary },
  caption: { fontSize: FontSize.xs, color: Colors.textSecondary },
  title: { fontSize: FontSize.lg, fontWeight: '700' },
  heading: { fontSize: FontSize.xxl, fontWeight: '800', letterSpacing: -0.5 },
  link: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
} satisfies Record<string, TextStyle>);

const buttonPalettes = {
  primary: { bg: Colors.primary, fg: Colors.surface, border: Colors.primary },
  secondary: { bg: Colors.surface, fg: Colors.primary, border: Colors.border },
  success: { bg: Colors.verifiedBg, fg: Colors.verifiedText, border: Colors.verifiedBg },
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  fill: { flex: 1, width: '100%' },
  column: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  scrollContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingBottom: Spacing.xxl,
  },
  text: { color: Colors.text, fontFamily: Fonts.sans },
  centerText: { textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  chipTextSelected: { color: Colors.surface },
  button: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: FontSize.md, fontWeight: '700' },
  pressed: { opacity: 0.75 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
});
