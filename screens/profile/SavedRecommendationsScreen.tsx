import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getSavedCropRecommendations } from '../../services/cropService';
import { Crop } from '../../types/crop';

const SavedRecommendationsScreen = ({ navigation }: { navigation: any }) => {
  const [savedCrops, setSavedCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedCrops = useCallback(async () => {
    try {
      setLoading(true);
      const crops = await getSavedCropRecommendations();
      setSavedCrops(crops);
    } catch (error) {
      console.error("Failed to fetch saved crops:", error);
      Alert.alert('Error', 'Could not load your saved recommendations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSavedCrops();
    }, [fetchSavedCrops])
  );

  const renderItem = ({ item }: { item: Crop }) => (
    <TouchableOpacity 
      className="bg-gray-800 p-4 rounded-lg mb-4 flex-row items-center"
      onPress={() => navigation.navigate('Crops', { screen: 'CropDetail', params: { crop: item } })}
    >
      <Text className="text-3xl mr-4">{item.icon}</Text>
      <View>
        <Text className="text-white text-lg font-bold">{item.name}</Text>
        <Text className="text-gray-400 text-sm">{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-900 p-4">
      <View className="flex-row items-center mb-6 pt-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Saved Recommendations</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" className="mt-10" />
      ) : (
        <FlatList
          data={savedCrops}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          ListEmptyComponent={<Text className="text-gray-400 text-center mt-10">You have no saved recommendations yet.</Text>}
        />
      )}
    </View>
  );
};

export default SavedRecommendationsScreen;
