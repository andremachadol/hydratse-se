// src/constants/theme.ts

export const COLORS = {
  backgroundGradient: ['#F7FCFF', '#E4F6FF', '#CDEFFF'] as const,

  primary: '#1497C9',
  primaryLight: '#57C9E8',
  secondary: '#0B5F84',
  secondaryDark: '#083D56',
  accent: '#FF8A4C',
  success: '#149C6B',
  danger: '#E25555',

  white: '#FFFFFF',
  black: '#000000',
  textDark: '#17394A',
  textLight: '#5E7583',
  textMuted: '#7E94A1',
  border: '#D8E7EF',
  borderStrong: '#BCD4DF',

  surface: '#F6FBFD',
  surfaceLight: '#EDF7FB',
  surfaceMuted: 'rgba(255, 255, 255, 0.72)',
  surfaceDanger: '#FFF3F3',
  surfaceCard: 'rgba(255, 255, 255, 0.92)',
  surfaceElevated: '#FFFFFF',
  surfacePrimary: '#E6F7FD',
  surfaceSuccess: '#E6FBF2',
  surfaceAccent: '#FFF3E8',
  overlay: 'rgba(7, 41, 55, 0.16)',

  backgroundOrbPrimary: 'rgba(20, 151, 201, 0.16)',
  backgroundOrbSecondary: 'rgba(87, 201, 232, 0.12)',
  backgroundOrbAccent: 'rgba(255, 138, 76, 0.12)',

  switchTrackOff: '#8A99A3',
  switchThumbOff: '#F4F6F8',
};

export const SHADOWS = {
  small: {
    shadowColor: '#0B5F84',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  medium: {
    shadowColor: '#0B5F84',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  large: {
    shadowColor: '#0B5F84',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  primary: {
    shadowColor: '#1497C9',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 8,
  },
};
