import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { subscribeToPosts, togglePostLike } from '../services/forumService';
import { Post } from '../types/forum';
import { useAuth } from '../contexts/AuthContext';

const categories = ['All', 'Fertilizers', 'Pest Control', 'Soil Health', 'Crop Management', 'Seeds', 'Weather'];
const topics = ['All', 'Tomatoes', 'Organic Farming', 'Testing', 'Planning', 'Irrigation', 'Harvesting'];

const ForumScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Subscribe to posts with real-time updates
  useEffect(() => {
    console.log('📡 Subscribing to posts...');
    setLoading(true);

    const unsubscribe = subscribeToPosts(
      (fetchedPosts) => {
        console.log('✅ Received posts:', fetchedPosts.length);
        setPosts(fetchedPosts);
        setLoading(false);
      },
      selectedCategory,
      selectedTopic
    );

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Unsubscribing from posts');
      unsubscribe();
    };
  }, [selectedCategory, selectedTopic]);

  // Client-side search filtering
  const filteredPosts = posts.filter(post => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(lowerQuery) ||
           post.content.toLowerCase().includes(lowerQuery);
  });

  const handleLike = async (postId: string) => {
    if (!user) {
      console.warn('User must be logged in to like posts');
      return;
    }

    try {
      await togglePostLike(postId, user.uid);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = user ? item.likes.includes(user.uid) : false;

    return (
      <TouchableOpacity
        className="bg-gray-800 rounded-xl p-4 mb-4 mx-4"
        onPress={() => navigation.navigate('PostDetail', { post: item })}
      >
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-white mb-1">{item.title}</Text>
            <Text className="text-gray-300 text-sm">by {item.authorName} • {formatDate(item.createdAt)}</Text>
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
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? "#ef4444" : "#9ca3af"} 
              />
              <Text className="text-gray-400 ml-1">{item.likeCount}</Text>
            </TouchableOpacity>
            
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="comment-outline" size={20} color="#9ca3af" />
              <Text className="text-gray-400 ml-1">{item.replyCount}</Text>
            </View>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="pt-20 pb-4 px-4 bg-gray-800">
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
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="text-gray-400 mt-4">Loading discussions...</Text>
        </View>
      ) : filteredPosts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="chatbubbles-outline" size={64} color="#4b5563" />
          <Text className="text-white text-xl font-semibold mt-4">No discussions yet</Text>
          <Text className="text-gray-400 text-center mt-2">
            {searchQuery ? 'No posts match your search.' : 'Be the first to start a discussion!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ForumScreen;
