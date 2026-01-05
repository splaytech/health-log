import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { storageService } from '../services/storage';
import { apiService } from '../services/api';

interface ApiSetupProps {
  onComplete: () => void;
}

export default function ApiSetup({ onComplete }: ApiSetupProps) {
  const [apiUrl, setApiUrl] = useState(
    Platform.OS === 'web' ? window.location.origin : ''
  );
  const [apiKey, setApiKey] = useState('change-me-in-production');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const testAndSave = async () => {
    setTesting(true);
    setError('');

    try {
      // Validate URL format
      new URL(apiUrl);

      // Test connection
      await apiService.updateConfig(apiUrl, apiKey);
      const isConnected = await apiService.testConnection();

      if (!isConnected) {
        throw new Error('Unable to connect to API. Please check the URL and API key.');
      }

      // Save and complete onboarding
      await storageService.setOnboardingComplete();
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid configuration');
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome to Health Log
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Configure your API connection to get started
      </Text>

      <TextInput
        label="API URL"
        value={apiUrl}
        onChangeText={setApiUrl}
        mode="outlined"
        placeholder="http://localhost:8600"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={styles.input}
      />
      <HelperText type="info" visible={true} style={styles.helperText}>
        {Platform.OS === 'web'
          ? 'Use the current URL (already filled in)'
          : 'Enter your server URL (e.g., http://192.168.1.100:8600)'}
      </HelperText>

      <TextInput
        label="API Key"
        value={apiKey}
        onChangeText={setApiKey}
        mode="outlined"
        placeholder="change-me-in-production"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <HelperText type="info" visible={true} style={styles.helperText}>
        Default API key is 'change-me-in-production'
      </HelperText>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <Button
        mode="contained"
        onPress={testAndSave}
        loading={testing}
        disabled={!apiUrl || !apiKey || testing}
        style={styles.button}
      >
        Test & Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
  },
  helperText: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
});
