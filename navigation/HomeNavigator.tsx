import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ForecastScreen from '../screens/ForecastScreen';
import { WeatherData } from '../weather/api';

export type HomeStackParamList = {
  HomeMain: undefined;
  Forecast: {
    data: WeatherData;
    locationName: string;
  };
};

const Stack = createStackNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Forecast" component={ForecastScreen} />
    </Stack.Navigator>
  );
};

export default HomeNavigator;