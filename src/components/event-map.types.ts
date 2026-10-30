import type { StyleProp, ViewStyle } from 'react-native';

import type { EventListItem } from '@/db/types';
import type { Coords } from '@/lib/geo';

export type EventMapProps = {
  events: EventListItem[];
  center: Coords;
  selectedId: number | null;
  onSelect: (eventId: number | null) => void;
  style?: StyleProp<ViewStyle>;
};
