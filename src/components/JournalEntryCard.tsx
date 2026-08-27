import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import {Entry} from '../types';
import {useTheme} from '../theme';
import {formatTimestamp} from '../utils/dateUtils';
import {truncateText} from '../utils/textUtils';
import {MOOD_COLORS, MOOD_LABELS, SOCIAL_APPS} from '../utils/constants';
import {spacing, borderRadius} from '../theme/spacing';
import {typography} from '../theme/typography';
import {StreakBadge} from './StreakBadge';

interface JournalEntryCardProps {
  entry: Entry;
  isInStreak: boolean;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

const TRUNCATE_CHARS = 180;

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  isInStreak,
  onEdit,
  onDelete,
}) => {
  const {colors} = useTheme();
  const [expanded, setExpanded] = useState(false);

  const app = SOCIAL_APPS.find(a => a.androidPackage === entry.triggeredApp);
  const moodColor = MOOD_COLORS[entry.mood];
  const displayText = expanded
    ? entry.entryText
    : truncateText(entry.entryText, TRUNCATE_CHARS);
  const isLong = entry.entryText.length > TRUNCATE_CHARS;

  const handleLongPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete', 'Share'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            onEdit(entry);
          } else if (buttonIndex === 2) {
            confirmDelete();
          } else if (buttonIndex === 3) {
            handleShare();
          }
        },
      );
    } else {
      Alert.alert('Entry Options', undefined, [
        {text: 'Edit', onPress: () => onEdit(entry)},
        {text: 'Share', onPress: () => handleShare()},
        {text: 'Delete', style: 'destructive', onPress: confirmDelete},
        {text: 'Cancel', style: 'cancel'},
      ]);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete Entry', 'This action cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id)},
    ]);
  };

  const handleShare = async (): Promise<void> => {
    await Share.share({
      message: `"${
        entry.entryText
      }"\n\n— Anti-Doomscroll Journal, ${formatTimestamp(entry.createdAt)}`,
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
      accessibilityLabel={`Journal entry from ${formatTimestamp(
        entry.createdAt,
      )}`}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {app && (
            <View
              style={[styles.appTag, {backgroundColor: `${app.colorHex}20`}]}>
              <View style={[styles.appDot, {backgroundColor: app.colorHex}]} />
              <Text style={[styles.appName, {color: app.colorHex}]}>
                {app.displayName}
              </Text>
            </View>
          )}
          {entry.isManual && (
            <View
              style={[styles.appTag, {backgroundColor: colors.accentMuted}]}>
              <Text style={[styles.appName, {color: colors.accent}]}>
                Manual
              </Text>
            </View>
          )}
        </View>
        {isInStreak && <StreakBadge count={1} size="small" />}
      </View>

      <Text style={[styles.prompt, {color: colors.textTertiary}]}>
        {entry.promptText}
      </Text>

      <Text style={[styles.entryText, {color: colors.textPrimary}]}>
        {displayText}
      </Text>

      {isLong && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          accessibilityLabel={expanded ? 'Collapse' : 'Expand'}>
          <Text style={[styles.expandButton, {color: colors.accent}]}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <View style={[styles.moodChip, {backgroundColor: `${moodColor}20`}]}>
          <Text style={[styles.moodText, {color: moodColor}]}>
            {MOOD_LABELS[entry.mood]}
          </Text>
        </View>
        <Text style={[styles.timestamp, {color: colors.textTertiary}]}>
          {formatTimestamp(entry.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.base,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    flex: 1,
  },
  appTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  appDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
  },
  appName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
  },
  prompt: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    lineHeight: typography.lineHeights.sm,
  },
  entryText: {
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
  },
  expandButton: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moodChip: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.full,
  },
  moodText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
  },
});
