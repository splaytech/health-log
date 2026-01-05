import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, TextInput, Button, Text } from 'react-native-paper';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import Food from '../database/models/Food';
import { format, startOfDay } from 'date-fns';

export default function FoodScreen() {
  const [entries, setEntries] = useState<Food[]>([]);
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();

    const subscription = database.collections
      .get<Food>('food')
      .query(Q.sortBy('timestamp', Q.desc))
      .observe()
      .subscribe(setEntries);

    return () => subscription.unsubscribe();
  }, []);

  const loadEntries = async () => {
    const data = await database.collections
      .get<Food>('food')
      .query(Q.sortBy('timestamp', Q.desc))
      .fetch();
    setEntries(data);
  };

  const handleSubmit = async () => {
    if (!description) return;

    setLoading(true);
    try {
      await database.write(async () => {
        await database.collections.get<Food>('food').create((record) => {
          record.timestamp = Date.now();
          record.description = description;
          record.calories = calories ? parseInt(calories) : undefined;
          record.source = 'manual';
          record.synced = false;
        });
      });

      setDescription('');
      setCalories('');
    } catch (error) {
      console.error('Error creating food entry:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group entries by date
  const groupedEntries: { [key: string]: Food[] } = {};
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
        Food Log
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.inputFull}
          />

          <TextInput
            label="Calories (optional)"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            mode="outlined"
            style={styles.inputFull}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={!description || loading}
          >
            Add Entry
          </Button>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.subtitle}>
        History
      </Text>

      {Object.keys(groupedEntries)
        .sort()
        .reverse()
        .map((dateKey) => (
          <View key={dateKey}>
            <Text variant="titleSmall" style={styles.dateHeader}>
              {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
            </Text>
            {groupedEntries[dateKey].map((entry) => (
              <Card key={entry.id} style={styles.listCard}>
                <Card.Content>
                  <Text variant="bodyLarge">{entry.description}</Text>
                  {entry.calories && (
                    <Text variant="bodyMedium" style={styles.calories}>
                      {entry.calories} calories
                    </Text>
                  )}
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {format(new Date(entry.timestamp), 'h:mm a')}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        ))}
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
  inputFull: {
    marginBottom: 12,
  },
  dateHeader: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  calories: {
    marginTop: 4,
    color: '#0078d4',
  },
  timestamp: {
    opacity: 0.7,
    marginTop: 4,
  },
});
