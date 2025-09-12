// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBD2es6TtdkxgYl1kMIQQs5rbtLZhLeocI",
  authDomain: "farmers-e95fb.firebaseapp.com",
  projectId: "farmers-e95fb",
  storageBucket: "farmers-e95fb.firebasestorage.app",
  messagingSenderId: "428560592685",
  appId: "1:428560592685:web:fbfaf3fb0a8d290d892da4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth with AsyncStorage persistence for React Native
let auth: any;
try {
  // For React Native, Firebase v12+ should automatically use AsyncStorage
  // if it's installed, but we can also explicitly initialize it
  auth = initializeAuth(app, {
    // @ts-ignore - Persistence configuration
    persistence: AsyncStorage
  });
} catch {
  // If already initialized, get the existing instance
  auth = getAuth(app);
}

export { auth };
export default app;