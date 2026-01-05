import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, ActivityIndicator, Banner } from 'react-native-paper';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import BloodPressure from '../database/models/BloodPressure';
import Food from '../database/models/Food';
import Water from '../database/models/Water';

export default function Dashboard() {
  const [latestBP, setLatestBP] = useState<BloodPressure | null>(null);
  const [todayWater, setTodayWater] = useState(0);
  const [todayFood, setTodayFood] = useState(0);
  const [loading, setLoading] = useState(true);

  const { isOnline } = useNetworkStatus();

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Dashboard
      </Text>

      {!isOnline && (
        <Banner visible={true} icon="wifi-off">
          Offline Mode - Data will sync when online
        </Banner>
      )}

      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.cardLabel}>
              Latest Blood Pressure
            </Text>
            {latestBP ? (
              <>
                <Text variant="displaySmall" style={styles.cardValue}>
                  {latestBP.systolic}/{latestBP.diastolic}
                </Text>
                <Text variant="bodySmall" style={styles.cardSubtext}>
                  {latestBP.pulse && `${latestBP.pulse} bpm • `}
                  {new Date(latestBP.timestamp).toLocaleString()}
                </Text>
              </>
            ) : (
              <Text variant="displaySmall" style={styles.cardValue}>
                -
              </Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.cardLabel}>
              Today's Water Intake
            </Text>
            <Text variant="displaySmall" style={styles.cardValue}>
              {todayWater} ml
            </Text>
            <Text variant="bodySmall" style={styles.cardSubtext}>
              {(todayWater / 1000).toFixed(1)} liters
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.cardLabel}>
              Today's Food Entries
            </Text>
            <Text variant="displaySmall" style={styles.cardValue}>
              {todayFood}
            </Text>
            <Text variant="bodySmall" style={styles.cardSubtext}>
              {todayFood === 1 ? 'entry' : 'entries'}
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  grid: {
    gap: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardLabel: {
    marginBottom: 8,
  },
  cardValue: {
    marginBottom: 4,
  },
  cardSubtext: {
    opacity: 0.7,
  },
});
