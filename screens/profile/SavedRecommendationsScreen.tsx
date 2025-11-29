import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getSavedCropRecommendations, deleteSavedCropRecommendation, clearAllSavedCropRecommendations } from '../../services/cropService';
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

  const handleDelete = (crop: Crop) => {
    Alert.alert(
      'Delete Crop',
      `Are you sure you want to remove ${crop.name} from your saved crops?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedCropRecommendation(crop.id || crop.name);
              await fetchSavedCrops();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete crop');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to remove all saved crop recommendations?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllSavedCropRecommendations();
              await fetchSavedCrops();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear crops');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Crop }) => (
    <View className="bg-gray-800 p-4 rounded-lg mb-4 flex-row items-center">
      <TouchableOpacity 
        className="flex-row items-center flex-1"
        onPress={() => navigation.navigate('Crops', { screen: 'CropDetail', params: { crop: item } })}
      >
        <Text className="text-3xl mr-4">{item.icon}</Text>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">{item.name}</Text>
          <Text className="text-gray-400 text-sm">{item.category}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => handleDelete(item)}
        className="bg-red-600/20 p-2 rounded-lg ml-2"
      >
        <MaterialCommunityIcons name="delete" size={22} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-900 p-4">
      <View className="flex-row items-center justify-between mb-6 pt-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Saved Crops</Text>
        </View>
        {savedCrops.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} className="bg-red-600/20 px-3 py-2 rounded-lg">
            <Text className="text-red-400 font-semibold text-sm">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" className="mt-10" />
      ) : (
        <FlatList
          data={savedCrops}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || item.name}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <MaterialCommunityIcons name="seed-off-outline" size={64} color="#4b5563" />
              <Text className="text-gray-400 text-center mt-4 text-lg">No saved crops yet</Text>
              <Text className="text-gray-500 text-center mt-2 px-8">
                Save crop recommendations from the Crops tab to view them here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default SavedRecommendationsScreen;
