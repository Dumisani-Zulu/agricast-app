import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData } from '../api';

interface Props { data?: WeatherData; }

interface DayData {
  temps: number[];
  rains: number[];
  winds: number[];
  uvs: number[];
}

const getDayWeatherIcon = (avgTemp: number, maxRain: number): keyof typeof Ionicons.glyphMap => {
  if (maxRain > 60) return 'rainy';
  if (avgTemp >= 25) return 'sunny';
  if (avgTemp >= 15) return 'partly-sunny';
  return 'cloudy';
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const WeatherDailySummary: React.FC<Props> = ({ data }) => {
  if (!data) return null;
  
  const byDay: Record<string, DayData> = {};
  data.hourly.time.forEach((t, i) => {
    const key = t.toISOString().slice(0, 10);
    if (!byDay[key]) byDay[key] = { temps: [], rains: [], winds: [], uvs: [] };
    byDay[key].temps.push(data.hourly.temperature_2m[i]);
    byDay[key].rains.push(data.hourly.precipitation_probability[i]);
    byDay[key].winds.push(data.hourly.wind_speed_10m[i]);
    byDay[key].uvs.push(data.hourly.uv_index[i]);
  });
  
  const entries = Object.entries(byDay).slice(0, 7); // Show 7 days

  return (
    <View className="bg-gray-800/60 rounded-3xl p-5 mb-6 border border-gray-700/50">
      <View className="flex-row items-center mb-4">
        <Ionicons name="calendar" size={20} color="#10B981" />
        <Text className="text-green-300 text-sm ml-2 font-semibold">7-Day Forecast</Text>
      </View>
      
      <View className="space-y-3">
        {entries.map(([day, vals]) => {
          const avgTemp = vals.temps.reduce((a, b) => a + b, 0) / vals.temps.length;
          const minTemp = Math.min(...vals.temps);
          const maxTemp = Math.max(...vals.temps);
          const maxRain = Math.max(...vals.rains);
          const avgWind = vals.winds.reduce((a, b) => a + b, 0) / vals.winds.length;
          const maxUV = Math.max(...vals.uvs);
          const weatherIcon = getDayWeatherIcon(avgTemp, maxRain);
          
          return (
            <View key={day} className="bg-gray-700/40 rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white font-semibold text-base flex-1">
                  {formatDate(day)}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name={weatherIcon} size={24} color="#FDE047" />
                  <View className="ml-3">
                    <Text className="text-white font-bold text-lg">
                      {maxTemp.toFixed(0)}°
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {minTemp.toFixed(0)}°
                    </Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="water" size={14} color="#60A5FA" />
                  <Text className="text-blue-300 text-xs ml-1">
                    {maxRain.toFixed(0)}%
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="flag" size={14} color="#9CA3AF" />
                  <Text className="text-gray-300 text-xs ml-1">
                    {avgWind.toFixed(0)} km/h
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="sunny" size={14} color="#F97316" />
                  <Text className="text-orange-300 text-xs ml-1">
                    UV {maxUV.toFixed(0)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
