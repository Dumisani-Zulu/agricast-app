import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }: { navigation: any }) => {
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    weatherAlerts: true,
    cropReminders: false,
    marketPrices: true,
    communityPosts: false,
    systemUpdates: true,
    emailNotifications: true,
    smsNotifications: false,
    weeklyDigest: true,
    emergencyAlerts: true
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const NotificationItem = ({
    icon,
    title,
    description,
    value,
    onToggle,
    iconColor = '#10b981'
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    iconColor?: string;
  }) => (
    <View className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/30">
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
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#374151', true: '#10b981' }}
          thumbColor={value ? '#ffffff' : '#9CA3AF'}
          ios_backgroundColor="#374151"
        />
      </View>
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
        <Text className="text-white text-3xl font-bold">Notifications</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Push Notifications Section */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Push Notifications</Text>
          
          <NotificationItem
            icon="notifications"
            title="Push Notifications"
            description="Receive push notifications on your device"
            value={notifications.pushNotifications}
            onToggle={() => toggleNotification('pushNotifications')}
          />
          
          <NotificationItem
            icon="thunderstorm"
            title="Weather Alerts"
            description="Get notified about severe weather conditions"
            value={notifications.weatherAlerts}
            onToggle={() => toggleNotification('weatherAlerts')}
            iconColor="#f59e0b"
          />
          
          <NotificationItem
            icon="leaf"
            title="Crop Reminders"
            description="Reminders for planting, watering, and harvesting"
            value={notifications.cropReminders}
            onToggle={() => toggleNotification('cropReminders')}
            iconColor="#22c55e"
          />
          
          <NotificationItem
            icon="trending-up"
            title="Market Prices"
            description="Updates on crop prices and market trends"
            value={notifications.marketPrices}
            onToggle={() => toggleNotification('marketPrices')}
            iconColor="#3b82f6"
          />
        </View>

        {/* Community Section */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Community</Text>
          
          <NotificationItem
            icon="chatbubbles"
            title="Community Posts"
            description="New posts and replies in farming forums"
            value={notifications.communityPosts}
            onToggle={() => toggleNotification('communityPosts')}
            iconColor="#8b5cf6"
          />
        </View>

        {/* System Section */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">System</Text>
          
          <NotificationItem
            icon="construct"
            title="System Updates"
            description="App updates and new feature announcements"
            value={notifications.systemUpdates}
            onToggle={() => toggleNotification('systemUpdates')}
            iconColor="#6b7280"
          />
          
          <NotificationItem
            icon="warning"
            title="Emergency Alerts"
            description="Critical alerts about pests, diseases, or weather"
            value={notifications.emergencyAlerts}
            onToggle={() => toggleNotification('emergencyAlerts')}
            iconColor="#ef4444"
          />
        </View>

        {/* Communication Preferences */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Communication Preferences</Text>
          
          <NotificationItem
            icon="mail"
            title="Email Notifications"
            description="Receive notifications via email"
            value={notifications.emailNotifications}
            onToggle={() => toggleNotification('emailNotifications')}
            iconColor="#06b6d4"
          />
          
          <NotificationItem
            icon="chatbox"
            title="SMS Notifications"
            description="Receive critical alerts via SMS"
            value={notifications.smsNotifications}
            onToggle={() => toggleNotification('smsNotifications')}
            iconColor="#84cc16"
          />
          
          <NotificationItem
            icon="calendar"
            title="Weekly Digest"
            description="Weekly summary of farming tips and updates"
            value={notifications.weeklyDigest}
            onToggle={() => toggleNotification('weeklyDigest')}
            iconColor="#f97316"
          />
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;