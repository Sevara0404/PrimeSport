import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { AppText, Icon } from './ui';

export function CityPicker({
  visible,
  cities,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  cities: string[];
  selected: string;
  onSelect: (city: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close city picker">
        <Pressable style={styles.sheet} onPress={() => {}}>
          <AppText variant="title" style={styles.title}>
            Choose your city
          </AppText>
          {cities.map((city) => (
            <Pressable
              key={city}
              accessibilityRole="button"
              accessibilityState={{ selected: city === selected }}
              onPress={() => {
                onSelect(city);
                onClose();
              }}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <Icon name="map-marker-outline" size={20} color={Colors.textSecondary} />
              <AppText style={styles.optionText}>{city}</AppText>
              {city === selected ? <Icon name="check" size={20} color={Colors.primary} /> : null}
            </Pressable>
          ))}
          <View style={styles.footer}>
            <AppText variant="caption">More cities will be added as organizers join.</AppText>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 46, 22, 0.45)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
  },
  title: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  optionText: { flex: 1 },
  pressed: { backgroundColor: Colors.background },
  footer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
});
