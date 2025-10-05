// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// Note: @react-native-async-storage/async-storage must be installed for persistence
// Firebase will automatically detect and use it in React Native environments

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

// Initialize Firebase Auth
// Note: AsyncStorage persistence is automatically detected and used in React Native
// when @react-native-async-storage/async-storage is installed
const auth = getAuth(app);
console.log('✅ Firebase Auth initialized');

export { auth };
export default app;