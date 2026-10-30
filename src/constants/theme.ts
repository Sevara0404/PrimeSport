import '@/global.css';

import { Platform } from 'react-native';

// Prime Sport palette: green and white, matched to Sevara's design mockup (replaces the
// brief's blue). White surfaces, soft grey controls, green only for actions and highlights.
export const Colors = {
  primary: '#0E9F6E',
  primaryDark: '#0B7F58',
  primarySoft: '#E7F6EF',
  brandDeep: '#0B5E43',
  ctaMuted: '#D5F1E4',
  text: '#111827',
  textSecondary: '#6B7280',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  control: '#F2F4F5',
  border: '#E5E7EB',
  verifiedBg: '#E7F6EF',
  verifiedText: '#0B7F58',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  warningBg: '#FEF3C7',
  warningText: '#92400E',
} as const;

// Each sport keeps its own recognisable icon colour, as in the mockup.
export const SportColors: Record<number, string> = {
  1: '#0E9F6E',
  2: '#F97316',
  3: '#C5CC17',
  4: '#2F7DD3',
  5: '#111827',
  6: '#0E9F6E',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const Fonts = Platform.select({
  web: { sans: 'var(--font-display)' },
  default: { sans: undefined },
});

// Content stays readable on tablets and desktop browsers, but fills phones edge to edge.
export const MaxContentWidth = 640;

export const Shadow = Platform.select({
  web: { boxShadow: '0 2px 8px rgba(17, 24, 39, 0.06)' },
  default: {
    shadowColor: '#111827',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
