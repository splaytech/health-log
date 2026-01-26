import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Text, ActivityIndicator, Banner } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme, colors as themeColors } from '../context/ThemeContext';
import { useHealthData } from '../context/HealthDataContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { MetricCard } from '../components/ui/MetricCard';
import { ActivityRings } from '../components/ui/ProgressRing';
import { MoodWeekView } from '../components/ui/WeekCalendar';
import BloodPressure from '../database/models/BloodPressure';
import Food from '../database/models/Food';
import Water from '../database/models/Water';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { isOnline } = useNetworkStatus();
  const { preferences } = useUserPreferences();
  const {
    latestBloodPressure,
    heartRateReadings,
    bloodOxygenReadings,
    stressReadings,
    moodEntries,
    getTodayActivity,
    getWeekMoods,
    todayWaterIntake,
    todayCalories,
    isLoading: healthLoading,
  } = useHealthData();

  const [latestBP, setLatestBP] = useState<BloodPressure | null>(null);
  const [todayWater, setTodayWater] = useState(0);
  const [todayFood, setTodayFood] = useState(0);
  const [loading, setLoading] = useState(true);

  const todayActivity = getTodayActivity();
  const weekMoods = getWeekMoods();
  const goals = preferences.activityGoals;

  // Calculate activity progress
  const stepsProgress = ((todayActivity?.steps || 0) / goals.dailySteps) * 100;
  const activeProgress = ((todayActivity?.activeMinutes || 0) / goals.dailyActiveMinutes) * 100;
  const caloriesProgress = ((todayActivity?.caloriesBurned || 0) / goals.dailyCalories) * 100;

  const activityRings = useMemo(() => [
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
  ], [todayActivity, goals, stepsProgress, activeProgress, caloriesProgress]);

  const latestHeartRate = heartRateReadings[0];
  const latestOxygen = bloodOxygenReadings[0];
  const latestStress = stressReadings[0];

  useEffect(() => {
    loadDashboardData();

    // Subscribe to database changes for real-time updates
    const subscriptions = [
      database.collections
        .get<BloodPressure>('blood_pressure')
        .query()
        .observe()
        .subscribe(loadDashboardData),
      database.collections
        .get<Water>('water')
        .query()
        .observe()
        .subscribe(loadDashboardData),
      database.collections
        .get<Food>('food')
        .query()
        .observe()
        .subscribe(loadDashboardData),
    ];

    return () => subscriptions.forEach((s) => s.unsubscribe());
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();

      // Latest BP
      const bpReadings = await database.collections
        .get<BloodPressure>('blood_pressure')
        .query(Q.sortBy('timestamp', Q.desc), Q.take(1))
        .fetch();
      if (bpReadings.length > 0) setLatestBP(bpReadings[0]);

      // Today's water
      const waterEntries = await database.collections
        .get<Water>('water')
        .query(Q.where('timestamp', Q.gte(todayTimestamp)))
        .fetch();
      const waterTotal = waterEntries.reduce((sum, e) => sum + e.amountMl, 0);
      setTodayWater(waterTotal);

      // Today's food
      const foodEntries = await database.collections
        .get<Food>('food')
        .query(Q.where('timestamp', Q.gte(todayTimestamp)))
        .fetch();
      setTodayFood(foodEntries.length);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || healthLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {!isOnline && (
        <Banner
          visible={true}
          icon={() => (
            <MaterialCommunityIcons name="wifi-off" size={24} color={colors.text} />
          )}
          style={[styles.offlineBanner, { backgroundColor: colors.surfaceElevated }]}
        >
          <Text style={{ color: colors.textSecondary }}>
            Offline Mode - Data will sync when online
          </Text>
        </Banner>
      )}

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text variant="headlineSmall" style={[styles.greetingText, { color: colors.text }]}>
          {getGreeting()}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
          {format(new Date(), 'EEEE, MMMM d')}
        </Text>
      </View>

      {/* Activity rings summary */}
      <Card
        style={[styles.activityCard, { backgroundColor: colors.card }]}
        onPress={() => (navigation as any).navigate('Activity')}
      >
        <Card.Content style={styles.activityContent}>
          <View style={styles.ringsSection}>
            <ActivityRings
              rings={activityRings}
              size={120}
              strokeWidth={10}
              gap={5}
            />
          </View>
          <View style={styles.activityStats}>
            <View style={styles.statRow}>
              <View style={[styles.statDot, { backgroundColor: themeColors.accent.steps }]} />
              <Text variant="bodyMedium" style={{ color: colors.text }}>
                {(todayActivity?.steps || 0).toLocaleString()} steps
              </Text>
            </View>
            <View style={styles.statRow}>
              <View style={[styles.statDot, { backgroundColor: themeColors.accent.activity }]} />
              <Text variant="bodyMedium" style={{ color: colors.text }}>
                {todayActivity?.activeMinutes || 0} min active
              </Text>
            </View>
            <View style={styles.statRow}>
              <View style={[styles.statDot, { backgroundColor: themeColors.accent.calories }]} />
              <Text variant="bodyMedium" style={{ color: colors.text }}>
                {todayActivity?.caloriesBurned || 0} kcal
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick metrics */}
      <View style={styles.metricsRow}>
        <MetricCard
          title="Blood Pressure"
          value={latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
          unit="mmHg"
          icon="heart-pulse"
          iconColor={themeColors.accent.heart}
          lastUpdated={latestBP?.timestamp}
          compact
        />
        <MetricCard
          title="Heart Rate"
          value={latestHeartRate?.bpm || '--'}
          unit="bpm"
          icon="heart"
          iconColor={themeColors.accent.heartLight}
          lastUpdated={latestHeartRate?.timestamp}
          compact
        />
      </View>

      <View style={styles.metricsRow}>
        <MetricCard
          title="Water"
          value={todayWater}
          unit="ml"
          icon="water"
          iconColor={themeColors.accent.water}
          subtitle={`${(todayWater / 1000).toFixed(1)}L`}
          progress={(todayWater / goals.dailyWaterMl) * 100}
          progressColor={themeColors.accent.water}
          showProgressBar
          compact
        />
        <MetricCard
          title="Blood Oxygen"
          value={latestOxygen?.spo2 || '--'}
          unit="%"
          icon="lungs"
          iconColor={themeColors.accent.oxygen}
          lastUpdated={latestOxygen?.timestamp}
          status={latestOxygen && latestOxygen.spo2 < 95 ? 'warning' : 'normal'}
          compact
        />
      </View>

      {/* Mood week overview */}
      <TouchableOpacity
        onPress={() => (navigation as any).navigate('Mindfulness')}
        activeOpacity={0.7}
      >
        <MoodWeekView weekMoods={weekMoods} style={styles.moodCard} />
      </TouchableOpacity>

      {/* Food summary */}
      <Card style={[styles.summaryCard, { backgroundColor: colors.card }]}>
        <Card.Content style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons
              name="food-apple"
              size={28}
              color={themeColors.accent.glucose}
            />
            <View style={styles.summaryText}>
              <Text variant="titleMedium" style={[styles.summaryValue, { color: colors.text }]}>
                {todayFood}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                meals logged
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.summaryItem}>
            <MaterialCommunityIcons
              name="fire"
              size={28}
              color={themeColors.accent.calories}
            />
            <View style={styles.summaryText}>
              <Text variant="titleMedium" style={[styles.summaryValue, { color: colors.text }]}>
                {todayCalories}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                kcal consumed
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.summaryItem}>
            <MaterialCommunityIcons
              name="head-snowflake-outline"
              size={28}
              color={latestStress ? themeColors.stressScale[latestStress.level - 1] : colors.textMuted}
            />
            <View style={styles.summaryText}>
              <Text variant="titleMedium" style={[styles.summaryValue, { color: colors.text }]}>
                {latestStress ? `${latestStress.level}/5` : '--'}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                stress level
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBanner: {
    marginBottom: 12,
    borderRadius: 12,
  },
  greeting: {
    marginBottom: 20,
  },
  greetingText: {
    fontWeight: '600',
    marginBottom: 4,
  },
  activityCard: {
    borderRadius: 20,
    marginBottom: 16,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  ringsSection: {
    marginRight: 24,
  },
  activityStats: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  moodCard: {
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryText: {
    alignItems: 'center',
    marginTop: 8,
  },
  summaryValue: {
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 50,
  },
});
