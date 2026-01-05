import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { navigationTheme } from '../theme/theme';

import Dashboard from '../screens/Dashboard';
import BloodPressure from '../screens/BloodPressure';
import Food from '../screens/Food';
import Water from '../screens/Water';
import Settings from '../screens/Settings';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#0078d4',
          tabBarInactiveTintColor: '#666666',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#f5f5f5',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Blood Pressure"
          component={BloodPressure}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="heart-pulse" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Food"
          component={Food}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="food-apple" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Water"
          component={Water}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="water" size={size} color={color} />
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
