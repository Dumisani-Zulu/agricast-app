# Authentication Testing Checklist

## ✅ Setup Verification

- [ ] Firebase project created and configured
- [ ] `.env` file contains all required Firebase credentials
- [ ] Email/Password authentication enabled in Firebase Console
- [ ] Email templates configured in Firebase Console

## 🧪 Sign Up Testing

### Valid Sign Up
- [ ] Open app and navigate to Sign Up
- [ ] Enter valid name (minimum 2 characters)
- [ ] Enter valid email address
- [ ] Enter password (minimum 6 characters)
- [ ] Click "Create Account"
- [ ] Verify success message appears
- [ ] Check email inbox for verification email
- [ ] User should be automatically logged in

### Sign Up Validation
- [ ] Try empty name field - should show error
- [ ] Try name with 1 character - should show error
- [ ] Try empty email - should show error
- [ ] Try invalid email format (e.g., "test@test") - should show error
- [ ] Try empty password - should show error
- [ ] Try password with less than 6 characters - should show error
- [ ] Try email that already exists - should show "email already in use" error

### UI Testing
- [ ] Password visibility toggle works (eye icon)
- [ ] Password requirements hint shows for sign up
- [ ] Loading spinner appears during sign up
- [ ] Form clears or redirects after successful sign up
- [ ] Keyboard doesn't cover input fields (KeyboardAvoidingView)

## 🔑 Sign In Testing

### Valid Sign In
- [ ] Switch to Sign In mode
- [ ] Enter registered email
- [ ] Enter correct password
- [ ] Click "Sign In"
- [ ] Verify success message (if implemented)
- [ ] User should be logged in and see main app

### Sign In Validation
- [ ] Try empty email - should show error
- [ ] Try empty password - should show error
- [ ] Try unregistered email - should show "user not found" error
- [ ] Try wrong password - should show "incorrect password" error
- [ ] Try invalid email format - should show error

### UI Testing
- [ ] Password visibility toggle works
- [ ] Loading spinner appears during sign in
- [ ] "Forgot Password?" link is visible
- [ ] Form switches between Sign In and Sign Up correctly

## 🔄 Password Reset Testing

### Valid Reset
- [ ] Click "Forgot Password?"
- [ ] Enter registered email address
- [ ] Submit form
- [ ] Verify confirmation message
- [ ] Check email for password reset link
- [ ] Click reset link and set new password
- [ ] Sign in with new password

### Reset Validation
- [ ] Try submitting without email - should show error
- [ ] Try unregistered email - should show "user not found" error
- [ ] Try invalid email format - should show error

## 🔒 Authentication State Testing

### Session Persistence
- [ ] Sign in to app
- [ ] Close app completely
- [ ] Reopen app
- [ ] User should still be logged in (AsyncStorage working)

### Logout
- [ ] Navigate to Profile screen
- [ ] Click Logout
- [ ] Verify user is logged out
- [ ] Should see Auth screen again

## 🎨 UI/UX Testing

### Design Elements
- [ ] All input fields have proper labels
- [ ] Placeholder text is visible and helpful
- [ ] Colors match app theme (dark mode)
- [ ] Buttons have proper active/disabled states
- [ ] Loading states are clear and visible
- [ ] Error messages are clear and actionable

### Responsiveness
- [ ] UI looks good on different screen sizes
- [ ] Keyboard doesn't cover input fields
- [ ] Scrolling works properly
- [ ] Touch targets are large enough

## 🐛 Error Handling Testing

### Network Errors
- [ ] Turn off internet
- [ ] Try to sign up - should show network error
- [ ] Try to sign in - should show network error
- [ ] Turn internet back on and retry

### Firebase Errors
- [ ] Test with intentionally wrong credentials
- [ ] Verify error messages are user-friendly
- [ ] Verify Firebase error codes are translated correctly

## 📱 Platform-Specific Testing

### iOS (if applicable)
- [ ] KeyboardAvoidingView works correctly
- [ ] Native keyboard behavior is correct
- [ ] Auto-fill works (if configured)

### Android (if applicable)
- [ ] KeyboardAvoidingView works correctly
- [ ] Back button behavior is correct
- [ ] Auto-fill works (if configured)

### Web (if applicable)
- [ ] Form submission works with Enter key
- [ ] Browser autofill works
- [ ] Responsive design works

## 🔍 Console Testing

### Expected Console Logs
During app startup:
- [ ] `🔥 Firebase Configuration:`
- [ ] `✅ Firebase App initialized successfully`
- [ ] `✅ Firebase Auth initialized with AsyncStorage`
- [ ] `🔐 Setting up Firebase Auth state listener...`
- [ ] `🔐 Auth state changed: No user logged in` (if not logged in)

During Sign Up:
- [ ] `🔐 Attempting to create user account: [email]`
- [ ] `✅ User account created successfully`
- [ ] `✅ User profile updated with name: [name]`
- [ ] `✅ Verification email sent`
- [ ] `🔐 Auth state changed: User logged in: [email]`

During Sign In:
- [ ] `🔐 Attempting to sign in user: [email]`
- [ ] `✅ Sign in successful`
- [ ] `🔐 Auth state changed: User logged in: [email]`

During Logout:
- [ ] `🔐 Logging out user`
- [ ] `✅ Logout successful`
- [ ] `🔐 Auth state changed: No user logged in`

## 🎯 Integration Testing

### With Other App Features
- [ ] After login, main app navigation works
- [ ] User info displays correctly in Profile screen
- [ ] Protected routes/screens are accessible after login
- [ ] User data persists across navigation

## 🚀 Performance Testing

### Load Times
- [ ] Sign up completes in reasonable time (< 3 seconds)
- [ ] Sign in completes in reasonable time (< 2 seconds)
- [ ] App startup checks auth state quickly (< 1 second)

### Memory
- [ ] No memory leaks during sign up/sign in flow
- [ ] AsyncStorage operations are efficient

## 📋 Test Results Template

```
Date: __________
Tester: __________
Device/Platform: __________
App Version: __________

Sign Up Tests: __ / __ passed
Sign In Tests: __ / __ passed  
Password Reset: __ / __ passed
UI/UX Tests: __ / __ passed
Error Handling: __ / __ passed
Console Logs: __ / __ passed

Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________

Notes:
_________________________________
_________________________________
_________________________________
```

## 🔧 Quick Fix Commands

If you encounter issues:

```bash
# Clear cache and restart
npx expo start --clear

# Reinstall dependencies
npm install

# Check Firebase configuration
node test-firebase.js

# View environment variables (during runtime)
console.log(process.env)
```

## 📞 Support

If tests fail, check:
1. Firebase Console - Authentication settings
2. `.env` file - Correct credentials
3. Network connection
4. Console logs - Detailed error messages
5. AUTH_IMPLEMENTATION.md - Detailed documentation
