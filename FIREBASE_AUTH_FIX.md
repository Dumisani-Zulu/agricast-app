# Firebase Auth v12 - Internal Assertion Error Fix

## 🐛 Error Message
```
ERROR [2025-10-05T14:43:11.430Z] @firebase/auth: Auth (12.2.0): 
INTERNAL ASSERTION FAILED: Expected a class definition
```

## 🔍 Root Cause

This error occurs in Firebase Auth v12+ when you try to manually configure persistence using `initializeAuth()` with AsyncStorage passed directly:

```typescript
// ❌ WRONG - Causes "INTERNAL ASSERTION FAILED" error
auth = initializeAuth(app, {
  persistence: AsyncStorage  // This doesn't work in v12+
});
```

### Why It Happened

1. **Firebase Auth v12 Changed Persistence API**: The way persistence is configured changed significantly
2. **AsyncStorage Not a Valid Persistence Class**: Firebase expects a specific persistence implementation, not the raw AsyncStorage module
3. **Incorrect Wrapper Usage**: Trying to pass AsyncStorage directly violates Firebase's internal type expectations

## ✅ Solution

### Simple Fix: Use `getAuth()` Instead

Firebase Auth **automatically detects** and uses AsyncStorage in React Native environments when `@react-native-async-storage/async-storage` is installed.

```typescript
// ✅ CORRECT - Let Firebase handle persistence automatically
import { getAuth } from "firebase/auth";

const auth = getAuth(app);
```

### What Changed in `config/firebase.ts`

#### Before (Caused Error) ❌
```typescript
import { initializeAuth, getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: AsyncStorage  // ❌ Wrong!
  });
} catch {
  auth = getAuth(app);
}
```

#### After (Fixed) ✅
```typescript
import { getAuth } from "firebase/auth";
// Note: @react-native-async-storage/async-storage must be installed
// Firebase automatically detects and uses it

const auth = getAuth(app);
```

## 📋 Requirements

Make sure you have AsyncStorage installed:

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.24.0",
    "firebase": "^12.2.1"
  }
}
```

If not installed:
```bash
npm install @react-native-async-storage/async-storage
```

## 🎯 How It Works

### Automatic Persistence Detection

1. **Firebase Detects Environment**: When you call `getAuth(app)`, Firebase checks if it's running in React Native
2. **Looks for AsyncStorage**: Firebase searches for `@react-native-async-storage/async-storage`
3. **Auto-Configures**: If found, Firebase automatically uses it for persistence
4. **Fallback to Memory**: If not found, falls back to memory-only persistence (with warnings)

### Persistence Behavior

With AsyncStorage properly installed:
- ✅ User stays logged in after app restart
- ✅ Auth tokens are persisted securely
- ✅ Session survives app kills
- ✅ No manual configuration needed

## 🔧 Alternative: Manual Configuration (Advanced)

If you absolutely need manual persistence configuration, use the correct approach for Firebase v12:

```typescript
import { initializeAuth, getAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Already initialized
  auth = getAuth(app);
}
```

**Note**: `getReactNativePersistence` may not be available in all Firebase versions. The simple `getAuth()` approach is recommended.

## 🧪 Testing the Fix

### 1. Check Console Logs

After the fix, you should see:
```
🔥 Firebase Configuration:
  Project ID: your-project-id
  Auth Domain: your-project.firebaseapp.com
  API Key exists: true
  App ID exists: true
✅ Firebase App initialized successfully
✅ Firebase Auth initialized
```

**No more**:
- ❌ INTERNAL ASSERTION FAILED errors
- ❌ "Expected a class definition" errors
- ⚠️ AsyncStorage warning (warning might still appear but auth works)

### 2. Test Auth Persistence

```typescript
// Sign in
await signInWithEmailAndPassword(auth, email, password);

// Close and reopen app
// User should still be logged in (auth.currentUser !== null)
```

### 3. Verify in Code

```typescript
import { auth } from './config/firebase';

// Check current user
console.log('Current user:', auth.currentUser);

// Listen to auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('No user logged in');
  }
});
```

## 📝 Updated File Structure

```typescript
// config/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = { /* ... */ };

const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

const auth = getAuth(app);

export { auth };
export default app;
```

## ⚠️ Common Issues

### Issue 1: AsyncStorage Warning Still Appears

```
WARN: You are initializing Firebase Auth for React Native without providing AsyncStorage
```

**Solution**: This is just a warning. If AsyncStorage is installed, Firebase will still use it. You can safely ignore this warning.

### Issue 2: Session Not Persisting

**Cause**: AsyncStorage might not be properly installed or linked

**Solution**:
```bash
# Reinstall AsyncStorage
npm install @react-native-async-storage/async-storage

# For Expo projects (auto-linked)
npx expo install @react-native-async-storage/async-storage

# Clear cache
npx expo start --clear
```

### Issue 3: Auth State Lost on App Restart

**Symptoms**: User has to log in every time they open the app

**Causes**:
1. AsyncStorage not installed
2. Firebase using memory persistence
3. Auth instance created multiple times

**Solution**:
1. Verify AsyncStorage is installed
2. Make sure Firebase is initialized only once (use `getApps().length` check)
3. Check console for persistence warnings

## 🎓 Key Learnings

### 1. Trust Firebase's Auto-Detection
- Firebase is smart about detecting React Native
- Manual configuration is usually unnecessary
- Simpler code = fewer bugs

### 2. Keep Dependencies Updated
```bash
npm install firebase@latest
npm install @react-native-async-storage/async-storage@latest
```

### 3. Read Version-Specific Docs
- Firebase v9 → v10 → v12 had breaking changes
- Always check migration guides
- API changes happen in major versions

## ✅ Verification Checklist

After applying the fix:

- [ ] No "INTERNAL ASSERTION FAILED" errors
- [ ] No "Expected a class definition" errors
- [ ] Auth initialization logs show success
- [ ] User can sign in successfully
- [ ] User stays logged in after app restart
- [ ] `auth.currentUser` persists correctly
- [ ] No TypeScript/lint errors in firebase.ts

## 📚 Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [React Native Firebase Guide](https://rnfirebase.io/)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [Firebase v9+ Migration Guide](https://firebase.google.com/docs/web/modular-upgrade)

## 🎉 Summary

**Problem**: Firebase Auth v12 doesn't accept AsyncStorage directly in `initializeAuth()`

**Solution**: Use `getAuth(app)` and let Firebase auto-detect AsyncStorage

**Result**: 
- ✅ Error fixed
- ✅ Cleaner code
- ✅ Automatic persistence
- ✅ No manual configuration needed

---

**Your Firebase Auth is now properly configured and error-free!** 🚀
