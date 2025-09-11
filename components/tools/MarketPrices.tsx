import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';

const MarketPrices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock market data - in real app, this would come from an API
  const marketData = [
    { crop: 'Tomatoes', price: '$2.50/kg', trend: 'up', change: '+5%' },
    { crop: 'Potatoes', price: '$1.20/kg', trend: 'down', change: '-2%' },
    { crop: 'Maize', price: '$0.80/kg', trend: 'up', change: '+3%' },
    { crop: 'Onions', price: '$1.80/kg', trend: 'up', change: '+7%' },
    { crop: 'Carrots', price: '$1.50/kg', trend: 'down', change: '-1%' },
    { crop: 'Cabbage', price: '$1.10/kg', trend: 'up', change: '+4%' },
  ];

  const filteredData = marketData.filter(item =>
    item.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-900 p-4">
      <Text className="text-2xl font-bold text-white text-center mb-6">
        Market Prices
      </Text>
      
      <View className="bg-gray-800 rounded-xl p-6 mb-6">
        <Entypo 
          name="price-tag" 
          size={64} 
          color="#f472b6" 
          style={{ alignSelf: 'center' }}
        />
        <Text className="text-white text-center mt-4 text-lg">
          Check current market prices for your produce
        </Text>
      </View>

      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <TextInput
          className="bg-gray-700 text-white p-3 rounded-lg"
          placeholder="Search for crop prices..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView className="flex-1">
        {filteredData.map((item, index) => (
          <View key={index} className="bg-gray-800 rounded-xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-white">{item.crop}</Text>
              <Text className="text-2xl font-bold text-green-400">{item.price}</Text>
            </View>
            <View className="items-center">
              <MaterialCommunityIcons 
                name={item.trend === 'up' ? 'trending-up' : 'trending-down'}
                size={24} 
                color={item.trend === 'up' ? '#22c55e' : '#ef4444'} 
              />
              <Text className={`font-semibold ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {item.change}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        className="bg-pink-600 rounded-xl p-4 mt-4 flex-row items-center justify-center"
        onPress={() => alert('Refreshing market data...')}
      >
        <MaterialCommunityIcons name="refresh" size={24} color="white" />
        <Text className="text-white font-semibold ml-2 text-lg">Refresh Prices</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MarketPrices;