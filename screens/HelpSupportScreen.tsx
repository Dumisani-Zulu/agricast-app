import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpSupportScreen = ({ navigation }: { navigation: any }) => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactMessage, setContactMessage] = useState('');

  const faqs = [
    {
      question: "How do I get accurate weather forecasts for my location?",
      answer: "AgriCast uses your device's GPS location to provide hyper-local weather data. Make sure location services are enabled in your device settings. You can also manually search for your specific area in the weather section."
    },
    {
      question: "What should I do if the crop disease identifier gives wrong results?",
      answer: "Our AI model is continuously learning. If you get an incorrect identification, please use the 'Report Issue' feature to help us improve. For critical issues, consult with a local agricultural expert or extension officer."
    },
    {
      question: "How often are market prices updated?",
      answer: "Market prices are updated daily from verified agricultural commodity exchanges and local markets. Some major commodities are updated multiple times per day during trading hours."
    },
    {
      question: "Can I use the app without internet connection?",
      answer: "Some features like saved crop guides and previously loaded content work offline. However, weather data, market prices, and community features require an internet connection."
    },
    {
      question: "How do I reset my password?",
      answer: "On the login screen, tap 'Forgot Password' and enter your email address. You'll receive a password reset link via email. Follow the instructions to create a new password."
    },
    {
      question: "Is my farm data secure and private?",
      answer: "Yes, we take data security seriously. Your personal and farm data is encrypted and stored securely. We never share your specific farm data with third parties without your explicit consent."
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactSupport = () => {
    if (!contactMessage.trim()) {
      Alert.alert('Error', 'Please enter your message before sending.');
      return;
    }
    
    Alert.alert(
      'Message Sent',
      'Thank you for contacting us! Our support team will get back to you within 24 hours.',
      [{ text: 'OK', onPress: () => setContactMessage('') }]
    );
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@agricast.com?subject=AgriCast Support Request');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+260971234567');
  };

  const handleWhatsAppSupport = () => {
    Linking.openURL('whatsapp://send?phone=+260971234567&text=Hello, I need help with AgriCast app');
  };

  const SupportOptionCard = ({
    icon,
    title,
    description,
    onPress,
    iconColor = '#10b981'
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    onPress: () => void;
    iconColor?: string;
  }) => (
    <TouchableOpacity
      className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/30"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${iconColor}20` }}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-semibold text-base">{title}</Text>
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
        <Text className="text-white text-3xl font-bold">Help & Support</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Quick Contact Options */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Contact Us</Text>
          
          <SupportOptionCard
            icon="mail"
            title="Email Support"
            description="Get help via email - support@agricast.com"
            onPress={handleEmailSupport}
            iconColor="#06b6d4"
          />
          
          <SupportOptionCard
            icon="call"
            title="Phone Support"
            description="Call us at +260 97 123 4567"
            onPress={handleCallSupport}
            iconColor="#22c55e"
          />
          
          <SupportOptionCard
            icon="logo-whatsapp"
            title="WhatsApp Support"
            description="Chat with us on WhatsApp"
            onPress={handleWhatsAppSupport}
            iconColor="#25d366"
          />
        </View>

        {/* Send Message */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Send us a Message</Text>
          
          <View className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/30">
            <TextInput
              className="text-white text-base min-h-[100px] mb-4"
              placeholder="Describe your issue or question..."
              placeholderTextColor="#9CA3AF"
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              className="bg-green-600 rounded-xl p-3 items-center"
              onPress={handleContactSupport}
            >
              <Text className="text-white font-semibold">Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Frequently Asked Questions</Text>
          
          {faqs.map((faq, index) => (
            <View key={index} className="bg-gray-800/50 rounded-2xl mb-4 border border-gray-700/30 overflow-hidden">
              <TouchableOpacity
                className="p-4 flex-row items-center justify-between"
                onPress={() => toggleFAQ(index)}
              >
                <Text className="text-white font-medium flex-1 pr-4">{faq.question}</Text>
                <Ionicons 
                  name={expandedFAQ === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
              
              {expandedFAQ === index && (
                <View className="px-4 pb-4 border-t border-gray-700/30">
                  <Text className="text-gray-300 text-sm leading-6 mt-3">{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* App Information */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">App Information</Text>
          
          <View className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/30">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-400">Version</Text>
              <Text className="text-white font-medium">1.0.0</Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-400">Last Updated</Text>
              <Text className="text-white font-medium">September 2025</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400">Support Hours</Text>
              <Text className="text-white font-medium">Mon-Fri, 8AM-6PM</Text>
            </View>
          </View>
        </View>

        {/* Helpful Links */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Helpful Links</Text>
          
          <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-4 mb-3 border border-gray-700/30">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="book" size={20} color="#3b82f6" />
                <Text className="text-white font-medium ml-3">User Guide</Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-4 mb-3 border border-gray-700/30">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="play-circle" size={20} color="#ef4444" />
                <Text className="text-white font-medium ml-3">Video Tutorials</Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/30">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="chatbubbles" size={20} color="#22c55e" />
                <Text className="text-white font-medium ml-3">Community Forum</Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;