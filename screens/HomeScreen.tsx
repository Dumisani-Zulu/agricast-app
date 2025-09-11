import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { useWeather } from '../weather/hooks/useWeather';
import { WeatherMainScreen } from '../weather/components/WeatherMainScreen';
import { LocationSearch } from '../weather/components/LocationSearch';

const HomeScreen = () => {
  const { data, loading, error, locationName, loadForLocation } = useWeather({
    auto: true,
    defaultLocation: 'Lusaka',
  });

  const handleLocationSelect = (coords: { latitude: number; longitude: number }, selectedLocationName: string) => {
    loadForLocation(coords, selectedLocationName);
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View className="flex-1" style={{ backgroundColor: '#1a1a1a' }}>
        {/* Search Bar */}
        <View className="px-6 pt-20">
          <LocationSearch onSelect={handleLocationSelect} />
        </View>
        
        {/* Weather Content */}
        <WeatherMainScreen 
          data={data} 
          loading={loading} 
          error={error} 
          locationName={locationName || 'Lusaka'} 
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
