# Firebase Console Setup Guide

## 🎯 Overview
This guide walks you through setting up Firebase Authentication in the Firebase Console for your AgriCast app.

## 📝 Prerequisites
- Firebase account (https://firebase.google.com/)
- Firebase project created
- Firebase credentials added to `.env` file

## 🔥 Step-by-Step Setup

### Step 1: Access Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project: **farmers-rain-planner** or **farmers-e95fb** (based on your .env)
3. You should see your project dashboard

### Step 2: Enable Email/Password Authentication

1. **Navigate to Authentication**
   - Click on "Build" in the left sidebar
   - Click on "Authentication"
   - If it's your first time, click "Get started"

2. **Enable Email/Password Sign-in**
   - Click on the "Sign-in method" tab
   - Find "Email/Password" in the list of providers
   - Click on it to open settings
   - Toggle "Enable" to ON
   - **Important:** You can optionally enable "Email link (passwordless sign-in)" but it's not required
   - Click "Save"

### Step 3: Configure Email Templates (Optional but Recommended)

1. **Access Templates**
   - Still in Authentication section
   - Click on "Templates" tab at the top
   - You'll see templates for:
     - Email address verification
     - Password reset
     - Email address change
     - SMS verification

2. **Customize Email Verification Template**
   - Click on "Email address verification"
   - Customize the following:
     - **From name:** AgriCast or Your App Name
     - **From email:** Choose from dropdown (usually noreply@yourproject.firebaseapp.com)
     - **Reply-to email:** Your support email
     - **Subject:** Verify your email for AgriCast
     - **Body:** Customize the message (keep the %LINK% variable)
   - Click "Save"

3. **Customize Password Reset Template**
   - Click on "Password reset"
   - Customize similarly:
     - **Subject:** Reset your AgriCast password
     - **Body:** Customize the message
   - Click "Save"

### Step 4: Configure Authorized Domains

1. **Navigate to Settings**
   - In Authentication section
   - Click on "Settings" tab
   - Scroll to "Authorized domains"

2. **Add Domains (if needed)**
   - By default, you'll have:
     - localhost (for testing)
     - yourproject.firebaseapp.com
     - yourproject.web.app
   - For production, add your custom domain
   - Click "Add domain" if needed

### Step 5: Set Up User Management (Optional)

1. **Access Users Tab**
   - Click on "Users" tab in Authentication
   - Here you can:
     - View all registered users
     - Manually add users
     - Disable/enable user accounts
     - Delete users
     - Reset passwords

### Step 6: Configure Security Rules (Recommended)

1. **Navigate to Firestore Rules** (if using Firestore)
   - Click on "Firestore Database" in left sidebar
   - Click on "Rules" tab
   - Update rules to require authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication for all reads and writes
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Or more specific rules
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 7: Enable App Check (Optional - For Production)

1. **Navigate to App Check**
   - Click on "App Check" in left sidebar
   - Follow setup wizard for your platform
   - This helps protect your backend from abuse

### Step 8: Set Up Analytics (Optional)

1. **Enable Google Analytics**
   - Click on "Analytics" in left sidebar
   - Click "Enable Google Analytics"
   - Follow the setup wizard
   - This helps track user authentication events

## 🧪 Testing the Setup

### Test Email/Password Authentication

1. **Try Signing Up**
   - Run your app: `npx expo start`
   - Go to Sign Up screen
   - Create a test account
   - Check Firebase Console → Authentication → Users
   - You should see the new user listed

2. **Check Email Verification**
   - After sign up, check your email
   - You should receive a verification email
   - If not, check:
     - Email templates are configured
     - Email isn't in spam folder
     - Email provider isn't blocking Firebase

3. **Test Sign In**
   - Sign in with the test account
   - Check console logs for success messages

### Firebase Console Verification Checklist

- [ ] Email/Password provider is enabled
- [ ] Email templates are customized
- [ ] Authorized domains include localhost
- [ ] Test user appears in Users list after sign up
- [ ] Verification email was received
- [ ] Password reset email can be sent and received

## 🔒 Security Best Practices

### 1. Enable Multi-Factor Authentication (MFA)
```
Authentication → Settings → Multi-factor authentication
Enable for all users or selected users
```

### 2. Set Password Policy
```
Authentication → Settings → Password policy
- Minimum length: 8 characters (recommended)
- Require uppercase
- Require lowercase  
- Require numbers
- Require special characters
```

### 3. Configure Account Recovery
```
Authentication → Settings → Account recovery
- Email verification required
- Password reset email timeout: 1 hour
```

### 4. Enable Suspicious Activity Monitoring
```
Authentication → Settings → Monitoring
- Enable account takeover protection
- Enable suspicious activity detection
```

## 📊 Monitoring & Analytics

### View Authentication Metrics

1. **Authentication Dashboard**
   - Go to Authentication → Dashboard
   - View metrics:
     - Total users
     - New users (daily/weekly/monthly)
     - Active users
     - Sign-in methods breakdown

2. **User Activity**
   - Click on individual users
   - See:
     - Sign-in timestamps
     - Creation date
     - Last refresh time
     - Provider info

## 🚨 Troubleshooting

### Common Issues

**Issue: Email/Password option is grayed out**
- Solution: Make sure you've clicked "Get started" on Authentication first
- Sometimes you need to refresh the page

**Issue: Emails not being sent**
- Check Templates tab is properly configured
- Verify "From email" is set
- Check email spam folders
- Verify email provider isn't blocking Firebase

**Issue: "Invalid API key" error in app**
- Verify `.env` file has correct `EXPO_PUBLIC_FIREBASE_API_KEY`
- Make sure there are no extra spaces or quotes
- Restart Expo server after changing .env

**Issue: "Firebase: Error (auth/unauthorized-domain)"**
- Add your domain to Authorized domains list
- For local testing, ensure "localhost" is in the list

**Issue: Users can't sign in after sign up**
- Check if email verification is required
- Verify Firebase rules aren't blocking access
- Check console for specific error messages

## 📱 Platform-Specific Settings

### For Mobile Apps (React Native/Expo)

1. **iOS Setup**
   - Add GoogleService-Info.plist to iOS folder
   - Configure URL schemes in app.json

2. **Android Setup**
   - Add google-services.json to android/app folder
   - Configure SHA fingerprints in Firebase Console

### For Web Apps

1. **Add Web App to Firebase**
   - Project Settings → Your apps
   - Click "Add app" → Web
   - Register app and copy config

## 🎓 Additional Resources

### Firebase Documentation
- [Firebase Auth Overview](https://firebase.google.com/docs/auth)
- [Email/Password Authentication](https://firebase.google.com/docs/auth/web/password-auth)
- [Manage Users](https://firebase.google.com/docs/auth/web/manage-users)
- [Customize Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)

### Security
- [Security Rules](https://firebase.google.com/docs/rules)
- [App Check](https://firebase.google.com/docs/app-check)
- [Authentication Best Practices](https://firebase.google.com/docs/auth/web/best-practices)

## ✅ Setup Complete!

Once you've completed these steps:
1. ✅ Email/Password authentication is enabled
2. ✅ Email templates are configured
3. ✅ Security rules are set
4. ✅ Your app can create and authenticate users

You're now ready to test the authentication flow in your app!

---

**Need Help?**
- Check Firebase Console → Support
- Visit Firebase Slack Community
- Check Stack Overflow with tag `firebase-authentication`
