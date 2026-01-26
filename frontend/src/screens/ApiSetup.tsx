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
  const [showApiKey, setShowApiKey] = useState(false);

  const testAndSave = async () => {
    setTesting(true);
    setError('');

    try {
      // Validate URL format
      const url = new URL(apiUrl);

      // Warn if using localhost on mobile
      if (Platform.OS !== 'web' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
        throw new Error('localhost will not work on mobile. Use your computer\'s network IP address (e.g., http://192.168.1.100:8600)');
      }

      // Test connection
      await apiService.updateConfig(apiUrl, apiKey);
      const result = await apiService.testConnection();

      if (!result.success) {
        throw new Error(result.error || 'Unable to connect to API. Please check the URL and API key.');
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
          : 'IMPORTANT: Use your computer\'s network IP, NOT localhost.\nExample: http://192.168.1.100:8600\nFind IP: Run "ipconfig" (Windows) or "ifconfig" (Mac/Linux) on your server.'}
      </HelperText>

      <TextInput
        label="API Key"
        value={apiKey}
        onChangeText={setApiKey}
        mode="outlined"
        placeholder="change-me-in-production"
        secureTextEntry={!showApiKey}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        right={
          <TextInput.Icon
            icon={showApiKey ? 'eye-off' : 'eye'}
            onPress={() => setShowApiKey(!showApiKey)}
          />
        }
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
