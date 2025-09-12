import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData } from '../api';

interface Props {
  data: WeatherData;
  onPress: () => void;
}

interface DayData {
  date: string;
  temps: number[];
  rains: number[];
}

const getWeatherIcon = (temp: number, rainProb: number): keyof typeof Ionicons.glyphMap => {
  if (rainProb > 60) return 'rainy';
  if (rainProb > 30) return 'partly-sunny';
  if (temp >= 30) return 'sunny';
  if (temp >= 20) return 'partly-sunny';
  if (temp >= 10) return 'cloudy';
  return 'snow';
};

const formatDayName = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // Check if the date is today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if the date is tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[date.getDay()];
};

export const Weather14DayPreview: React.FC<Props> = ({ data, onPress }) => {
  // Process daily data - start from today
  const byDay: Record<string, DayData> = {};
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  data.hourly.time.forEach((t, i) => {
    // Include data from today onwards
    if (t >= startOfToday) {
      const key = t.toISOString().slice(0, 10);
      if (!byDay[key]) {
        byDay[key] = { 
          date: key, 
          temps: [], 
          rains: []
        };
      }
      byDay[key].temps.push(data.hourly.temperature_2m[i]);
      byDay[key].rains.push(data.hourly.precipitation_probability[i]);
    }
  });
  
  // Show preview of first 5 days
  const dailyEntries = Object.entries(byDay).slice(0, 5);

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="mx-2 mb-4 bg-gray-800/40 rounded-xl border border-gray-700/30"
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-700/50">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={20} color="#10b981" />
            <Text className="text-white text-lg font-bold ml-2">14-Day Forecast</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-400 text-sm mr-2">View all</Text>
            <Ionicons name="chevron-forward" size={16} color="#10b981" />
          </View>
        </View>
      </View>

      {/* Preview List */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
        <View className="flex-row space-x-4">
          {dailyEntries.map(([day, vals], index) => {
            const minTemp = Math.min(...vals.temps);
            const maxTemp = Math.max(...vals.temps);
            const maxRain = Math.max(...vals.rains);
            const dayDate = new Date(day);
            const dayWeatherIcon = getWeatherIcon(maxTemp, maxRain);
            const dayName = formatDayName(dayDate);
            
            return (
              <View key={day} className="items-center py-2 min-w-[60px]">
                <Text className="text-gray-300 text-sm font-medium mb-2">{dayName}</Text>
                <Ionicons 
                  name={dayWeatherIcon} 
                  size={24} 
                  color={maxTemp >= 25 ? '#FFD700' : '#87CEEB'} 
                  style={{ marginBottom: 8 }}
                />
                <Text className="text-white font-semibold text-sm">
                  {Math.round(maxTemp)}°
                </Text>
                <Text className="text-gray-400 text-xs">
                  {Math.round(minTemp)}°
                </Text>
                {maxRain > 20 && (
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="rainy-outline" size={10} color="#60A5FA" />
                    <Text className="text-blue-300 text-xs ml-1">{Math.round(maxRain)}%</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </TouchableOpacity>
  );
};