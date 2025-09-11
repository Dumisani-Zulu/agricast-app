import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const categories = ['Fertilizers', 'Pest Control', 'Soil Health', 'Crop Management', 'Seeds', 'Weather'];
const topics = ['Tomatoes', 'Organic Farming', 'Testing', 'Planning', 'Irrigation', 'Harvesting'];

const CreatePostScreen = ({ navigation }: { navigation: any }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter your question or content');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!selectedTopic) {
      Alert.alert('Error', 'Please select a topic');
      return;
    }

    // In a real app, this would send the data to a backend
    Alert.alert(
      'Success', 
      'Your post has been submitted!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        {/* Title Input */}
        <View className="mb-6">
          <Text className="text-white font-semibold text-lg mb-2">Title *</Text>
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg text-base"
            placeholder="What's your question or topic?"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
            multiline
          />
        </View>

        {/* Content Input */}
        <View className="mb-6">
          <Text className="text-white font-semibold text-lg mb-2">Content *</Text>
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg text-base min-h-32"
            placeholder="Describe your question in detail. The more information you provide, the better answers you'll get!"
            placeholderTextColor="#9ca3af"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Category Selection */}
        <View className="mb-6">
          <Text className="text-white font-semibold text-lg mb-3">Category *</Text>
          <View className="flex-row flex-wrap">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className={`rounded-full px-4 py-2 mr-2 mb-2 ${
                  selectedCategory === category ? 'bg-green-600' : 'bg-gray-700'
                }`}
                onPress={() => setSelectedCategory(category)}
              >
                <Text className={`${selectedCategory === category ? 'text-white' : 'text-gray-300'}`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Topic Selection */}
        <View className="mb-8">
          <Text className="text-white font-semibold text-lg mb-3">Topic *</Text>
          <View className="flex-row flex-wrap">
            {topics.map((topic) => (
              <TouchableOpacity
                key={topic}
                className={`rounded-full px-4 py-2 mr-2 mb-2 ${
                  selectedTopic === topic ? 'bg-blue-600' : 'bg-gray-700'
                }`}
                onPress={() => setSelectedTopic(topic)}
              >
                <Text className={`${selectedTopic === topic ? 'text-white' : 'text-gray-300'}`}>
                  {topic}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Guidelines */}
        <View className="bg-gray-800 rounded-lg p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text className="text-blue-400 font-semibold ml-2">Community Guidelines</Text>
          </View>
          <Text className="text-gray-300 text-sm leading-5">
            • Be respectful and helpful to fellow farmers{'\n'}
            • Provide detailed information for better answers{'\n'}
            • Search existing posts before posting{'\n'}
            • Stay on topic and relevant to agriculture
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-green-600 rounded-lg p-4 flex-row items-center justify-center"
          onPress={handleSubmit}
        >
          <Ionicons name="send" size={20} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">Post Question</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          className="bg-gray-700 rounded-lg p-4 flex-row items-center justify-center mt-3"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={20} color="#9ca3af" />
          <Text className="text-gray-300 font-semibold text-lg ml-2">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreatePostScreen;