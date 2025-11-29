import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, LayoutAnimation, Platform, UIManager, ImageStyle, StyleProp } from 'react-native';
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
import { 
  getSavedCropRecommendations, 
  deleteSavedCropRecommendation, 
  clearAllSavedCropRecommendations 
} from '../../services/cropService';
import { Crop } from '../../types/crop';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Image component with fallback for missing images
const ImageWithFallback = ({ uri, style, type }: { uri: string; style?: StyleProp<ImageStyle>; type: 'disease' | 'pest' }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError || !uri) {
    return (
      <View 
        style={[style, { backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }]}
        className="rounded-lg"
      >
        <MaterialCommunityIcons 
          name={type === 'disease' ? 'leaf' : 'bug'} 
          size={32} 
          color={type === 'disease' ? '#22c55e' : '#fbbf24'} 
        />
        <Text className="text-gray-400 text-xs mt-1">No image</Text>
      </View>
    );
  }
  
  return (
    <Image
      source={{ uri }}
      style={style}
      className="rounded-lg"
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
};

type TabType = 'crops' | 'diseases' | 'pests';

const MySavedItemsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('crops');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [identifications, setIdentifications] = useState<SavedIdentification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setLoading(true);
    try {
      const [cropsData, identificationsData] = await Promise.all([
        getSavedCropRecommendations().catch(() => []),
        getSavedIdentifications()
      ]);
      setCrops(cropsData);
      setIdentifications(identificationsData);
    } catch (error) {
      console.error('Error loading saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const diseases = identifications.filter(i => i.type === 'disease') as SavedDiseaseIdentification[];
  const pests = identifications.filter(i => i.type === 'pest') as SavedPestIdentification[];

  const handleDeleteCrop = (crop: Crop) => {
    Alert.alert(
      'Delete Crop',
      `Remove ${crop.name} from saved crops?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedCropRecommendation(crop.id || crop.name);
              await loadData();
            } catch {
              Alert.alert('Error', 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const handleDeleteIdentification = (id: string, name: string) => {
    Alert.alert(
      'Delete',
      `Remove ${name} from saved items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedIdentification(id);
              await loadData();
            } catch {
              Alert.alert('Error', 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    const itemType = activeTab === 'crops' ? 'crops' : activeTab === 'diseases' ? 'disease identifications' : 'pest identifications';
    Alert.alert(
      'Clear All',
      `Are you sure you want to delete all saved ${itemType}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              if (activeTab === 'crops') {
                await clearAllSavedCropRecommendations();
              } else {
                await clearAllSavedIdentifications();
              }
              await loadData();
            } catch {
              Alert.alert('Error', 'Failed to clear items');
            }
          },
        },
      ]
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const renderCropCard = (crop: Crop) => (
    <View key={crop.id || crop.name} className="bg-gray-800 p-4 rounded-xl mb-3 flex-row items-center">
      <TouchableOpacity 
        className="flex-row items-center flex-1"
        onPress={() => navigation.navigate('Crops', { screen: 'CropDetail', params: { crop } })}
      >
        <View className="bg-green-900/30 rounded-lg p-3 mr-3">
          <Text className="text-2xl">{crop.icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">{crop.name}</Text>
          <Text className="text-gray-400 text-sm">{crop.category}</Text>
          <Text className="text-green-400 text-xs mt-1">
            {crop.waterRequirement} water • {crop.growingSeasonDays} days
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => handleDeleteCrop(crop)}
        className="bg-red-600/20 p-2 rounded-lg"
      >
        <MaterialCommunityIcons name="delete" size={22} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  const renderDiseaseCard = (item: SavedDiseaseIdentification) => {
    const isExpanded = expandedIds.has(item.id);
    
    return (
      <View key={item.id} className="bg-gray-800 rounded-xl p-4 mb-3">
        <View className="flex-row items-start">
          <ImageWithFallback 
            uri={item.imageUri} 
            style={{ width: 80, height: 80 }} 
            type="disease" 
          />
          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="leaf" size={16} color="#22c55e" />
                <Text className="text-green-400 text-xs ml-1">Disease</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleDeleteIdentification(item.id, item.diseaseName)}
                className="bg-red-600/20 p-1.5 rounded"
              >
                <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <Text className="text-white font-bold text-lg mt-1">{item.diseaseName}</Text>
            <Text className="text-gray-400 text-sm">{item.affectedCrop}</Text>
            <View className="flex-row items-center mt-2">
              <View className={`${getSeverityColor(item.severity)} px-2 py-0.5 rounded-full`}>
                <Text className="text-white text-xs font-semibold">{item.severity}</Text>
              </View>
              <Text className="text-gray-500 text-xs ml-2">{formatDate(item.timestamp)}</Text>
            </View>
          </View>
        </View>

        {isExpanded && (
          <View className="mt-3 pt-3 border-t border-gray-700">
            {item.symptoms.length > 0 && (
              <View className="mb-2">
                <Text className="text-gray-400 text-xs mb-1">Symptoms:</Text>
                <Text className="text-gray-300 text-sm">{item.symptoms.join(', ')}</Text>
              </View>
            )}
            {item.treatment.length > 0 && (
              <View className="mb-2">
                <Text className="text-gray-400 text-xs mb-1">Treatment:</Text>
                <Text className="text-gray-300 text-sm">{item.treatment.join(', ')}</Text>
              </View>
            )}
            {item.organicSolutions?.length > 0 && (
              <View className="mb-2">
                <Text className="text-gray-400 text-xs mb-1">Organic Solutions:</Text>
                <Text className="text-gray-300 text-sm">{item.organicSolutions.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity 
          onPress={() => toggleExpand(item.id)}
          className="flex-row items-center justify-center py-2 mt-2 border-t border-gray-700"
        >
          <Text className="text-green-400 font-semibold text-sm mr-1">
            {isExpanded ? 'Less' : 'More'}
          </Text>
          <MaterialCommunityIcons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={18} 
            color="#22c55e" 
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPestCard = (item: SavedPestIdentification) => {
    const isExpanded = expandedIds.has(item.id);
    
    return (
      <View key={item.id} className="bg-gray-800 rounded-xl p-4 mb-3">
        <View className="flex-row items-start">
          <ImageWithFallback 
            uri={item.imageUri} 
            style={{ width: 80, height: 80 }} 
            type="pest" 
          />
          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="bug" size={16} color="#fbbf24" />
                <Text className="text-yellow-400 text-xs ml-1">Pest</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleDeleteIdentification(item.id, item.pestName)}
                className="bg-red-600/20 p-1.5 rounded"
              >
                <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <Text className="text-white font-bold text-lg mt-1">{item.pestName}</Text>
            <Text className="text-gray-400 text-sm italic">{item.scientificName}</Text>
            <View className="flex-row items-center mt-2">
              <View className={`${getSeverityColor(item.severity)} px-2 py-0.5 rounded-full`}>
                <Text className="text-white text-xs font-semibold">{item.severity}</Text>
              </View>
              <Text className="text-gray-500 text-xs ml-2">{formatDate(item.timestamp)}</Text>
            </View>
          </View>
        </View>

        {isExpanded && (
          <View className="mt-3 pt-3 border-t border-gray-700">
            {item.affectedCrops.length > 0 && (
              <View className="mb-2">
                <Text className="text-gray-400 text-xs mb-1">Affected Crops:</Text>
                <View className="flex-row flex-wrap">
                  {item.affectedCrops.map((crop, i) => (
                    <View key={i} className="bg-yellow-900/30 border border-yellow-700 rounded px-2 py-0.5 mr-1 mb-1">
                      <Text className="text-yellow-300 text-xs">{crop}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {item.biologicalControl?.length > 0 && (
              <View className="mb-2">
                <Text className="text-gray-400 text-xs mb-1">Biological Control:</Text>
                <Text className="text-gray-300 text-sm">{item.biologicalControl.join(', ')}</Text>
              </View>
            )}
            {item.chemicalControl?.length > 0 && (
              <View className="mb-2">
                <Text className="text-gray-400 text-xs mb-1">Chemical Control:</Text>
                <Text className="text-gray-300 text-sm">{item.chemicalControl.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity 
          onPress={() => toggleExpand(item.id)}
          className="flex-row items-center justify-center py-2 mt-2 border-t border-gray-700"
        >
          <Text className="text-yellow-400 font-semibold text-sm mr-1">
            {isExpanded ? 'Less' : 'More'}
          </Text>
          <MaterialCommunityIcons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={18} 
            color="#fbbf24" 
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = (type: TabType) => {
    const config = {
      crops: { icon: 'seed-off-outline', text: 'No saved crops', desc: 'Save crop recommendations to view them here' },
      diseases: { icon: 'leaf-off', text: 'No saved diseases', desc: 'Save disease identifications to view them here' },
      pests: { icon: 'bug-outline', text: 'No saved pests', desc: 'Save pest identifications to view them here' },
    };
    
    return (
      <View className="items-center py-16">
        <MaterialCommunityIcons name={config[type].icon as any} size={64} color="#4b5563" />
        <Text className="text-gray-400 text-lg mt-4">{config[type].text}</Text>
        <Text className="text-gray-500 text-sm mt-2 text-center px-8">{config[type].desc}</Text>
      </View>
    );
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'crops': return crops;
      case 'diseases': return diseases;
      case 'pests': return pests;
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-gray-800 px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-gray-700 p-2 rounded-lg mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">My Saved Items</Text>
          </View>
          {getCurrentItems().length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              className="bg-red-600/20 px-3 py-2 rounded-lg"
            >
              <Text className="text-red-400 font-semibold text-sm">Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab('crops')}
            className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center ${activeTab === 'crops' ? 'bg-green-600' : 'bg-gray-700'}`}
          >
            <MaterialCommunityIcons name="sprout" size={18} color={activeTab === 'crops' ? 'white' : '#9ca3af'} />
            <Text className={`ml-1 font-semibold ${activeTab === 'crops' ? 'text-white' : 'text-gray-400'}`}>
              Crops ({crops.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('diseases')}
            className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center ${activeTab === 'diseases' ? 'bg-green-600' : 'bg-gray-700'}`}
          >
            <MaterialCommunityIcons name="leaf" size={18} color={activeTab === 'diseases' ? 'white' : '#9ca3af'} />
            <Text className={`ml-1 font-semibold ${activeTab === 'diseases' ? 'text-white' : 'text-gray-400'}`}>
              Diseases ({diseases.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('pests')}
            className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center ${activeTab === 'pests' ? 'bg-yellow-600' : 'bg-gray-700'}`}
          >
            <MaterialCommunityIcons name="bug" size={18} color={activeTab === 'pests' ? 'white' : '#9ca3af'} />
            <Text className={`ml-1 font-semibold ${activeTab === 'pests' ? 'text-white' : 'text-gray-400'}`}>
              Pests ({pests.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="text-gray-400 mt-4">Loading saved items...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          {activeTab === 'crops' && (
            crops.length > 0 
              ? crops.map(renderCropCard)
              : renderEmptyState('crops')
          )}
          {activeTab === 'diseases' && (
            diseases.length > 0 
              ? diseases.map(renderDiseaseCard)
              : renderEmptyState('diseases')
          )}
          {activeTab === 'pests' && (
            pests.length > 0 
              ? pests.map(renderPestCard)
              : renderEmptyState('pests')
          )}
          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
};

export default MySavedItemsScreen;
