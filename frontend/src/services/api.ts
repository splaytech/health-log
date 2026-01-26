import { BloodPressure, Food, Water } from '../types';
import { storageService } from './storage';

class ApiService {
  private apiUrl: string = '';
  private apiKey: string = '';

  async initialize() {
    const url = await storageService.getApiUrl();
    const key = await storageService.getApiKey();

    if (url) this.apiUrl = url;
    if (key) this.apiKey = key;
  }

  async updateConfig(url: string, key: string) {
    this.apiUrl = url;
    this.apiKey = key;
    await storageService.setApiUrl(url);
    await storageService.setApiKey(key);
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-API-KEY': this.apiKey,
    };
  }

  // Test connection to API
  testConnection = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(`${this.apiUrl}/api/health`, {
          headers: this.getHeaders(),
        }),
        timeoutPromise,
      ]);

      if (response.ok) {
        return { success: true };
      } else if (response.status === 401 || response.status === 403) {
        return { success: false, error: 'Invalid API key. Please check your credentials.' };
      } else {
        return { success: false, error: `Server error: ${response.status}` };
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Connection timeout') {
          return { success: false, error: 'Connection timeout. Check if the server is running and the URL is correct.' };
        } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          return { success: false, error: 'Cannot reach server. On mobile, use your computer\'s network IP (e.g., http://192.168.1.100:8600), not localhost.' };
        }
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Unknown connection error' };
    }
  };

  // Blood Pressure API
  bloodPressure = {
    getAll: async (): Promise<BloodPressure[]> => {
      const response = await fetch(`${this.apiUrl}/api/blood-pressure`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch blood pressure readings');
      return response.json();
    },

    create: async (data: Omit<BloodPressure, 'id' | 'createdAt'>): Promise<BloodPressure> => {
      const response = await fetch(`${this.apiUrl}/api/blood-pressure`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create blood pressure reading');
      return response.json();
    },
  };

  // Food API
  food = {
    getAll: async (): Promise<Food[]> => {
      const response = await fetch(`${this.apiUrl}/api/food`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch food entries');
      return response.json();
    },

    create: async (data: Omit<Food, 'id' | 'createdAt'>): Promise<Food> => {
      const response = await fetch(`${this.apiUrl}/api/food`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create food entry');
      return response.json();
    },
  };

  // Water API
  water = {
    getAll: async (startDate?: string, endDate?: string): Promise<Water[]> => {
      let url = `${this.apiUrl}/api/water`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch water entries');
      return response.json();
    },

    create: async (data: Omit<Water, 'id' | 'createdAt'>): Promise<Water> => {
      const response = await fetch(`${this.apiUrl}/api/water`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create water entry');
      return response.json();
    },
  };
}

export const apiService = new ApiService();
