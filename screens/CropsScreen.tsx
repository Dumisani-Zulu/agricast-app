import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWeather } from '../contexts/WeatherContext'; // Corrected import
import { getCropRecommendations } from '../services/cropService';
import { CropRecommendationResponse } from '../types/crop';

interface CropsScreenProps {
  navigation?: any;
}

const CropsScreen = ({ navigation }: CropsScreenProps) => {
  const weather = useWeather(); // No longer needs options, context handles it
  const [recommendations, setRecommendations] = useState<CropRecommendationResponse | null>(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    if (!weather.data || !weather.locationName) {
      console.log('⏸️ [CropsScreen] Waiting for weather data to load recommendations.');
      return;
    }
    
    console.log('🚀 [CropsScreen] Loading recommendations for', weather.locationName);
    setCropLoading(true);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      // Use cache by default
      const result = await getCropRecommendations(weather.data, weather.locationName, true);
      setRecommendations(result);
      console.log(`✨ [CropsScreen] Recommendations displayed in ${Date.now() - startTime}ms`);
    } catch (err: any) {
      console.error('❌ [CropsScreen] Error loading recommendations:', err);
      setError(err.message || 'Failed to load crop recommendations');
    } finally {
      setCropLoading(false);
    }
  }, [weather.data, weather.locationName]);

  // Main effect to react to weather changes
  useEffect(() => {
    console.log('🔄 [CropsScreen] Effect triggered:', {
      isReady: weather.isReady,
      currentLocation: weather.locationName,
    });

    if (weather.isReady) {
      console.log('✅ [CropsScreen] Weather is ready. Loading recommendations for', weather.locationName);
      loadRecommendations();
    } else {
      console.log('⏳ [CropsScreen] Weather not ready. Clearing recommendations.');
      // Clear recommendations when weather is not ready (e.g., during location change)
      setRecommendations(null);
    }
  }, [weather.isReady, weather.locationName, loadRecommendations]);

  const handleRefresh = async () => {
    console.log('🔄 [CropsScreen] Manual refresh triggered');
    // The context's reload will trigger the useEffect chain
    await weather.reload();
  };

  const handleCropPress = (crop: any) => {
    console.log('🌾 [CropsScreen] Opening crop details for:', crop.name);
    if (navigation) {
      navigation.navigate('CropDetail', { crop });
    }
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  // Combined loading state
  if (weather.loading || cropLoading) {
    return (
      <View className="flex-1 bg-gray-900">
        <View className="pt-20 pb-4 px-4 bg-gray-800">
          <Text className="text-2xl font-bold text-white">Crop Recommendations</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="text-gray-400 mt-4">
            {weather.loading ? 'Fetching weather data...' : 'Loading crop recommendations...'}
          </Text>
        </View>
      </View>
    );
  }

  // Combined error state
  if (error || weather.error) {
    return (
      <View className="flex-1 bg-gray-900">
        <View className="pt-20 pb-4 px-4 bg-gray-800">
          <Text className="text-2xl font-bold text-white">Crop Recommendations</Text>
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="text-red-500 text-lg mt-4 text-center">
            {error || weather.error}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="mt-6 bg-blue-600 py-2 px-6 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!recommendations) {
    return (
      <View className="flex-1 bg-gray-900">
        <View className="pt-20 pb-4 px-4 bg-gray-800">
          <Text className="text-2xl font-bold text-white">Crop Recommendations</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="sprout-outline" size={64} color="#4b5563" />
          <Text className="text-white text-xl font-semibold mt-4 text-center">
            No recommendations available
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Get AI-powered crop suggestions based on your local weather forecast
          </Text>
          <TouchableOpacity
            className="bg-green-600 rounded-lg px-6 py-3 mt-6"
            onPress={() => loadRecommendations()}
          >
            <Text className="text-white font-semibold">Load Recommendations</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="pt-20 pb-4 px-4 bg-gray-800">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Crop Recommendations</Text>
            <Text className="text-gray-400 mt-1">📍 {recommendations.locationName}</Text>
          </View>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={40} color="#22c55e" />
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={weather.loading || cropLoading} onRefresh={handleRefresh} tintColor="#22c55e" />
        }
      >

      {/* Current Weather Stats (Real-time) */}
      {weather.data && (
        <View className="bg-gray-800 m-4 p-4 rounded-xl">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="thermometer" size={24} color="#3b82f6" />
            <Text className="text-white font-bold text-lg ml-2">Current Weather</Text>
          </View>
          
          <View className="flex-row justify-between">
            {/* Temperature */}
            <View className="flex-1 items-center bg-gray-700 rounded-lg p-3 mr-2">
              <MaterialCommunityIcons name="thermometer" size={20} color="#ef4444" />
              <Text className="text-2xl font-bold text-white mt-1">
                {Math.round(weather.data.hourly.temperature_2m[0])}°C
              </Text>
              <Text className="text-gray-400 text-xs mt-1">Temperature</Text>
            </View>
            
            {/* Rainfall */}
            <View className="flex-1 items-center bg-gray-700 rounded-lg p-3 ml-2">
              <MaterialCommunityIcons name="water" size={20} color="#3b82f6" />
              <Text className="text-2xl font-bold text-white mt-1">
                {weather.data.hourly.rain[0].toFixed(1)} mm
              </Text>
              <Text className="text-gray-400 text-xs mt-1">Rain Now</Text>
            </View>
          </View>
          
          {/* 7-Day Total Rainfall */}
          <View className="bg-gray-700 rounded-lg p-3 mt-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="weather-rainy" size={18} color="#60a5fa" />
                <Text className="text-white ml-2">7-Day Forecast:</Text>
              </View>
              <Text className="text-white font-bold">
                {(() => {
                  const next7Days = weather.data.hourly.rain.slice(0, 168); // 7 days * 24 hours
                  const totalRain = Array.from(next7Days).reduce((sum, val) => sum + val, 0);
                  return `${totalRain.toFixed(1)} mm total`;
                })()}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* AI Weather Analysis */}
      <View className="bg-gray-800 mx-4 mb-4 p-4 rounded-xl">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="brain" size={24} color="#a855f7" />
          <Text className="text-white font-bold text-lg ml-2">AI Analysis</Text>
        </View>
        <Text className="text-gray-300">{recommendations.weatherSummary}</Text>
      </View>

      {/* Crop Cards */}
      <View className="px-4 pt-4 pb-4">
        <Text className="text-white text-xl font-bold mb-3">
          Recommended Crops ({recommendations.recommendations.length})
        </Text>
        
        {recommendations.recommendations.map((rec, index) => (
          <TouchableOpacity
            key={rec.crop.id || index}
            className="bg-gray-800 rounded-xl p-4 mb-4"
            onPress={() => handleCropPress(rec.crop)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start">
              {/* Crop Icon */}
              <View className="bg-gray-700 rounded-full w-16 h-16 items-center justify-center mr-4">
                <Text className="text-4xl">{rec.crop.icon}</Text>
              </View>
              
              {/* Crop Info */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-white text-xl font-bold">{rec.crop.name}</Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="star" size={16} color={getSuitabilityColor(rec.suitabilityScore)} />
                    <Text className="text-white font-bold ml-1">{rec.suitabilityScore}%</Text>
                  </View>
                </View>
                
                <Text className="text-gray-400 text-sm italic mb-2">{rec.crop.scientificName}</Text>
                
                <View className="bg-gray-700 rounded-lg px-2 py-1 self-start mb-2">
                  <Text className="text-green-400 text-xs font-semibold">{rec.crop.category}</Text>
                </View>
                
                <Text className="text-gray-300 text-sm mb-3">{rec.reasoning}</Text>
                
                {/* Growing Info */}
                <View className="flex-row flex-wrap gap-2 mb-3">
                  <View className="flex-row items-center bg-gray-700 rounded-lg px-2 py-1">
                    <MaterialCommunityIcons name="thermometer" size={14} color="#fbbf24" />
                    <Text className="text-gray-300 text-xs ml-1">
                      {rec.crop.optimalTemperature.min}-{rec.crop.optimalTemperature.max}°C
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center bg-gray-700 rounded-lg px-2 py-1">
                    <MaterialCommunityIcons name="water" size={14} color="#3b82f6" />
                    <Text className="text-gray-300 text-xs ml-1">{rec.crop.waterRequirement}</Text>
                  </View>
                  
                  <View className="flex-row items-center bg-gray-700 rounded-lg px-2 py-1">
                    <MaterialCommunityIcons name="calendar" size={14} color="#22c55e" />
                    <Text className="text-gray-300 text-xs ml-1">{rec.crop.growingSeasonDays} days</Text>
                  </View>
                </View>
                
                {/* Benefits */}
                {rec.benefits && rec.benefits.length > 0 && (
                  <View className="mb-2">
                    <Text className="text-green-400 font-semibold text-sm mb-1">✓ Key Benefits:</Text>
                    {rec.benefits.slice(0, 2).map((benefit, idx) => (
                      <Text key={idx} className="text-gray-300 text-xs ml-2">• {benefit}</Text>
                    ))}
                  </View>
                )}
                
                {/* Warnings */}
                {rec.warnings && rec.warnings.length > 0 && (
                  <View>
                    <Text className="text-yellow-400 font-semibold text-sm mb-1">⚠ Notes:</Text>
                    {rec.warnings.map((warning, idx) => (
                      <Text key={idx} className="text-gray-300 text-xs ml-2">• {warning}</Text>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Arrow */}
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6b7280" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* General Advice */}
      <View className="bg-blue-900 mx-4 mb-24 p-4 rounded-xl border border-blue-700">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="lightbulb" size={24} color="#fbbf24" />
          <Text className="text-white font-bold text-lg ml-2">General Advice</Text>
        </View>
        <Text className="text-blue-100">{recommendations.generalAdvice}</Text>
      </View>
      </ScrollView>
    </View>
  );
};

export default CropsScreen;
