import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../theme';
import {spacing, borderRadius} from '../theme/spacing';
import {typography} from '../theme/typography';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const {colors} = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[styles.iconContainer, {backgroundColor: colors.accentMuted}]}>
        <Text style={[styles.iconText, {color: colors.accent}]}>✦</Text>
      </View>
      <Text style={[styles.title, {color: colors.textPrimary}]}>{title}</Text>
      <Text style={[styles.message, {color: colors.textSecondary}]}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.button, {backgroundColor: colors.accent}]}
          onPress={onAction}
          accessibilityLabel={actionLabel}
          accessibilityRole="button">
          <Text style={[styles.buttonText, {color: colors.textInverse}]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.sizes.base,
    textAlign: 'center',
    lineHeight: typography.lineHeights.base,
    marginBottom: spacing.xl,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
  },
});
