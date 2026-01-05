import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Text, SegmentedButtons } from 'react-native-paper';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import Water from '../database/models/Water';
import { format } from 'date-fns';

export default function WaterScreen() {
  const [entries, setEntries] = useState<Water[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [drinkType, setDrinkType] = useState<'water' | 'tea' | 'coffee' | 'juice' | 'other'>('water');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();

    const subscription = database.collections
      .get<Water>('water')
      .query(Q.sortBy('timestamp', Q.desc))
      .observe()
      .subscribe((data) => {
        setEntries(data);
        calculateTodayTotal(data);
      });

    return () => subscription.unsubscribe();
  }, []);

  const loadEntries = async () => {
    const data = await database.collections
      .get<Water>('water')
      .query(Q.sortBy('timestamp', Q.desc))
      .fetch();
    setEntries(data);
    calculateTodayTotal(data);
  };

  const calculateTodayTotal = (data: Water[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todayEntries = data.filter((e) => e.timestamp >= todayTimestamp);
    const total = todayEntries.reduce((sum, e) => sum + e.amountMl, 0);
    setTodayTotal(total);
  };

  const addWater = async (amountMl: number) => {
    setLoading(true);
    try {
      await database.write(async () => {
        await database.collections.get<Water>('water').create((record) => {
          record.timestamp = Date.now();
          record.amountMl = amountMl;
          record.type = drinkType;
          record.source = 'manual';
          record.synced = false;
        });
      });
    } catch (error) {
      console.error('Error adding water entry:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group entries by date
  const groupedEntries: { [key: string]: Water[] } = {};
  entries.forEach((entry) => {
    const dateKey = format(new Date(entry.timestamp), 'yyyy-MM-dd');
    if (!groupedEntries[dateKey]) {
      groupedEntries[dateKey] = [];
    }
    groupedEntries[dateKey].push(entry);
  });

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Water Intake
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="labelMedium" style={styles.label}>
            Today's Total
          </Text>
          <Text variant="displayLarge" style={styles.total}>
            {todayTotal} ml
          </Text>
          <Text variant="bodyMedium" style={styles.liters}>
            {(todayTotal / 1000).toFixed(2)} liters
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="labelMedium" style={styles.label}>
            Drink Type
          </Text>
          <SegmentedButtons
            value={drinkType}
            onValueChange={(value) => setDrinkType(value as typeof drinkType)}
            buttons={[
              { value: 'water', label: 'Water' },
              { value: 'tea', label: 'Tea' },
              { value: 'coffee', label: 'Coffee' },
              { value: 'juice', label: 'Juice' },
              { value: 'other', label: 'Other' },
            ]}
            style={styles.segmented}
          />

          <Text variant="labelMedium" style={styles.label}>
            Quick Add
          </Text>
          <View style={styles.buttonGrid}>
            <Button
              mode="contained-tonal"
              onPress={() => addWater(250)}
              disabled={loading}
              style={styles.quickButton}
            >
              250 ml
            </Button>
            <Button
              mode="contained-tonal"
              onPress={() => addWater(500)}
              disabled={loading}
              style={styles.quickButton}
            >
              500 ml
            </Button>
            <Button
              mode="contained-tonal"
              onPress={() => addWater(750)}
              disabled={loading}
              style={styles.quickButton}
            >
              750 ml
            </Button>
            <Button
              mode="contained-tonal"
              onPress={() => addWater(1000)}
              disabled={loading}
              style={styles.quickButton}
            >
              1 L
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.subtitle}>
        History
      </Text>

      {Object.keys(groupedEntries)
        .sort()
        .reverse()
        .map((dateKey) => {
          const dailyTotal = groupedEntries[dateKey].reduce((sum, e) => sum + e.amountMl, 0);
          return (
            <View key={dateKey}>
              <Text variant="titleSmall" style={styles.dateHeader}>
                {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')} - {dailyTotal} ml
              </Text>
              {groupedEntries[dateKey].map((entry) => (
                <Card key={entry.id} style={styles.listCard}>
                  <Card.Content>
                    <View style={styles.entryRow}>
                      <Text variant="bodyLarge">{entry.amountMl} ml</Text>
                      <Text variant="bodyMedium" style={styles.type}>
                        {entry.type}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.timestamp}>
                      {format(new Date(entry.timestamp), 'h:mm a')}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    marginBottom: 16,
  },
  listCard: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 8,
  },
  total: {
    marginBottom: 4,
    color: '#0078d4',
  },
  liters: {
    opacity: 0.7,
  },
  segmented: {
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    minWidth: '45%',
  },
  dateHeader: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    textTransform: 'capitalize',
    opacity: 0.7,
  },
  timestamp: {
    opacity: 0.7,
    marginTop: 4,
  },
});
