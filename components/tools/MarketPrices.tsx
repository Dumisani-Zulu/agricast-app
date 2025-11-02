import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Entypo, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface MarketPrice {
  crop: string;
  category: string;
  pricePerKg: number;
  pricePerBag?: number;
  bagWeight?: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  market: string;
  lastUpdated: string;
  minPrice: number;
  maxPrice: number;
}

interface Market {
  name: string;
  location: string;
  distance?: string;
}

const MarketPrices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('All Markets');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  
  // Available markets in Zambia
  const markets: Market[] = [
    { name: 'All Markets', location: 'Nationwide' },
    { name: 'Soweto Market', location: 'Lusaka', distance: '2.5 km' },
    { name: 'City Market', location: 'Lusaka', distance: '5.0 km' },
    { name: 'Kamwala Market', location: 'Lusaka', distance: '3.2 km' },
    { name: 'Chisokone Market', location: 'Kitwe', distance: '15 km' },
    { name: 'Luburma Market', location: 'Ndola', distance: '20 km' },
  ];

  const categories = ['All', 'Vegetables', 'Grains', 'Fruits', 'Legumes'];
  
  // Comprehensive market data with Kwacha pricing
  const [marketData, setMarketData] = useState<MarketPrice[]>([
    // Vegetables
    { crop: 'Tomatoes', category: 'Vegetables', pricePerKg: 35, trend: 'up', change: 5, market: 'Soweto Market', lastUpdated: '2 hours ago', minPrice: 30, maxPrice: 40 },
    { crop: 'Onions', category: 'Vegetables', pricePerKg: 28, trend: 'up', change: 7, market: 'City Market', lastUpdated: '1 hour ago', minPrice: 25, maxPrice: 32 },
    { crop: 'Cabbage', category: 'Vegetables', pricePerKg: 15, trend: 'stable', change: 0, market: 'Soweto Market', lastUpdated: '3 hours ago', minPrice: 12, maxPrice: 18 },
    { crop: 'Carrots', category: 'Vegetables', pricePerKg: 22, trend: 'down', change: -3, market: 'Kamwala Market', lastUpdated: '1 hour ago', minPrice: 20, maxPrice: 25 },
    { crop: 'Rape (Chinese Cabbage)', category: 'Vegetables', pricePerKg: 12, trend: 'up', change: 2, market: 'Soweto Market', lastUpdated: '2 hours ago', minPrice: 10, maxPrice: 15 },
    { crop: 'Green Peppers', category: 'Vegetables', pricePerKg: 45, trend: 'up', change: 8, market: 'City Market', lastUpdated: '4 hours ago', minPrice: 40, maxPrice: 50 },
    { crop: 'Potatoes', category: 'Vegetables', pricePerKg: 18, pricePerBag: 450, bagWeight: 25, trend: 'down', change: -2, market: 'Luburma Market', lastUpdated: '5 hours ago', minPrice: 16, maxPrice: 20 },
    
    // Grains
    { crop: 'Maize (White)', category: 'Grains', pricePerKg: 8, pricePerBag: 400, bagWeight: 50, trend: 'stable', change: 0, market: 'City Market', lastUpdated: '1 day ago', minPrice: 7, maxPrice: 9 },
    { crop: 'Maize (Yellow)', category: 'Grains', pricePerKg: 7.5, pricePerBag: 375, bagWeight: 50, trend: 'up', change: 3, market: 'Kamwala Market', lastUpdated: '1 day ago', minPrice: 6.5, maxPrice: 8.5 },
    { crop: 'Rice (Broken)', category: 'Grains', pricePerKg: 15, pricePerBag: 750, bagWeight: 50, trend: 'up', change: 4, market: 'Chisokone Market', lastUpdated: '6 hours ago', minPrice: 14, maxPrice: 17 },
    { crop: 'Wheat', category: 'Grains', pricePerKg: 12, pricePerBag: 600, bagWeight: 50, trend: 'down', change: -1, market: 'City Market', lastUpdated: '1 day ago', minPrice: 11, maxPrice: 13 },
    { crop: 'Sorghum', category: 'Grains', pricePerKg: 9, pricePerBag: 450, bagWeight: 50, trend: 'stable', change: 0, market: 'Luburma Market', lastUpdated: '2 days ago', minPrice: 8, maxPrice: 10 },
    
    // Fruits
    { crop: 'Bananas', category: 'Fruits', pricePerKg: 20, trend: 'up', change: 6, market: 'Soweto Market', lastUpdated: '3 hours ago', minPrice: 18, maxPrice: 25 },
    { crop: 'Oranges', category: 'Fruits', pricePerKg: 25, trend: 'down', change: -4, market: 'City Market', lastUpdated: '2 hours ago', minPrice: 22, maxPrice: 28 },
    { crop: 'Mangoes', category: 'Fruits', pricePerKg: 30, trend: 'up', change: 10, market: 'Kamwala Market', lastUpdated: '1 hour ago', minPrice: 25, maxPrice: 35 },
    { crop: 'Apples', category: 'Fruits', pricePerKg: 35, trend: 'stable', change: 0, market: 'City Market', lastUpdated: '4 hours ago', minPrice: 32, maxPrice: 38 },
    { crop: 'Pineapples', category: 'Fruits', pricePerKg: 28, trend: 'up', change: 5, market: 'Soweto Market', lastUpdated: '2 hours ago', minPrice: 25, maxPrice: 32 },
    
    // Legumes
    { crop: 'Beans (Sugar)', category: 'Legumes', pricePerKg: 25, pricePerBag: 1250, bagWeight: 50, trend: 'up', change: 8, market: 'Chisokone Market', lastUpdated: '1 day ago', minPrice: 22, maxPrice: 28 },
    { crop: 'Groundnuts', category: 'Legumes', pricePerKg: 35, pricePerBag: 1750, bagWeight: 50, trend: 'down', change: -2, market: 'Kamwala Market', lastUpdated: '1 day ago', minPrice: 32, maxPrice: 38 },
    { crop: 'Cowpeas', category: 'Legumes', pricePerKg: 30, pricePerBag: 1500, bagWeight: 50, trend: 'stable', change: 0, market: 'Luburma Market', lastUpdated: '2 days ago', minPrice: 28, maxPrice: 33 },
    { crop: 'Soybeans', category: 'Legumes', pricePerKg: 18, pricePerBag: 900, bagWeight: 50, trend: 'up', change: 4, market: 'City Market', lastUpdated: '1 day ago', minPrice: 16, maxPrice: 20 },
  ]);

  const filteredData = marketData.filter(item => {
    const matchesSearch = item.crop.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMarket = selectedMarket === 'All Markets' || item.market === selectedMarket;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesMarket && matchesCategory;
  });

  const refreshPrices = () => {
    setRefreshing(true);
    // Simulate API call with random price fluctuations
    setTimeout(() => {
      setMarketData(prevData => 
        prevData.map(item => {
          const fluctuation = (Math.random() - 0.5) * 10; // -5% to +5%
          const newChange = Math.round(fluctuation);
          const newPrice = Math.max(item.minPrice, Math.min(item.maxPrice, 
            item.pricePerKg + (item.pricePerKg * fluctuation / 100)));
          
          return {
            ...item,
            pricePerKg: Math.round(newPrice),
            pricePerBag: item.pricePerBag ? Math.round((newPrice * (item.bagWeight || 1))) : undefined,
            change: newChange,
            trend: newChange > 2 ? 'up' : newChange < -2 ? 'down' : 'stable',
            lastUpdated: 'Just now'
          };
        })
      );
      setRefreshing(false);
      Alert.alert('Success', 'Market prices updated successfully!');
    }, 1500);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'trending-neutral';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#22c55e';
      case 'down': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-white text-center mb-4">
          Market Prices
        </Text>
        
        {/* Header Card */}
        <View className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-6 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-1">Live Market Prices</Text>
              <Text className="text-white/80 text-sm">Prices in Zambian Kwacha (ZMW)</Text>
              <Text className="text-white/60 text-xs mt-1">Updated regularly from local markets</Text>
            </View>
            <Entypo name="price-tag" size={48} color="white" />
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-gray-800 rounded-xl p-3 mb-4 flex-row items-center">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 text-white ml-2 text-base"
            placeholder="Search for crops..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`mr-2 px-4 py-2 rounded-full ${
                selectedCategory === category ? 'bg-pink-600' : 'bg-gray-800'
              }`}
            >
              <Text className={`font-semibold ${
                selectedCategory === category ? 'text-white' : 'text-gray-400'
              }`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Market Filter */}
        <View className="mb-4">
          <Text className="text-white font-semibold mb-2 text-sm">Select Market:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {markets.map((market) => (
              <TouchableOpacity
                key={market.name}
                onPress={() => setSelectedMarket(market.name)}
                className={`mr-3 px-4 py-3 rounded-xl ${
                  selectedMarket === market.name ? 'bg-pink-600' : 'bg-gray-800'
                }`}
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons 
                    name="store" 
                    size={18} 
                    color={selectedMarket === market.name ? 'white' : '#9ca3af'} 
                  />
                  <View className="ml-2">
                    <Text className={`font-semibold ${
                      selectedMarket === market.name ? 'text-white' : 'text-gray-300'
                    }`}>
                      {market.name}
                    </Text>
                    <Text className={`text-xs ${
                      selectedMarket === market.name ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {market.location} {market.distance && `• ${market.distance}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Price Cards */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-bold text-lg">
              {filteredData.length} {filteredData.length === 1 ? 'Product' : 'Products'}
            </Text>
            <TouchableOpacity
              onPress={refreshPrices}
              disabled={refreshing}
              className="flex-row items-center bg-gray-800 px-3 py-2 rounded-lg"
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#f472b6" />
              ) : (
                <MaterialCommunityIcons name="refresh" size={18} color="#f472b6" />
              )}
              <Text className="text-pink-400 font-semibold ml-1 text-sm">Refresh</Text>
            </TouchableOpacity>
          </View>

          {filteredData.map((item, index) => (
            <View key={index} className="bg-gray-800 rounded-xl p-4 mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-white">{item.crop}</Text>
                  <View className="flex-row items-center mt-1">
                    <View className="bg-gray-700 px-2 py-1 rounded">
                      <Text className="text-gray-400 text-xs">{item.category}</Text>
                    </View>
                    <MaterialCommunityIcons name="map-marker" size={12} color="#9ca3af" style={{ marginLeft: 8 }} />
                    <Text className="text-gray-400 text-xs ml-1">{item.market}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <MaterialCommunityIcons 
                    name={getTrendIcon(item.trend)}
                    size={28} 
                    color={getTrendColor(item.trend)} 
                  />
                  <Text className={`font-bold text-sm ${
                    item.trend === 'up' ? 'text-green-400' : 
                    item.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </Text>
                </View>
              </View>

              <View className="border-t border-gray-700 pt-3 mt-2">
                <View className="flex-row justify-between items-end">
                  <View>
                    <Text className="text-gray-400 text-xs mb-1">Per Kilogram</Text>
                    <Text className="text-3xl font-bold text-green-400">
                      K{item.pricePerKg.toFixed(2)}
                    </Text>
                  </View>
                  {item.pricePerBag && (
                    <View className="items-end">
                      <Text className="text-gray-400 text-xs mb-1">
                        Per Bag ({item.bagWeight}kg)
                      </Text>
                      <Text className="text-xl font-bold text-blue-400">
                        K{item.pricePerBag.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-700">
                  <View>
                    <Text className="text-gray-500 text-xs">Price Range</Text>
                    <Text className="text-gray-300 text-sm font-semibold">
                      K{item.minPrice} - K{item.maxPrice}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-500 text-xs">Last Updated</Text>
                    <Text className="text-gray-300 text-sm font-semibold">
                      {item.lastUpdated}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {filteredData.length === 0 && (
            <View className="bg-gray-800 rounded-xl p-8 items-center">
              <MaterialCommunityIcons name="magnify-close" size={64} color="#4b5563" />
              <Text className="text-gray-400 text-center mt-4 text-lg">
                No products found
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 mb-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#60a5fa" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-400 font-semibold mb-1">Market Information</Text>
              <Text className="text-blue-200/80 text-sm">
                Prices are indicative and may vary based on quality, season, and location. 
                Contact markets directly for bulk pricing and current availability.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MarketPrices;