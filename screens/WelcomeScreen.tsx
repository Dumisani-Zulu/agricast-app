import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';

const WelcomeScreen = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#0f172a' }}>
      <View className="flex-1 justify-center items-center px-6 py-12 min-h-screen">
        {/* Hero Section */}
        <View className="items-center mb-4">
          <View className="w-40 h-40 rounded-3xl items-center justify-center mb-6 shadow-lg">
            {/* <Text className="text-4xl">🌱</Text> */}
              <Image source={require('../assets/agricast.png')} className="w-80 h-80" />
          </View>
          
          {/* <Text className="text-5xl font-black text-white text-center mb-4 tracking-tight">
            FarmApp
          </Text> */}
          
          {/* <Text className="text-xl text-gray-300 text-center mb-2 font-light">
            Smart Farming Solutions
          </Text> */}
          
          {/* <View className="w-40 h-1 rounded-full" style={{ backgroundColor: '#16a34a' }}></View> */}
        </View>
        
        {/* Features Grid */}
        <View className="w-full max-w-sm mb-10">
          <Text className="text-lg font-semibold text-white text-center mb-6">
            Smart Farming Solutions
          </Text>
          
          <View className="space-y-4 gap-5">
            <View className="flex-row items-center bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/50">
              <View className="w-12 h-12 bg-green-500/20 rounded-xl items-center justify-center mr-4">
                <Text className="text-2xl">🌾</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Crop Recommendations</Text>
                <Text className="text-gray-400 text-sm">Get personalized crop suggestions</Text>
              </View>
            </View>
            
            <View className="flex-row items-center bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/50">
              <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mr-4">
                <Text className="text-2xl">🔧</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Farm Tools</Text>
                <Text className="text-gray-400 text-sm">Access a variety of tools for your farm</Text>
              </View>
            </View>
            
            <View className="flex-row items-center bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/50">
              <View className="w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center mr-4">
                <Text className="text-2xl">💬</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Community Forum</Text>
                <Text className="text-gray-400 text-sm">Connect with farmers</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* CTA Section */}
        <View className="w-full max-w-sm">
          <TouchableOpacity
            className="px-8 py-5 rounded-2xl w-full shadow-lg active:scale-95"
            style={{ backgroundColor: '#16a34a' }}
            onPress={onGetStarted}
          >
            <Text className="text-white text-center font-bold text-lg">
              Get Started
            </Text>
          </TouchableOpacity>
          
          <Text className="text-gray-400 text-center mt-4 text-sm">
            Join thousands of farmers already using FarmApp
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default WelcomeScreen;
