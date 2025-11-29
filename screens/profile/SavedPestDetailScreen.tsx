import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ImageStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SavedPestIdentification, deleteSavedIdentification } from '../../services/savedIdentifications';

// Image component with fallback for missing images
const ImageWithFallback = ({ uri, style }: { uri: string; style?: StyleProp<ImageStyle> }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError || !uri) {
    return (
      <View 
        style={[style, { backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }]}
        className="rounded-xl"
      >
        <MaterialCommunityIcons name="bug" size={64} color="#fbbf24" />
        <Text className="text-gray-400 text-sm mt-2">Image not available</Text>
      </View>
    );
  }
  
  return (
    <Image
      source={{ uri }}
      style={style}
      className="rounded-xl"
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
};

interface SavedPestDetailScreenProps {
  route: {
    params: {
      pest: SavedPestIdentification;
    };
  };
  navigation: any;
}

const SavedPestDetailScreen = ({ route, navigation }: SavedPestDetailScreenProps) => {
  const { pest } = route.params;

  const handleDelete = () => {
    Alert.alert(
      'Delete Pest',
      `Are you sure you want to remove this ${pest.pestName} identification?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedIdentification(pest.id);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete identification');
            }
          },
        },
      ]
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-yellow-600 p-6 rounded-b-3xl">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="bg-yellow-700/50 p-2 rounded-lg"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="bug" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">Pest Identification</Text>
            </View>
            <TouchableOpacity 
              onPress={handleDelete}
              className="bg-red-500/30 p-2 rounded-lg"
            >
              <MaterialCommunityIcons name="delete" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-white text-3xl font-bold">{pest.pestName}</Text>
          <Text className="text-yellow-100 text-lg italic mt-1">{pest.scientificName}</Text>
          
          <View className="flex-row items-center mt-3 flex-wrap">
            <View className={`${getSeverityColor(pest.severity)} px-3 py-1 rounded-full mr-3 mb-2`}>
              <Text className="text-white font-semibold">{pest.severity} Severity</Text>
            </View>
            <View className="bg-yellow-700/50 px-3 py-1 rounded-full mr-3 mb-2">
              <Text className="text-white">{pest.confidence} Confidence</Text>
            </View>
            {pest.lifeStage && (
              <View className="bg-yellow-700/50 px-3 py-1 rounded-full mb-2">
                <Text className="text-white">Stage: {pest.lifeStage}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Image */}
        <View className="mx-4 mt-4">
          <ImageWithFallback 
            uri={pest.imageUri} 
            style={{ width: '100%', height: 250 }} 
          />
        </View>

        {/* Timestamp */}
        <View className="mx-4 mt-3">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="calendar-clock" size={16} color="#9ca3af" />
            <Text className="text-gray-400 text-sm ml-2">Identified on {formatDate(pest.timestamp)}</Text>
          </View>
        </View>

        {/* Affected Crops */}
        {pest.affectedCrops && pest.affectedCrops.length > 0 && (
          <View className="bg-gray-800 m-4 p-4 rounded-xl">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="sprout" size={24} color="#22c55e" />
              <Text className="text-white font-bold text-lg ml-2">Affected Crops</Text>
            </View>
            
            <View className="flex-row flex-wrap">
              {pest.affectedCrops.map((crop, index) => (
                <View key={index} className="bg-yellow-900/30 border border-yellow-700 rounded-lg px-3 py-2 mr-2 mb-2">
                  <Text className="text-yellow-300">{crop}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Biological Control */}
        {pest.biologicalControl && pest.biologicalControl.length > 0 && (
          <View className="bg-gray-800 m-4 p-4 rounded-xl">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="leaf-circle" size={24} color="#22c55e" />
              <Text className="text-white font-bold text-lg ml-2">Biological Control</Text>
            </View>
            <Text className="text-gray-400 text-sm mb-3">Eco-friendly methods to control this pest</Text>
            
            {pest.biologicalControl.map((method, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Text className="text-green-400 mr-2">✓</Text>
                <Text className="text-gray-300 flex-1">{method}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Chemical Control */}
        {pest.chemicalControl && pest.chemicalControl.length > 0 && (
          <View className="bg-gray-800 m-4 p-4 rounded-xl">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="flask" size={24} color="#ef4444" />
              <Text className="text-white font-bold text-lg ml-2">Chemical Control</Text>
            </View>
            <View className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 mb-3">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="alert-circle" size={18} color="#ef4444" />
                <Text className="text-red-300 text-sm ml-2">Always follow safety guidelines when using chemicals</Text>
              </View>
            </View>
            
            {pest.chemicalControl.map((chemical, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View className="bg-red-600 rounded-full w-5 h-5 items-center justify-center mr-2 mt-0.5">
                  <Text className="text-white text-xs font-bold">{index + 1}</Text>
                </View>
                <Text className="text-gray-300 flex-1">{chemical}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Prevention Methods */}
        {pest.preventionMethods && pest.preventionMethods.length > 0 && (
          <View className="bg-gray-800 m-4 p-4 rounded-xl mb-6">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="shield-check" size={24} color="#fbbf24" />
              <Text className="text-white font-bold text-lg ml-2">Prevention Methods</Text>
            </View>
            
            {pest.preventionMethods.map((method, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Text className="text-yellow-400 mr-2">◆</Text>
                <Text className="text-gray-300 flex-1">{method}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Severity Warning */}
        {(pest.severity === 'Critical' || pest.severity === 'High') && (
          <View className={`mx-4 mb-6 p-4 rounded-xl border ${pest.severity === 'Critical' ? 'bg-red-900/30 border-red-700' : 'bg-orange-900/30 border-orange-700'}`}>
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={24} 
                color={pest.severity === 'Critical' ? '#ef4444' : '#f97316'} 
              />
              <Text className={`font-bold text-lg ml-2 ${getSeverityTextColor(pest.severity)}`}>
                {pest.severity === 'Critical' ? 'Critical Infestation' : 'High Alert'}
              </Text>
            </View>
            <Text className="text-gray-300">
              {pest.severity === 'Critical' 
                ? 'This pest infestation requires immediate intervention. Act quickly to prevent severe crop damage.'
                : 'This pest can multiply rapidly. Begin control measures as soon as possible.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SavedPestDetailScreen;
