import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ForumScreen from '../screens/ForumScreen';
import PostDetailScreen from '../components/forum/PostDetailScreen';
import CreatePostScreen from '../components/forum/CreatePostScreen';

const Stack = createStackNavigator();

const ForumNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ForumList" 
        component={ForumScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{ title: 'Discussion' }}
      />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{ title: 'New Post' }}
      />
    </Stack.Navigator>
  );
};

export default ForumNavigator;