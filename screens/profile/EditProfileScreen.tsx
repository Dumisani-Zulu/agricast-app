import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const EditProfileScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '+260 97 123 4567',
    location: 'Lusaka, Zambia',
    farmSize: '25 hectares',
    experience: '8 years',
    cropTypes: 'Maize, Soybeans, Tomatoes',
    bio: 'Experienced farmer specializing in sustainable agriculture practices.'
  });

  const handleSave = () => {
    Alert.alert(
      'Save Changes',
      'Are you sure you want to save these changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => {
            // TODO: Implement profile update logic
            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    multiline = false,
    keyboardType = 'default' 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: any;
  }) => (
    <View className="mb-6">
      <Text className="text-white text-sm font-medium mb-2 ml-1">{label}</Text>
      <TextInput
        className={`bg-gray-700/70 text-white p-4 rounded-2xl border border-gray-600/50 text-base ${
          multiline ? 'h-24' : ''
        }`}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0f172a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mt-20 border-b border-gray-700/30">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 rounded-full bg-gray-800/50"
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          className="px-4 py-2 rounded-full bg-green-600"
        >
          <Text className="text-white font-medium">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Profile Picture Section */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-blue-500 items-center justify-center">
              <Text className="text-white text-3xl font-bold">
                {(formData.displayName.charAt(0) || 'U').toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-600 items-center justify-center border-2 border-slate-900">
              <Ionicons name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-400 mt-2">Tap to change photo</Text>
        </View>

        {/* Personal Information */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Personal Information
          </Text>
          
          <InputField
            label="Full Name"
            value={formData.displayName}
            onChangeText={(text) => setFormData({ ...formData, displayName: text })}
            placeholder="Enter your full name"
          />
          
          <InputField
            label="Email Address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
          
          <InputField
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          
          <InputField
            label="Location"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholder="Enter your location"
          />
        </View>

        {/* Farm Information */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Farm Information
          </Text>
          
          <InputField
            label="Farm Size"
            value={formData.farmSize}
            onChangeText={(text) => setFormData({ ...formData, farmSize: text })}
            placeholder="e.g. 25 hectares"
          />
          
          <InputField
            label="Experience"
            value={formData.experience}
            onChangeText={(text) => setFormData({ ...formData, experience: text })}
            placeholder="e.g. 8 years"
          />
          
          <InputField
            label="Crop Types"
            value={formData.cropTypes}
            onChangeText={(text) => setFormData({ ...formData, cropTypes: text })}
            placeholder="e.g. Maize, Soybeans, Tomatoes"
          />
          
          <InputField
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder="Tell us about yourself and your farming experience"
            multiline={true}
          />
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;