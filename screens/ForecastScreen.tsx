import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData } from '../weather/api';
import { useNavigation } from '@react-navigation/native';

interface Props {
  route: {
    params: {
      data: WeatherData;
      locationName: string;
    };
  };
}

interface DayData {
  date: string;
  temps: number[];
  rains: number[];
  winds: number[];
  uvs: number[];
  precipitation: number[];
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
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[date.getDay()];
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const ForecastScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation();
  const { data, locationName } = route.params;

  // Process daily data - start from today for the 14-day forecast
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
          rains: [], 
          winds: [], 
          uvs: [],
          precipitation: []
        };
      }
      byDay[key].temps.push(data.hourly.temperature_2m[i]);
      byDay[key].rains.push(data.hourly.precipitation_probability[i]);
      byDay[key].winds.push(data.hourly.wind_speed_10m[i]);
      byDay[key].uvs.push(data.hourly.uv_index[i]);
      byDay[key].precipitation.push(data.hourly.precipitation[i]);
    }
  });
  
  // Take up to 14 days
  const dailyEntries = Object.entries(byDay).slice(0, 14);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#1a1a1a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View className="flex-row items-between px-4 py-4 mt-20 border-b border-gray-700/30">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mr-4 p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-3xl font-bold">14-Day Forecast</Text>
          <Text className="text-gray-400 text-sm">{locationName}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Forecast List */}
        <View className="py-4">
          {dailyEntries.map(([day, vals], index) => {
            const avgTemp = vals.temps.reduce((a, b) => a + b, 0) / vals.temps.length;
            const minTemp = Math.min(...vals.temps);
            const maxTemp = Math.max(...vals.temps);
            const maxRain = Math.max(...vals.rains);
            const avgWind = vals.winds.reduce((a, b) => a + b, 0) / vals.winds.length;
            const maxUv = Math.max(...vals.uvs);
            const avgPrecipitation = vals.precipitation.reduce((a, b) => a + b, 0) / vals.precipitation.length;
            
            const dayDate = new Date(day);
            const isDayTime = true;
            const dayWeatherIcon = getWeatherIcon(avgTemp, maxRain, !isDayTime);
            const dayCondition = getWeatherCondition(avgTemp, maxRain, !isDayTime);
            const dayName = formatDayName(dayDate);
            const dateString = formatDate(dayDate);
            
            return (
              <View 
                key={day} 
                className="bg-gray-800/40 rounded-xl border border-gray-700/30 mb-3 p-4"
              >
                {/* Day Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-white font-bold text-lg">{dayName}</Text>
                    <Text className="text-gray-400 text-sm">{dateString}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons 
                      name={dayWeatherIcon} 
                      size={32} 
                      color={dayCondition.includes('Sunny') || dayCondition.includes('Clear') ? '#FFD700' : '#87CEEB'} 
                    />
                    <View className="ml-3 items-end">
                      <Text className="text-white font-bold text-lg">
                        {Math.round(maxTemp)}°
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {Math.round(minTemp)}°
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Weather Condition */}
                <Text className="text-gray-300 text-base mb-3">{dayCondition}</Text>

                {/* Weather Details */}
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Ionicons name="rainy-outline" size={20} color="#60A5FA" />
                    <Text className="text-gray-400 text-xs mt-1">Rain</Text>
                    <Text className="text-blue-300 font-semibold">{Math.round(maxRain)}%</Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <Ionicons name="water-outline" size={20} color="#6366F1" />
                    <Text className="text-gray-400 text-xs mt-1">Precipitation</Text>
                    <Text className="text-indigo-300 font-semibold">{avgPrecipitation.toFixed(1)}mm</Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <Ionicons name="trending-up-outline" size={20} color="#10B981" />
                    <Text className="text-gray-400 text-xs mt-1">Wind</Text>
                    <Text className="text-emerald-300 font-semibold">{Math.round(avgWind)}km/h</Text>
                  </View>
                  
                  <View className="items-center flex-1">
                    <Ionicons name="sunny-outline" size={20} color="#F59E0B" />
                    <Text className="text-gray-400 text-xs mt-1">UV Index</Text>
                    <Text className="text-amber-300 font-semibold">{Math.round(maxUv)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForecastScreen;