import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import BloodPressure from '../database/models/BloodPressure';
import Food from '../database/models/Food';
import Water from '../database/models/Water';

// Health metric types
export interface BloodPressureReading {
  id: string;
  timestamp: number;
  systolic: number;
  diastolic: number;
  pulse?: number;
  note?: string;
}

export interface BloodGlucoseReading {
  id: string;
  timestamp: number;
  value: number; // mg/dL
  mealContext: 'fasting' | 'before_meal' | 'after_meal' | 'bedtime';
  note?: string;
}

export interface HeartRateReading {
  id: string;
  timestamp: number;
  bpm: number;
  context: 'resting' | 'active' | 'exercise' | 'sleep';
  note?: string;
}

export interface StressReading {
  id: string;
  timestamp: number;
  level: number; // 1-5 scale
  note?: string;
}

export interface BloodOxygenReading {
  id: string;
  timestamp: number;
  spo2: number; // percentage
  note?: string;
}

export interface MoodEntry {
  id: string;
  timestamp: number;
  mood: 'happy' | 'fine' | 'neutral' | 'sad' | 'stressed';
  note?: string;
}

export interface ActivityData {
  date: string; // YYYY-MM-DD
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  distance: number; // km
  floorsClimbed: number;
  hourlySteps: number[]; // 24 entries for each hour
  hourlyActiveMinutes: number[]; // 24 entries for each hour
}

// Metric ranges for color coding
export const METRIC_RANGES = {
  bloodPressure: {
    systolic: { low: 90, normal: [90, 120], elevated: [120, 130], high1: [130, 140], high2: [140, 180], crisis: 180 },
    diastolic: { low: 60, normal: [60, 80], elevated: [80, 85], high1: [85, 90], high2: [90, 120], crisis: 120 },
  },
  heartRate: {
    low: 40,
    normal: [60, 100],
    elevated: [100, 120],
    high: 120,
  },
  bloodOxygen: {
    normal: [95, 100],
    low: [90, 95],
    critical: 90,
  },
  bloodGlucose: {
    fasting: { low: 70, normal: [70, 100], prediabetic: [100, 126], diabetic: 126 },
    afterMeal: { low: 70, normal: [70, 140], elevated: [140, 200], high: 200 },
  },
};

interface HealthDataContextType {
  // Blood Pressure
  bloodPressureReadings: BloodPressureReading[];
  latestBloodPressure: BloodPressureReading | null;

  // Blood Glucose (stored locally)
  bloodGlucoseReadings: BloodGlucoseReading[];
  addBloodGlucose: (reading: Omit<BloodGlucoseReading, 'id'>) => Promise<void>;

  // Heart Rate (stored locally)
  heartRateReadings: HeartRateReading[];
  addHeartRate: (reading: Omit<HeartRateReading, 'id'>) => Promise<void>;

  // Stress (stored locally)
  stressReadings: StressReading[];
  addStress: (reading: Omit<StressReading, 'id'>) => Promise<void>;

  // Blood Oxygen (stored locally)
  bloodOxygenReadings: BloodOxygenReading[];
  addBloodOxygen: (reading: Omit<BloodOxygenReading, 'id'>) => Promise<void>;

  // Mood (stored locally)
  moodEntries: MoodEntry[];
  addMood: (entry: Omit<MoodEntry, 'id'>) => Promise<void>;
  getTodayMoods: () => MoodEntry[];
  getWeekMoods: () => { date: string; moods: MoodEntry[] }[];

  // Activity (stored locally)
  activityData: ActivityData[];
  updateActivityData: (data: ActivityData) => Promise<void>;
  getTodayActivity: () => ActivityData | null;

  // Water tracking from DB
  todayWaterIntake: number;

  // Food tracking from DB
  todayFoodEntries: number;
  todayCalories: number;

