import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { subscribeToPost, subscribeToReplies, createReply, togglePostLike, toggleReplyLike } from '../../services/forumService';
import { Post, Reply } from '../../types/forum';
import { useAuth } from '../../contexts/AuthContext';

const PostDetailScreen = ({ route }: { route: any }) => {
  const { post: initialPost } = route.params;
  const { user } = useAuth();
  
  // Convert serialized dates back to Date objects
  const deserializedPost: Post = {
    ...initialPost,
    createdAt: typeof initialPost.createdAt === 'string' 
      ? new Date(initialPost.createdAt) 
      : initialPost.createdAt,
    updatedAt: typeof initialPost.updatedAt === 'string' 
      ? new Date(initialPost.updatedAt) 
      : initialPost.updatedAt
  };
  
  const [post, setPost] = useState<Post>(deserializedPost);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Subscribe to post updates
  useEffect(() => {
    console.log('📡 Subscribing to post:', post.id);
    const unsubscribe = subscribeToPost(post.id, (updatedPost) => {
      if (updatedPost) {
        setPost(updatedPost);
      }
    });

    return () => {
      console.log('🔌 Unsubscribing from post');
      unsubscribe();
    };
  }, [post.id]);

  // Subscribe to replies
  useEffect(() => {
    console.log('📡 Subscribing to replies for post:', post.id);
    setLoading(true);

    const unsubscribe = subscribeToReplies(post.id, (fetchedReplies) => {
      console.log('✅ Received replies:', fetchedReplies.length);
      setReplies(fetchedReplies);
      setLoading(false);
    });

    return () => {
      console.log('🔌 Unsubscribing from replies');
      unsubscribe();
    };
  }, [post.id]);

  const handlePostLike = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to like posts');
      return;
    }

    try {
      await togglePostLike(post.id, user.uid);
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleReplyLike = async (replyId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to like replies');
      return;
    }

    try {
      await toggleReplyLike(replyId, user.uid);
    } catch (error) {
      console.error('Error liking reply:', error);
      Alert.alert('Error', 'Failed to like reply');
    }
  };

  const handleSubmitReply = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to reply');
      return;
    }

    if (newReply.trim() === '') {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }

    setSubmitting(true);

    try {
      const authorName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
      
      await createReply(
        post.id,
        newReply.trim(),
        user.uid,
        authorName
      );

      setNewReply('');
      Alert.alert('Success', 'Reply posted successfully!');
    } catch (error) {
      console.error('Error creating reply:', error);
      Alert.alert('Error', 'Failed to post reply. Please try again.');
    } finally {
      setSubmitting(false);
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

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Original Post */}
        <View className="bg-gray-800 p-4 m-4 rounded-xl">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white mb-2">{post.title}</Text>
              <Text className="text-gray-300 text-sm">by {post.authorName} • {formatDate(post.createdAt)}</Text>
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
                name={user && post.likes.includes(user.uid) ? "heart" : "heart-outline"} 
                size={24} 
                color={user && post.likes.includes(user.uid) ? "#ef4444" : "#9ca3af"} 
              />
              <Text className="text-gray-400 ml-2 text-base">{post.likeCount} likes</Text>
            </TouchableOpacity>
            
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="comment-outline" size={24} color="#9ca3af" />
              <Text className="text-gray-400 ml-2 text-base">{post.replyCount} replies</Text>
            </View>
          </View>
        </View>

        {/* Replies Section */}
        <View className="mx-4 mb-4">
          <Text className="text-white font-bold text-lg mb-3">Replies ({replies.length})</Text>
          
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#16a34a" />
              <Text className="text-gray-400 mt-2">Loading replies...</Text>
            </View>
          ) : replies.length === 0 ? (
            <View className="bg-gray-800 p-8 rounded-xl items-center">
              <MaterialCommunityIcons name="comment-outline" size={48} color="#4b5563" />
              <Text className="text-gray-400 mt-3 text-center">No replies yet. Be the first to reply!</Text>
            </View>
          ) : (
            replies.map((reply) => {
              const isLiked = user ? reply.likes.includes(user.uid) : false;
              
              return (
                <View key={reply.id} className="bg-gray-800 p-4 mb-3 rounded-xl ml-4">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-gray-300 text-sm">{reply.authorName} • {formatDate(reply.createdAt)}</Text>
                    </View>
                  </View>
                  
                  <Text className="text-gray-200 text-base leading-6 mb-3">{reply.content}</Text>
                  
                  <View className="flex-row items-center">
                    <TouchableOpacity 
                      className="flex-row items-center"
                      onPress={() => handleReplyLike(reply.id)}
                    >
                      <Ionicons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isLiked ? "#ef4444" : "#9ca3af"} 
                      />
                      <Text className="text-gray-400 ml-1">{reply.likeCount}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
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
              editable={!submitting}
            />
          </View>
          <TouchableOpacity
            className={`rounded-lg p-3 ${submitting ? 'bg-gray-600' : 'bg-green-600'}`}
            onPress={handleSubmitReply}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostDetailScreen;