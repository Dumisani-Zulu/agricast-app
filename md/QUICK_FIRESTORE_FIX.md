# 🔥 Quick Fix: Firestore Permissions Error

## Error You're Seeing:
```
❌ Error in posts subscription: [FirebaseError: Missing or insufficient permissions.]
```

## Fix in 3 Steps:

### Step 1: Go to Firebase Console
Open: https://console.firebase.google.com

### Step 2: Navigate to Rules
Click: **Firestore Database** → **Rules** tab

### Step 3: Copy & Paste These Rules

**For Testing (Quick & Easy):**
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

**For Production (Secure):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(authorId) {
      return isSignedIn() && request.auth.uid == authorId;
    }
    
    match /posts/{postId} {
      allow read: if true;
      allow create: if isSignedIn() && request.resource.data.authorId == request.auth.uid;
      allow update: if isOwner(resource.data.authorId) || isSignedIn();
      allow delete: if isOwner(resource.data.authorId);
    }
    
    match /replies/{replyId} {
      allow read: if true;
      allow create: if isSignedIn() && request.resource.data.authorId == request.auth.uid;
      allow update: if isOwner(resource.data.authorId) || isSignedIn();
      allow delete: if isOwner(resource.data.authorId);
    }
  }
}
```

### Step 4: Click "Publish"

### Step 5: Restart Your App

Done! The error should be gone. ✅

---

## Why This Happened

Firestore blocks all access by default. You need to set rules to allow your app to read/write data.

## Choose Which Rules?

- **Testing Rules**: Use if you just want it to work ASAP (less secure)
- **Production Rules**: Use for real apps (secure, only authenticated users can write)
