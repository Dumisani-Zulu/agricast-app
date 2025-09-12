import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PrivacySettingsScreen = ({ navigation }: { navigation: any }) => {
  const [settings, setSettings] = useState({
    profileVisibility: true,
    shareLocation: false,
    dataCollection: true,
    thirdPartySharing: false,
    analyticsTracking: true,
    marketingEmails: false,
    biometricAuth: false,
    twoFactorAuth: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'This feature will be available soon. Please contact support for assistance.');
          }
        }
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert('Data Export', 'Your data export will be sent to your registered email address within 24-48 hours.');
  };

  const SettingItem = ({
    icon,
    title,
    description,
    value,
    onToggle,
    iconColor = '#10b981',
    hasToggle = true
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    value?: boolean;
    onToggle?: () => void;
    iconColor?: string;
    hasToggle?: boolean;
  }) => (
    <TouchableOpacity
      className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/30"
      onPress={hasToggle ? onToggle : undefined}
      disabled={!hasToggle}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${iconColor}20` }}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-base">{title}</Text>
            <Text className="text-gray-400 text-sm mt-1">{description}</Text>
          </View>
        </View>
        {hasToggle && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#374151', true: '#10b981' }}
            thumbColor={value ? '#ffffff' : '#9CA3AF'}
            ios_backgroundColor="#374151"
          />
        )}
        {!hasToggle && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  const ActionButton = ({
    icon,
    title,
    description,
    onPress,
    iconColor = '#ef4444',
    textColor = '#ef4444'
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    onPress: () => void;
    iconColor?: string;
    textColor?: string;
  }) => (
    <TouchableOpacity
      className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/30"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${iconColor}20` }}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-base" style={{ color: textColor }}>{title}</Text>
          <Text className="text-gray-400 text-sm mt-1">{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
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
        <Text className="text-white text-3xl font-bold">Privacy & Settings</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Privacy Settings */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Privacy</Text>
          
          <SettingItem
            icon="eye"
            title="Profile Visibility"
            description="Allow others to see your profile in the community"
            value={settings.profileVisibility}
            onToggle={() => toggleSetting('profileVisibility')}
          />
          
          <SettingItem
            icon="location"
            title="Share Location"
            description="Share your location for local weather and tips"
            value={settings.shareLocation}
            onToggle={() => toggleSetting('shareLocation')}
            iconColor="#f59e0b"
          />
          
          <SettingItem
            icon="analytics"
            title="Data Collection"
            description="Allow app to collect usage data for improvements"
            value={settings.dataCollection}
            onToggle={() => toggleSetting('dataCollection')}
            iconColor="#3b82f6"
          />
          
          <SettingItem
            icon="share"
            title="Third-party Sharing"
            description="Share anonymized data with agricultural research partners"
            value={settings.thirdPartySharing}
            onToggle={() => toggleSetting('thirdPartySharing')}
            iconColor="#8b5cf6"
          />
        </View>

        {/* Security Settings */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Security</Text>
          
          <SettingItem
            icon="finger-print"
            title="Biometric Authentication"
            description="Use fingerprint or face ID to unlock the app"
            value={settings.biometricAuth}
            onToggle={() => toggleSetting('biometricAuth')}
            iconColor="#22c55e"
          />
          
          <SettingItem
            icon="shield-checkmark"
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            value={settings.twoFactorAuth}
            onToggle={() => toggleSetting('twoFactorAuth')}
            iconColor="#06b6d4"
          />
        </View>

        {/* Marketing Preferences */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Marketing</Text>
          
          <SettingItem
            icon="trending-up"
            title="Analytics Tracking"
            description="Help us improve the app with usage analytics"
            value={settings.analyticsTracking}
            onToggle={() => toggleSetting('analyticsTracking')}
            iconColor="#f97316"
          />
          
          <SettingItem
            icon="mail"
            title="Marketing Emails"
            description="Receive promotional emails and farming tips"
            value={settings.marketingEmails}
            onToggle={() => toggleSetting('marketingEmails')}
            iconColor="#84cc16"
          />
        </View>

        {/* Data Management */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Data Management</Text>
          
          <ActionButton
            icon="download"
            title="Export My Data"
            description="Download a copy of all your data"
            onPress={handleDataExport}
            iconColor="#10b981"
            textColor="#10b981"
          />
          
          <ActionButton
            icon="trash"
            title="Delete Account"
            description="Permanently delete your account and all data"
            onPress={handleDeleteAccount}
            iconColor="#ef4444"
            textColor="#ef4444"
          />
        </View>

        {/* Legal Information */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Legal</Text>
          
          <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/30">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 bg-blue-500/20">
                  <Ionicons name="document-text" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base">Privacy Policy</Text>
                  <Text className="text-gray-400 text-sm mt-1">Read our privacy policy</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/30">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 bg-purple-500/20">
                  <Ionicons name="document" size={20} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base">Terms of Service</Text>
                  <Text className="text-gray-400 text-sm mt-1">Read our terms and conditions</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySettingsScreen;