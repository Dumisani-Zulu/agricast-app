import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData } from '../api';

interface Props { data?: WeatherData; }

const getHourlyWeatherIcon = (temp: number, rainProb: number): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
  if (rainProb > 60) return { icon: 'rainy', color: '#3B82F6' };
  if (temp >= 25) return { icon: 'sunny', color: '#FDE047' };
  if (temp >= 15) return { icon: 'partly-sunny', color: '#F97316' };
  return { icon: 'cloudy', color: '#9CA3AF' };
};

export const WeatherHourlyScroll: React.FC<Props> = ({ data }) => {
  if (!data) return null;
  const now = new Date();
  
  return (
    <View className="px-6">
      <View className="flex-row items-center mb-4">
        <Ionicons name="time" size={20} color="#9CA3AF" />
        <Text className="text-white text-lg ml-2 font-medium">Hourly Forecast</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
        {data.hourly.time.slice(0, 8).map((t, i) => {
          const temp = data.hourly.temperature_2m[i];
          const rainProb = data.hourly.precipitation_probability[i];
          const active = t.getHours() === now.getHours() && t.getDate() === now.getDate();
          const weatherIcon = getHourlyWeatherIcon(temp, rainProb);
          
          return (
            <View 
              key={i} 
              className={`mx-2 items-center min-w-[80px] ${
                active 
                  ? 'bg-blue-600/30' 
                  : 'bg-gray-800/60'
              } rounded-2xl px-4 py-5`}
            > 
              {/* Time */}
              <Text className="text-white text-sm mb-3 font-medium">
                {active ? 'Now' : `${t.getHours() % 12 || 12}${t.getHours() >= 12 ? 'pm' : 'am'}`}
              </Text>
              
              {/* Weather Icon */}
              <View className="mb-3">
                <Ionicons 
                  name={weatherIcon.icon} 
                  size={32} 
                  color={weatherIcon.color} 
                />
              </View>
              
              {/* Temperature */}
              <Text className="text-white font-bold text-xl">
                {temp.toFixed(0)}°
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
