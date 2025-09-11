import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SoilHealthChecker = () => {
  const [soilData, setSoilData] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: ''
  });

  const handleAnalysis = () => {
    if (!soilData.ph || !soilData.nitrogen || !soilData.phosphorus || !soilData.potassium) {
      alert('Please fill in all soil data fields');
      return;
    }
    // Analysis logic would go here
    alert('Soil analysis complete! Recommendations will be displayed.');
  };

  return (
    <ScrollView className="flex-1 bg-gray-900 p-4">
      <Text className="text-2xl font-bold text-white text-center mb-6">
        Soil Health Checker
      </Text>
      
      <View className="bg-gray-800 rounded-xl p-6 mb-6">
        <MaterialCommunityIcons 
          name="shovel" 
          size={64} 
          color="#a16207" 
          style={{ alignSelf: 'center' }}
        />
        <Text className="text-white text-center mt-4 text-lg">
          Enter your soil test results to get health recommendations
        </Text>
      </View>

      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <Text className="text-white font-semibold mb-2">pH Level</Text>
        <TextInput
          className="bg-gray-700 text-white p-3 rounded-lg"
          placeholder="Enter pH value (0-14)"
          placeholderTextColor="#9ca3af"
          value={soilData.ph}
          onChangeText={(text) => setSoilData({...soilData, ph: text})}
          keyboardType="numeric"
        />
      </View>

      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <Text className="text-white font-semibold mb-2">Nitrogen (N) %</Text>
        <TextInput
          className="bg-gray-700 text-white p-3 rounded-lg"
          placeholder="Enter nitrogen percentage"
          placeholderTextColor="#9ca3af"
          value={soilData.nitrogen}
          onChangeText={(text) => setSoilData({...soilData, nitrogen: text})}
          keyboardType="numeric"
        />
      </View>

      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <Text className="text-white font-semibold mb-2">Phosphorus (P) %</Text>
        <TextInput
          className="bg-gray-700 text-white p-3 rounded-lg"
          placeholder="Enter phosphorus percentage"
          placeholderTextColor="#9ca3af"
          value={soilData.phosphorus}
          onChangeText={(text) => setSoilData({...soilData, phosphorus: text})}
          keyboardType="numeric"
        />
      </View>

      <View className="bg-gray-800 rounded-xl p-4 mb-6">
        <Text className="text-white font-semibold mb-2">Potassium (K) %</Text>
        <TextInput
          className="bg-gray-700 text-white p-3 rounded-lg"
          placeholder="Enter potassium percentage"
          placeholderTextColor="#9ca3af"
          value={soilData.potassium}
          onChangeText={(text) => setSoilData({...soilData, potassium: text})}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        className="bg-yellow-700 rounded-xl p-4 mb-4 flex-row items-center justify-center"
        onPress={handleAnalysis}
      >
        <MaterialCommunityIcons name="test-tube" size={24} color="white" />
        <Text className="text-white font-semibold ml-2 text-lg">Analyze Soil</Text>
      </TouchableOpacity>

      <View className="bg-gray-800 rounded-xl p-4">
        <Text className="text-gray-300 text-sm text-center">
          Get your soil tested at a local lab for accurate readings
        </Text>
      </View>
    </ScrollView>
  );
};

export default SoilHealthChecker;