import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock replies data
const mockReplies = [
  {
    id: '1',
    content: 'I recommend using organic compost mixed with balanced NPK fertilizer. Works great for my tomatoes!',
    author: 'Tom Gardener',
    createdAt: '1 hour ago',
    likes: 5,
    isLiked: false,
  },
  {
    id: '2',
    content: 'Fish emulsion is also excellent for tomatoes. Apply every 2 weeks during growing season.',
    author: 'Maria Santos',
    createdAt: '30 minutes ago',
    likes: 3,
    isLiked: true,
  },
  {
    id: '3',
    content: 'Don\'t forget to check your soil pH first. Tomatoes prefer slightly acidic soil (6.0-6.8).',
    author: 'Dr. Plant',
    createdAt: '15 minutes ago',
    likes: 8,
    isLiked: false,
  },
];

const PostDetailScreen = ({ route }: { route: any }) => {
  const { post } = route.params;
  const [replies, setReplies] = useState(mockReplies);
  const [newReply, setNewReply] = useState('');
  const [postLiked, setPostLiked] = useState(post.isLiked);
  const [postLikes, setPostLikes] = useState(post.likes);

  const handlePostLike = () => {
    setPostLiked(!postLiked);
    setPostLikes(postLiked ? postLikes - 1 : postLikes + 1);
  };

  const handleReplyLike = (replyId: string) => {
    setReplies(replies.map(reply => 
      reply.id === replyId 
        ? { ...reply, isLiked: !reply.isLiked, likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1 }
        : reply
    ));
  };

  const handleSubmitReply = () => {
    if (newReply.trim() === '') {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }

    const newReplyObj = {
      id: Date.now().toString(),
      content: newReply.trim(),
      author: 'Current User', // In a real app, this would come from auth
      createdAt: 'Just now',
      likes: 0,
      isLiked: false,
    };

    setReplies([...replies, newReplyObj]);
    setNewReply('');
    Alert.alert('Success', 'Reply posted successfully!');
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Original Post */}
        <View className="bg-gray-800 p-4 m-4 rounded-xl">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white mb-2">{post.title}</Text>
              <Text className="text-gray-300 text-sm">by {post.author} • {post.createdAt}</Text>
            </View>
          </View>
          
          <View className="flex-row mb-4">
            <View className="bg-green-600 rounded-full px-3 py-1 mr-2">
              <Text className="text-white text-xs font-medium">{post.category}</Text>
            </View>
            <View className="bg-blue-600 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-medium">{post.topic}</Text>
            </View>
          </View>
          
          <Text className="text-gray-200 text-base leading-6 mb-4">{post.content}</Text>
          
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-700">
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={handlePostLike}
            >
              <Ionicons 
                name={postLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={postLiked ? "#ef4444" : "#9ca3af"} 
              />
              <Text className="text-gray-400 ml-2 text-base">{postLikes} likes</Text>
            </TouchableOpacity>
            
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="comment-outline" size={24} color="#9ca3af" />
              <Text className="text-gray-400 ml-2 text-base">{replies.length} replies</Text>
            </View>
          </View>
        </View>

        {/* Replies Section */}
        <View className="mx-4 mb-4">
          <Text className="text-white font-bold text-lg mb-3">Replies ({replies.length})</Text>
          
          {replies.map((reply) => (
            <View key={reply.id} className="bg-gray-800 p-4 mb-3 rounded-xl ml-4">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-gray-300 text-sm">{reply.author} • {reply.createdAt}</Text>
                </View>
              </View>
              
              <Text className="text-gray-200 text-base leading-6 mb-3">{reply.content}</Text>
              
              <View className="flex-row items-center">
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => handleReplyLike(reply.id)}
                >
                  <Ionicons 
                    name={reply.isLiked ? "heart" : "heart-outline"} 
                    size={20} 
                    color={reply.isLiked ? "#ef4444" : "#9ca3af"} 
                  />
                  <Text className="text-gray-400 ml-1">{reply.likes}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Reply Input */}
      <View className="bg-gray-800 p-4 border-t border-gray-700">
        <View className="flex-row items-end">
          <View className="flex-1 bg-gray-700 rounded-lg p-3 mr-3">
            <TextInput
              className="text-white max-h-24"
              placeholder="Write a reply..."
              placeholderTextColor="#9ca3af"
              value={newReply}
              onChangeText={setNewReply}
              multiline
              textAlignVertical="top"
            />
          </View>
          <TouchableOpacity
            className="bg-green-600 rounded-lg p-3"
            onPress={handleSubmitReply}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostDetailScreen;