import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {useTheme} from '../theme';
// spacing removed as unused
import {typography} from '../theme/typography';

interface TimerCircleProps {
  progress: number;
  totalSeconds: number;
  remainingSeconds: number;
  size?: number;
}

export const TimerCircle: React.FC<TimerCircleProps> = ({
  progress,
  totalSeconds: _totalSeconds,
  remainingSeconds,
  size = 60,
}) => {
  const {colors} = useTheme();

  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={center}
          originY={center}
        />
      </Svg>
      <Text style={[styles.label, {color: colors.textSecondary}]}>
        {remainingSeconds > 0 ? remainingSeconds : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    position: 'absolute',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
});
