import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { UserPreferencesProvider, useUserPreferences } from './src/context/UserPreferencesContext';
import { HealthDataProvider } from './src/context/HealthDataContext';
import { storageService } from './src/services/storage';
import { apiService } from './src/services/api';
import AppNavigator from './src/navigation/AppNavigator';
import ApiSetup from './src/screens/ApiSetup';
import { HealthOnboarding } from './src/screens/onboarding';

function AppContent() {
  const { paperTheme, colors, isDark } = useTheme();
  const { preferences, isLoading: prefsLoading } = useUserPreferences();

  const [isReady, setIsReady] = useState(false);
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [showHealthOnboarding, setShowHealthOnboarding] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    // Check if health onboarding should be shown after preferences load
    if (!prefsLoading && isApiConfigured) {
      setShowHealthOnboarding(!preferences.healthOnboardingComplete);
    }
  }, [prefsLoading, isApiConfigured, preferences.healthOnboardingComplete]);

  const initialize = async () => {
    try {
      // Initialize API service with stored config
      await apiService.initialize();

      // Check if API onboarding is complete
      const onboardingComplete = await storageService.isOnboardingComplete();
      setIsApiConfigured(onboardingComplete);
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setIsReady(true);
    }
  };

  const handleApiSetupComplete = () => {
    setIsApiConfigured(true);
  };

  const handleHealthOnboardingComplete = () => {
    setShowHealthOnboarding(false);
  };

  if (!isReady || prefsLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {!isApiConfigured ? (
        <ApiSetup onComplete={handleApiSetupComplete} />
      ) : showHealthOnboarding ? (
        <HealthOnboarding onComplete={handleHealthOnboardingComplete} />
      ) : (
        <AppNavigator />
      )}
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <UserPreferencesProvider>
          <HealthDataProvider>
            <AppContent />
          </HealthDataProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
