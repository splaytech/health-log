import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, colors as themeColors } from '../context/ThemeContext';
import { useHealthData, ActivityData } from '../context/HealthDataContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { ActivityRings } from '../components/ui/ProgressRing';
import { WeekCalendar } from '../components/ui/WeekCalendar';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function Activity() {
  const { colors } = useTheme();
  const { activityData, updateActivityData, getTodayActivity } = useHealthData();
  const { preferences } = useUserPreferences();

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryType, setEntryType] = useState<'steps' | 'active' | 'calories'>('steps');
  const [entryValue, setEntryValue] = useState('');

  const todayActivity = getTodayActivity();
  const goals = preferences.activityGoals;

  // Calculate progress percentages
  const stepsProgress = ((todayActivity?.steps || 0) / goals.dailySteps) * 100;
  const activeProgress = ((todayActivity?.activeMinutes || 0) / goals.dailyActiveMinutes) * 100;
  const caloriesProgress = ((todayActivity?.caloriesBurned || 0) / goals.dailyCalories) * 100;

  // Activity rings data
  const rings = [
    {
      progress: stepsProgress,
      color: themeColors.accent.steps,
      label: 'Steps',
      value: todayActivity?.steps || 0,
      goal: goals.dailySteps,
    },
    {
      progress: activeProgress,
      color: themeColors.accent.activity,
      label: 'Active',
      value: todayActivity?.activeMinutes || 0,
      goal: goals.dailyActiveMinutes,
    },
    {
      progress: caloriesProgress,
      color: themeColors.accent.calories,
      label: 'Calories',
      value: todayActivity?.caloriesBurned || 0,
      goal: goals.dailyCalories,
    },
  ];

  // Generate hourly data for bar chart
  const hourlyData = useMemo(() => {
    const hours = todayActivity?.hourlySteps || Array(24).fill(0);
    const maxSteps = Math.max(...hours, 1);
    return hours.map((steps, hour) => ({
      hour,
      steps,
      height: (steps / maxSteps) * 100,
    }));
  }, [todayActivity]);

  const handleAddEntry = async () => {
    const value = parseInt(entryValue, 10);
    if (isNaN(value) || value < 0) return;

    const today = new Date().toISOString().split('T')[0];
    const currentActivity = todayActivity || {
      date: today,
      steps: 0,
      activeMinutes: 0,
      caloriesBurned: 0,
      distance: 0,
      floorsClimbed: 0,
      hourlySteps: Array(24).fill(0),
      hourlyActiveMinutes: Array(24).fill(0),
    };

    const updatedActivity: ActivityData = {
      ...currentActivity,
      [entryType === 'steps' ? 'steps' : entryType === 'active' ? 'activeMinutes' : 'caloriesBurned']:
        currentActivity[entryType === 'steps' ? 'steps' : entryType === 'active' ? 'activeMinutes' : 'caloriesBurned'] + value,
    };

    // Update hourly data for current hour
    if (entryType === 'steps') {
      const currentHour = new Date().getHours();
      updatedActivity.hourlySteps = [...currentActivity.hourlySteps];
      updatedActivity.hourlySteps[currentHour] += value;
    }

    await updateActivityData(updatedActivity);
    setShowEntryModal(false);
    setEntryValue('');
  };

  const openEntryModal = (type: 'steps' | 'active' | 'calories') => {
    setEntryType(type);
    setEntryValue('');
    setShowEntryModal(true);
  };

  const metricCards = [
    {
      id: 'steps',
      icon: 'shoe-print',
      title: 'Steps',
      value: todayActivity?.steps || 0,
      goal: goals.dailySteps,
      unit: 'steps',
      color: themeColors.accent.steps,
      progress: stepsProgress,
    },
    {
      id: 'active',
      icon: 'timer-outline',
      title: 'Active Time',
      value: todayActivity?.activeMinutes || 0,
      goal: goals.dailyActiveMinutes,
      unit: 'min',
      color: themeColors.accent.activity,
      progress: activeProgress,
    },
    {
      id: 'calories',
      icon: 'fire',
      title: 'Calories',
      value: todayActivity?.caloriesBurned || 0,
      goal: goals.dailyCalories,
      unit: 'kcal',
      color: themeColors.accent.calories,
      progress: caloriesProgress,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
        Activity
      </Text>

      {/* Week calendar */}
      <WeekCalendar style={styles.calendar} />

      {/* Activity rings */}
      <Card style={[styles.ringsCard, { backgroundColor: colors.card }]}>
        <Card.Content style={styles.ringsContent}>
          <View style={styles.ringsContainer}>
            <ActivityRings
              rings={rings}
              size={180}
              strokeWidth={14}
              gap={8}
            />
          </View>

          <View style={styles.ringsLegend}>
            {rings.map((ring) => (
              <View key={ring.label} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: ring.color }]}
                />
                <View style={styles.legendText}>
                  <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                    {ring.label}
                  </Text>
                  <Text variant="bodyLarge" style={[styles.legendValue, { color: colors.text }]}>
                    {ring.value.toLocaleString()}
                    <Text variant="bodySmall" style={{ color: colors.textMuted }}>
                      /{ring.goal.toLocaleString()}
                    </Text>
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Metric cards */}
      <View style={styles.metricsGrid}>
        {metricCards.map((metric) => (
          <Card
            key={metric.id}
            style={[styles.metricCard, { backgroundColor: colors.card }]}
            onPress={() => openEntryModal(metric.id as any)}
          >
            <Card.Content style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <View
                  style={[
                    styles.metricIcon,
                    { backgroundColor: `${metric.color}20` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={metric.icon}
                    size={20}
                    color={metric.color}
                  />
                </View>
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={20}
                  color={colors.textMuted}
                />
              </View>

              <Text variant="titleMedium" style={[styles.metricValue, { color: colors.text }]}>
                {metric.value.toLocaleString()}
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                  {' '}{metric.unit}
                </Text>
              </Text>

              <View style={[styles.progressBar, { backgroundColor: colors.divider }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, metric.progress)}%`,
                      backgroundColor: metric.color,
                    },
                  ]}
                />
              </View>

              <Text variant="labelSmall" style={{ color: colors.textMuted }}>
                Goal: {metric.goal.toLocaleString()} {metric.unit}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Hourly steps chart */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: colors.text }]}
      >
        Hourly Steps
      </Text>

      <Card style={[styles.chartCard, { backgroundColor: colors.card }]}>
        <Card.Content>
          <View style={styles.barChart}>
            {hourlyData.map((item) => (
              <View key={item.hour} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(4, item.height)}%`,
                      backgroundColor:
                        item.steps > 0 ? themeColors.accent.steps : colors.divider,
                    },
                  ]}
                />
                {item.hour % 6 === 0 && (
                  <Text variant="labelSmall" style={[styles.barLabel, { color: colors.textMuted }]}>
                    {item.hour === 0 ? '12a' : item.hour === 12 ? '12p' : item.hour < 12 ? `${item.hour}a` : `${item.hour - 12}p`}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <View style={[styles.currentTimeIndicator, { left: `${(new Date().getHours() / 24) * 100}%` }]}>
            <View style={[styles.currentTimeLine, { backgroundColor: themeColors.primary.main }]} />
          </View>
        </Card.Content>
      </Card>

      {/* Summary stats */}
      <View style={styles.summaryGrid}>
        <Card style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Card.Content style={styles.summaryContent}>
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={24}
              color={themeColors.accent.water}
            />
            <Text variant="titleMedium" style={[styles.summaryValue, { color: colors.text }]}>
              {(todayActivity?.distance || 0).toFixed(2)}
            </Text>
            <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
              km walked
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Card.Content style={styles.summaryContent}>
            <MaterialCommunityIcons
              name="stairs-up"
              size={24}
              color={themeColors.accent.heart}
            />
            <Text variant="titleMedium" style={[styles.summaryValue, { color: colors.text }]}>
              {todayActivity?.floorsClimbed || 0}
            </Text>
            <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
              floors climbed
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Entry modal */}
      <Portal>
        <Modal
          visible={showEntryModal}
          onDismiss={() => setShowEntryModal(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text
            variant="titleLarge"
            style={[styles.modalTitle, { color: colors.text }]}
          >
            Add {entryType === 'steps' ? 'Steps' : entryType === 'active' ? 'Active Time' : 'Calories'}
          </Text>

          <TextInput
            mode="outlined"
            label={entryType === 'steps' ? 'Number of steps' : entryType === 'active' ? 'Minutes' : 'Calories (kcal)'}
            value={entryValue}
            onChangeText={setEntryValue}
            keyboardType="numeric"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={themeColors.primary.main}
            textColor={colors.text}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="text"
              onPress={() => setShowEntryModal(false)}
              textColor={colors.textSecondary}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddEntry}
              disabled={!entryValue || parseInt(entryValue, 10) <= 0}
              buttonColor={themeColors.primary.main}
            >
              Add
            </Button>
          </View>
        </Modal>
      </Portal>
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
  title: {
    fontWeight: '600',
    marginBottom: 20,
  },
  calendar: {
    marginBottom: 16,
  },
  ringsCard: {
    borderRadius: 20,
    marginBottom: 20,
  },
  ringsContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  ringsContainer: {
    marginBottom: 24,
  },
  ringsLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    alignItems: 'flex-start',
  },
  legendValue: {
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
  },
  metricContent: {
    paddingVertical: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  chartCard: {
    borderRadius: 16,
    marginBottom: 20,
  },
  barChart: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    position: 'relative',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 9,
    marginTop: 4,
  },
  currentTimeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: '100%',
  },
  currentTimeLine: {
    width: 2,
    height: '100%',
    opacity: 0.5,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
  },
  summaryContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryValue: {
    fontWeight: '600',
    marginVertical: 4,
  },
  modal: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
  },
  modalTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
