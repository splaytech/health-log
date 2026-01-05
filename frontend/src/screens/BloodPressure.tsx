import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, TextInput, Button, Text } from 'react-native-paper';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryLegend, VictoryTheme } from 'victory-native';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import BloodPressure from '../database/models/BloodPressure';

export default function BloodPressureScreen() {
  const [readings, setReadings] = useState<BloodPressure[]>([]);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReadings();

    const subscription = database.collections
      .get<BloodPressure>('blood_pressure')
      .query(Q.sortBy('timestamp', Q.desc))
      .observe()
      .subscribe(setReadings);

    return () => subscription.unsubscribe();
  }, []);

  const loadReadings = async () => {
    const data = await database.collections
      .get<BloodPressure>('blood_pressure')
      .query(Q.sortBy('timestamp', Q.desc))
      .fetch();
    setReadings(data);
  };

  const handleSubmit = async () => {
    if (!systolic || !diastolic) return;

    setLoading(true);
    try {
      await database.write(async () => {
        await database.collections.get<BloodPressure>('blood_pressure').create((record) => {
          record.timestamp = Date.now();
          record.systolic = parseInt(systolic);
          record.diastolic = parseInt(diastolic);
          record.pulse = pulse ? parseInt(pulse) : undefined;
          record.note = note || undefined;
          record.source = 'manual';
          record.synced = false; // Will sync later
        });
      });

      setSystolic('');
      setDiastolic('');
      setPulse('');
      setNote('');
    } catch (error) {
      console.error('Error creating reading:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data (last 20 readings)
  const chartData = readings
    .slice(0, 20)
    .reverse()
    .map((r, idx) => ({
      x: idx + 1,
      systolic: r.systolic,
      diastolic: r.diastolic,
    }));

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Blood Pressure
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.formRow}>
            <TextInput
              label="Systolic (mmHg)"
              value={systolic}
              onChangeText={setSystolic}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Diastolic (mmHg)"
              value={diastolic}
              onChangeText={setDiastolic}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
          </View>

          <TextInput
            label="Pulse (bpm)"
            value={pulse}
            onChangeText={setPulse}
            keyboardType="numeric"
            mode="outlined"
            style={styles.inputFull}
          />

          <TextInput
            label="Note"
            value={note}
            onChangeText={setNote}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.inputFull}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={!systolic || !diastolic || loading}
          >
            Add Reading
          </Button>
        </Card.Content>
      </Card>

      {chartData.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.subtitle}>
              Recent Readings (Last 20)
            </Text>
            <VictoryChart
              theme={VictoryTheme.material}
              width={Dimensions.get('window').width - 64}
              height={250}
            >
              <VictoryAxis
                style={{
                  tickLabels: { fontSize: 10 },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  tickLabels: { fontSize: 10 },
                }}
              />
              <VictoryLine
                data={chartData}
                y="systolic"
                style={{
                  data: { stroke: '#0078d4', strokeWidth: 2 },
                }}
              />
              <VictoryLine
                data={chartData}
                y="diastolic"
                style={{
                  data: { stroke: '#00b7c3', strokeWidth: 2 },
                }}
              />
              <VictoryLegend
                x={20}
                y={10}
                orientation="horizontal"
                gutter={20}
                data={[
                  { name: 'Systolic', symbol: { fill: '#0078d4' } },
                  { name: 'Diastolic', symbol: { fill: '#00b7c3' } },
                ]}
              />
            </VictoryChart>
          </Card.Content>
        </Card>
      )}

      <Text variant="titleMedium" style={styles.subtitle}>
        History
      </Text>
      {readings.map((reading) => (
        <Card key={reading.id} style={styles.listCard}>
          <Card.Content>
            <Text variant="titleLarge">
              {reading.systolic}/{reading.diastolic}
              {reading.pulse && ` • ${reading.pulse} bpm`}
            </Text>
            <Text variant="bodySmall" style={styles.timestamp}>
              {new Date(reading.timestamp).toLocaleString()}
            </Text>
            {reading.note && <Text variant="bodyMedium">{reading.note}</Text>}
            <Text variant="bodySmall" style={styles.source}>
              Source: {reading.source}
            </Text>
          </Card.Content>
        </Card>
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
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
  },
  inputFull: {
    marginBottom: 12,
  },
  timestamp: {
    opacity: 0.7,
    marginTop: 4,
  },
  source: {
    opacity: 0.5,
    marginTop: 4,
  },
});