  // Refresh data
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

// Storage keys for local health data
const STORAGE_KEYS = {
  bloodGlucose: 'health_blood_glucose',
  heartRate: 'health_heart_rate',
  stress: 'health_stress',
  bloodOxygen: 'health_blood_oxygen',
  mood: 'health_mood',
  activity: 'health_activity',
};

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

interface HealthDataProviderProps {
  children: ReactNode;
}

export function HealthDataProvider({ children }: HealthDataProviderProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Blood pressure from WatermelonDB
  const [bloodPressureReadings, setBloodPressureReadings] = useState<BloodPressureReading[]>([]);
  const [latestBloodPressure, setLatestBloodPressure] = useState<BloodPressureReading | null>(null);

  // Local storage health data
  const [bloodGlucoseReadings, setBloodGlucoseReadings] = useState<BloodGlucoseReading[]>([]);
  const [heartRateReadings, setHeartRateReadings] = useState<HeartRateReading[]>([]);
  const [stressReadings, setStressReadings] = useState<StressReading[]>([]);
  const [bloodOxygenReadings, setBloodOxygenReadings] = useState<BloodOxygenReading[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);

  // Water and food from DB
  const [todayWaterIntake, setTodayWaterIntake] = useState(0);
  const [todayFoodEntries, setTodayFoodEntries] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadBloodPressureFromDB(),
        loadLocalHealthData(),
        loadTodayWaterAndFood(),
      ]);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBloodPressureFromDB = async () => {
    try {
      const bpReadings = await database.collections
        .get<BloodPressure>('blood_pressure')
        .query(Q.sortBy('timestamp', Q.desc), Q.take(50))
        .fetch();

      const mapped: BloodPressureReading[] = bpReadings.map(bp => ({
        id: bp.id,
        timestamp: bp.timestamp,
        systolic: bp.systolic,
        diastolic: bp.diastolic,
        pulse: bp.pulse,
        note: bp.note,
      }));

      setBloodPressureReadings(mapped);
      if (mapped.length > 0) {
        setLatestBloodPressure(mapped[0]);
      }
    } catch (error) {
      console.error('Error loading blood pressure:', error);
    }
  };

  const loadLocalHealthData = async () => {
    try {
      const [glucose, hr, stress, oxygen, mood, activity] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.bloodGlucose),
        AsyncStorage.getItem(STORAGE_KEYS.heartRate),
        AsyncStorage.getItem(STORAGE_KEYS.stress),
        AsyncStorage.getItem(STORAGE_KEYS.bloodOxygen),
        AsyncStorage.getItem(STORAGE_KEYS.mood),
        AsyncStorage.getItem(STORAGE_KEYS.activity),
      ]);

      if (glucose) setBloodGlucoseReadings(JSON.parse(glucose));
      if (hr) setHeartRateReadings(JSON.parse(hr));
      if (stress) setStressReadings(JSON.parse(stress));
      if (oxygen) setBloodOxygenReadings(JSON.parse(oxygen));
      if (mood) setMoodEntries(JSON.parse(mood));
      if (activity) setActivityData(JSON.parse(activity));
    } catch (error) {
      console.error('Error loading local health data:', error);
    }
  };

  const loadTodayWaterAndFood = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();

      const waterEntries = await database.collections
        .get<Water>('water')
        .query(Q.where('timestamp', Q.gte(todayTimestamp)))
        .fetch();
      setTodayWaterIntake(waterEntries.reduce((sum, e) => sum + e.amountMl, 0));

      const foodEntries = await database.collections
        .get<Food>('food')
        .query(Q.where('timestamp', Q.gte(todayTimestamp)))
        .fetch();
      setTodayFoodEntries(foodEntries.length);
      setTodayCalories(foodEntries.reduce((sum, e) => sum + (e.calories || 0), 0));
    } catch (error) {
      console.error('Error loading water/food data:', error);
    }
  };

  // Save helper
  const saveLocalData = async <T,>(key: string, data: T[]) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving local data:', error);
      throw error;
    }
  };

  // Blood Glucose
  const addBloodGlucose = async (reading: Omit<BloodGlucoseReading, 'id'>) => {
    const newReading: BloodGlucoseReading = {
      ...reading,
      id: Date.now().toString(),
    };
    const updated = [newReading, ...bloodGlucoseReadings].slice(0, 1000); // Keep last 1000
    setBloodGlucoseReadings(updated);
    await saveLocalData(STORAGE_KEYS.bloodGlucose, updated);
  };

  // Heart Rate
  const addHeartRate = async (reading: Omit<HeartRateReading, 'id'>) => {
    const newReading: HeartRateReading = {
      ...reading,
      id: Date.now().toString(),
    };
    const updated = [newReading, ...heartRateReadings].slice(0, 1000);
    setHeartRateReadings(updated);
    await saveLocalData(STORAGE_KEYS.heartRate, updated);
  };

  // Stress
  const addStress = async (reading: Omit<StressReading, 'id'>) => {
    const newReading: StressReading = {
      ...reading,
      id: Date.now().toString(),
    };
    const updated = [newReading, ...stressReadings].slice(0, 1000);
    setStressReadings(updated);
    await saveLocalData(STORAGE_KEYS.stress, updated);
  };

  // Blood Oxygen
  const addBloodOxygen = async (reading: Omit<BloodOxygenReading, 'id'>) => {
    const newReading: BloodOxygenReading = {
      ...reading,
      id: Date.now().toString(),
    };
    const updated = [newReading, ...bloodOxygenReadings].slice(0, 1000);
    setBloodOxygenReadings(updated);
    await saveLocalData(STORAGE_KEYS.bloodOxygen, updated);
  };

  // Mood
  const addMood = async (entry: Omit<MoodEntry, 'id'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    const updated = [newEntry, ...moodEntries].slice(0, 1000);
    setMoodEntries(updated);
    await saveLocalData(STORAGE_KEYS.mood, updated);
  };

  const getTodayMoods = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    return moodEntries.filter(m => m.timestamp >= todayTimestamp);
  }, [moodEntries]);

  const getWeekMoods = useCallback(() => {
    const result: { date: string; moods: MoodEntry[] }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dateStr = date.toISOString().split('T')[0];
      const dayMoods = moodEntries.filter(
        m => m.timestamp >= date.getTime() && m.timestamp < nextDate.getTime()
      );

      result.push({ date: dateStr, moods: dayMoods });
    }

    return result;
  }, [moodEntries]);

  // Activity
  const updateActivityData = async (data: ActivityData) => {
    const existingIndex = activityData.findIndex(a => a.date === data.date);
    let updated: ActivityData[];

    if (existingIndex >= 0) {
      updated = [...activityData];
      updated[existingIndex] = data;
    } else {
      updated = [data, ...activityData].slice(0, 365); // Keep 1 year
    }

    setActivityData(updated);
    await saveLocalData(STORAGE_KEYS.activity, updated);
  };

  const getTodayActivity = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return activityData.find(a => a.date === today) || null;
  }, [activityData]);

  const refreshData = async () => {
    await loadAllData();
  };

  const value: HealthDataContextType = {
    bloodPressureReadings,
    latestBloodPressure,
    bloodGlucoseReadings,
    addBloodGlucose,
    heartRateReadings,
    addHeartRate,
    stressReadings,
    addStress,
    bloodOxygenReadings,
    addBloodOxygen,
    moodEntries,
    addMood,
    getTodayMoods,
    getWeekMoods,
    activityData,
    updateActivityData,
    getTodayActivity,
    todayWaterIntake,
    todayFoodEntries,
    todayCalories,
    refreshData,
    isLoading,
  };

  return (
    <HealthDataContext.Provider value={value}>{children}</HealthDataContext.Provider>
  );
}

export function useHealthData() {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
}
