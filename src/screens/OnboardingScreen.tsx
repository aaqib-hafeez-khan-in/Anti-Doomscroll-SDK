import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
// SVG imports removed as they were unused
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../theme';
import {spacing, borderRadius} from '../theme/spacing';
import {typography} from '../theme/typography';
import {RootStackParamList} from '../types';
import {useSettingsStore} from '../store/useSettingsStore';
import {usePermissions} from '../hooks/usePermissions';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const DEFAULT_THRESHOLD_MINUTES = 15;

interface Slide {
  id: string;
  render: (props: SlideProps) => React.ReactElement;
}

interface SlideProps {
  colors: ReturnType<typeof useTheme>['colors'];
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
  userName: string;
  setUserName: (name: string) => void;
  thresholdMinutes: number;
  setThresholdMinutes: (m: number) => void;
  requestPermission: () => Promise<void>;
  permissionStatus: string;
}

const PhoneMockup: React.FC<{colors: SlideProps['colors']}> = ({colors}) => (
  <View style={mockStyles.phone}>
    <View style={[mockStyles.screen, {backgroundColor: colors.background}]}>
      <Text style={[mockStyles.appText, {color: colors.textTertiary}]}>
        You've spent 18 min on Instagram
      </Text>
      <View
        style={[
          mockStyles.breathCircle,
          {backgroundColor: colors.accentMuted},
        ]}>
        <View
          style={[mockStyles.breathInner, {backgroundColor: colors.accent}]}
        />
      </View>
      <View
        style={[
          mockStyles.mockInput,
          {backgroundColor: colors.surfaceElevated, borderColor: colors.border},
        ]}>
        <Text style={[mockStyles.mockInputText, {color: colors.textTertiary}]}>
          Write your reflection...
        </Text>
      </View>
      <View style={[mockStyles.mockButton, {backgroundColor: colors.border}]}>
        <Text style={[mockStyles.mockButtonText, {color: colors.textTertiary}]}>
          Submit Reflection
        </Text>
      </View>
    </View>
  </View>
);

