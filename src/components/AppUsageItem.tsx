import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AppUsage} from '../types';
import {useTheme} from '../theme';
import {SOCIAL_APPS} from '../utils/constants';
import {formatDuration} from '../utils/dateUtils';
import {getStatusColor} from '../utils/colorUtils';
import {spacing, borderRadius} from '../theme/spacing';
import {typography} from '../theme/typography';

interface AppUsageItemProps {
  usage: AppUsage;
}

export const AppUsageItem: React.FC<AppUsageItemProps> = ({usage}) => {
  const {colors, isDark} = useTheme();

  const app = SOCIAL_APPS.find(a => a.androidPackage === usage.packageName);
  const statusColor = getStatusColor(usage.status, isDark);
  const fillPercent = Math.min(usage.percentOfThreshold * 100, 100);

  const statusLabel = {
    safe: 'OK',
    warning: 'Careful',
    exceeded: 'Over Limit',
  }[usage.status];

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.appDot,
            {backgroundColor: app?.colorHex ?? colors.accent},
          ]}
        />
        <Text
          style={[styles.appName, {color: colors.textPrimary}]}
          numberOfLines={1}>
          {usage.displayName}
        </Text>
        <View
          style={[styles.statusBadge, {backgroundColor: `${statusColor}22`}]}>
          <Text style={[styles.statusText, {color: statusColor}]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={[styles.track, {backgroundColor: colors.border}]}>
        <View
          style={[
            styles.fill,
            {width: `${fillPercent}%`, backgroundColor: statusColor},
          ]}
        />
      </View>

      <View style={styles.bottomRow}>
        <Text style={[styles.timeUsed, {color: colors.textPrimary}]}>
          {formatDuration(usage.durationSeconds)}
        </Text>
        <Text style={[styles.limit, {color: colors.textTertiary}]}>
          / {formatDuration(usage.thresholdSeconds)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  appDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  appName: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  track: {
    height: 5,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xxs,
  },
  timeUsed: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  limit: {
    fontSize: typography.sizes.sm,
  },
});
