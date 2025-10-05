// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Log Firebase configuration for testing
console.log('🔥 Firebase Configuration:');
console.log('  Project ID:', firebaseConfig.projectId);
console.log('  Auth Domain:', firebaseConfig.authDomain);
console.log('  API Key exists:', !!firebaseConfig.apiKey);
console.log('  App ID exists:', !!firebaseConfig.appId);

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log('✅ Firebase App initialized successfully');

// Initialize Firebase Auth with AsyncStorage persistence for React Native
let auth: any;
try {
  // For React Native, Firebase v12+ should automatically use AsyncStorage
  // if it's installed, but we can also explicitly initialize it
  auth = initializeAuth(app, {
    // @ts-ignore - Persistence configuration
    persistence: AsyncStorage
  });
  console.log('✅ Firebase Auth initialized with AsyncStorage');
} catch {
  // If already initialized, get the existing instance
  auth = getAuth(app);
  console.log('✅ Firebase Auth instance retrieved');
}

export { auth };
export default app;