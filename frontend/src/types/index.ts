export interface BloodPressure {
  id: number;
  timestamp: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  note?: string;
  source: 'manual' | 'android';
  createdAt: string;
}

export interface Food {
  id: number;
  timestamp: string;
  description: string;
  calories?: number;
  source: 'manual' | 'android';
  createdAt: string;
}

export interface Water {
  id: number;
  timestamp: string;
  amountMl: number;
  type: 'water' | 'tea' | 'coffee' | 'juice' | 'other';
  source: 'manual' | 'android';
  createdAt: string;
}
