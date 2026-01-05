import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, List, Divider } from 'react-native-paper';
import { storageService } from '../services/storage';
import { apiService } from '../services/api';
import { useSync } from '../hooks/useSync';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function Settings() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { isOnline } = useNetworkStatus();
  const { lastSyncTime, performSync, isSyncing } = useSync();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const url = await storageService.getApiUrl();
    const key = await storageService.getApiKey();
    if (url) setApiUrl(url);
    if (key) setApiKey(key);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await apiService.updateConfig(apiUrl, apiKey);
      const isConnected = await apiService.testConnection();

      if (isConnected) {
        setTestResult({ success: true, message: 'Connection successful!' });
      } else {
        setTestResult({ success: false, message: 'Connection failed. Check URL and API key.' });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await apiService.updateConfig(apiUrl, apiKey);
      setIsEditing(false);
      setTestResult(null);
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>API Configuration</List.Subheader>

        <View style={styles.infoBox}>
          <Text variant="bodySmall" style={styles.infoText}>
            Current URL: {apiUrl || 'Not set'}
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            API Key: {apiKey ? '••••••••' + apiKey.slice(-4) : 'Not set'}
          </Text>
        </View>

        <TextInput
          label="API URL"
          value={apiUrl}
          onChangeText={setApiUrl}
          mode="outlined"
          disabled={!isEditing}
          style={styles.input}
          placeholder="http://192.168.1.100:8600"
        />

        <TextInput
          label="API Key"
          value={apiKey}
          onChangeText={setApiKey}
          mode="outlined"
          secureTextEntry={!isEditing}
          disabled={!isEditing}
          style={styles.input}
          placeholder="change-me-in-production"
        />

        {testResult && (
          <View style={[styles.testResult, testResult.success ? styles.testSuccess : styles.testError]}>
            <Text variant="bodySmall" style={styles.testResultText}>
              {testResult.message}
            </Text>
          </View>
        )}

        {isEditing ? (
          <>
            <View style={styles.buttonRow}>
              <Button mode="outlined" onPress={() => setIsEditing(false)} style={styles.buttonHalf}>
                Cancel
              </Button>
              <Button mode="contained" onPress={saveConfig} loading={saving} style={styles.buttonHalf}>
                Save
              </Button>
            </View>
            <Button
              mode="outlined"
              onPress={testConnection}
              loading={testing}
              disabled={!apiUrl || !apiKey}
              style={styles.button}
            >
              Test Connection
            </Button>
          </>
        ) : (
          <Button mode="outlined" onPress={() => setIsEditing(true)}>
            Edit Configuration
          </Button>
        )}
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Sync</List.Subheader>

        <List.Item
          title="Network Status"
          description={isOnline ? 'Online' : 'Offline'}
          left={(props) => <List.Icon {...props} icon="wifi" />}
        />

        <List.Item
          title="Last Sync"
          description={lastSyncTime ? lastSyncTime.toLocaleString() : 'Never'}
          left={(props) => <List.Icon {...props} icon="sync" />}
        />

        <Button
          mode="contained"
          onPress={performSync}
          loading={isSyncing}
          disabled={!isOnline || isSyncing}
          style={styles.button}
        >
          Sync Now
        </Button>
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  input: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  buttonHalf: {
    flex: 1,
  },
  button: {
    marginTop: 16,
  },
  testResult: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  testSuccess: {
    backgroundColor: '#d4edda',
  },
  testError: {
    backgroundColor: '#f8d7da',
  },
  testResultText: {
    textAlign: 'center',
  },
});
