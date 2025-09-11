import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const PestIdentifier = () => {
  const handleImageCapture = () => {
    Alert.alert('Camera', 'Camera functionality will be implemented here');
  };

  const handleImageGallery = () => {
    Alert.alert('Gallery', 'Gallery selection will be implemented here');
  };

  return (
    <View className="flex-1 bg-gray-900 p-4">
      <Text className="text-2xl font-bold text-white text-center mb-6">
        Pest Identifier
      </Text>
      
      <View className="bg-gray-800 rounded-xl p-6 mb-6">
        <FontAwesome5 
          name="bug" 
          size={64} 
          color="#fbbf24" 
          style={{ alignSelf: 'center' }}
        />
        <Text className="text-white text-center mt-4 text-lg">
          Identify pests affecting your crops and get treatment recommendations
        </Text>
      </View>

      <TouchableOpacity
        className="bg-yellow-600 rounded-xl p-4 mb-4 flex-row items-center justify-center"
        onPress={handleImageCapture}
      >
        <FontAwesome5 name="camera" size={20} color="white" />
        <Text className="text-white font-semibold ml-2 text-lg">Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-blue-600 rounded-xl p-4 mb-4 flex-row items-center justify-center"
        onPress={handleImageGallery}
      >
        <FontAwesome5 name="images" size={20} color="white" />
        <Text className="text-white font-semibold ml-2 text-lg">Choose from Gallery</Text>
      </TouchableOpacity>

      <View className="bg-gray-800 rounded-xl p-4 mt-4">
        <Text className="text-gray-300 text-sm text-center">
          Tip: Capture close-up images of the pest or damage for accurate identification
        </Text>
      </View>
    </View>
  );
};

export default PestIdentifier;