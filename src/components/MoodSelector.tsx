import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {MoodTag} from '../types';
import {useTheme} from '../theme';
import {MOOD_COLORS, MOOD_LABELS} from '../utils/constants';
import {spacing, borderRadius} from '../theme/spacing';
import {typography} from '../theme/typography';
import {hexToRgba} from '../utils/colorUtils';

interface MoodSelectorProps {
  selected: MoodTag | null;
  onSelect: (mood: MoodTag) => void;
}

const MOODS: MoodTag[] = [
  'grateful',
  'calm',
  'reflective',
  'challenged',
  'hopeful',
  'neutral',
];

const MOOD_EMOJI: Record<MoodTag, string> = {
  grateful: '🙏',
  calm: '😌',
  reflective: '🤔',
  challenged: '💪',
  hopeful: '✨',
  neutral: '😐',
};

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const {colors} = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, {color: colors.textSecondary}]}>
        How are you feeling?
      </Text>
      <View style={styles.grid}>
        {MOODS.map(mood => {
          const isSelected = selected === mood;
          const moodColor = MOOD_COLORS[mood];

          return (
            <TouchableOpacity
              key={mood}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? hexToRgba(moodColor, 0.15)
                    : colors.surfaceElevated,
                  borderColor: isSelected ? moodColor : colors.border,
                },
              ]}
              onPress={() => onSelect(mood)}
              accessibilityLabel={`Mood: ${MOOD_LABELS[mood]}`}
              accessibilityRole="button"
              accessibilityState={{selected: isSelected}}>
              <Text style={styles.emoji}>{MOOD_EMOJI[mood]}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  {color: isSelected ? moodColor : colors.textSecondary},
                ]}>
                {MOOD_LABELS[mood]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 16,
  },
  moodLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
