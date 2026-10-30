import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from './ui';

// Green brand tiles per sport, used until an event has a real photo.
const SPORT_TILES: Record<number, { bg: string; fg: string }> = {
  1: { bg: '#15803D', fg: '#DCFCE7' },
  2: { bg: '#166534', fg: '#BBF7D0' },
  3: { bg: '#16A34A', fg: '#F0FDF4' },
  4: { bg: '#047857', fg: '#D1FAE5' },
  5: { bg: '#22C55E', fg: '#F0FDF4' },
  6: { bg: '#14532D', fg: '#BBF7D0' },
};

export function EventImage({
  uri,
  sportId,
  sportIcon,
  style,
  iconSize = 48,
}: {
  uri: string | null;
  sportId: number;
  sportIcon: string;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
}) {
  if (uri) {
    return (
      <View style={[styles.frame, style]}>
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      </View>
    );
  }
  const tile = SPORT_TILES[sportId] ?? SPORT_TILES[6];
  return (
    <View style={[styles.frame, styles.placeholder, { backgroundColor: tile.bg }, style]}>
      <View style={[styles.watermark, { right: -iconSize * 0.4, bottom: -iconSize * 0.5 }]}>
        <Icon name={sportIcon as IconName} size={iconSize * 3} color={tile.fg} style={styles.faint} />
      </View>
      <Icon name={sportIcon as IconName} size={iconSize} color={tile.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', width: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  watermark: { position: 'absolute' },
  faint: { opacity: 0.15 },
});
