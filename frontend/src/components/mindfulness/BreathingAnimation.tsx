import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTheme, colors as themeColors } from '../../context/ThemeContext';

export type BreathingPattern = 'relaxing' | 'energizing' | 'balancing' | 'calming';

interface BreathingConfig {
  name: string;
  inhale: number; // seconds
  hold1: number; // hold after inhale
  exhale: number;
  hold2: number; // hold after exhale
  description: string;
}

const BREATHING_PATTERNS: Record<BreathingPattern, BreathingConfig> = {
  relaxing: {
    name: 'Relaxing Breath',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    description: '4-7-8 breathing for deep relaxation',
  },
  energizing: {
    name: 'Energizing Breath',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 0,
    description: 'Box breathing to increase alertness',
  },
  balancing: {
    name: 'Balancing Breath',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    description: 'Square breathing for balance',
  },
  calming: {
    name: 'Calming Breath',
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    description: 'Extended exhale for calming',
  },
};

type BreathPhase = 'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2';

interface BreathingAnimationProps {
  pattern?: BreathingPattern;
  duration?: number; // total session duration in minutes
  onComplete?: () => void;
  style?: ViewStyle;
}

export function BreathingAnimation({
  pattern = 'relaxing',
  duration = 3,
  onComplete,
  style,
}: BreathingAnimationProps) {
  const { colors } = useTheme();
  const config = BREATHING_PATTERNS[pattern];

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  const cycleTimeMs =
    (config.inhale + config.hold1 + config.exhale + config.hold2) * 1000;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((t) => {
          if (t <= 1) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, timeRemaining, onComplete]);

  useEffect(() => {
    if (!isActive) {
      scaleAnim.setValue(0.6);
      opacityAnim.setValue(0.5);
      setPhase('idle');
      return;
    }

    const runCycle = () => {
      const sequence: { phase: BreathPhase; duration: number; scale: number }[] = [];

      if (config.inhale > 0) {
        sequence.push({ phase: 'inhale', duration: config.inhale, scale: 1 });
      }
      if (config.hold1 > 0) {
        sequence.push({ phase: 'hold1', duration: config.hold1, scale: 1 });
      }
      if (config.exhale > 0) {
        sequence.push({ phase: 'exhale', duration: config.exhale, scale: 0.6 });
      }
      if (config.hold2 > 0) {
        sequence.push({ phase: 'hold2', duration: config.hold2, scale: 0.6 });
      }

      const animations: Animated.CompositeAnimation[] = [];
      let totalDelay = 0;

      sequence.forEach((step) => {
        const phaseAnimation = Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: step.scale,
            duration: step.duration * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: step.scale > 0.8 ? 0.8 : 0.5,
            duration: step.duration * 1000,
            useNativeDriver: true,
          }),
        ]);
        animations.push(phaseAnimation);
      });

      // Update phase display
      let delay = 0;
      sequence.forEach((step) => {
        setTimeout(() => {
          if (isActive) {
            setPhase(step.phase);
            setPhaseTimeRemaining(step.duration);
          }
        }, delay);
        delay += step.duration * 1000;
      });

      // Run animation sequence
      Animated.sequence(animations).start(() => {
        if (isActive) {
          setCycleCount((c) => c + 1);
          runCycle();
        }
      });
    };

    runCycle();
  }, [isActive, config, scaleAnim, opacityAnim]);

  // Phase timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && phaseTimeRemaining > 0) {
      timer = setInterval(() => {
        setPhaseTimeRemaining((t) => Math.max(0, t - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phaseTimeRemaining]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold1':
      case 'hold2':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Ready';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setCycleCount(0);
    setTimeRemaining(duration * 60);
  };

  const handleStop = () => {
    setIsActive(false);
    setPhase('idle');
  };

  return (
    <View style={[styles.container, style]}>
      <Text variant="titleLarge" style={[styles.title, { color: colors.text }]}>
        {config.name}
      </Text>
      <Text
        variant="bodySmall"
        style={[styles.description, { color: colors.textSecondary }]}
      >
        {config.description}
      </Text>

      <View style={styles.animationContainer}>
        {/* Outer ring */}
        <View
          style={[
            styles.outerRing,
            { borderColor: `${themeColors.primary.main}30` },
          ]}
        />

        {/* Animated circle */}
        <Animated.View
          style={[
            styles.breathCircle,
            {
              backgroundColor: themeColors.primary.main,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Inner glow */}
          <View style={styles.innerGlow} />
        </Animated.View>

        {/* Center text */}
        <View style={styles.centerText}>
          <Text
            variant="headlineMedium"
            style={[styles.phaseText, { color: '#FFFFFF' }]}
          >
            {getPhaseText()}
          </Text>
          {isActive && phase !== 'idle' && (
            <Text variant="displaySmall" style={styles.countdownText}>
              {phaseTimeRemaining}
            </Text>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text variant="labelSmall" style={{ color: colors.textMuted }}>
            Time Left
          </Text>
          <Text variant="titleMedium" style={{ color: colors.text }}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text variant="labelSmall" style={{ color: colors.textMuted }}>
            Cycles
          </Text>
          <Text variant="titleMedium" style={{ color: colors.text }}>
            {cycleCount}
          </Text>
        </View>
      </View>

      {/* Pattern info */}
      <View style={[styles.patternInfo, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.patternStep}>
          <Text variant="labelSmall" style={{ color: colors.textMuted }}>
            Inhale
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.text }}>
            {config.inhale}s
          </Text>
        </View>
        {config.hold1 > 0 && (
          <View style={styles.patternStep}>
            <Text variant="labelSmall" style={{ color: colors.textMuted }}>
              Hold
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.text }}>
              {config.hold1}s
            </Text>
          </View>
        )}
        <View style={styles.patternStep}>
          <Text variant="labelSmall" style={{ color: colors.textMuted }}>
            Exhale
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.text }}>
            {config.exhale}s
          </Text>
        </View>
        {config.hold2 > 0 && (
          <View style={styles.patternStep}>
            <Text variant="labelSmall" style={{ color: colors.textMuted }}>
              Hold
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.text }}>
              {config.hold2}s
            </Text>
          </View>
        )}
      </View>

      {/* Control button */}
      <Button
        mode="contained"
        onPress={isActive ? handleStop : handleStart}
        style={styles.button}
        buttonColor={isActive ? colors.surfaceElevated : themeColors.primary.main}
        textColor={isActive ? colors.text : '#FFFFFF'}
      >
        {isActive ? 'Stop' : 'Start Breathing'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    marginBottom: 24,
    textAlign: 'center',
  },
  animationContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  outerRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  breathCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  phaseText: {
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  countdownText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  patternInfo: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    gap: 20,
    marginBottom: 24,
  },
  patternStep: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 24,
    paddingHorizontal: 16,
  },
});

export default BreathingAnimation;
