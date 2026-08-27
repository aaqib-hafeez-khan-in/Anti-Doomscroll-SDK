import React, {useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Share,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Path} from 'react-native-svg';
import {useTheme} from '@theme';
import {spacing, borderRadius} from '@theme/spacing';
import {typography} from '@theme/typography';
import {useJournalStore} from '@store/useJournalStore';
import {useStreakStore} from '@store/useStreakStore';
import {WeeklyChart} from '@components/WeeklyChart';
import {
  getLast7Days,
  getLast90Days,
  toISODateString,
  isSameDayAsEntry,
} from '@utils/dateUtils';
import {SOCIAL_APPS, MOOD_COLORS, MOOD_LABELS} from '@utils/constants';
import {DatabaseService} from '@services/DatabaseService';
import {WeeklyBarData, AppTriggerData, MoodDistribution, MoodTag} from '@types';
import {format} from 'date-fns';

// SCREEN_WIDTH removed as unused consumer CHART_WIDTH was removed
const CONTENT_PADDING = spacing.base;
// CHART_WIDTH removed as it was unused

export const InsightsScreen: React.FC = () => {
  const {colors, isDark} = useTheme();
  const {entries} = useJournalStore();
  const {currentStreak, longestStreak} = useStreakStore();

  const weeklyData = useMemo<WeeklyBarData[]>(() => {
    const last7 = getLast7Days();
    return last7.map(day => ({
      date: toISODateString(day),
      label: format(day, 'EEE').substring(0, 1),
      count: entries.filter(e => isSameDayAsEntry(e.createdAt, day)).length,
    }));
  }, [entries]);

  const appTriggerData = useMemo<AppTriggerData[]>(() => {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      counts[entry.triggeredApp] = (counts[entry.triggeredApp] ?? 0) + 1;
    }

    return SOCIAL_APPS.map(app => ({
      packageName: app.androidPackage,
      displayName: app.displayName,
      count: counts[app.androidPackage] ?? 0,
      colorHex: app.colorHex,
    }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [entries]);

  const moodDistribution = useMemo<MoodDistribution[]>(() => {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
    }

    return Object.entries(counts).map(([mood, count]) => ({
      mood: mood as MoodTag,
      count,
      percentage: entries.length > 0 ? (count / entries.length) * 100 : 0,
    }));
  }, [entries]);

  const mostBlockedApp = useMemo<string>(() => {
    if (appTriggerData.length === 0) {
      return 'None';
    }
    return appTriggerData[0].displayName;
  }, [appTriggerData]);

  const calendarData = useMemo(() => {
    const last90 = getLast90Days();
    return last90.map(day => ({
      date: toISODateString(day),
      count: entries.filter(e => isSameDayAsEntry(e.createdAt, day)).length,
    }));
  }, [entries]);

  const maxCalendarCount = useMemo(
    () => Math.max(...calendarData.map(d => d.count), 1),
    [calendarData],
  );

  const handleExport = async (): Promise<void> => {
    const data = await DatabaseService.exportAllData();
    await Share.share({message: data, title: 'Anti-Doomscroll Export'});
  };

  const maxTriggerCount = useMemo(
    () => Math.max(...appTriggerData.map(d => d.count), 1),
    [appTriggerData],
  );

  const donutRadius = 70;
  const donutCenter = 90;
  const donutSize = donutCenter * 2;
  // circumference removed as it was unused

  let cumulativeAngle = 0;
  const donutSlices = moodDistribution.map(item => {
    const startAngle = cumulativeAngle;
    const angle = (item.percentage / 100) * 360;
    cumulativeAngle += angle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((startAngle + angle - 90) * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;

    const x1 = donutCenter + donutRadius * Math.cos(startRad);
    const y1 = donutCenter + donutRadius * Math.sin(startRad);
    const x2 = donutCenter + donutRadius * Math.cos(endRad);
    const y2 = donutCenter + donutRadius * Math.sin(endRad);

    return {
      ...item,
      path: `M ${donutCenter} ${donutCenter} L ${x1} ${y1} A ${donutRadius} ${donutRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: MOOD_COLORS[item.mood],
    };
  });

  return (
    <SafeAreaView
      style={[styles.screen, {backgroundColor: colors.background}]}
      edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: colors.textPrimary}]}>
            Insights
          </Text>
          <TouchableOpacity
            style={[
              styles.exportBtn,
              {backgroundColor: colors.accentMuted, borderColor: colors.accent},
            ]}
            onPress={handleExport}
            accessibilityLabel="Export journal data"
            accessibilityRole="button">
            <Text style={[styles.exportText, {color: colors.accent}]}>
              Export
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {[
            {label: 'Total Entries', value: String(entries.length)},
            {label: 'Current Streak', value: `${currentStreak}d`},
            {label: 'Longest Streak', value: `${longestStreak}d`},
            {label: 'Top Trigger', value: mostBlockedApp},
          ].map(stat => (
            <View
              key={stat.label}
              style={[
                styles.statCard,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <Text
                style={[styles.statValue, {color: colors.textPrimary}]}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, {color: colors.textTertiary}]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <WeeklyChart data={weeklyData} />

        {appTriggerData.length > 0 && (
          <View
            style={[
              styles.card,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <Text style={[styles.cardTitle, {color: colors.textPrimary}]}>
              App Trigger Breakdown
            </Text>
            <View style={styles.barList}>
              {appTriggerData.map(item => (
                <View key={item.packageName} style={styles.barRow}>
                  <Text
                    style={[styles.barLabel, {color: colors.textSecondary}]}
                    numberOfLines={1}>
                    {item.displayName}
                  </Text>
                  <View
                    style={[styles.barTrack, {backgroundColor: colors.border}]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${(item.count / maxTriggerCount) * 100}%`,
                          backgroundColor: item.colorHex,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.barCount, {color: colors.textSecondary}]}>
                    {item.count}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {moodDistribution.length > 0 && (
          <View
            style={[
              styles.card,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <Text style={[styles.cardTitle, {color: colors.textPrimary}]}>
              Mood Distribution
            </Text>
            <View style={styles.donutRow}>
              <Svg width={donutSize} height={donutSize}>
                {donutSlices.map(slice => (
                  <Path key={slice.mood} d={slice.path} fill={slice.color} />
                ))}
                <Circle
                  cx={donutCenter}
                  cy={donutCenter}
                  r={45}
                  fill={colors.surface}
                />
              </Svg>
              <View style={styles.legend}>
                {moodDistribution.map(item => (
                  <View key={item.mood} style={styles.legendRow}>
                    <View
                      style={[
                        styles.legendDot,
                        {backgroundColor: MOOD_COLORS[item.mood]},
                      ]}
                    />
                    <Text
                      style={[
                        styles.legendLabel,
                        {color: colors.textSecondary},
                      ]}>
                      {MOOD_LABELS[item.mood]} ({Math.round(item.percentage)}%)
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View
          style={[
            styles.card,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <Text style={[styles.cardTitle, {color: colors.textPrimary}]}>
            Activity Calendar
          </Text>
          <Text style={[styles.cardSubtitle, {color: colors.textTertiary}]}>
            Last 90 days
          </Text>
          <View style={styles.calendarGrid}>
            {calendarData.map(day => {
              const intensity =
                day.count === 0 ? 0 : Math.min(day.count / maxCalendarCount, 1);
              const bg =
                day.count === 0
                  ? isDark
                    ? '#2E2E2E'
                    : '#E5E5E3'
                  : `${colors.accent}${Math.round(25 + intensity * 230)
                      .toString(16)
                      .padStart(2, '0')}`;
              return (
                <View
                  key={day.date}
                  style={[styles.calendarCell, {backgroundColor: bg}]}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1},
  scrollContent: {
    padding: CONTENT_PADDING,
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  exportBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  exportText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.base,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
  },
  cardSubtitle: {
    fontSize: typography.sizes.sm,
    marginTop: -spacing.xs,
  },
  barList: {gap: spacing.sm},
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    width: 80,
    fontSize: typography.sizes.sm,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  barCount: {
    width: 24,
    fontSize: typography.sizes.sm,
    textAlign: 'right',
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  legend: {gap: spacing.xs},
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: typography.sizes.sm,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  calendarCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
