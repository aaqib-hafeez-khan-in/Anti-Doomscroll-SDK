export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  accent: string;
  accentMuted: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  danger: string;
  dangerMuted: string;
  streakFlame: string;
  blockerOverlay: string;
};

export const lightColors: ThemeColors = {
  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F5F3',
  border: '#E5E5E3',
  borderStrong: '#CCCCCA',
  textPrimary: '#1A1A18',
  textSecondary: '#4A4A48',
  textTertiary: '#8A8A88',
  textInverse: '#FFFFFF',
  accent: '#2D6A4F',
  accentMuted: '#D8EAE2',
  success: '#2D6A4F',
  successMuted: '#D8EAE2',
  warning: '#B45309',
  warningMuted: '#FEF3C7',
  danger: '#B91C1C',
  dangerMuted: '#FEE2E2',
  streakFlame: '#FF6B35',
  blockerOverlay: 'rgba(0, 0, 0, 0.6)',
};

export const darkColors: ThemeColors = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  border: '#2E2E2E',
  borderStrong: '#3E3E3E',
  textPrimary: '#F5F5F3',
  textSecondary: '#A5A5A3',
  textTertiary: '#6A6A68',
  textInverse: '#0F0F0F',
  accent: '#52B788',
  accentMuted: '#1A3D2E',
  success: '#52B788',
  successMuted: '#1A3D2E',
  warning: '#F59E0B',
  warningMuted: '#2D1F05',
  danger: '#EF4444',
  dangerMuted: '#2D0A0A',
  streakFlame: '#FF8C5A',
  blockerOverlay: 'rgba(0, 0, 0, 0.8)',
};
