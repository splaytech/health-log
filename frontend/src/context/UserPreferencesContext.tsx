import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Health goal options from the onboarding flow
export type HealthGoal =
  | 'reducing_anxiety'
  | 'reducing_stress'
  | 'relaxation'
  | 'being_positive'
  | 'overall_wellbeing'
  | 'better_sleep';

export const HEALTH_GOALS: { id: HealthGoal; label: string; icon: string; description: string }[] = [
  {
    id: 'reducing_anxiety',
    label: 'Reducing Anxiety',
    icon: 'brain',
    description: 'Calm your mind with guided exercises',
  },
  {
    id: 'reducing_stress',
    label: 'Reducing Stress',
    icon: 'leaf',
    description: 'Find peace in your daily life',
  },
  {
    id: 'relaxation',
    label: 'Relaxation',
    icon: 'spa',
    description: 'Unwind and recharge your energy',
  },
  {
    id: 'being_positive',
    label: 'Being Positive',
    icon: 'emoticon-happy',
    description: 'Cultivate a positive mindset',
  },
  {
    id: 'overall_wellbeing',
    label: 'Overall Wellbeing',
    icon: 'heart',
    description: 'Improve your holistic health',
  },
  {
    id: 'better_sleep',
    label: 'Better Sleep',
    icon: 'sleep',
    description: 'Get quality rest every night',
  },
];

// Activity goals with defaults
export interface ActivityGoals {
  dailySteps: number;
  dailyActiveMinutes: number;
  dailyCalories: number;
  dailyWaterMl: number;
}

const DEFAULT_ACTIVITY_GOALS: ActivityGoals = {
  dailySteps: 6000,
  dailyActiveMinutes: 90,
  dailyCalories: 500,
  dailyWaterMl: 2000,
};

// User preferences
export interface UserPreferences {
  healthGoals: HealthGoal[];
  activityGoals: ActivityGoals;
  reminderEnabled: boolean;
  reminderTime: string; // Format: "HH:mm"
  notificationsEnabled: boolean;
  userName?: string;
  userAge?: number;
  healthOnboardingComplete: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  healthGoals: [],
  activityGoals: DEFAULT_ACTIVITY_GOALS,
  reminderEnabled: false,
  reminderTime: '09:00',
  notificationsEnabled: false,
  healthOnboardingComplete: false,
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  setHealthGoals: (goals: HealthGoal[]) => Promise<void>;
  setActivityGoals: (goals: Partial<ActivityGoals>) => Promise<void>;
  completeHealthOnboarding: () => Promise<void>;
  resetPreferences: () => Promise<void>;
  isLoading: boolean;
}

const PREFERENCES_STORAGE_KEY = 'user_preferences';

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    await savePreferences(newPreferences);
  };

  const setHealthGoals = async (goals: HealthGoal[]) => {
    await updatePreferences({ healthGoals: goals });
  };

  const setActivityGoals = async (goals: Partial<ActivityGoals>) => {
    await updatePreferences({
      activityGoals: { ...preferences.activityGoals, ...goals },
    });
  };

  const completeHealthOnboarding = async () => {
    await updatePreferences({ healthOnboardingComplete: true });
  };

  const resetPreferences = async () => {
    await savePreferences(DEFAULT_PREFERENCES);
  };

  const value: UserPreferencesContextType = {
    preferences,
    updatePreferences,
    setHealthGoals,
    setActivityGoals,
    completeHealthOnboarding,
    resetPreferences,
    isLoading,
  };

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
