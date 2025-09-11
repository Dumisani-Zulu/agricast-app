import React from 'react';
import { View, Text } from 'react-native';

const CropsScreen = () => (
  <View className="flex-1 items-center justify-center bg-gray-900">
    <Text className="text-4xl font-bold text-green-500">Crops Recommendation</Text>
    <Text className="text-xl font-bold text-white text-center max-w-[250px]">Crops Recommendation based on the weather data</Text>
    <Text className="text-xl font-bold text-green-600 text-center max-w-[250px]">Coming Soon...</Text>
  </View>
);

export default CropsScreen;
