import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from './ui';

// Brand-friendly tile colours per sport, used until an event has a real photo.
const SPORT_TILES: Record<number, { bg: string; fg: string }> = {
  1: { bg: '#15803D', fg: '#DCFCE7' },
  2: { bg: '#EA580C', fg: '#FFEDD5' },
  3: { bg: '#65A30D', fg: '#ECFCCB' },
  4: { bg: '#0891B2', fg: '#CFFAFE' },
  5: { bg: '#2563EB', fg: '#DBEAFE' },
  6: { bg: '#7C3AED', fg: '#EDE9FE' },
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
