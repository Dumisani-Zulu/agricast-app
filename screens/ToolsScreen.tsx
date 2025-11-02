

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Entypo } from '@expo/vector-icons';

const tools = [
  {
    name: 'Crop Disease Identifier',
    description: 'Identify diseases affecting your crops using images or symptoms.',
    icon: <MaterialCommunityIcons name="leaf" size={32} color="#22c55e" />,
    route: 'CropDiseaseIdentifier',
  },
  {
    name: 'Pest Identifier',
    description: 'Detect and identify pests threatening your crops.',
    icon: <FontAwesome5 name="bug" size={28} color="#fbbf24" />,
    route: 'PestIdentifier',
  },
  {
    name: 'Market Prices',
    description: 'Check current market prices for your produce.',
    icon: <Entypo name="price-tag" size={28} color="#f472b6" />,
    route: 'MarketPrices',
  },
];

const ToolsScreen = ({ navigation }: { navigation: any }) => (
  <View className="flex-1 bg-gray-900 pt-20">
    <Text className="text-3xl font-bold text-white text-center mb-6">Tools</Text>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
      {tools.map((tool, idx) => (
        <TouchableOpacity
          key={tool.name}
          className="bg-gray-800 rounded-xl p-5 mb-4 shadow-md flex-row items-center"
          activeOpacity={0.7}
          onPress={() => navigation.navigate(tool.route)}
        >
          <View className="mr-4">{tool.icon}</View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-green-400 mb-1">{tool.name}</Text>
            <Text className="text-gray-200 text-base">{tool.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default ToolsScreen;
