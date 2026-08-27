import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import LottieView from 'lottie-react-native';
import {useTheme} from '../theme';

interface CelebrationOverlayProps {
  visible: boolean;
  onFinish: () => void;
  duration?: number;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  visible,
  onFinish,
  duration = 2000,
}) => {
  const {colors} = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, duration, onFinish, opacity]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        {opacity, backgroundColor: colors.blockerOverlay},
      ]}
      pointerEvents="none">
      <View style={styles.content}>
        <LottieView
          source={require('../../assets/animations/celebration.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 300,
    height: 300,
  },
});
