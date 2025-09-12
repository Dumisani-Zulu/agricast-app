import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData } from '../api';

interface Props {
  data?: WeatherData;
  loading: boolean;
  error?: string;
  locationName?: string;
}

interface DayData {
  date: string;
  temps: number[];
  rains: number[];
  winds: number[];
  uvs: number[];
}

const getWeatherIcon = (temp: number, rainProb: number, isNightTime: boolean): keyof typeof Ionicons.glyphMap => {
  if (rainProb > 60) {
    return isNightTime ? 'rainy' : 'rainy';
  }
  if (rainProb > 30) {
    return isNightTime ? 'cloudy-night' : 'partly-sunny';
  }
  if (isNightTime) {
    return temp > 15 ? 'moon' : 'moon';
  }
  if (temp >= 30) return 'sunny';
  if (temp >= 20) return 'partly-sunny';
  if (temp >= 10) return 'cloudy';
  return 'snow';
};

const getWeatherCondition = (temp: number, rainProb: number, isNightTime: boolean) => {
  if (rainProb > 70) return 'Rainy';
  if (rainProb > 40) return 'Cloudy';
  if (isNightTime) {
    return temp > 15 ? 'Clear Night' : 'Cold Night';
  }
  if (temp >= 30) return 'Sunny';
  if (temp >= 20) return 'Partly Sunny';
  if (temp >= 10) return 'Cloudy';
  return 'Cold';
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
  
  // For subsequent days, show the actual day name
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[date.getDay()];
};

