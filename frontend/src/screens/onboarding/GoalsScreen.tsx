import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, colors as themeColors } from '../../context/ThemeContext';
import {
  useUserPreferences,
  HealthGoal,
  HEALTH_GOALS,
} from '../../context/UserPreferencesContext';
import { GoalCard } from '../../components/ui/PillButton';

interface GoalsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function GoalsScreen({ onNext, onBack }: GoalsScreenProps) {
  const { colors } = useTheme();
  const { setHealthGoals, completeHealthOnboarding } = useUserPreferences();
  const [selectedGoals, setSelectedGoals] = useState<HealthGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleGoal = (goalId: HealthGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await setHealthGoals(selectedGoals);
      await completeHealthOnboarding();
      onNext();
    } catch (error) {
      console.error('Error saving goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={onBack}
          icon={() => (
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.text}
            />
          )}
          textColor={colors.text}
        >
          Back
        </Button>
        <View style={styles.progressContainer}>
          <Text variant="labelSmall" style={{ color: colors.textMuted }}>
            Step 2 of 2
          </Text>
          <ProgressBar
            progress={1}
            color={themeColors.primary.main}
            style={styles.progressBar}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
          What are your health goals?
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Select all that apply. We'll personalize your experience based on your choices.
        </Text>

        <View style={styles.goalsContainer}>
          {HEALTH_GOALS.map((goal) => (
            <GoalCard
              key={goal.id}
              title={goal.label}
              description={goal.description}
              icon={goal.icon}
              selected={selectedGoals.includes(goal.id)}
              onPress={() => toggleGoal(goal.id)}
            />
          ))}
        </View>

        {selectedGoals.length > 0 && (
          <View
            style={[
              styles.selectionSummary,
              { backgroundColor: `${themeColors.primary.main}10` },
            ]}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={themeColors.primary.main}
            />
            <Text
              variant="bodyMedium"
              style={[styles.summaryText, { color: themeColors.primary.main }]}
            >
              {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''} selected
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          mode="text"
          onPress={handleComplete}
          textColor={colors.textSecondary}
          disabled={isLoading}
        >
          Skip for now
        </Button>
        <Button
          mode="contained"
          onPress={handleComplete}
          style={styles.continueButton}
          buttonColor={themeColors.primary.main}
          loading={isLoading}
          disabled={isLoading}
        >
          {selectedGoals.length > 0 ? 'Continue' : 'Skip'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  progressContainer: {
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  progressBar: {
    width: 80,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 28,
    lineHeight: 22,
  },
  goalsContainer: {
    marginBottom: 20,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
  },
  summaryText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  continueButton: {
    borderRadius: 24,
    paddingHorizontal: 16,
  },
});

export default GoalsScreen;
