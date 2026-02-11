// src/constants/theme.ts

export const COLORS = {
  // Gradiente de fundo
  backgroundGradient: ['#F0F9FF', '#D1F0FC', '#A5E6FD'] as const,

  // Cores principais
  primary: '#00B4D8',
  primaryLight: '#4fa3d1',
  secondary: '#0077B6',
  accent: '#FF5722',
  danger: '#FF5252',

  // Cores neutras
  white: '#FFFFFF',
  black: '#000000',
  textDark: '#333333',
  textLight: '#666666',
  border: '#E0E0E0',

  // Cores de superfície
  surface: '#F9F9F9',
  surfaceLight: '#F0F0F0',
  surfaceDanger: '#FFF0F0',
  surfaceCard: 'rgba(255, 255, 255, 0.9)',

  // Cores de switch/toggle
  switchTrackOff: '#767577',
  switchThumbOff: '#f4f3f4',
};

// Estilos de sombra reutilizáveis
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  primary: {
    shadowColor: '#00B4D8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
};