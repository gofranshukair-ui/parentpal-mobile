/**
 * Pastel palette inspired by the ParentPal brand — peach, pink, light blue, and coral accents.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    backgroundElement: '#FFD1DC',
    backgroundSelected: '#FFDAB9',
    textSecondary: '#5C5C5C',
    accent: '#FF7F50',
    accentBlue: '#B0E0E6',
    accentPink: '#FFD1DC',
    accentPeach: '#FFDAB9',
    error: '#E85D4C',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1C1513',
    backgroundElement: '#4A3540',
    backgroundSelected: '#5C4538',
    textSecondary: '#B8A8A0',
    accent: '#FF7F50',
    accentBlue: '#6A9FA8',
    accentPink: '#4A3540',
    accentPeach: '#5C4538',
    error: '#FF8A7A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
