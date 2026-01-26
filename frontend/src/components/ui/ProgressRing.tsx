import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientColors?: string[];
  backgroundColor?: string;
  showPercentage?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
  centerUnit?: string;
  style?: ViewStyle;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = '#6C5CE7',
  gradientColors,
  backgroundColor,
  showPercentage = false,
  centerLabel,
  centerValue,
  centerUnit,
  style,
}: ProgressRingProps) {
  const { colors } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (circumference * clampedProgress) / 100;
  const center = size / 2;

  const bgColor = backgroundColor || colors.divider;
  const useGradient = gradientColors && gradientColors.length >= 2;
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {useGradient && (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {gradientColors.map((clr, idx) => (
                <Stop
                  key={idx}
                  offset={`${(idx / (gradientColors.length - 1)) * 100}%`}
                  stopColor={clr}
                />
              ))}
            </LinearGradient>
          </Defs>
        )}

        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={useGradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        {showPercentage && (
          <Text variant="headlineMedium" style={[styles.percentage, { color: colors.text }]}>
            {Math.round(clampedProgress)}%
          </Text>
        )}
        {centerValue !== undefined && (
          <View style={styles.centerValueContainer}>
            <Text variant="headlineSmall" style={[styles.centerValue, { color: colors.text }]}>
              {centerValue}
            </Text>
            {centerUnit && (
              <Text variant="bodySmall" style={[styles.centerUnit, { color: colors.textSecondary }]}>
                {centerUnit}
              </Text>
            )}
          </View>
        )}
        {centerLabel && (
          <Text variant="labelSmall" style={[styles.centerLabel, { color: colors.textMuted }]}>
            {centerLabel}
          </Text>
        )}
      </View>
    </View>
  );
}

// Multi-ring progress for activity tracking (steps, active time, calories)
interface ActivityRingsProps {
  rings: {
    progress: number;
    color: string;
    label: string;
    value: string | number;
    goal: string | number;
  }[];
  size?: number;
  strokeWidth?: number;
  gap?: number;
  style?: ViewStyle;
}

export function ActivityRings({
  rings,
  size = 180,
  strokeWidth = 12,
  gap = 6,
  style,
}: ActivityRingsProps) {
  const { colors } = useTheme();
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {rings.map((ring, index) => {
          const ringRadius = center - strokeWidth / 2 - index * (strokeWidth + gap);
          const circumference = 2 * Math.PI * ringRadius;
          const clampedProgress = Math.min(100, Math.max(0, ring.progress));
          const strokeDashoffset = circumference - (circumference * clampedProgress) / 100;

          return (
            <React.Fragment key={index}>
              {/* Background */}
              <Circle
                cx={center}
                cy={center}
                r={ringRadius}
                stroke={`${ring.color}30`}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress */}
              <Circle
                cx={center}
                cy={center}
                r={ringRadius}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                origin={`${center}, ${center}`}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontWeight: '700',
  },
  centerValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  centerValue: {
    fontWeight: '600',
  },
  centerUnit: {
    marginLeft: 2,
  },
  centerLabel: {
    marginTop: 2,
    textAlign: 'center',
  },
});

export default ProgressRing;
