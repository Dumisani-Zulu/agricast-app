# 🔥 Firebase Auth Error - Quick Fix

## Error
```
ERROR @firebase/auth: Auth (12.2.0): 
INTERNAL ASSERTION FAILED: Expected a class definition
```

## Problem
Trying to pass AsyncStorage directly to `initializeAuth()` in Firebase v12+.

## Solution
Use `getAuth(app)` instead - Firebase automatically handles AsyncStorage.

## What Changed

### Before ❌
```typescript
import { initializeAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

auth = initializeAuth(app, {
  persistence: AsyncStorage  // ❌ Causes error
});
```

### After ✅
```typescript
import { getAuth } from "firebase/auth";

const auth = getAuth(app);  // ✅ Firebase auto-detects AsyncStorage
```

## File Modified
- `config/firebase.ts` ✅

## Test It
```bash
npx expo start --clear
```

## Expected Result
- ✅ No "INTERNAL ASSERTION FAILED" error
- ✅ Auth works correctly
- ✅ Session persists after app restart

---

**Done! Firebase Auth is now properly configured.** 🎉

See `FIREBASE_AUTH_FIX.md` for detailed explanation.
