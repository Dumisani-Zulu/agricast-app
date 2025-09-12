import React from 'react';
import { SafeAreaView, StatusBar, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useWeather } from '../weather/hooks/useWeather';
import { WeatherMainScreen } from '../weather/components/WeatherMainScreen';
import { LocationSearch } from '../weather/components/LocationSearch';
import { Weather14DayPreview } from '../weather/components/Weather14DayPreview';
import { HomeStackParamList } from '../navigation/HomeNavigator';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeMain'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { data, loading, error, locationName, loadForLocation } = useWeather({
    auto: true,
    defaultLocation: 'Lusaka',
  });

  const handleLocationSelect = (coords: { latitude: number; longitude: number }, selectedLocationName: string) => {
    loadForLocation(coords, selectedLocationName);
  };

  const handleForecastPress = () => {
    if (data && locationName) {
      navigation.navigate('Forecast', {
        data,
        locationName,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View className="flex-1" style={{ backgroundColor: '#1a1a1a' }}>
        {/* Search Bar */}
        <View className="px-6 pt-20">
          <LocationSearch onSelect={handleLocationSelect} />
        </View>
        
        <ScrollView className="flex-1" style={{ backgroundColor: '#1a1a1a' }}>
          {/* Weather Content */}
          <WeatherMainScreen 
            data={data} 
            loading={loading} 
            error={error} 
            locationName={locationName || 'Lusaka'} 
          />
          
          {/* 14-Day Forecast Preview */}
          {data && !loading && !error && (
            <Weather14DayPreview 
              data={data} 
              onPress={handleForecastPress}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
