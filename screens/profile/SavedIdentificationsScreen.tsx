import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { 
  getSavedIdentifications, 
  deleteSavedIdentification, 
  clearAllSavedIdentifications,
  SavedIdentification,
  SavedDiseaseIdentification,
  SavedPestIdentification
} from '../../services/savedIdentifications';

const SavedIdentificationsScreen = ({ navigation }: any) => {
  const [identifications, setIdentifications] = useState<SavedIdentification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'disease' | 'pest'>('all');

  const loadIdentifications = async () => {
    setLoading(true);
    try {
      const data = await getSavedIdentifications();
      setIdentifications(data);
    } catch (error) {
      console.error('Error loading identifications:', error);
      Alert.alert('Error', 'Failed to load saved identifications');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIdentifications();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Identification',
      'Are you sure you want to delete this saved identification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedIdentification(id);
              await loadIdentifications();
            } catch {
              Alert.alert('Error', 'Failed to delete identification');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to delete all saved identifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllSavedIdentifications();
              await loadIdentifications();
            } catch {
              Alert.alert('Error', 'Failed to clear identifications');
            }
          },
        },
      ]
    );
  };

  const filteredIdentifications = identifications.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-orange-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const renderDiseaseCard = (item: SavedDiseaseIdentification) => (
    <View key={item.id} className="bg-gray-800 rounded-xl p-4 mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="leaf" size={20} color="#22c55e" />
            <Text className="text-green-400 font-semibold ml-2">Disease</Text>
          </View>
          <Text className="text-white text-xl font-bold">{item.diseaseName}</Text>
          <Text className="text-gray-400 text-sm mt-1">{item.affectedCrop}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          className="bg-red-600/20 p-2 rounded-lg"
        >
          <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: item.imageUri }}
        className="w-full h-48 rounded-lg mb-3"
        resizeMode="cover"
      />

      <View className="flex-row items-center justify-between mb-3">
        <View className={`${getSeverityColor(item.severity)} px-3 py-1 rounded-full`}>
          <Text className="text-white font-semibold text-sm">{item.severity}</Text>
        </View>
        <Text className="text-gray-400 text-xs">{formatDate(item.timestamp)}</Text>
      </View>

      {item.symptoms.length > 0 && (
        <View className="mb-2">
          <Text className="text-gray-400 text-xs mb-1">Symptoms:</Text>
          <Text className="text-gray-300 text-sm" numberOfLines={2}>
            {item.symptoms.slice(0, 2).join(', ')}
          </Text>
        </View>
      )}

      {item.treatment.length > 0 && (
        <View>
          <Text className="text-gray-400 text-xs mb-1">Treatment:</Text>
          <Text className="text-gray-300 text-sm" numberOfLines={2}>
            {item.treatment.slice(0, 2).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderPestCard = (item: SavedPestIdentification) => (
    <View key={item.id} className="bg-gray-800 rounded-xl p-4 mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="bug" size={20} color="#fbbf24" />
            <Text className="text-yellow-400 font-semibold ml-2">Pest</Text>
          </View>
          <Text className="text-white text-xl font-bold">{item.pestName}</Text>
          <Text className="text-gray-400 text-sm italic mt-1">{item.scientificName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          className="bg-red-600/20 p-2 rounded-lg"
        >
          <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: item.imageUri }}
        className="w-full h-48 rounded-lg mb-3"
        resizeMode="cover"
      />

      <View className="flex-row items-center justify-between mb-3">
        <View className={`${getSeverityColor(item.severity)} px-3 py-1 rounded-full`}>
          <Text className="text-white font-semibold text-sm">{item.severity}</Text>
        </View>
        <Text className="text-gray-400 text-xs">{formatDate(item.timestamp)}</Text>
      </View>

      {item.affectedCrops.length > 0 && (
        <View className="mb-2">
          <Text className="text-gray-400 text-xs mb-1">Affected Crops:</Text>
          <View className="flex-row flex-wrap">
            {item.affectedCrops.slice(0, 3).map((crop, index) => (
              <View key={index} className="bg-yellow-900/30 border border-yellow-700 rounded px-2 py-1 mr-2 mb-1">
                <Text className="text-yellow-300 text-xs">{crop}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.biologicalControl.length > 0 && (
        <View>
          <Text className="text-gray-400 text-xs mb-1">Control Methods:</Text>
          <Text className="text-gray-300 text-sm" numberOfLines={2}>
            {item.biologicalControl.slice(0, 2).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-gray-800 px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-gray-700 p-2 rounded-lg"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1 text-center">
            Saved Identifications
          </Text>
          {identifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              className="bg-red-600/20 px-3 py-2 rounded-lg"
            >
              <Text className="text-red-400 font-semibold text-sm">Clear All</Text>
            </TouchableOpacity>
          )}
          {identifications.length === 0 && <View className="w-12" />}
        </View>

        {/* Filter Tabs */}
        <View className="flex-row space-x-2 gap-4">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`flex-1 py-2 rounded-lg ${filter === 'all' ? 'bg-pink-600' : 'bg-gray-700'}`}
          >
            <Text className={`text-center font-semibold ${filter === 'all' ? 'text-white' : 'text-gray-400'}`}>
              All ({identifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('disease')}
            className={`flex-1 py-2 rounded-lg ${filter === 'disease' ? 'bg-green-600' : 'bg-gray-700'}`}
          >
            <Text className={`text-center font-semibold ${filter === 'disease' ? 'text-white' : 'text-gray-400'}`}>
              Diseases ({identifications.filter(i => i.type === 'disease').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('pest')}
            className={`flex-1 py-2 rounded-lg ${filter === 'pest' ? 'bg-yellow-600' : 'bg-gray-700'}`}
          >
            <Text className={`text-center font-semibold ${filter === 'pest' ? 'text-white' : 'text-gray-400'}`}>
              Pests ({identifications.filter(i => i.type === 'pest').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <MaterialCommunityIcons name="loading" size={48} color="#9ca3af" />
            <Text className="text-gray-400 mt-4">Loading saved identifications...</Text>
          </View>
        ) : filteredIdentifications.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <MaterialCommunityIcons 
              name={filter === 'disease' ? 'leaf-off' : filter === 'pest' ? 'bug-outline' : 'folder-open-outline'} 
              size={64} 
              color="#4b5563" 
            />
            <Text className="text-gray-400 text-lg mt-4 text-center">
              {filter === 'all' 
                ? 'No saved identifications yet' 
                : `No saved ${filter} identifications`}
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center px-8">
              Use the disease identifier or pest identifier tools and save your results for offline viewing
            </Text>
          </View>
        ) : (
          <View>
            {filteredIdentifications.map((item) =>
              item.type === 'disease'
                ? renderDiseaseCard(item as SavedDiseaseIdentification)
                : renderPestCard(item as SavedPestIdentification)
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SavedIdentificationsScreen;
