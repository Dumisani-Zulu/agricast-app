import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [userProfile] = useState({
    name: user?.displayName || 'Farmer',
    email: user?.email || 'No email',
    phone: '+260 97 123 4567',
    location: 'Lusaka, Zambia',
    joinDate: 'January 2024',
    farmSize: '25 hectares',
    cropTypes: ['Maize', 'Soybeans', 'Tomatoes'],
    experience: '8 years'
  });

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality coming soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const MenuButton = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    color = 'white' 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    color?: string;
  }) => (
    <TouchableOpacity 
      className="flex-row items-center py-4 px-6 bg-gray-800/50 rounded-2xl mb-3 border border-gray-700/30"
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: '#16a34a20' }}>
        <Ionicons name={icon} size={20} color={color === 'white' ? '#16a34a' : color} />
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{title}</Text>
        {subtitle && <Text className="text-gray-400 text-sm mt-1">{subtitle}</Text>}
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0f172a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        {/* <View className="flex-row items-center justify-between px-6 pt-20 pb-6">
          <Text className="text-white text-2xl font-bold">Profile</Text>
          <TouchableOpacity onPress={handleSettings}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View> */}

        {/* Profile Card */}
        <View className="mx-6 mb-6 mt-20 rounded-3xl p-6 border border-gray-700/30">
          
          {/* Profile Image & Edit Button */}
          <View className="items-center mb-6">
            <View className="relative">
              <View className="w-32 h-32 rounded-full items-center justify-center border-4 border-green-500/20">
                <Ionicons name="person" size={60} color="#9CA3AF" />
              </View>
              <TouchableOpacity 
                className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full items-center justify-center border-2 border-gray-800"
                style={{ backgroundColor: '#16a34a' }}
                onPress={handleEditProfile}
              >
                <Ionicons name="camera" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-white text-2xl font-bold mt-4">{userProfile.name}</Text>
            <Text className="text-gray-400 text-base">{userProfile.email}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#9CA3AF" />
              <Text className="text-gray-400 text-lg ml-1">{userProfile.location}</Text>
            </View>
          </View>
        </View>

        {/* Farm Information */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-4 flex-row items-center">
            <Text className="text-2xl font-bold text-[#16a34a]">Farm Information</Text>
          </Text>
          
          <View className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/30">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-400">Farm Size</Text>
              <Text className="text-white font-semibold">{userProfile.farmSize}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-400">Experience</Text>
              <Text className="text-white font-semibold">{userProfile.experience}</Text>
            </View>
            <View className="mb-2">
              <Text className="text-gray-400 mb-2">Crop Types</Text>
              <View className="flex-row flex-wrap">
                {userProfile.cropTypes.map((crop, index) => (
                  <View key={index} className="bg-green-500/20 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-green-300 text-sm">{crop}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View className="flex-row justify-between items-center border-t border-gray-700/50 pt-4">
              <Text className="text-gray-400">Member Since</Text>
              <Text className="text-white font-semibold">{userProfile.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View className="mx-6 mb-6">
          <Text className="text-2xl font-bold text-[#16a34a] mb-4">Account</Text>
          
          <MenuButton 
            icon="person-outline" 
            title="Edit Profile" 
            subtitle="Update your personal information"
            onPress={handleEditProfile}
          />
          
          <MenuButton 
            icon="notifications-outline" 
            title="Notifications" 
            subtitle="Manage your notification preferences"
            onPress={() => Alert.alert('Notifications', 'Coming soon!')}
          />
          
          <MenuButton 
            icon="shield-checkmark-outline" 
            title="Privacy & Security" 
            subtitle="Control your privacy settings"
            onPress={() => Alert.alert('Privacy', 'Coming soon!')}
          />
          
          <MenuButton 
            icon="help-circle-outline" 
            title="Help & Support" 
            subtitle="Get help or contact support"
            onPress={() => Alert.alert('Help', 'Coming soon!')}
          />
          
          <MenuButton 
            icon="information-circle-outline" 
            title="About" 
            subtitle="App version and information"
            onPress={() => Alert.alert('About', 'FarmApp v1.0.0')}
          />
        </View>

        {/* Logout */}
        <View className="mx-6 mb-8">
          <MenuButton 
            icon="log-out-outline" 
            title="Logout" 
            onPress={handleLogout}
            showArrow={false}
            color="#ef4444"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
