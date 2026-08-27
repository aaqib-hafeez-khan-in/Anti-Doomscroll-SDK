import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useTheme} from '@theme';
import {spacing, borderRadius} from '@theme/spacing';
import {typography} from '@theme/typography';
import {RootStackParamList, MainTabParamList, Entry, FilterType} from '@types';
import {JournalEntryCard} from '@components/JournalEntryCard';
import {EmptyState} from '@components/EmptyState';
import {useJournalEntries} from '@hooks/useJournalEntries';
import {useJournalStore} from '@store/useJournalStore';
import {useStreakStore} from '@store/useStreakStore';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Journal'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const FILTERS: {label: string; value: FilterType}[] = [
  {label: 'All', value: 'all'},
  {label: 'This Week', value: 'week'},
  {label: 'This Month', value: 'month'},
  {label: 'Grateful', value: 'grateful'},
  {label: 'Calm', value: 'calm'},
  {label: 'Reflective', value: 'reflective'},
  {label: 'Challenged', value: 'challenged'},
  {label: 'Hopeful', value: 'hopeful'},
  {label: 'Neutral', value: 'neutral'},
];

export const JournalScreen: React.FC = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<NavProp>();

  const {sections, isLoading, reload} = useJournalEntries();
  const {searchQuery, activeFilter, setSearchQuery, setFilter, removeEntry} =
    useJournalStore();
  const {streakHistory} = useStreakStore();

  const handleEdit = useCallback(
    (entry: Entry) => {
      navigation.navigate('Blocker', {
        triggeredApp: entry.triggeredApp,
        triggeredDurationSeconds: entry.triggeredDurationSeconds,
        editEntryId: entry.id,
      });
    },
    [navigation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Entry', 'This cannot be undone.', [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeEntry(id);
          },
        },
      ]);
    },
    [removeEntry],
  );

  return (
    <SafeAreaView
      style={[styles.screen, {backgroundColor: colors.background}]}
      edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.textPrimary}]}>Journal</Text>
      </View>

      <View
        style={[
          styles.searchContainer,
          {backgroundColor: colors.surface, borderColor: colors.border},
        ]}>
        <Text style={[styles.searchIcon, {color: colors.textTertiary}]}>
          🔍
        </Text>
        <TextInput
          style={[styles.searchInput, {color: colors.textPrimary}]}
          placeholder="Search entries..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search journal entries"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Clear search">
            <Text style={[styles.clearBtn, {color: colors.textTertiary}]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={f => f.value}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  activeFilter === item.value ? colors.accent : colors.surface,
                borderColor:
                  activeFilter === item.value ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setFilter(item.value)}
            accessibilityLabel={`Filter: ${item.label}`}
            accessibilityRole="button"
            accessibilityState={{selected: activeFilter === item.value}}>
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    activeFilter === item.value
                      ? colors.textInverse
                      : colors.textSecondary,
                },
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reload}
            tintColor={colors.accent}
          />
        }
        renderSectionHeader={({section}) => (
          <View
            style={[
              styles.sectionHeader,
              {backgroundColor: colors.background},
            ]}>
            <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({item}) => (
          <JournalEntryCard
            entry={item}
            isInStreak={streakHistory.includes(item.createdAt.substring(0, 10))}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No entries yet"
            message={
              searchQuery
                ? 'No entries match your search.'
                : 'Your reflections will appear here after your first blocker.'
            }
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.base,
  },
  clearBtn: {
    fontSize: 16,
    padding: spacing.xs,
  },
  filtersContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  sectionHeader: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
});
