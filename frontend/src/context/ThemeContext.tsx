import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { colors, ColorTheme } from '../theme/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  colors: ColorTheme;
  paperTheme: typeof MD3DarkTheme;
  navigationTheme: typeof DarkTheme;
  isDark: boolean;
}

const THEME_STORAGE_KEY = 'theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Paper theme for dark mode
const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.dark,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.dark,
    tertiary: colors.accent.sleep,
    background: colors.dark.background,
    surface: colors.dark.surface,
    surfaceVariant: colors.dark.surfaceElevated,
    error: colors.status.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: colors.dark.text,
    onSurface: colors.dark.text,
    onSurfaceVariant: colors.dark.textSecondary,
    outline: colors.dark.border,
    elevation: {
      level0: 'transparent',
      level1: colors.dark.surface,
      level2: colors.dark.surfaceElevated,
      level3: colors.dark.cardElevated,
      level4: colors.dark.cardElevated,
      level5: colors.dark.cardElevated,
    },
  },
  roundness: 12,
};

// Paper theme for light mode
const lightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.light,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.light,
    tertiary: colors.accent.sleep,
    background: colors.light.background,
    surface: colors.light.surface,
    surfaceVariant: colors.light.surfaceElevated,
    error: colors.status.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: colors.light.text,
    onSurface: colors.light.text,
    onSurfaceVariant: colors.light.textSecondary,
    outline: colors.light.border,
    elevation: {
      level0: 'transparent',
      level1: colors.light.surface,
      level2: colors.light.surfaceElevated,
      level3: colors.light.cardElevated,
      level4: colors.light.cardElevated,
      level5: colors.light.cardElevated,
    },
  },
  roundness: 12,
};

// Navigation themes
const darkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary.main,
    background: colors.dark.background,
    card: colors.dark.surface,
    text: colors.dark.text,
    border: colors.dark.border,
  },
};

const lightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary.main,
    background: colors.light.background,
    card: colors.light.surface,
    text: colors.light.text,
    border: colors.light.border,
  },
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('dark'); // Default to dark mode

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(mode === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeContextType = {
    mode,
    toggleTheme,
    setTheme,
    colors: mode === 'dark' ? colors.dark : colors.light,
    paperTheme: mode === 'dark' ? darkPaperTheme : lightPaperTheme,
    navigationTheme: mode === 'dark' ? darkNavigationTheme : lightNavigationTheme,
    isDark: mode === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export colors for use outside of components
export { colors };
