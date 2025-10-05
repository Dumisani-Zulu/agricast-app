
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CropDiseaseIdentifier = () => {
  const handleImageCapture = () => {
    Alert.alert('Camera', 'Camera functionality will be implemented here');
  };

  const handleImageGallery = () => {
    Alert.alert('Gallery', 'Gallery selection will be implemented here');
  };

  return (
    <View className="flex-1 bg-gray-900 p-4">
      <Text className="text-2xl font-bold text-white text-center mb-6">
        Crop Disease Identifier
      </Text>
      
      <View className="bg-gray-800 rounded-xl p-6 mb-6">
        <MaterialCommunityIcons 
          name="leaf" 
          size={64} 
          color="#22c55e" 
          style={{ alignSelf: 'center' }}
        />
        <Text className="text-white text-center mt-4 text-lg">
          Upload or capture an image of your crop to identify potential diseases
        </Text>
      </View>

      <TouchableOpacity
        className="bg-green-600 rounded-xl p-4 mb-4 flex-row items-center justify-center"
        onPress={handleImageCapture}
      >
        <MaterialCommunityIcons name="camera" size={24} color="white" />
        <Text className="text-white font-semibold ml-2 text-lg">Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-blue-600 rounded-xl p-4 mb-4 flex-row items-center justify-center"
        onPress={handleImageGallery}
      >
        <MaterialCommunityIcons name="image" size={24} color="white" />
        <Text className="text-white font-semibold ml-2 text-lg">Choose from Gallery</Text>
      </TouchableOpacity>

      <View className="bg-gray-800 rounded-xl p-4 mt-4">
        <Text className="text-gray-300 text-sm text-center">
          Tip: Take clear photos in good lighting for better identification results
        </Text>
      </View>
    </View>
  );
};

export default CropDiseaseIdentifier;