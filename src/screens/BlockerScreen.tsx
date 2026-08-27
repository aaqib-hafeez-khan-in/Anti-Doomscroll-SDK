import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {RootStackParamList, MoodTag} from '../types';
import {useTheme} from '../theme';
import {spacing, borderRadius} from '../theme/spacing';
import {typography} from '../theme/typography';
import {GratitudeBlocker} from '../components/GratitudeBlocker';
import {MoodSelector} from '../components/MoodSelector';
import {TimerCircle} from '../components/TimerCircle';
import {CelebrationOverlay} from '../components/CelebrationOverlay';
import {useJournalStore} from '../store/useJournalStore';
import {useStreakStore} from '../store/useStreakStore';
import {
  GRATITUDE_PROMPTS,
  MIN_WORD_COUNT,
  MIN_BLOCKER_SECONDS,
  CHARACTER_LIMIT,
  CELEBRATION_DURATION_MS,
  SOCIAL_APPS,
} from '../utils/constants';
import {countWords, getRandomItem} from '../utils/textUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Blocker'>;

export const BlockerScreen: React.FC<Props> = ({route, navigation}) => {
  const {triggeredApp, triggeredDurationSeconds, editEntryId} = route.params;
  const {colors} = useTheme();

  const [prompt] = useState(() => getRandomItem(GRATITUDE_PROMPTS));
  const [entryText, setEntryText] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
  const [timeOnScreen, setTimeOnScreen] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  const addEntry = useJournalStore(state => state.addEntry);
  const editEntry = useJournalStore(state => state.editEntry);
  const markToday = useStreakStore(state => state.markToday);

  const app = SOCIAL_APPS.find(a => a.androidPackage === triggeredApp);
  const displayAppName = app?.displayName ?? triggeredApp;
  const displayMinutes = Math.round(triggeredDurationSeconds / 60);

  const wordCount = countWords(entryText);
  const hasMinWords = wordCount >= MIN_WORD_COUNT;
  const hasMinTime = timeOnScreen >= MIN_BLOCKER_SECONDS;
  const canSubmit =
    hasMinWords && hasMinTime && selectedMood !== null && !isSubmitting;

  const progress = Math.min(timeOnScreen / MIN_BLOCKER_SECONDS, 1);
  const remaining = Math.max(MIN_BLOCKER_SECONDS - timeOnScreen, 0);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeOnScreen(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || selectedMood === null) {
      return;
    }

    setIsSubmitting(true);
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      ReactNativeHapticFeedback.trigger('notificationSuccess', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });

      if (editEntryId) {
        await editEntry(editEntryId, {
          entryText,
          mood: selectedMood,
          wordCount,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addEntry({
          triggeredApp,
          triggeredDurationSeconds,
          promptText: prompt,
          entryText,
          mood: selectedMood,
          wordCount,
          timeOnBlockerSeconds: elapsed,
          isManual: false,
        });

        markToday();
      }

      setShowCelebration(true);
    } catch {
      Alert.alert('Error', 'Failed to save your entry. Please try again.');
      setIsSubmitting(false);
    }
  }, [
    canSubmit,
    selectedMood,
    editEntryId,
    editEntry,
    addEntry,
    entryText,
    wordCount,
    triggeredApp,
    triggeredDurationSeconds,
    prompt,
    markToday,
  ]);

  const handleCelebrationFinish = useCallback(() => {
    setShowCelebration(false);
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={[styles.screen, {backgroundColor: colors.background}]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Text style={[styles.triggerLabel, {color: colors.textTertiary}]}>
              You spent {displayMinutes} min on {displayAppName}
            </Text>
            <Text style={[styles.headline, {color: colors.textPrimary}]}>
              Pause & Reflect
            </Text>
          </View>

          <View style={styles.breathingSection}>
            <GratitudeBlocker size={180} />
          </View>

          <View
            style={[
              styles.promptCard,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <Text style={[styles.promptLabel, {color: colors.textTertiary}]}>
              Your prompt
            </Text>
            <Text style={[styles.promptText, {color: colors.textPrimary}]}>
              {prompt}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Write your response here..."
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={CHARACTER_LIMIT}
              value={entryText}
              onChangeText={setEntryText}
              textAlignVertical="top"
              accessibilityLabel="Journal entry text input"
            />
            <View style={styles.inputMeta}>
              <Text
                style={[
                  styles.wordCount,
                  {color: hasMinWords ? colors.success : colors.textTertiary},
                ]}>
                {wordCount} / {MIN_WORD_COUNT} words min
              </Text>
              <Text style={[styles.charCount, {color: colors.textTertiary}]}>
                {entryText.length} / {CHARACTER_LIMIT}
              </Text>
            </View>
          </View>

          <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />

          <View style={styles.submitRow}>
            <TimerCircle
              progress={progress}
              totalSeconds={MIN_BLOCKER_SECONDS}
              remainingSeconds={remaining}
              size={56}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: canSubmit ? colors.accent : colors.border,
                },
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityLabel="Submit journal entry"
              accessibilityRole="button">
              <Text
                style={[
                  styles.submitText,
                  {color: canSubmit ? colors.textInverse : colors.textTertiary},
                ]}>
                {isSubmitting ? 'Saving...' : 'Submit Reflection'}
              </Text>
            </TouchableOpacity>
          </View>

          {!hasMinTime && (
            <Text style={[styles.waitLabel, {color: colors.textTertiary}]}>
              Please take {remaining}s to breathe and reflect...
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <CelebrationOverlay
        visible={showCelebration}
        onFinish={handleCelebrationFinish}
        duration={CELEBRATION_DURATION_MS}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerSection: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xl,
  },
  triggerLabel: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  headline: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  breathingSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  promptCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.base,
    gap: spacing.xs,
  },
  promptLabel: {
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: typography.weights.semiBold,
  },
  promptText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.md,
  },
  inputSection: {
    gap: spacing.xs,
  },
  textInput: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
    minHeight: 120,
    maxHeight: 280,
  },
  inputMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wordCount: {
    fontSize: typography.sizes.xs,
  },
  charCount: {
    fontSize: typography.sizes.xs,
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  submitText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
  },
  waitLabel: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});
