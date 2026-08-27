import React, {useEffect, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {useTheme} from '../theme';
import {
  BREATHING_INHALE_SECONDS,
  BREATHING_EXHALE_SECONDS,
} from '../utils/constants';

interface GratitudeBlockerProps {
  size?: number;
}

const BREATHING_LABEL_MAP = ['Breathe in...', 'Breathe out...'];

export const GratitudeBlocker: React.FC<GratitudeBlockerProps> = ({
  size = 200,
}) => {
  const {colors} = useTheme();
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0.5);
  const phaseRef = useRef(0);
  const [phaseLabel, setPhaseLabel] = React.useState(BREATHING_LABEL_MAP[0]);

  const totalCycleDuration =
    (BREATHING_INHALE_SECONDS + BREATHING_EXHALE_SECONDS) * 1000;

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.0, {
        duration: BREATHING_INHALE_SECONDS * 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    opacity.value = withRepeat(
      withTiming(1.0, {
        duration: BREATHING_INHALE_SECONDS * 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    const interval = setInterval(() => {
      phaseRef.current = (phaseRef.current + 1) % 2;
      setPhaseLabel(BREATHING_LABEL_MAP[phaseRef.current]);
    }, (BREATHING_INHALE_SECONDS + BREATHING_EXHALE_SECONDS) * 500);

    return () => {
      clearInterval(interval);
    };
  }, [opacity, scale, totalCycleDuration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  const innerSize = size * 0.65;
  const outerSize = size;

  return (
    <View style={[styles.wrapper, {width: outerSize, height: outerSize}]}>
      <Animated.View
        style={[
          styles.outerCircle,
          animatedStyle,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            backgroundColor: colors.accentMuted,
          },
        ]}
      />
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: colors.accent,
          },
        ]}>
        <Animated.Text style={[styles.label, {color: colors.textInverse}]}>
          {phaseLabel}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    position: 'absolute',
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
