# 🔥 Quick Fix Reference Card

## Problem
```
ERROR [Error: [Gesture Handler] Failed to obtain view for PanGestureHandler]
```

## Solution
Replace `@react-navigation/stack` with `@react-navigation/native-stack`

## Quick Migration Steps

### 1. Change Import
```typescript
// ❌ Old
import { createStackNavigator } from '@react-navigation/stack';

// ✅ New
import { createNativeStackNavigator } from '@react-navigation/native-stack';
```

### 2. Change Stack Creation
```typescript
// ❌ Old
const Stack = createStackNavigator();

// ✅ New
const Stack = createNativeStackNavigator();
```

### 3. Update Screen Options (if needed)
```typescript
// ❌ Old
cardStyle: { backgroundColor: '#0f172a' }

// ✅ New
contentStyle: { backgroundColor: '#0f172a' }
```

## Files Changed
- ✅ `navigation/HomeNavigator.tsx`
- ✅ `navigation/ToolsNavigator.tsx`
- ✅ `navigation/ForumNavigator.tsx`
- ✅ `navigation/ProfileNavigator.tsx`

## Test It
```bash
npx expo start --clear
```

## Expected Result
✅ No gesture handler errors
✅ Smooth native animations  
✅ Better performance

---

**That's it! Your navigation is now error-free.** 🎉
