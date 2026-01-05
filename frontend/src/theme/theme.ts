import { MD3LightTheme } from 'react-native-paper';
import { DefaultTheme } from '@react-navigation/native';

// Map Fluent UI design tokens to React Native Paper theme
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0078d4',        // Fluent Blue
    secondary: '#00b7c3',      // Fluent Teal
    tertiary: '#8764b8',       // Fluent Purple
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceVariant: '#e1e1e1',
    error: '#d13438',          // Fluent Red
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#000000',
    onSurface: '#000000',
  },
  roundness: 4,
};

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0078d4',
    background: '#ffffff',
    card: '#f5f5f5',
    text: '#000000',
    border: '#e1e1e1',
  },
};
