import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for posts
const mockPosts = [
  {
    id: '1',
    title: 'Best fertilizer for tomatoes?',
    content: 'I\'m having issues with my tomato plants. What fertilizer do you recommend for better yield?',
    author: 'John Farmer',
    category: 'Fertilizers',
    topic: 'Tomatoes',
    createdAt: '2 hours ago',
    likes: 12,
    replies: 5,
    isLiked: false,
  },
  {
    id: '2',
    title: 'Pest control for aphids',
    content: 'My crops are being attacked by aphids. Looking for organic solutions.',
    author: 'Sarah Green',
    category: 'Pest Control',
    topic: 'Organic Farming',
    createdAt: '4 hours ago',
    likes: 8,
    replies: 3,
    isLiked: true,
  },
  {
    id: '3',
    title: 'Soil pH testing methods',
    content: 'What are the most accurate ways to test soil pH at home?',
    author: 'Mike Davis',
    category: 'Soil Health',
    topic: 'Testing',
    createdAt: '1 day ago',
    likes: 15,
    replies: 7,
    isLiked: false,
  },
  {
    id: '4',
    title: 'Crop rotation schedule advice',
    content: 'Need help planning my crop rotation for the next season. Any suggestions?',
    author: 'Lisa Johnson',
    category: 'Crop Management',
    topic: 'Planning',
    createdAt: '2 days ago',
    likes: 20,
    replies: 12,
    isLiked: true,
  },
];

const categories = ['All', 'Fertilizers', 'Pest Control', 'Soil Health', 'Crop Management', 'Seeds', 'Weather'];
const topics = ['All', 'Tomatoes', 'Organic Farming', 'Testing', 'Planning', 'Irrigation', 'Harvesting'];

const ForumScreen = ({ navigation }: { navigation: any }) => {
  const [posts, setPosts] = useState(mockPosts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesTopic = selectedTopic === 'All' || post.topic === selectedTopic;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesTopic && matchesSearch;
  });

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-gray-800 rounded-xl p-4 mb-4 mx-4"
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-white mb-1">{item.title}</Text>
          <Text className="text-gray-300 text-sm">by {item.author} • {item.createdAt}</Text>
        </View>
      </View>
      
      <View className="flex-row mb-3">
        <View className="bg-green-600 rounded-full px-3 py-1 mr-2">
          <Text className="text-white text-xs font-medium">{item.category}</Text>
        </View>
        <View className="bg-blue-600 rounded-full px-3 py-1">
          <Text className="text-white text-xs font-medium">{item.topic}</Text>
        </View>
      </View>
      
      <Text className="text-gray-300 mb-3" numberOfLines={2}>{item.content}</Text>
      
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="flex-row items-center mr-4"
            onPress={() => handleLike(item.id)}
          >
            <Ionicons 
              name={item.isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={item.isLiked ? "#ef4444" : "#9ca3af"} 
            />
            <Text className="text-gray-400 ml-1">{item.likes}</Text>
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="comment-outline" size={20} color="#9ca3af" />
            <Text className="text-gray-400 ml-1">{item.replies}</Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-gray-800">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-white">Community Forum</Text>
          <TouchableOpacity
            className="bg-green-600 rounded-full p-2"
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Search */}
        <View className="bg-gray-700 rounded-lg p-3 mb-4 flex-row items-center">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="Search discussions..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View className="px-4 py-3 bg-gray-800">
        <Text className="text-white font-semibold mb-2">Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              className={`rounded-full px-4 py-2 mr-2 ${
                selectedCategory === category ? 'bg-green-600' : 'bg-gray-700'
              }`}
              onPress={() => setSelectedCategory(category)}
            >
              <Text className={`${selectedCategory === category ? 'text-white' : 'text-gray-300'}`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <Text className="text-white font-semibold mb-2">Topics</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {topics.map((topic) => (
            <TouchableOpacity
              key={topic}
              className={`rounded-full px-4 py-2 mr-2 ${
                selectedTopic === topic ? 'bg-blue-600' : 'bg-gray-700'
              }`}
              onPress={() => setSelectedTopic(topic)}
            >
              <Text className={`${selectedTopic === topic ? 'text-white' : 'text-gray-300'}`}>
                {topic}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ForumScreen;
