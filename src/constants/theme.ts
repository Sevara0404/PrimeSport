import '@/global.css';

import { Platform } from 'react-native';

// Prime Sport brand palette (from the product brief).
export const Colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: '#DBEAFE',
  text: '#0F172A',
  textSecondary: '#64748B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  verifiedBg: '#DCFCE7',
  verifiedText: '#166534',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  warningBg: '#FEF3C7',
  warningText: '#92400E',
} as const;

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
  web: { boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' },
  default: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
