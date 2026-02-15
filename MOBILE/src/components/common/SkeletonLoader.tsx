/**
 * SkeletonLoader Component
 * Animated placeholders while loading
 */

import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 40,
  borderRadius = 8,
  style,
}) => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const opacity = useSharedValue(0.5);

  // Animate opacity for shimmer effect
  opacity.value = withRepeat(
    withSequence(
      withTiming(0.5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    false
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedView
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

/**
 * SkeletonCard - Card-shaped skeleton
 */
export const SkeletonCard: React.FC<{ style?: any }> = ({ style }) => {
  return (
    <View
      style={[
        {
          padding: 16,
          borderRadius: 12,
          backgroundColor: '#fff',
        },
        style,
      ]}
    >
      <SkeletonLoader height={20} width="60%" style={{ marginBottom: 12 }} />
      <SkeletonLoader height={16} width="40%" style={{ marginBottom: 8 }} />
      <SkeletonLoader height={16} width="80%" />
    </View>
  );
};

/**
 * SkeletonList - List of skeleton cards
 */
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={{ marginBottom: 12 }} />
      ))}
    </>
  );
};
