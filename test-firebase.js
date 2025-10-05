// Simple Firebase connection test script
require('dotenv').config();
const { initializeApp, getApps } = require('firebase/app');
const { getAuth } = require('firebase/auth');

console.log('\n🔥 Testing Firebase Connection...\n');

// Check if environment variables are loaded
console.log('📋 Environment Variables:');
console.log('  API_KEY:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('  AUTH_DOMAIN:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Loaded' : '❌ Missing');
console.log('  PROJECT_ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Loaded' : '❌ Missing');
console.log('  STORAGE_BUCKET:', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Loaded' : '❌ Missing');
console.log('  MESSAGING_SENDER_ID:', process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Loaded' : '❌ Missing');
console.log('  APP_ID:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? '✅ Loaded' : '❌ Missing');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

console.log('\n🔧 Firebase Configuration:');
console.log('  Project ID:', firebaseConfig.projectId);
console.log('  Auth Domain:', firebaseConfig.authDomain);
console.log('  Storage Bucket:', firebaseConfig.storageBucket);

try {
  // Initialize Firebase
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  console.log('\n✅ Firebase App initialized successfully!');
  console.log('  App Name:', app.name);
  console.log('  Project ID:', app.options.projectId);

  // Initialize Auth
  const auth = getAuth(app);
  console.log('\n✅ Firebase Auth initialized successfully!');
  console.log('  Current User:', auth.currentUser ? auth.currentUser.email : 'No user logged in');

  console.log('\n🎉 Firebase connection test PASSED!\n');
} catch (error) {
  console.error('\n❌ Firebase connection test FAILED!');
  console.error('Error:', error.message);
  console.error('\nFull Error:', error);
  process.exit(1);
}
