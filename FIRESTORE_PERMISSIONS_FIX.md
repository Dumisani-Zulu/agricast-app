# 🚨 FIRESTORE PERMISSIONS FIX

## The Problem
You're seeing this error:
```
❌ Error in posts subscription: [FirebaseError: Missing or insufficient permissions.]
```

This happens because Firestore security rules are blocking read/write access.

## Quick Fix (Option 1 - Test Mode - NOT for Production!)

### For Development/Testing ONLY:

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab
5. Replace the rules with this (allows read/write for 30 days):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 11, 5);
    }
  }
}
```

6. Click **Publish**
7. Restart your app

⚠️ **WARNING**: This allows anyone to read/write your database. Use ONLY for testing!

---

## Recommended Fix (Option 2 - Production Ready)

### For Production Use:

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab
5. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user is the owner
    function isOwner(authorId) {
      return isSignedIn() && request.auth.uid == authorId;
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

6. Click **Publish**
7. Wait about 10 seconds for rules to propagate
8. Restart your app

---

## Step-by-Step Visual Guide

### 1. Open Firebase Console
![Firebase Console](https://console.firebase.google.com)

### 2. Navigate to Firestore Rules
```
Firebase Console → Your Project → Firestore Database → Rules Tab
```

### 3. You'll see something like this:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // ❌ This blocks everything
    }
  }
}
```

### 4. Replace with one of the rule sets above

### 5. Click "Publish"

---

## Verify It's Working

After updating the rules, test in your app:

1. **Open the Forum tab** - You should see the loading indicator
2. **No error messages** - Check the console (it should not show permission errors)
3. **Create a post** - Try creating a new post
4. **Like a post** - Try liking/unliking

---

## Troubleshooting

### Still Getting Permission Errors?

1. **Wait 30-60 seconds** - Rules take time to propagate
2. **Reload the app** - Close and reopen completely
3. **Check you're signed in** - For creating posts, you must be authenticated
4. **Check the correct project** - Verify you're editing rules for the right Firebase project
5. **Check project ID** - In your `.env` file, make sure `EXPO_PUBLIC_FIREBASE_PROJECT_ID` matches

### How to Check if Rules Applied?

In Firebase Console → Firestore Database → Rules tab, you should see:
- Your new rules displayed
- A timestamp showing when they were last published
- No error messages

### Test in Firebase Console Simulator

1. In the Rules tab, click **Rules Playground** (top right)
2. Select operation: `get`
3. Location: `/posts/test123`
4. Click **Run**
5. Should show: ✅ Allowed (if using test mode or reading posts)

---

## What These Rules Do

### Option 1 (Test Mode):
- ✅ Allows all reads and writes until November 5, 2025
- ❌ **NOT SECURE** - anyone can access your data
- ✅ Good for development and testing

### Option 2 (Production):
- ✅ Anyone can READ posts and replies (even logged out users)
- ✅ Only authenticated users can CREATE posts/replies
- ✅ Only the author can DELETE their own posts/replies
- ✅ Only the author can EDIT their posts/replies
- ✅ Anyone logged in can LIKE posts/replies
- ✅ Secure and ready for production

---

## Next Steps

After fixing the permissions:

1. ✅ Forum should load posts
2. ✅ You can create new posts (when logged in)
3. ✅ You can reply to posts (when logged in)
4. ✅ You can like posts and replies (when logged in)
5. ✅ Real-time updates work automatically

---

## Need Help?

If you're still having issues:

1. Check the browser console for the exact error
2. Verify your Firebase project is set up correctly
3. Make sure Authentication is enabled
4. Ensure Firestore database is created
5. Double-check the environment variables in your `.env` file

---

**Remember**: Start with **Option 1** for quick testing, then switch to **Option 2** before deploying to production!
