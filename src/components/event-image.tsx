import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, SportColors } from '@/constants/theme';

import { Icon, type IconName } from './ui';

/**
 * Event photo. A soft tile with the sport icon sits underneath, so the card still looks
 * right while the photo loads, when an event has no photo, or when the device is offline.
 */
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
  const [failed, setFailed] = useState(false);
  const color = SportColors[sportId] ?? Colors.primary;
  return (
    <View style={[styles.frame, styles.placeholder, style]}>
      <Icon name={sportIcon as IconName} size={iconSize} color={color} />
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', width: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primarySoft },
});
