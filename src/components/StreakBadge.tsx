import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../theme';
import {spacing, borderRadius} from '../theme/spacing';
import {typography} from '../theme/typography';

interface StreakBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  count,
  size = 'medium',
}) => {
  const {colors} = useTheme();

  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
      flame: styles.flameSmall,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
      flame: styles.flameMedium,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
      flame: styles.flameLarge,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        currentSize.container,
        {backgroundColor: colors.warningMuted, borderColor: colors.streakFlame},
      ]}>
      <Text style={currentSize.flame}>🔥</Text>
      <Text
        style={[styles.count, currentSize.text, {color: colors.streakFlame}]}>
        {count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    gap: spacing.xxs,
  },
  containerSmall: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  containerMedium: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  containerLarge: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  flameSmall: {fontSize: 12},
  flameMedium: {fontSize: 16},
  flameLarge: {fontSize: 22},
  count: {
    fontWeight: typography.weights.bold,
  },
  textSmall: {fontSize: typography.sizes.xs},
  textMedium: {fontSize: typography.sizes.md},
  textLarge: {fontSize: typography.sizes.xl},
});
