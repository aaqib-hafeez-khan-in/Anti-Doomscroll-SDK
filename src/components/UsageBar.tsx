import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../theme';
import {spacing, borderRadius} from '../theme/spacing';
import {typography} from '../theme/typography';
import {AppUsage} from '../types';
import {SOCIAL_APPS} from '../utils/constants';
import {formatDuration} from '../utils/dateUtils';
import {getStatusColor} from '../utils/colorUtils';

interface UsageBarProps {
  usage: AppUsage;
}

export const UsageBar: React.FC<UsageBarProps> = ({usage}) => {
  const {colors, isDark} = useTheme();

  const app = SOCIAL_APPS.find(a => a.androidPackage === usage.packageName);
  const statusColor = getStatusColor(usage.status, isDark);
  const fillPercent = Math.min(usage.percentOfThreshold, 1) * 100;

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <View style={styles.header}>
        <View
          style={[
            styles.dot,
            {backgroundColor: app?.colorHex ?? colors.accent},
          ]}
        />
        <Text
          style={[styles.appName, {color: colors.textPrimary}]}
          numberOfLines={1}>
          {usage.displayName}
        </Text>
        <Text style={[styles.duration, {color: statusColor}]}>
          {formatDuration(usage.durationSeconds)}
        </Text>
      </View>
      <View style={[styles.track, {backgroundColor: colors.border}]}>
        <View
          style={[
            styles.fill,
            {
              width: `${fillPercent}%`,
              backgroundColor: statusColor,
            },
          ]}
        />
      </View>
      <Text style={[styles.limit, {color: colors.textTertiary}]}>
        Limit: {formatDuration(usage.thresholdSeconds)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  appName: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
  duration: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  track: {
    height: 4,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  limit: {
    fontSize: typography.sizes.xs,
  },
});
