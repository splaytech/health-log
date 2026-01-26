// Samsung Health-inspired color palette with purple/blue gradients

export const colors = {
  // Primary gradient colors
  primary: {
    main: '#6C5CE7',
    light: '#A29BFE',
    dark: '#4A3F7A',
    gradient: ['#6C5CE7', '#4A3F7A'],
  },

  // Secondary colors
  secondary: {
    main: '#00CEC9',
    light: '#81ECEC',
    dark: '#00B5B0',
  },

  // Accent colors for different metrics
  accent: {
    heart: '#FF6B6B',
    heartLight: '#FF8A8A',
    steps: '#00D68F',
    stepsLight: '#5DFFB6',
    water: '#00B4D8',
    waterLight: '#48CAE4',
    sleep: '#9B59B6',
    sleepLight: '#BB8FCE',
    stress: '#F39C12',
    stressLight: '#F7DC6F',
    oxygen: '#3498DB',
    oxygenLight: '#85C1E9',
    glucose: '#E74C3C',
    glucoseLight: '#F1948A',
    calories: '#FF9FF3',
    caloriesLight: '#FFCCF9',
    activity: '#54A0FF',
    activityLight: '#7EB8FF',
  },

  // Mood colors
  mood: {
    happy: '#FFD93D',
    fine: '#6BCB77',
    neutral: '#4D96FF',
    sad: '#9B59B6',
    stressed: '#FF6B6B',
  },

  // Stress scale colors
  stressScale: ['#3498DB', '#2ECC71', '#F1C40F', '#E67E22', '#E74C3C'],

  // Status colors
  status: {
    success: '#00D68F',
    warning: '#FFAA00',
    error: '#FF3D71',
    info: '#0095FF',
  },

  // Dark theme
  dark: {
    background: '#1A1A2E',
    backgroundSecondary: '#16213E',
    surface: '#2D2640',
    surfaceElevated: '#3D3556',
    text: '#FFFFFF',
    textSecondary: '#B8B8D0',
    textMuted: '#6B6B80',
    border: '#3D3D5C',
    divider: '#2D2D45',
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: '#252540',
    cardElevated: '#2D2D50',
  },

  // Light theme
  light: {
    background: '#F8F9FA',
    backgroundSecondary: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceElevated: '#F0F2F5',
    text: '#1A1A2E',
    textSecondary: '#6B6B80',
    textMuted: '#9B9BB0',
    border: '#E0E0E8',
    divider: '#F0F0F5',
    overlay: 'rgba(0, 0, 0, 0.3)',
    card: '#FFFFFF',
    cardElevated: '#F5F5F8',
  },
};

export type ColorTheme = typeof colors.dark;
