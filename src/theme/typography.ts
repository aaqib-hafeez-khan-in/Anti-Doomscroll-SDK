import {Platform} from 'react-native';

export type FontWeight = '400' | '500' | '600' | '700' | 'normal' | 'bold';

const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }) as string,
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
  }) as string,
  semiBold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
  }) as string,
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
  }) as string,
};

export const typography = {
  fontFamily,
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    xxxl: 38,
  },
  lineHeights: {
    xs: 16,
    sm: 18,
    base: 22,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 38,
    xxxl: 48,
  },
  weights: {
    regular: '400' as FontWeight,
    medium: '500' as FontWeight,
    semiBold: '600' as FontWeight,
    bold: '700' as FontWeight,
  },
};
