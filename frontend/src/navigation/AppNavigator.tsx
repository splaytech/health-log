import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, colors as themeColors } from '../context/ThemeContext';

import Dashboard from '../screens/Dashboard';
import Mindfulness from '../screens/Mindfulness';
import Activity from '../screens/Activity';
import HealthMetrics from '../screens/HealthMetrics';
import Settings from '../screens/Settings';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { navigationTheme, colors, isDark } = useTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: themeColors.primary.main,
          tabBarInactiveTintColor: colors.textMuted,
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          headerTitleStyle: {
            fontWeight: '600',
            color: colors.text,
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 4,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginBottom: 6,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={Dashboard}
          options={{
            headerTitle: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Activity"
          component={Activity}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="run" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Metrics"
          component={HealthMetrics}
          options={{
            headerTitle: 'Health Metrics',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="heart-pulse" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Mindfulness"
          component={Mindfulness}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="meditation" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
