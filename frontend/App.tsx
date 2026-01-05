import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { paperTheme } from './src/theme/theme';
import { storageService } from './src/services/storage';
import { apiService } from './src/services/api';
import AppNavigator from './src/navigation/AppNavigator';
import ApiSetup from './src/screens/ApiSetup';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      // Initialize API service with stored config
      await apiService.initialize();

      // Check if onboarding is complete
      const onboardingComplete = await storageService.isOnboardingComplete();
      setIsConfigured(onboardingComplete);
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setIsReady(true);
    }
  };

  const handleSetupComplete = () => {
    setIsConfigured(true);
  };

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0078d4" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="auto" />
        {isConfigured ? <AppNavigator /> : <ApiSetup onComplete={handleSetupComplete} />}
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
