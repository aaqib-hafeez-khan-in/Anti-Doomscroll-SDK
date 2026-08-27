import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useTheme} from '@theme';
import {spacing, borderRadius} from '@theme/spacing';
import {typography} from '@theme/typography';
import {RootStackParamList, MainTabParamList} from '@types';
import {AppUsageItem} from '@components/AppUsageItem';
import {StreakBadge} from '@components/StreakBadge';
import {useAppUsage} from '@hooks/useAppUsage';
import {useStreak} from '@hooks/useStreak';
import {useSettingsStore} from '@store/useSettingsStore';
import {MINDFULNESS_QUOTES} from '@utils/constants';
import {
  getGreeting,
  getDayOfYearIndex,
  getLast7Days,
  toISODateString,
} from '@utils/dateUtils';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const HomeScreen: React.FC = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<NavProp>();

  const userName = useSettingsStore(state => state.userName);
  const {usageData, warningApps, refresh, isLoading} = useAppUsage();
  const {currentStreak, streakHistory} = useStreak();

  const greeting = getGreeting();
  const displayName = userName.trim() || 'there';
  const quote =
    MINDFULNESS_QUOTES[getDayOfYearIndex() % MINDFULNESS_QUOTES.length];
  const last7Days = getLast7Days();

  const [warningDismissed, setWarningDismissed] = React.useState(false);

  const hasWarnings = warningApps.length > 0 && !warningDismissed;

  const handleQuickWrite = useCallback(() => {
    navigation.navigate('Blocker', {
      triggeredApp: 'manual',
      triggeredDurationSeconds: 0,
    });
  }, [navigation]);

  return (
    <SafeAreaView
      style={[styles.screen, {backgroundColor: colors.background}]}
      edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.accent}
          />
        }>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, {color: colors.textTertiary}]}>
              {greeting},
            </Text>
            <Text style={[styles.userName, {color: colors.textPrimary}]}>
              {displayName}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.quickWriteBtn, {backgroundColor: colors.accent}]}
            onPress={handleQuickWrite}
            accessibilityLabel="Write a gratitude entry"
            accessibilityRole="button">
            <Text style={[styles.quickWriteText, {color: colors.textInverse}]}>
              + Write
            </Text>
          </TouchableOpacity>
        </View>

        {hasWarnings && (
          <View
            style={[
              styles.warningBanner,
              {
                backgroundColor: colors.warningMuted,
                borderColor: colors.warning,
              },
            ]}>
            <Text style={[styles.warningText, {color: colors.warning}]}>
              {warningApps[0].displayName} is at{' '}
              {Math.round(warningApps[0].percentOfThreshold * 100)}% of your
              daily limit
            </Text>
            <TouchableOpacity
              onPress={() => setWarningDismissed(true)}
              accessibilityLabel="Dismiss warning">
              <Text style={[styles.warningDismiss, {color: colors.warning}]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
            Today's Screen Time
          </Text>
          {usageData.length > 0 ? (
            <FlatList
              data={usageData}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.packageName}
              renderItem={({item}) => <AppUsageItem usage={item} />}
              contentContainerStyle={styles.usageList}
            />
          ) : (
            <Text style={[styles.noData, {color: colors.textTertiary}]}>
              No usage data available. Grant Usage Stats permission in Settings.
            </Text>
          )}
        </View>

        <View
          style={[
            styles.streakCard,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <View style={styles.streakHeader}>
            <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
              Your Streak
            </Text>
            <StreakBadge count={currentStreak} size="medium" />
          </View>

          <Text style={[styles.streakCount, {color: colors.textPrimary}]}>
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </Text>

          <View style={styles.weekDots}>
            {last7Days.map(day => {
              const dateStr = toISODateString(day);
              const hasEntry = streakHistory.includes(dateStr);
              return (
                <View
                  key={dateStr}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: hasEntry ? colors.accent : colors.border,
                    },
                  ]}
                />
              );
            })}
          </View>

          <Text style={[styles.streakSubtitle, {color: colors.textTertiary}]}>
            Last 7 days
          </Text>
        </View>

        <View
          style={[
            styles.quoteCard,
            {backgroundColor: colors.accentMuted, borderColor: colors.accent},
          ]}>
          <Text style={[styles.quoteLabel, {color: colors.accent}]}>
            Today's Reflection
          </Text>
          <Text style={[styles.quoteText, {color: colors.textPrimary}]}>
            "{quote}"
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  greeting: {
    fontSize: typography.sizes.base,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  quickWriteBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.full,
  },
  quickWriteText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  warningDismiss: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  usageList: {
    paddingBottom: spacing.xs,
  },
  noData: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.base,
  },
  streakCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.base,
    gap: spacing.sm,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakCount: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
  weekDots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  streakSubtitle: {
    fontSize: typography.sizes.xs,
  },
  quoteCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: spacing.base,
    gap: spacing.xs,
  },
  quoteLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteText: {
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
    fontStyle: 'italic',
  },
});
