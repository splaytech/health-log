import React, { useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { WelcomeScreen } from './WelcomeScreen';
import { GoalsScreen } from './GoalsScreen';

type OnboardingStep = 'welcome' | 'goals';

interface HealthOnboardingProps {
  onComplete: () => void;
}

export function HealthOnboarding({ onComplete }: HealthOnboardingProps) {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [fadeAnim] = useState(new Animated.Value(1));

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(callback, 150);
  };

  const handleNext = () => {
    if (currentStep === 'welcome') {
      animateTransition(() => setCurrentStep('goals'));
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    animateTransition(() => setCurrentStep('welcome'));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.background, opacity: fadeAnim },
      ]}
    >
      {currentStep === 'welcome' && <WelcomeScreen onNext={handleNext} />}
      {currentStep === 'goals' && (
        <GoalsScreen onNext={handleNext} onBack={handleBack} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HealthOnboarding;
