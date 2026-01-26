import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, List, Divider, Switch } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { storageService } from '../services/storage';
import { apiService } from '../services/api';
import { useSync } from '../hooks/useSync';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme, colors as themeColors } from '../context/ThemeContext';
import { useUserPreferences, HEALTH_GOALS } from '../context/UserPreferencesContext';

export default function Settings() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { preferences, updatePreferences, resetPreferences } = useUserPreferences();
  const { isOnline } = useNetworkStatus();
  const { lastSyncTime, performSync, isSyncing } = useSync();

  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Goal editing
  const [editingGoals, setEditingGoals] = useState(false);
  const [dailySteps, setDailySteps] = useState(preferences.activityGoals.dailySteps.toString());
  const [dailyActiveMinutes, setDailyActiveMinutes] = useState(preferences.activityGoals.dailyActiveMinutes.toString());
  const [dailyCalories, setDailyCalories] = useState(preferences.activityGoals.dailyCalories.toString());
  const [dailyWater, setDailyWater] = useState(preferences.activityGoals.dailyWaterMl.toString());

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    setDailySteps(preferences.activityGoals.dailySteps.toString());
    setDailyActiveMinutes(preferences.activityGoals.dailyActiveMinutes.toString());
    setDailyCalories(preferences.activityGoals.dailyCalories.toString());
    setDailyWater(preferences.activityGoals.dailyWaterMl.toString());
  }, [preferences.activityGoals]);

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
      const result = await apiService.testConnection();

      if (result.success) {
        setTestResult({ success: true, message: 'Connection successful!' });
      } else {
        setTestResult({ success: false, message: result.error || 'Connection failed. Check URL and API key.' });
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

  const saveActivityGoals = async () => {
    try {
      await updatePreferences({
        activityGoals: {
          dailySteps: parseInt(dailySteps, 10) || 6000,
          dailyActiveMinutes: parseInt(dailyActiveMinutes, 10) || 90,
          dailyCalories: parseInt(dailyCalories, 10) || 500,
          dailyWaterMl: parseInt(dailyWater, 10) || 2000,
        },
      });
      setEditingGoals(false);
    } catch (error) {
      console.error('Failed to save goals:', error);
    }
  };

  const handleResetPreferences = () => {
    Alert.alert(
      'Reset Preferences',
      'This will reset all your preferences and goals to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetPreferences();
          },
        },
      ]
    );
  };

  const selectedGoalLabels = preferences.healthGoals
    .map((goalId) => HEALTH_GOALS.find((g) => g.id === goalId)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Appearance Section */}
      <List.Section>
        <List.Subheader style={{ color: colors.textSecondary }}>
          Appearance
        </List.Subheader>

        <List.Item
          title="Dark Mode"
          description={isDark ? 'Dark theme active' : 'Light theme active'}
          titleStyle={{ color: colors.text }}
          descriptionStyle={{ color: colors.textSecondary }}
          left={(props) => (
            <List.Icon
              {...props}
              icon={isDark ? 'weather-night' : 'white-balance-sunny'}
              color={themeColors.primary.main}
            />
          )}
          right={() => (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              color={themeColors.primary.main}
            />
          )}
          style={[styles.listItem, { backgroundColor: colors.card }]}
        />
      </List.Section>

      <Divider style={{ backgroundColor: colors.border }} />

      {/* Health Goals Section */}
      <List.Section>
        <List.Subheader style={{ color: colors.textSecondary }}>
          Health Goals
        </List.Subheader>

        <List.Item
          title="Focus Areas"
          description={selectedGoalLabels || 'No goals selected'}
          titleStyle={{ color: colors.text }}
          descriptionStyle={{ color: colors.textSecondary }}
          left={(props) => (
            <List.Icon {...props} icon="target" color={themeColors.accent.steps} />
          )}
          style={[styles.listItem, { backgroundColor: colors.card }]}
        />

        {editingGoals ? (
          <View style={[styles.goalsEdit, { backgroundColor: colors.card }]}>
            <TextInput
              label="Daily Steps Goal"
              value={dailySteps}
              onChangeText={setDailySteps}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={themeColors.primary.main}
              textColor={colors.text}
            />
            <TextInput
              label="Daily Active Minutes"
              value={dailyActiveMinutes}
              onChangeText={setDailyActiveMinutes}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={themeColors.primary.main}
              textColor={colors.text}
            />
            <TextInput
              label="Daily Calories (kcal)"
              value={dailyCalories}
              onChangeText={setDailyCalories}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={themeColors.primary.main}
              textColor={colors.text}
            />
            <TextInput
              label="Daily Water (ml)"
              value={dailyWater}
              onChangeText={setDailyWater}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={themeColors.primary.main}
              textColor={colors.text}
            />
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => setEditingGoals(false)}
                style={styles.buttonHalf}
                textColor={colors.text}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveActivityGoals}
                style={styles.buttonHalf}
                buttonColor={themeColors.primary.main}
              >
                Save
              </Button>
            </View>
          </View>
        ) : (
          <View style={[styles.goalsDisplay, { backgroundColor: colors.card }]}>
            <View style={styles.goalRow}>
              <MaterialCommunityIcons name="shoe-print" size={20} color={themeColors.accent.steps} />
              <Text style={{ color: colors.text, marginLeft: 12 }}>
                {preferences.activityGoals.dailySteps.toLocaleString()} steps
              </Text>
            </View>
            <View style={styles.goalRow}>
              <MaterialCommunityIcons name="timer-outline" size={20} color={themeColors.accent.activity} />
              <Text style={{ color: colors.text, marginLeft: 12 }}>
                {preferences.activityGoals.dailyActiveMinutes} min active
              </Text>
            </View>
            <View style={styles.goalRow}>
              <MaterialCommunityIcons name="fire" size={20} color={themeColors.accent.calories} />
              <Text style={{ color: colors.text, marginLeft: 12 }}>
                {preferences.activityGoals.dailyCalories} kcal
              </Text>
            </View>
            <View style={styles.goalRow}>
              <MaterialCommunityIcons name="water" size={20} color={themeColors.accent.water} />
              <Text style={{ color: colors.text, marginLeft: 12 }}>
                {(preferences.activityGoals.dailyWaterMl / 1000).toFixed(1)}L water
              </Text>
            </View>
            <Button
              mode="outlined"
              onPress={() => setEditingGoals(true)}
              style={styles.editGoalsButton}
              textColor={themeColors.primary.main}
            >
              Edit Goals
            </Button>
          </View>
        )}
      </List.Section>

      <Divider style={{ backgroundColor: colors.border }} />

      {/* API Configuration Section */}
      <List.Section>
        <List.Subheader style={{ color: colors.textSecondary }}>
          API Configuration
        </List.Subheader>

        <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
          <Text variant="bodySmall" style={[styles.infoText, { color: colors.textSecondary }]}>
            Current URL: {apiUrl || 'Not set'}
          </Text>
          <Text variant="bodySmall" style={[styles.infoText, { color: colors.textSecondary }]}>
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
          outlineColor={colors.border}
          activeOutlineColor={themeColors.primary.main}
          textColor={colors.text}
        />

        <TextInput
          label="API Key"
          value={apiKey}
          onChangeText={setApiKey}
          mode="outlined"
          secureTextEntry={!showApiKey}
          disabled={!isEditing}
          style={styles.input}
          placeholder="change-me-in-production"
          outlineColor={colors.border}
          activeOutlineColor={themeColors.primary.main}
          textColor={colors.text}
          right={
            <TextInput.Icon
              icon={showApiKey ? 'eye-off' : 'eye'}
              onPress={() => setShowApiKey(!showApiKey)}
            />
          }
        />

        {testResult && (
          <View
            style={[
              styles.testResult,
              {
                backgroundColor: testResult.success
                  ? `${themeColors.status.success}20`
                  : `${themeColors.status.error}20`,
              },
            ]}
          >
            <Text
              variant="bodySmall"
              style={{
                color: testResult.success
                  ? themeColors.status.success
                  : themeColors.status.error,
                textAlign: 'center',
              }}
            >
              {testResult.message}
            </Text>
          </View>
        )}

        {isEditing ? (
          <>
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => setIsEditing(false)}
                style={styles.buttonHalf}
                textColor={colors.text}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveConfig}
                loading={saving}
                style={styles.buttonHalf}
                buttonColor={themeColors.primary.main}
              >
                Save
              </Button>
            </View>
            <Button
              mode="outlined"
              onPress={testConnection}
              loading={testing}
              disabled={!apiUrl || !apiKey}
              style={styles.button}
              textColor={themeColors.primary.main}
            >
              Test Connection
            </Button>
          </>
        ) : (
          <Button
            mode="outlined"
            onPress={() => setIsEditing(true)}
            textColor={themeColors.primary.main}
          >
            Edit Configuration
          </Button>
        )}
      </List.Section>

      <Divider style={{ backgroundColor: colors.border }} />

      {/* Sync Section */}
      <List.Section>
        <List.Subheader style={{ color: colors.textSecondary }}>
          Sync
        </List.Subheader>

        <List.Item
          title="Network Status"
          description={isOnline ? 'Online' : 'Offline'}
          titleStyle={{ color: colors.text }}
          descriptionStyle={{ color: isOnline ? themeColors.status.success : themeColors.status.error }}
          left={(props) => (
            <List.Icon
              {...props}
              icon={isOnline ? 'wifi' : 'wifi-off'}
              color={isOnline ? themeColors.status.success : themeColors.status.error}
            />
          )}
          style={[styles.listItem, { backgroundColor: colors.card }]}
        />

        <List.Item
          title="Last Sync"
          description={lastSyncTime ? lastSyncTime.toLocaleString() : 'Never'}
          titleStyle={{ color: colors.text }}
          descriptionStyle={{ color: colors.textSecondary }}
          left={(props) => (
            <List.Icon {...props} icon="sync" color={themeColors.primary.main} />
          )}
          style={[styles.listItem, { backgroundColor: colors.card }]}
        />

        <Button
          mode="contained"
          onPress={performSync}
          loading={isSyncing}
          disabled={!isOnline || isSyncing}
          style={styles.button}
          buttonColor={themeColors.primary.main}
        >
          Sync Now
        </Button>
      </List.Section>

      <Divider style={{ backgroundColor: colors.border }} />

      {/* Danger Zone */}
      <List.Section>
        <List.Subheader style={{ color: colors.textSecondary }}>
          Data
        </List.Subheader>

        <Button
          mode="outlined"
          onPress={handleResetPreferences}
          style={styles.button}
          textColor={themeColors.status.error}
        >
          Reset All Preferences
        </Button>
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  listItem: {
    borderRadius: 12,
    marginBottom: 8,
  },
  infoBox: {
    padding: 12,
    borderRadius: 12,
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
  goalsEdit: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  goalsDisplay: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  editGoalsButton: {
    marginTop: 8,
  },
});
