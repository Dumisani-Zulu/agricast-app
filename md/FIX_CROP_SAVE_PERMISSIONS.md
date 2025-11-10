# 🔧 Fix Firebase Permissions for Saving Crops

## The Problem
You're seeing this error when trying to save crop recommendations:
```
ERROR Failed to save crop: [FirebaseError: Missing or insufficient permissions.]
```

This happens because your Firestore security rules don't allow writing to the `users` collection.

## Solution: Update Firestore Rules

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project: **farmers-rain-planner**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab

### Step 2: Update the Rules

Replace the existing rules with these updated rules that include `users` collection permissions:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user is the owner
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Users collection - for storing user profiles and saved data
    match /users/{userId} {
      // Users can read their own document
      allow read: if isOwner(userId);
      
      // Users can create and update their own document
      allow create, update: if isOwner(userId);
      
      // Users cannot delete their document (prevent accidental deletion)
      allow delete: if false;
    }
    
    // Posts collection
    match /posts/{postId} {
      // Anyone can read posts (even unauthenticated users)
      allow read: if true;
      
      // Only authenticated users can create posts
      allow create: if isSignedIn() 
                    && request.resource.data.authorId == request.auth.uid;
      
      // Only the author can update their own posts
      // OR any authenticated user can update likes/counts
      allow update: if isOwner(resource.data.authorId)
                    || (isSignedIn() && 
                        request.resource.data.diff(resource.data).affectedKeys()
                          .hasOnly(['likes', 'likeCount', 'updatedAt', 'replyCount']));
      
      // Only the author can delete their posts
      allow delete: if isOwner(resource.data.authorId);
    }
    
    // Replies collection
    match /replies/{replyId} {
      // Anyone can read replies (even unauthenticated users)
      allow read: if true;
      
      // Only authenticated users can create replies
      allow create: if isSignedIn() 
                    && request.resource.data.authorId == request.auth.uid;
      
      // Only the author can update their own replies
      // OR any authenticated user can update likes
      allow update: if isOwner(resource.data.authorId)
                    || (isSignedIn() && 
                        request.resource.data.diff(resource.data).affectedKeys()
                          .hasOnly(['likes', 'likeCount', 'updatedAt']));
      
      // Only the author can delete their replies
      allow delete: if isOwner(resource.data.authorId);
    }
  }
}
```

### Step 3: Publish the Rules

1. Click the **Publish** button (top right)
2. Wait 10-30 seconds for the rules to propagate
3. You should see a success message

### Step 4: Test the Fix

1. Restart your app completely
2. Navigate to the Crops screen
3. Select a crop recommendation
4. Click **Save Recommendation**
5. You should see a success message! ✅

---

## What This Does

The new rules add a `users` collection section that:

✅ **Allows users to read their own data** - Each user can only see their own saved crops  
✅ **Allows users to create their profile** - First time users can create their document  
✅ **Allows users to update their data** - Users can save crops and update preferences  
✅ **Prevents deletion** - Users cannot accidentally delete their profile  
✅ **Secure** - Users cannot access other users' data

---

## Troubleshooting

### Still getting permission errors?

1. **Check you're logged in** - You must be authenticated to save crops
2. **Wait a bit longer** - Rules can take up to 60 seconds to propagate
3. **Verify correct project** - Make sure you're editing the right Firebase project
4. **Clear app data** - Try clearing the app cache and restarting
5. **Check console logs** - Look for authentication errors in the terminal

### How to verify rules are applied?

In Firebase Console → Firestore Database → Rules tab:
- You should see your new rules
- There should be a timestamp showing when they were published
- No error/warning messages should appear

---

## Quick Test Mode (Development Only)

If you need to test quickly, you can use this **TEMPORARY** rule (⚠️ NOT SECURE):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

This allows all access until end of 2025. **Use only for testing!**

---

## What Gets Saved?

When you save a crop recommendation, the following data is stored in Firestore:

```
/users/{userId}/
  └── savedCrops: [
        {
          name: "Maize",
          scientificName: "Zea mays",
          description: "...",
          growthDuration: "90-120 days",
          climate: {...},
          soilRequirements: {...},
          // ... and more
        }
      ]
```

Each user's saved crops are stored in their own document, completely isolated from other users.

---

## Security Notes

These rules ensure:
- ✅ Users can only access their own saved data
- ✅ Authentication is required to save crops
- ✅ Other users cannot see your saved recommendations
- ✅ Data integrity is maintained
- ✅ Production-ready and secure

---

**After updating the rules, your crop saving feature should work perfectly!** 🎉
