import {useColorScheme} from 'react-native';
import {lightColors, darkColors, ThemeColors} from './colors';
import {typography} from './typography';
import {spacing, borderRadius} from './spacing';
import {useSettingsStore} from '../store/useSettingsStore';

export {lightColors, darkColors};
export type {ThemeColors};
export {typography, spacing, borderRadius};

export interface Theme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  isDark: boolean;
}

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const themeSetting = useSettingsStore(state => state.theme);

  const isDark =
    themeSetting === 'dark' ||
    (themeSetting === 'system' && systemScheme === 'dark');

  return {
    colors: isDark ? darkColors : lightColors,
    typography,
    spacing,
    borderRadius,
    isDark,
  };
}