export const WeatherMainScreen: React.FC<Props> = ({ data, loading, error, locationName = "Lusaka" }) => {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-white/70 mt-4 text-lg">Loading weather...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <Ionicons name="alert-circle" size={48} color="#F87171" />
        <Text className="text-red-300 mt-4 text-center px-8">{error}</Text>
      </View>
    );
  }

  if (!data) return null;

  // Current weather data - for TODAY
  const now = new Date();
  const currentHour = now.getHours();
  const isNightTime = currentHour < 6 || currentHour > 18; // Night time between 6 PM and 6 AM
  
  // Find current hour data for TODAY
  const currentHourIndex = data.hourly.time.findIndex(t => {
    const timeDate = new Date(t);
    return timeDate.getDate() === now.getDate() && 
           timeDate.getMonth() === now.getMonth() && 
           timeDate.getFullYear() === now.getFullYear() &&
           Math.abs(timeDate.getHours() - currentHour) <= 1; // Allow 1 hour tolerance
  });
  
  const currentTemp = currentHourIndex >= 0 ? data.hourly.temperature_2m[currentHourIndex] : 25;
  const currentWind = currentHourIndex >= 0 ? data.hourly.wind_speed_10m[currentHourIndex] : 11;
  const currentHumidity = currentHourIndex >= 0 ? data.hourly.precipitation_probability[currentHourIndex] : 50;
  const currentRain = currentHourIndex >= 0 ? data.hourly.precipitation_probability[currentHourIndex] : 30;
  
  const weatherIcon = getWeatherIcon(currentTemp, currentRain, isNightTime);
  const weatherCondition = getWeatherCondition(currentTemp, currentRain, isNightTime);

  // Process daily data - start from TODAY for the 7-day forecast
  const byDay: Record<string, DayData> = {};
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0); // Start of today at midnight
  
  data.hourly.time.forEach((t, i) => {
    // Include data from today onwards
    if (t >= startOfToday) {
      const key = t.toISOString().slice(0, 10);
      if (!byDay[key]) {
        byDay[key] = { 
          date: key, 
          temps: [], 
          rains: [], 
          winds: [], 
          uvs: [] 
        };
      }
      byDay[key].temps.push(data.hourly.temperature_2m[i]);
      byDay[key].rains.push(data.hourly.precipitation_probability[i]);
      byDay[key].winds.push(data.hourly.wind_speed_10m[i]);
      byDay[key].uvs.push(data.hourly.uv_index[i]);
    }
  });
  
  const dailyEntries = Object.entries(byDay).slice(0, 7);

  return (
    <View style={{ backgroundColor: '#1a1a1a' }}>
      {/* Current Weather Section */}
      <View className="items-center px-2 py-4">
        {/* Location Header */}
        <View className="items-center mb-4">
          <Text className="text-white text-2xl font-bold">{locationName}</Text>
          <Text className="text-gray-400 text-lg font-semibold">
            Today • {now.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Weather Icon */}
        <View className="mb-4">
          <Ionicons 
            name={weatherIcon} 
            size={130} 
            color={weatherCondition === 'Sunny' ? '#FFD700' : '#87CEEB'} 
          />
        </View>

        {/* Temperature */}
        <Text className="text-white font-bold text-8xl mb-2">
          {Math.round(currentTemp)}°
        </Text>
        <Text className="text-white text-xl mb-8">{weatherCondition}</Text>

        {/* Weather Stats */}
        <View className="flex-row justify-between w-full max-w-sm mb-8 px-20">
          <View className="items-center">
            <Ionicons name="trending-up-outline" size={25} color="#87CEEB" />
            <Text className="text-gray-400 text-xs mt-1">Wind</Text>
            <Text className="text-white font-semibold">{Math.round(currentWind)}kmh</Text>
          </View>
          <View className="items-center">
            <Ionicons name="rainy-outline" size={25} color="#87CEEB" />
            <Text className="text-gray-400 text-xs mt-1">Rain</Text>
            <Text className="text-white font-semibold">{Math.round(currentRain)}%</Text>
          </View>
          <View className="items-center">
            <Ionicons name="water-outline" size={25} color="#87CEEB" />
            <Text className="text-gray-400 text-xs mt-1">Humidity</Text>
            <Text className="text-white font-semibold">{Math.round(currentHumidity)}%</Text>
          </View>
        </View>
      </View>

      {/* 7-Day Forecast Section */}
      <View className="mx-2 mb-8 bg-gray-800/40 rounded-xl border border-gray-700/30" >
        {/* 7-Day Forecast Header */}
        <View className="px-4 py-5">
          <View className="flex-row items-center justify-center">
            <View className="flex-row items-center ">
              <Text className="text-white text-2xl font-bold">7 days Weather Forecast</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Forecast List */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4 py-2"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <View className="flex-row space-x-4 gap-3">
            {dailyEntries.map(([day, vals], index) => {
              const avgTemp = vals.temps.reduce((a, b) => a + b, 0) / vals.temps.length;
              const minTemp = Math.min(...vals.temps);
              const maxTemp = Math.max(...vals.temps);
              const maxRain = Math.max(...vals.rains);
              const dayDate = new Date(day);
              const isDayTime = true; // For daily forecast, assume daytime weather
              const dayWeatherIcon = getWeatherIcon(avgTemp, maxRain, !isDayTime);
              const dayCondition = getWeatherCondition(avgTemp, maxRain, !isDayTime);
              const dayName = formatDayName(dayDate);
              
              return (
                <View key={day} className="items-center py-4 px-3 min-w-[100px] bg-gray-700/20 rounded-lg border border-gray-600/20">
                  <Text className="text-white font-medium text-sm mb-3">{dayName}</Text>
                  
                  <Ionicons 
                    name={dayWeatherIcon} 
                    size={32} 
                    color={dayCondition.includes('Sunny') || dayCondition.includes('Clear') ? '#FFD700' : '#87CEEB'} 
                    style={{ marginBottom: 8 }}
                  />
                  
                  <Text className="text-gray-300 text-xs text-center mb-2">{dayCondition}</Text>
                  
                  <View className="items-center mb-2">
                    <Text className="text-white font-semibold text-lg">
                      {Math.round(maxTemp)}°
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {Math.round(minTemp)}°
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Ionicons name="rainy-outline" size={12} color="#60A5FA" />
                    <Text className="text-blue-300 text-xs ml-1">{Math.round(maxRain)}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};