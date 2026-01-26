export { ThemeProvider, useTheme, colors } from './ThemeContext';
export { UserPreferencesProvider, useUserPreferences, HEALTH_GOALS } from './UserPreferencesContext';
export type { HealthGoal, ActivityGoals, UserPreferences } from './UserPreferencesContext';
export { HealthDataProvider, useHealthData, METRIC_RANGES } from './HealthDataContext';
export type {
  BloodPressureReading,
  BloodGlucoseReading,
  HeartRateReading,
  StressReading,
  BloodOxygenReading,
  MoodEntry,
  ActivityData,
} from './HealthDataContext';
