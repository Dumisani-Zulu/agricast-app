import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred';
      
      // Handle specific Firebase error codes
      if (error.message.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email address';
      } else if (error.message.includes('auth/wrong-password')) {
        errorMessage = 'Incorrect password';
      } else if (error.message.includes('auth/email-already-in-use')) {
        errorMessage = 'An account with this email already exists';
      } else if (error.message.includes('auth/invalid-email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (error.message.includes('auth/weak-password')) {
        errorMessage = 'Password is too weak';
      } else {
        errorMessage = error.message;
      }
      
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert(
        'Password Reset', 
        'A password reset email has been sent to your email address. Please check your inbox.'
      );
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email';
      if (error.message.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email address';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#0f172a' }}>
      <View className="flex-1 justify-center px-4 py-8 min-h-screen">
        {/* Header */}
        <View className="items-center mb-4">
          <View className="w-20 h-20 rounded-2xl items-center justify-center mb-16 shadow-lg">
            <Image source={require('../assets/agricast.png')} className="w-64 h-64" />
          </View>
          
          {/* <Text className="text-3xl font-black text-white text-center mb-2">
            {isLogin ? 'Welcome Back' : 'Join FarmApp'}
          </Text> */}
          
          <Text className="text-gray-400 text-center text-base">
            {isLogin ? 'Sign in to continue your farming journey' : 'Create your account to get started'}
          </Text>
        </View>
        
        {/* Form Container */}
        <View className="bg-gray-800/50 backdrop-blur-sm py-4 px-4 rounded-2xl border border-gray-700/50 shadow-2xl">
          {/* Name Input - Only show for sign up */}
          {!isLogin && (
            <View className="mb-6">
              <Text className="text-gray-300 text-sm font-medium mb-2 ml-1">Full Name</Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-700/70 text-white p-4 rounded-2xl border border-gray-600/50 text-base"
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}
          
          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-gray-300 text-sm font-medium mb-2 ml-1">Email Address</Text>
            <View className="relative">
              <TextInput
                className="bg-gray-700/70 text-white p-4 rounded-2xl border border-gray-600/50 text-base"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          {/* Password Input */}
          <View className="mb-8">
            <Text className="text-gray-300 text-sm font-medium mb-2 ml-1">Password</Text>
            <View className="relative">
              <TextInput
                className="bg-gray-700/70 text-white p-4 rounded-2xl border border-gray-600/50 text-base"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>
          
          {/* Action Button */}
          <TouchableOpacity
            className="p-4 rounded-2xl mb-6 shadow-lg active:scale-95"
            style={{ backgroundColor: loading ? '#9CA3AF' : '#16a34a' }}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white text-center font-bold text-lg">
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password - Only show for login */}
          {isLogin && (
            <TouchableOpacity
              className="mb-4"
              onPress={handleForgotPassword}
            >
              <Text className="text-green-400 text-center font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Divider */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-gray-600"></View>
            <Text className="text-gray-400 px-4 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-600"></View>
          </View>
          
          {/* Toggle Auth Mode */}
          <TouchableOpacity
            className="bg-gray-700/50 p-4 rounded-2xl border border-gray-600/50"
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text className="text-green-400 text-center font-semibold">
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <Text className="text-gray-500 text-center mt-4 text-sm leading-5">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </ScrollView>
  );
};

export default AuthScreen;
