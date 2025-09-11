import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData } from '../api';

interface Props {
  data?: WeatherData;
  loading: boolean;
  error?: string;
  locationName?: string;
}

const getWeatherIcon = (temp: number, rainProb: number): keyof typeof Ionicons.glyphMap => {
  if (rainProb > 60) return 'rainy';
  if (temp >= 30) return 'sunny';
  if (temp >= 20) return 'partly-sunny';
  if (temp >= 10) return 'cloudy';
  return 'snow';
};

const getWeatherDescription = (temp: number, rainProb: number) => {
  if (rainProb > 70) return 'Expect heavy rain today.';
  if (rainProb > 40) return 'Light rain expected.';
  if (temp >= 30) return 'Hot and sunny day.';
  if (temp >= 20) return 'Pleasant weather today.';
  if (temp >= 10) return 'Cool and cloudy.';
  return 'Cold weather expected.';
};



export const WeatherCurrent: React.FC<Props> = ({ data, loading, error, locationName = "Current Location" }) => {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-white/70 mt-4 text-lg">Loading weather...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Ionicons name="alert-circle" size={48} color="#F87171" />
        <Text className="text-red-300 mt-4 text-center px-8">{error}</Text>
      </View>
    );
  }

  if (!data) return null;

  // Current hour index
  const now = new Date();
  const idx = data.hourly.time.findIndex(t => t.getHours() === now.getHours() && t.getDate() === now.getDate());
  const temp = idx >= 0 ? data.hourly.temperature_2m[idx] : 0;
  const wind = idx >= 0 ? data.hourly.wind_speed_10m[idx] : 0;
  const uv = idx >= 0 ? data.hourly.uv_index[idx] : 0;
  const rainProb = idx >= 0 ? data.hourly.precipitation_probability[idx] : 0;

  const weatherIcon = getWeatherIcon(temp, rainProb);
  const description = getWeatherDescription(temp, rainProb);

  return (
    <View className="flex-1">
      {/* Location Header */}
      <View className="items-center mb-8">
        <Text className="text-white text-lg font-medium">{locationName}</Text>
      </View>

      {/* Main Weather Display */}
      <View className="items-center mb-12">
        {/* Large Weather Icon */}
        <View className="mb-8">
          <View className="w-32 h-32 items-center justify-center">
            <Ionicons name={weatherIcon} size={120} color="#FDE047" />
            {rainProb > 40 && (
              <View className="absolute bottom-0 right-0">
                <Ionicons name="water" size={32} color="#60A5FA" />
              </View>
            )}
          </View>
        </View>

        {/* Temperature */}
        <View className="flex-row items-end mb-4">
          <Text className="text-white font-thin" style={{ fontSize: 96, lineHeight: 96 }}>
            {temp.toFixed(0)}
          </Text>
          <Text className="text-white/70 text-4xl mb-4 ml-2">°C</Text>
        </View>

        {/* Weather Description */}
        <Text className="text-white/70 text-lg text-center">{description}</Text>
      </View>

      {/* Bottom Metrics Row */}
      <View className="flex-row justify-around px-4">
        {/* Wind Speed */}
        <View className="items-center">
          <Ionicons name="trending-up" size={24} color="#9CA3AF" />
          <Text className="text-white font-semibold mt-1">{wind.toFixed(0)}km/hr</Text>
        </View>

        {/* Rain Probability */}
        <View className="items-center">
          <Ionicons name="water" size={24} color="#9CA3AF" />
          <Text className="text-white font-semibold mt-1">{rainProb.toFixed(0)}%</Text>
        </View>

        {/* UV Index */}
        <View className="items-center">
          <Ionicons name="sunny" size={24} color="#9CA3AF" />
          <Text className="text-white font-semibold mt-1">{uv.toFixed(0)}hr</Text>
        </View>
      </View>
    </View>
  );
};
