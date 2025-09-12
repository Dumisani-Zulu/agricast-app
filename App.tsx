
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import HomeNavigator from './navigation/HomeNavigator';
import CropsScreen from './screens/CropsScreen';
import ToolsNavigator from './navigation/ToolsNavigator';
import ForumNavigator from './navigation/ForumNavigator';
import ProfileScreen from './screens/ProfileScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import './global.css';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // Show welcome screen first
  if (showWelcome) {
    return (
      <>
        <WelcomeScreen onGetStarted={handleGetStarted} />
        <StatusBar style="light" />
      </>
    );
  }

  // Show auth screen if user is not authenticated
  if (!user) {
    return (
      <>
        <AuthScreen />
        <StatusBar style="light" />
      </>
    );
  }

  // Show main app if user is authenticated
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1f2937',
            borderTopColor: '#374151',
          },
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Crops') {
              iconName = focused ? 'leaf' : 'leaf-outline';
            } else if (route.name === 'Tools') {
              iconName = focused ? 'build' : 'build-outline';
            } else if (route.name === 'Forum') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'ellipse-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeNavigator} />
        <Tab.Screen name="Crops" component={CropsScreen} />
        <Tab.Screen name="Tools" component={ToolsNavigator} />
        <Tab.Screen name="Forum" component={ForumNavigator} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
