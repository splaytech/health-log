import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal, SegmentedButtons } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, colors as themeColors } from '../context/ThemeContext';
import { useHealthData, METRIC_RANGES } from '../context/HealthDataContext';
import { MetricCard, MetricStatus } from '../components/ui/MetricCard';
import { StressLevelSelector } from '../components/ui/MoodSelector';
import { database } from '../database';
import BloodPressureModel from '../database/models/BloodPressure';
import { format } from 'date-fns';

type MetricType = 'bloodPressure' | 'bloodGlucose' | 'heartRate' | 'stress' | 'bloodOxygen';

export default function HealthMetrics() {
  const { colors } = useTheme();
  const {
    latestBloodPressure,
    bloodGlucoseReadings,
    heartRateReadings,
    stressReadings,
    bloodOxygenReadings,
    addBloodGlucose,
    addHeartRate,
    addStress,
    addBloodOxygen,
  } = useHealthData();

  const [showModal, setShowModal] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricType>('heartRate');

  // Form states
  const [heartRateValue, setHeartRateValue] = useState('');
  const [heartRateContext, setHeartRateContext] = useState<'resting' | 'active' | 'exercise' | 'sleep'>('resting');
  const [glucoseValue, setGlucoseValue] = useState('');
  const [glucoseContext, setGlucoseContext] = useState<'fasting' | 'before_meal' | 'after_meal' | 'bedtime'>('fasting');
  const [oxygenValue, setOxygenValue] = useState('');
  const [stressLevel, setStressLevel] = useState<number | undefined>();

  // Blood pressure form states
  const [systolicValue, setSystolicValue] = useState('');
  const [diastolicValue, setDiastolicValue] = useState('');
  const [pulseValue, setPulseValue] = useState('');
  const [bpSaving, setBpSaving] = useState(false);

  // Get latest readings
  const latestGlucose = bloodGlucoseReadings[0];
  const latestHeartRate = heartRateReadings[0];
  const latestStress = stressReadings[0];
  const latestOxygen = bloodOxygenReadings[0];

  // Determine status colors based on ranges
  const getHeartRateStatus = (bpm: number): MetricStatus => {
    const { normal, elevated } = METRIC_RANGES.heartRate;
    if (bpm < normal[0]) return 'low';
    if (bpm >= normal[0] && bpm <= normal[1]) return 'normal';
    if (bpm > normal[1] && bpm <= elevated[1]) return 'elevated';
    return 'critical';
  };

  const getOxygenStatus = (spo2: number): MetricStatus => {
    const { normal, low, critical } = METRIC_RANGES.bloodOxygen;
    if (spo2 >= normal[0]) return 'normal';
    if (spo2 >= low[0]) return 'warning';
    return 'critical';
  };

  const getBPStatus = (): MetricStatus => {
    if (!latestBloodPressure) return 'normal';
    const { systolic, diastolic } = latestBloodPressure;
    if (systolic >= 140 || diastolic >= 90) return 'critical';
    if (systolic >= 130 || diastolic >= 85) return 'elevated';
    if (systolic < 90 || diastolic < 60) return 'low';
    return 'normal';
  };

  const openEntryModal = (metric: MetricType) => {
    setActiveMetric(metric);
    setShowModal(true);
    // Reset form values
    setHeartRateValue('');
    setGlucoseValue('');
    setOxygenValue('');
    setStressLevel(undefined);
    setSystolicValue('');
    setDiastolicValue('');
    setPulseValue('');
  };

  const handleSave = async () => {
    switch (activeMetric) {
      case 'bloodPressure':
        if (systolicValue && diastolicValue) {
          setBpSaving(true);
          try {
            await database.write(async () => {
              await database.collections.get<BloodPressureModel>('blood_pressure').create((record) => {
                record.timestamp = Date.now();
                record.systolic = parseInt(systolicValue, 10);
                record.diastolic = parseInt(diastolicValue, 10);
                record.pulse = pulseValue ? parseInt(pulseValue, 10) : undefined;
                record.source = 'manual';
                record.synced = false;
              });
            });
          } catch (error) {
            console.error('Error saving blood pressure:', error);
          } finally {
            setBpSaving(false);
          }
        }
        break;
      case 'heartRate':
        if (heartRateValue) {
          await addHeartRate({
            timestamp: Date.now(),
            bpm: parseInt(heartRateValue, 10),
            context: heartRateContext,
          });
        }
        break;
      case 'bloodGlucose':
        if (glucoseValue) {
          await addBloodGlucose({
            timestamp: Date.now(),
            value: parseInt(glucoseValue, 10),
            mealContext: glucoseContext,
          });
        }
        break;
      case 'bloodOxygen':
        if (oxygenValue) {
          await addBloodOxygen({
            timestamp: Date.now(),
            spo2: parseInt(oxygenValue, 10),
          });
        }
        break;
      case 'stress':
        if (stressLevel) {
          await addStress({
            timestamp: Date.now(),
            level: stressLevel,
          });
        }
        break;
    }
    setShowModal(false);
  };

  const renderModalContent = () => {
    switch (activeMetric) {
      case 'bloodPressure':
        return (
          <>
            <View style={styles.bpRow}>
              <TextInput
                mode="outlined"
                label="Systolic"
                value={systolicValue}
                onChangeText={setSystolicValue}
                keyboardType="numeric"
                style={styles.bpInput}
                outlineColor={colors.border}
                activeOutlineColor={themeColors.primary.main}
                textColor={colors.text}
                placeholder="120"
              />
              <Text style={[styles.bpSlash, { color: colors.textMuted }]}>/</Text>
              <TextInput
                mode="outlined"
                label="Diastolic"
                value={diastolicValue}
                onChangeText={setDiastolicValue}
                keyboardType="numeric"
                style={styles.bpInput}
                outlineColor={colors.border}
                activeOutlineColor={themeColors.primary.main}
                textColor={colors.text}
                placeholder="80"
              />
            </View>
            <TextInput
              mode="outlined"
              label="Pulse (optional)"
              value={pulseValue}
              onChangeText={setPulseValue}
              keyboardType="numeric"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={themeColors.primary.main}
              textColor={colors.text}
              placeholder="72"
            />
          </>
        );
      case 'heartRate':
        return (
          <>
            <TextInput
              mode="outlined"
              label="Heart Rate (bpm)"
              value={heartRateValue}
              onChangeText={setHeartRateValue}
              keyboardType="numeric"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={themeColors.primary.main}
              textColor={colors.text}
            />
            <Text variant="labelMedium" style={[styles.contextLabel, { color: colors.textSecondary }]}>
              Context
            </Text>
            <SegmentedButtons
              value={heartRateContext}
              onValueChange={(value) => setHeartRateContext(value as any)}
              buttons={[
                { value: 'resting', label: 'Resting' },
                { value: 'active', label: 'Active' },
                { value: 'exercise', label: 'Exercise' },
              ]}
              style={styles.segmentedButtons}
            />
          </>
        );
      case 'bloodGlucose':
        return (
          <>
            <TextInput
              mode="outlined"
              label="Blood Glucose (mg/dL)"
              value={glucoseValue}
              onChangeText={setGlucoseValue}
              keyboardType="numeric"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={themeColors.primary.main}
              textColor={colors.text}
            />
            <Text variant="labelMedium" style={[styles.contextLabel, { color: colors.textSecondary }]}>
              Meal Context
            </Text>
            <SegmentedButtons
              value={glucoseContext}
              onValueChange={(value) => setGlucoseContext(value as any)}
              buttons={[
                { value: 'fasting', label: 'Fasting' },
                { value: 'before_meal', label: 'Before' },
                { value: 'after_meal', label: 'After' },
              ]}
              style={styles.segmentedButtons}
            />
          </>
        );
      case 'bloodOxygen':
        return (
          <TextInput
            mode="outlined"
            label="Blood Oxygen (SpO2 %)"
            value={oxygenValue}
            onChangeText={setOxygenValue}
            keyboardType="numeric"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={themeColors.primary.main}
            textColor={colors.text}
          />
        );
      case 'stress':
        return (
          <View style={styles.stressContainer}>
            <Text variant="bodyMedium" style={[styles.stressPrompt, { color: colors.text }]}>
              How stressed are you feeling?
            </Text>
            <StressLevelSelector
              selectedLevel={stressLevel}
              onLevelSelect={setStressLevel}
              style={styles.stressSelector}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeMetric) {
      case 'bloodPressure': return 'Log Blood Pressure';
      case 'heartRate': return 'Log Heart Rate';
      case 'bloodGlucose': return 'Log Blood Glucose';
      case 'bloodOxygen': return 'Log Blood Oxygen';
      case 'stress': return 'Log Stress Level';
      default: return 'Log Metric';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
        Health Metrics
      </Text>

      {/* Primary metrics grid */}
      <View style={styles.metricsGrid}>
        {/* Row 1 */}
        <View style={styles.metricsRow}>
          {/* Blood Pressure */}
          <MetricCard
            title="Blood Pressure"
            value={latestBloodPressure ? `${latestBloodPressure.systolic}/${latestBloodPressure.diastolic}` : '--/--'}
            unit="mmHg"
            icon="heart-pulse"
            iconColor={themeColors.accent.heart}
            status={getBPStatus()}
            subtitle={latestBloodPressure?.pulse ? `Pulse: ${latestBloodPressure.pulse}` : undefined}
            lastUpdated={latestBloodPressure?.timestamp}
            onPress={() => openEntryModal('bloodPressure')}
          />

          {/* Heart Rate */}
          <MetricCard
            title="Heart Rate"
            value={latestHeartRate?.bpm || '--'}
            unit="bpm"
            icon="heart"
            iconColor={themeColors.accent.heartLight}
            status={latestHeartRate ? getHeartRateStatus(latestHeartRate.bpm) : undefined}
            progress={latestHeartRate ? ((latestHeartRate.bpm - 40) / 120) * 100 : 0}
            progressColor={themeColors.accent.heart}
            showProgressBar={true}
            subtitle="60-100 normal"
            lastUpdated={latestHeartRate?.timestamp}
            onPress={() => openEntryModal('heartRate')}
          />
        </View>

        {/* Row 2 */}
        <View style={styles.metricsRow}>
          {/* Blood Oxygen */}
          <MetricCard
            title="Blood Oxygen"
            value={latestOxygen?.spo2 || '--'}
            unit="%"
            icon="lungs"
            iconColor={themeColors.accent.oxygen}
            status={latestOxygen ? getOxygenStatus(latestOxygen.spo2) : undefined}
            progress={latestOxygen?.spo2 || 0}
            progressColor={themeColors.accent.oxygen}
            showProgressBar={true}
            subtitle="95-100% normal"
            lastUpdated={latestOxygen?.timestamp}
            onPress={() => openEntryModal('bloodOxygen')}
          />

          {/* Blood Glucose */}
          <MetricCard
            title="Blood Glucose"
            value={latestGlucose?.value || '--'}
            unit="mg/dL"
            icon="water"
            iconColor={themeColors.accent.glucose}
            subtitle={latestGlucose ? latestGlucose.mealContext.replace('_', ' ') : 'No readings'}
            lastUpdated={latestGlucose?.timestamp}
            onPress={() => openEntryModal('bloodGlucose')}
          />
        </View>
      </View>

      {/* Stress tracking */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: colors.text }]}
      >
        Stress Level
      </Text>

      <Card
        style={[styles.stressCard, { backgroundColor: colors.card }]}
        onPress={() => openEntryModal('stress')}
      >
        <Card.Content>
          <View style={styles.stressHeader}>
            <View style={styles.stressInfo}>
              <View
                style={[
                  styles.stressIcon,
                  { backgroundColor: `${themeColors.accent.stress}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name="head-snowflake-outline"
                  size={24}
                  color={themeColors.accent.stress}
                />
              </View>
              <View>
                <Text variant="titleMedium" style={{ color: colors.text }}>
                  {latestStress ? `Level ${latestStress.level}/5` : 'Not tracked'}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                  {latestStress
                    ? format(latestStress.timestamp, 'MMM d, h:mm a')
                    : 'Tap to log your stress level'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={24}
              color={colors.textMuted}
            />
          </View>

          {/* Stress scale visualization */}
          <View style={styles.stressScale}>
            {themeColors.stressScale.map((color, index) => (
              <View
                key={index}
                style={[
                  styles.stressSegment,
                  {
                    backgroundColor: color,
                    opacity: latestStress?.level === index + 1 ? 1 : 0.3,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.stressLabels}>
            <Text variant="labelSmall" style={{ color: colors.textMuted }}>
              Low
            </Text>
            <Text variant="labelSmall" style={{ color: colors.textMuted }}>
              High
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Advanced metrics section */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: colors.text }]}
      >
        Advanced Lab Metrics
      </Text>

      <View style={styles.advancedMetrics}>
        <Card style={[styles.advancedCard, { backgroundColor: colors.card }]}>
          <Card.Content style={styles.advancedContent}>
            <View style={styles.advancedHeader}>
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color={themeColors.accent.steps}
              />
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            <Text variant="titleSmall" style={[styles.advancedTitle, { color: colors.text }]}>
              Antioxidant Index
            </Text>
            <Text variant="headlineMedium" style={[styles.advancedValue, { color: colors.text }]}>
              --
            </Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
              Not measured
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.advancedCard, { backgroundColor: colors.card }]}>
          <Card.Content style={styles.advancedContent}>
            <View style={styles.advancedHeader}>
              <MaterialCommunityIcons
                name="molecule"
                size={24}
                color={themeColors.accent.sleep}
              />
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            <Text variant="titleSmall" style={[styles.advancedTitle, { color: colors.text }]}>
              AGEs Index
            </Text>
            <Text variant="headlineMedium" style={[styles.advancedValue, { color: colors.text }]}>
              --
            </Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
              Not measured
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.advancedCard, { backgroundColor: colors.card }]}>
          <Card.Content style={styles.advancedContent}>
            <View style={styles.advancedHeader}>
              <MaterialCommunityIcons
                name="chart-line-variant"
                size={24}
                color={themeColors.accent.water}
              />
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            <Text variant="titleSmall" style={[styles.advancedTitle, { color: colors.text }]}>
              Vascular Load
            </Text>
            <Text variant="headlineMedium" style={[styles.advancedValue, { color: colors.text }]}>
              --
            </Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
              Not measured
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Entry modal */}
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text
            variant="titleLarge"
            style={[styles.modalTitle, { color: colors.text }]}
          >
            {getModalTitle()}
          </Text>

          {renderModalContent()}

          <View style={styles.modalButtons}>
            <Button
              mode="text"
              onPress={() => setShowModal(false)}
              textColor={colors.textSecondary}
              disabled={bpSaving}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              buttonColor={themeColors.primary.main}
              loading={bpSaving}
              disabled={
                bpSaving ||
                (activeMetric === 'bloodPressure' && (!systolicValue || !diastolicValue)) ||
                (activeMetric === 'heartRate' && !heartRateValue) ||
                (activeMetric === 'bloodGlucose' && !glucoseValue) ||
                (activeMetric === 'bloodOxygen' && !oxygenValue) ||
                (activeMetric === 'stress' && !stressLevel)
              }
            >
              Save
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
  metricsGrid: {
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  stressCard: {
    borderRadius: 16,
    marginBottom: 24,
  },
  stressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stressIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stressScale: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 2,
  },
  stressSegment: {
    flex: 1,
    borderRadius: 3,
  },
  stressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  advancedMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  advancedCard: {
    flex: 1,
    borderRadius: 16,
  },
  advancedContent: {
    paddingVertical: 4,
  },
  advancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  advancedTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  advancedValue: {
    fontWeight: '600',
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
    marginBottom: 16,
  },
  bpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bpInput: {
    flex: 1,
  },
  bpSlash: {
    fontSize: 24,
    marginHorizontal: 12,
    fontWeight: '300',
  },
  contextLabel: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  stressContainer: {
    marginBottom: 20,
  },
  stressPrompt: {
    textAlign: 'center',
    marginBottom: 20,
  },
  stressSelector: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
