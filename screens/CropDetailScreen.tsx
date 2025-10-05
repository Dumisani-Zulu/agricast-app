
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Crop } from '../types/crop';

interface CropDetailScreenProps {
  route: {
    params: {
      crop: Crop;
    };
  };
  navigation: any;
}

const CropDetailScreen = ({ route, navigation }: CropDetailScreenProps) => {
  const { crop } = route.params;

  return (
    <ScrollView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-green-600 p-6 rounded-b-3xl">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mb-4"
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row items-center">
          <View className="bg-white rounded-full w-20 h-20 items-center justify-center mr-4">
            <Text className="text-5xl">{crop.icon}</Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-white text-3xl font-bold">{crop.name}</Text>
            <Text className="text-green-100 text-sm italic mt-1">{crop.scientificName}</Text>
            <View className="bg-green-700 rounded-lg px-3 py-1 self-start mt-2">
              <Text className="text-white text-xs font-semibold">{crop.category}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Description */}
      <View className="bg-gray-800 m-4 p-4 rounded-xl">
        <Text className="text-white font-bold text-lg mb-2">About</Text>
        <Text className="text-gray-300">{crop.description}</Text>
      </View>

      {/* Growing Conditions */}
      <View className="bg-gray-800 m-4 p-4 rounded-xl">
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons name="sprout" size={24} color="#22c55e" />
          <Text className="text-white font-bold text-lg ml-2">Growing Conditions</Text>
        </View>
        
        <View className="space-y-3">
          <View className="flex-row items-center mb-3">
            <View className="bg-gray-700 rounded-lg p-2 mr-3">
              <MaterialCommunityIcons name="thermometer" size={20} color="#fbbf24" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Temperature Range</Text>
              <Text className="text-white font-semibold">
                {crop.optimalTemperature.min}°C - {crop.optimalTemperature.max}°C
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-3">
            <View className="bg-gray-700 rounded-lg p-2 mr-3">
              <MaterialCommunityIcons name="water" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Water Requirement</Text>
              <Text className="text-white font-semibold">{crop.waterRequirement}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-3">
            <View className="bg-gray-700 rounded-lg p-2 mr-3">
              <MaterialCommunityIcons name="white-balance-sunny" size={20} color="#fbbf24" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Sunlight</Text>
              <Text className="text-white font-semibold">{crop.sunlightRequirement}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-3">
            <View className="bg-gray-700 rounded-lg p-2 mr-3">
              <MaterialCommunityIcons name="calendar-clock" size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Growing Season</Text>
              <Text className="text-white font-semibold">{crop.growingSeasonDays} days</Text>
            </View>
          </View>

          <View className="flex-row items-start mb-3">
            <View className="bg-gray-700 rounded-lg p-2 mr-3">
              <MaterialCommunityIcons name="layers" size={20} color="#a16207" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm">Soil Type</Text>
              <Text className="text-white font-semibold">{crop.soilType.join(', ')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Planting Information */}
      <View className="bg-gray-800 m-4 p-4 rounded-xl">
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons name="seed" size={24} color="#22c55e" />
          <Text className="text-white font-bold text-lg ml-2">Planting Information</Text>
        </View>
        
        <View className="space-y-2">
          <View className="mb-3">
            <Text className="text-gray-400 text-sm">Planting Time</Text>
            <Text className="text-white">{crop.plantingTime}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-gray-400 text-sm">Planting Depth</Text>
            <Text className="text-white">{crop.plantingDepth}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-gray-400 text-sm">Spacing</Text>
            <Text className="text-white">{crop.spacing}</Text>
          </View>
        </View>
      </View>

      {/* Care Instructions */}
      <View className="bg-gray-800 m-4 p-4 rounded-xl">
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons name="clipboard-check" size={24} color="#22c55e" />
          <Text className="text-white font-bold text-lg ml-2">Care Instructions</Text>
        </View>
        
        {crop.careInstructions.map((instruction, index) => (
          <View key={index} className="flex-row items-start mb-2">
            <Text className="text-green-400 mr-2">•</Text>
            <Text className="text-gray-300 flex-1">{instruction}</Text>
          </View>
        ))}
      </View>

      {/* Pests & Diseases */}
      <View className="bg-gray-800 m-4 p-4 rounded-xl">
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons name="bug" size={24} color="#ef4444" />
          <Text className="text-white font-bold text-lg ml-2">Common Pests & Diseases</Text>
        </View>
        
        <Text className="text-gray-400 text-sm font-semibold mb-2">Common Pests:</Text>
        {crop.commonPests.map((pest, index) => (
          <View key={index} className="flex-row items-start mb-1">
            <Text className="text-red-400 mr-2">•</Text>
            <Text className="text-gray-300 flex-1">{pest}</Text>
          </View>
        ))}
        
        <Text className="text-gray-400 text-sm font-semibold mb-2 mt-3">Common Diseases:</Text>
        {crop.commonDiseases.map((disease, index) => (
          <View key={index} className="flex-row items-start mb-1">
            <Text className="text-red-400 mr-2">•</Text>
            <Text className="text-gray-300 flex-1">{disease}</Text>
          </View>
        ))}
      </View>

      {/* Harvest Information */}
      <View className="bg-gray-800 m-4 p-4 rounded-xl">
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons name="basket" size={24} color="#fbbf24" />
          <Text className="text-white font-bold text-lg ml-2">Harvest Information</Text>
        </View>
        
        <View className="space-y-2">
          <View className="mb-3">
            <Text className="text-gray-400 text-sm">When to Harvest</Text>
            <Text className="text-white">{crop.harvestTime}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-gray-400 text-sm">Expected Yield</Text>
            <Text className="text-white">{crop.harvestYield}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-gray-400 text-sm">Storage Instructions</Text>
            <Text className="text-white">{crop.storageInstructions}</Text>
          </View>
        </View>
      </View>

      {/* Additional Tips */}
      {crop.tips && crop.tips.length > 0 && (
        <View className="bg-blue-900 m-4 p-4 rounded-xl border border-blue-700">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="lightbulb" size={24} color="#fbbf24" />
            <Text className="text-white font-bold text-lg ml-2">Pro Tips</Text>
          </View>
          
          {crop.tips.map((tip, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <Text className="text-yellow-400 mr-2">💡</Text>
              <Text className="text-blue-100 flex-1">{tip}</Text>
            </View>
          ))}
        </View>
      )}

      <View className="h-6" />
    </ScrollView>
  );
};

export default CropDetailScreen;