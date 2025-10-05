import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWeather } from '../weather/hooks/useWeather';
import { getCropRecommendations } from '../services/cropService';
import { CropRecommendationResponse } from '../types/crop';

interface CropsScreenProps {
  navigation?: any;
}

const CropsScreen = ({ navigation }: CropsScreenProps) => {
  const weather = useWeather({ auto: true });
  const [recommendations, setRecommendations] = useState<CropRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousLocationRef = useRef<string | null>(null);

  const loadRecommendations = async (forceReload: boolean = false) => {
    if (!weather.data || !weather.locationName) {
      console.log('⏸️ [CropsScreen] Waiting for weather data...');
      return;
    }
    
    console.log('🚀 [CropsScreen] Loading recommendations for', weather.locationName);
    setLoading(true);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      // Use cache unless forced to reload
      const result = await getCropRecommendations(weather.data, weather.locationName, !forceReload);
      setRecommendations(result);
      previousLocationRef.current = weather.locationName;
      console.log(`✨ [CropsScreen] Recommendations displayed in ${Date.now() - startTime}ms`);
    } catch (err: any) {
      console.error('❌ [CropsScreen] Error loading recommendations:', err);
      setError(err.message || 'Failed to load crop recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Monitor location changes
  useEffect(() => {
    console.log('🔄 [CropsScreen] Effect triggered:', {
      hasData: !!weather.data,
      currentLocation: weather.locationName,
      previousLocation: previousLocationRef.current,
      hasRecommendations: !!recommendations,
    });
    
    // Only load if we have weather data and location
    if (!weather.data || !weather.locationName) {
      return;
    }
    
    // Check if location has changed
    if (previousLocationRef.current !== weather.locationName) {
      console.log('📍 [CropsScreen] Location changed from', previousLocationRef.current, 'to', weather.locationName);
      loadRecommendations();
    } else if (!recommendations) {
      console.log('📋 [CropsScreen] No recommendations yet, loading...');
      loadRecommendations();
    }
  }, [weather.data, weather.locationName]);

  const handleRefresh = async () => {
    console.log('🔄 [CropsScreen] Manual refresh triggered');
    previousLocationRef.current = null; // Clear to force reload
    await weather.reload();
    if (weather.data && weather.locationName) {
      loadRecommendations(true); // Force reload, skip cache
    }
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

  if (weather.loading || loading) {
    return (
      <View className="flex-1 bg-gray-900">
        <View className="pt-20 pb-4 px-4 bg-gray-800">
          <Text className="text-2xl font-bold text-white">Crop Recommendations</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="text-gray-400 mt-4">Loading crop recommendations...</Text>
        </View>
      </View>
    );
  }

  if (error || weather.error) {
    return (
      <View className="flex-1 bg-gray-900">
        <View className="pt-20 pb-4 px-4 bg-gray-800">
          <Text className="text-2xl font-bold text-white">Crop Recommendations</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#4b5563" />
          <Text className="text-white text-xl font-semibold mt-4 text-center">
            {error || weather.error}
          </Text>
          <TouchableOpacity
            className="bg-green-600 rounded-lg px-6 py-3 mt-6"
            onPress={handleRefresh}
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
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor="#22c55e" />
        }
      >

      {/* Weather Summary */}
      <View className="bg-gray-800 m-4 p-4 rounded-xl">
        <View className="flex-row items-center mb-2">
          <MaterialCommunityIcons name="weather-sunny" size={24} color="#fbbf24" />
          <Text className="text-white font-bold text-lg ml-2">Weather Overview</Text>
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
