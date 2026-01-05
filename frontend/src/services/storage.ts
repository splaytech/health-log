import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL_KEY = 'api_url';
const API_KEY_KEY = 'api_key';
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

export const storageService = {
  // API URL (non-sensitive, use AsyncStorage)
  getApiUrl: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(API_URL_KEY);
  },

  setApiUrl: async (url: string): Promise<void> => {
    await AsyncStorage.setItem(API_URL_KEY, url);
  },

  // API Key (sensitive, use SecureStore on native, AsyncStorage on web)
  getApiKey: async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(API_KEY_KEY);
    }
    return await SecureStore.getItemAsync(API_KEY_KEY);
  },

  setApiKey: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(API_KEY_KEY, key);
    } else {
      await SecureStore.setItemAsync(API_KEY_KEY, key);
    }
  },

  // Onboarding flag
  isOnboardingComplete: async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  },

  setOnboardingComplete: async (): Promise<void> => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  },

  // Clear all data (for logout/reset)
  clearAll: async (): Promise<void> => {
    await AsyncStorage.clear();
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(API_KEY_KEY).catch(() => {});
    }
  },
};
