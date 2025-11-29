import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ImageStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SavedDiseaseIdentification, deleteSavedIdentification } from '../../services/savedIdentifications';

// Image component with fallback for missing images
const ImageWithFallback = ({ uri, style }: { uri: string; style?: StyleProp<ImageStyle> }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError || !uri) {
    return (
      <View 
        style={[style, { backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }]}
        className="rounded-xl"
      >
        <MaterialCommunityIcons name="leaf" size={64} color="#22c55e" />
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

interface SavedDiseaseDetailScreenProps {
  route: {
    params: {
      disease: SavedDiseaseIdentification;
    };
  };
  navigation: any;
}

const SavedDiseaseDetailScreen = ({ route, navigation }: SavedDiseaseDetailScreenProps) => {
  const { disease } = route.params;

  const handleDelete = () => {
    Alert.alert(
      'Delete Disease',
      `Are you sure you want to remove this ${disease.diseaseName} identification?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedIdentification(disease.id);
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
        <View className="bg-green-600 p-6 rounded-b-3xl">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="bg-green-700/50 p-2 rounded-lg"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="leaf" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">Disease Identification</Text>
            </View>
            <TouchableOpacity 
              onPress={handleDelete}
              className="bg-red-500/30 p-2 rounded-lg"
            >
              <MaterialCommunityIcons name="delete" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-white text-3xl font-bold">{disease.diseaseName}</Text>
          <Text className="text-green-100 text-lg mt-1">Affecting: {disease.affectedCrop}</Text>
          
          <View className="flex-row items-center mt-3">
            <View className={`${getSeverityColor(disease.severity)} px-3 py-1 rounded-full mr-3`}>
              <Text className="text-white font-semibold">{disease.severity} Severity</Text>
            </View>
            <View className="bg-green-700/50 px-3 py-1 rounded-full">
              <Text className="text-white">{disease.confidence} Confidence</Text>
            </View>
          </View>
        </View>

        {/* Image */}
        <View className="mx-4 mt-4">
          <ImageWithFallback 
            uri={disease.imageUri} 
            style={{ width: '100%', height: 250 }} 
          />
        </View>

        {/* Timestamp */}
        <View className="mx-4 mt-3">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="calendar-clock" size={16} color="#9ca3af" />
            <Text className="text-gray-400 text-sm ml-2">Identified on {formatDate(disease.timestamp)}</Text>
          </View>
        </View>

        {/* Symptoms */}
        {disease.symptoms && disease.symptoms.length > 0 && (
          <View className="bg-gray-800 m-4 p-4 rounded-xl">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="eye" size={24} color="#ef4444" />
              <Text className="text-white font-bold text-lg ml-2">Symptoms</Text>
            </View>
            
            {disease.symptoms.map((symptom, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Text className="text-red-400 mr-2">•</Text>
                <Text className="text-gray-300 flex-1">{symptom}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Treatment */}
        {disease.treatment && disease.treatment.length > 0 && (
          <View className="bg-gray-800 m-4 p-4 rounded-xl">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="medical-bag" size={24} color="#3b82f6" />
              <Text className="text-white font-bold text-lg ml-2">Treatment</Text>
            </View>
            
            {disease.treatment.map((item, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View className="bg-blue-600 rounded-full w-5 h-5 items-center justify-center mr-2 mt-0.5">
                  <Text className="text-white text-xs font-bold">{index + 1}</Text>
                </View>
                <Text className="text-gray-300 flex-1">{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Organic Solutions */}
        {disease.organicSolutions && disease.organicSolutions.length > 0 && (
          <View className="bg-gray-800 m-4 p-4 rounded-xl">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="leaf-circle" size={24} color="#22c55e" />
              <Text className="text-white font-bold text-lg ml-2">Organic Solutions</Text>
            </View>
            
            {disease.organicSolutions.map((solution, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Text className="text-green-400 mr-2">✓</Text>
                <Text className="text-gray-300 flex-1">{solution}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Prevention */}
        {disease.prevention && disease.prevention.length > 0 && (
          <View className="bg-gray-800 m-4 p-4 rounded-xl mb-6">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="shield-check" size={24} color="#fbbf24" />
              <Text className="text-white font-bold text-lg ml-2">Prevention</Text>
            </View>
            
            {disease.prevention.map((item, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Text className="text-yellow-400 mr-2">◆</Text>
                <Text className="text-gray-300 flex-1">{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Severity Warning */}
        {(disease.severity === 'Critical' || disease.severity === 'High') && (
          <View className={`mx-4 mb-6 p-4 rounded-xl border ${disease.severity === 'Critical' ? 'bg-red-900/30 border-red-700' : 'bg-orange-900/30 border-orange-700'}`}>
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={24} 
                color={disease.severity === 'Critical' ? '#ef4444' : '#f97316'} 
              />
              <Text className={`font-bold text-lg ml-2 ${getSeverityTextColor(disease.severity)}`}>
                {disease.severity === 'Critical' ? 'Critical Warning' : 'High Alert'}
              </Text>
            </View>
            <Text className="text-gray-300">
              {disease.severity === 'Critical' 
                ? 'This disease requires immediate attention. Take action as soon as possible to prevent crop loss.'
                : 'This disease can spread quickly. Monitor closely and begin treatment promptly.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SavedDiseaseDetailScreen;