const SLIDES: Slide[] = [
  {
    id: 'concept',
    render: ({colors, onNext, onSkip}: SlideProps) => (
      <View style={slideStyles.slide}>
        <PhoneMockup colors={colors} />
        <Text style={[slideStyles.headline, {color: colors.textPrimary}]}>
          Stop doomscrolling.{'\n'}Start reflecting.
        </Text>
        <Text style={[slideStyles.body, {color: colors.textSecondary}]}>
          Anti-Doomscroll Journal monitors your screen time on social apps and
          replaces the scroll reflex with a moment of genuine gratitude.
        </Text>
        <View style={slideStyles.buttonRow}>
          <TouchableOpacity
            onPress={onSkip}
            accessibilityLabel="Skip onboarding"
            accessibilityRole="button">
            <Text style={[slideStyles.skip, {color: colors.textTertiary}]}>
              Skip
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[slideStyles.primaryBtn, {backgroundColor: colors.accent}]}
            onPress={onNext}
            accessibilityRole="button"
            accessibilityLabel="Next slide">
            <Text
              style={[slideStyles.primaryBtnText, {color: colors.textInverse}]}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
  },
  {
    id: 'permission',
    render: ({
      colors,
      onNext,
      onSkip,
      requestPermission,
      permissionStatus,
    }: SlideProps) => (
      <View style={slideStyles.slide}>
        <Text style={slideStyles.emoji}>📊</Text>
        <Text style={[slideStyles.headline, {color: colors.textPrimary}]}>
          We need to see your screen time
        </Text>
        <Text style={[slideStyles.body, {color: colors.textSecondary}]}>
          {
            'To interrupt doomscrolling, we need permission to check how much time you spend in social apps.\n\nOn Android this is the "Usage Access" permission. On iOS it uses the Screen Time framework.\n\nWe NEVER send your data anywhere. Everything stays on your device.'
          }
        </Text>
        <TouchableOpacity
          style={[
            slideStyles.permBtn,
            {
              backgroundColor:
                permissionStatus === 'granted'
                  ? colors.successMuted
                  : colors.accent,
              borderColor:
                permissionStatus === 'granted' ? colors.success : colors.accent,
            },
          ]}
          onPress={requestPermission}
          accessibilityLabel="Grant permission"
          accessibilityRole="button">
          <Text
            style={[
              slideStyles.permBtnText,
              {
                color:
                  permissionStatus === 'granted'
                    ? colors.success
                    : colors.textInverse,
              },
            ]}>
            {permissionStatus === 'granted'
              ? 'Permission Granted'
              : 'Grant Permission'}
          </Text>
        </TouchableOpacity>
        <View style={slideStyles.buttonRow}>
          <TouchableOpacity
            onPress={onSkip}
            accessibilityLabel="Skip"
            accessibilityRole="button">
            <Text style={[slideStyles.skip, {color: colors.textTertiary}]}>
              Skip for now
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[slideStyles.primaryBtn, {backgroundColor: colors.accent}]}
            onPress={onNext}
            accessibilityLabel="Continue"
            accessibilityRole="button">
            <Text
              style={[slideStyles.primaryBtnText, {color: colors.textInverse}]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
  },
  {
    id: 'threshold',
    render: ({
      colors,
      onNext,
      onSkip,
      thresholdMinutes,
      setThresholdMinutes,
    }: SlideProps) => (
      <View style={slideStyles.slide}>
        <Text style={slideStyles.emoji}>⏱️</Text>
        <Text style={[slideStyles.headline, {color: colors.textPrimary}]}>
          Set your daily limit
        </Text>
        <Text style={[slideStyles.body, {color: colors.textSecondary}]}>
          How many minutes per app before we interrupt?
        </Text>
        <View
          style={[
            slideStyles.thresholdCard,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <Text
            style={[slideStyles.thresholdValue, {color: colors.textPrimary}]}>
            {thresholdMinutes} minutes
          </Text>
          <Text
            style={[
              slideStyles.thresholdPreview,
              {color: colors.textTertiary},
            ]}>
            {`"You've spent ${thresholdMinutes} min on Instagram. Take 30 seconds to reflect."`}
          </Text>
          <View style={slideStyles.thresholdControls}>
            <TouchableOpacity
              style={[slideStyles.thresholdBtn, {borderColor: colors.border}]}
              onPress={() =>
                setThresholdMinutes(Math.max(5, thresholdMinutes - 5))
              }
              accessibilityLabel="Decrease threshold">
              <Text
                style={[
                  slideStyles.thresholdBtnText,
                  {color: colors.textPrimary},
                ]}>
                -5
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[slideStyles.thresholdBtn, {borderColor: colors.border}]}
              onPress={() =>
                setThresholdMinutes(Math.min(120, thresholdMinutes + 5))
              }
              accessibilityLabel="Increase threshold">
              <Text
                style={[
                  slideStyles.thresholdBtnText,
                  {color: colors.textPrimary},
                ]}>
                +5
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={slideStyles.buttonRow}>
          <TouchableOpacity
            onPress={onSkip}
            accessibilityLabel="Skip"
            accessibilityRole="button">
            <Text style={[slideStyles.skip, {color: colors.textTertiary}]}>
              Skip
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[slideStyles.primaryBtn, {backgroundColor: colors.accent}]}
            onPress={onNext}
            accessibilityLabel="Continue"
            accessibilityRole="button">
            <Text
              style={[slideStyles.primaryBtnText, {color: colors.textInverse}]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
  },
  {
    id: 'name',
    render: ({colors, userName, setUserName, onNext}: SlideProps) => (
      <View style={slideStyles.slide}>
        <Text style={slideStyles.emoji}>👋</Text>
        <Text style={[slideStyles.headline, {color: colors.textPrimary}]}>
          What's your name?
        </Text>
        <Text style={[slideStyles.body, {color: colors.textSecondary}]}>
          We'll greet you each time you open the app.
        </Text>
        <TextInput
          style={[
            slideStyles.nameInput,
            {
              color: colors.textPrimary,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
          value={userName}
          onChangeText={setUserName}
          placeholder="Your first name"
          placeholderTextColor={colors.textTertiary}
          autoFocus
          autoCapitalize="words"
          accessibilityLabel="First name"
        />
        <TouchableOpacity
          style={[
            slideStyles.primaryBtn,
            {backgroundColor: colors.accent, marginTop: spacing.xl},
          ]}
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel="Finish onboarding">
          <Text
            style={[slideStyles.primaryBtnText, {color: colors.textInverse}]}>
            Start Journaling
          </Text>
        </TouchableOpacity>
      </View>
    ),
  },
];

export const OnboardingScreen: React.FC = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<Nav>();

  const {
    setUserName: persistName,
    setThreshold,
    setOnboardingComplete,
  } = useSettingsStore();
  const {requestUsageStats, permissions} = usePermissions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [localName, setLocalName] = useState('');
  const [thresholdMinutes, setThresholdMinutes] = useState(
    DEFAULT_THRESHOLD_MINUTES,
  );

  const flatListRef = useRef<FlatList<Slide>>(null);

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({index, animated: true});
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    persistName(localName.trim());

    const thresholdSeconds = thresholdMinutes * 60;
    const {SOCIAL_APPS} = require('../utils/constants');
    for (const app of SOCIAL_APPS) {
      setThreshold(app.androidPackage, thresholdSeconds);
    }

    setOnboardingComplete(true);
    navigation.replace('Main');
  };

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  return (
    <SafeAreaView
      style={[styles.screen, {backgroundColor: colors.background}]}
      edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
        renderItem={({item, index}) =>
          item.render({
            colors,
            onNext: handleNext,
            onSkip: handleSkip,
            isLast: index === SLIDES.length - 1,
            userName: localName,
            setUserName: setLocalName,
            thresholdMinutes,
            setThresholdMinutes,
            requestPermission: requestUsageStats,
            permissionStatus: permissions.usageStats,
          })
        }
      />
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === currentIndex ? colors.accent : colors.border,
                width: i === currentIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const mockStyles = StyleSheet.create({
  phone: {
    width: 180,
    height: 320,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 8,
    borderWidth: 3,
    borderColor: '#333',
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  screen: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appText: {fontSize: 9, textAlign: 'center'},
  breathCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathInner: {width: 40, height: 40, borderRadius: 20},
  mockInput: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  mockInputText: {fontSize: 8},
  mockButton: {
    width: '100%',
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockButtonText: {fontSize: 8},
});

const slideStyles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    flex: 1,
  },
  emoji: {fontSize: 64},
  headline: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  body: {
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.md,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
  },
  skip: {fontSize: typography.sizes.base, paddingVertical: spacing.md},
  permBtn: {
    padding: spacing.md,
    borderRadius: borderRadius.full,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  permBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
  },
  thresholdCard: {
    width: '100%',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.md,
    alignItems: 'center',
  },
  thresholdValue: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
  thresholdPreview: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  thresholdControls: {flexDirection: 'row', gap: spacing.lg},
  thresholdBtn: {
    width: 56,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  thresholdBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  nameInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semiBold,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  screen: {flex: 1},
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.xl,
  },
  dot: {height: 8, borderRadius: 4},
});
