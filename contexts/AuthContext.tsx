import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  updateUserEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Setting up Firebase Auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', user ? `User logged in: ${user.email}` : 'No user logged in');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting to sign in user:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful');
    } catch (error: any) {
      console.error('❌ Sign in error:', error.code, error.message);
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('🔐 Attempting to create user account:', email);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ User account created successfully');
      
      await updateProfile(user, { displayName: name });
      console.log('✅ User profile updated with name:', name);
      
      // Send verification email
      await sendEmailVerification(user);
      console.log('✅ Verification email sent');
    } catch (error: any) {
      console.error('❌ Sign up error:', error.code, error.message);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      console.log('🔐 Logging out user');
      await signOut(auth);
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('❌ Logout error:', error.message);
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔐 Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('❌ Password reset error:', error.message);
      throw new Error(error.message);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently logged in');
      }
      console.log('📧 Sending verification email to:', auth.currentUser.email);
      await sendEmailVerification(auth.currentUser);
      console.log('✅ Verification email sent');
    } catch (error: any) {
      console.error('❌ Verification email error:', error.message);
      throw new Error(error.message);
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently logged in');
      }
      console.log('👤 Updating user profile');
      await updateProfile(auth.currentUser, { displayName, photoURL });
      console.log('✅ Profile updated successfully');
    } catch (error: any) {
      console.error('❌ Profile update error:', error.message);
      throw new Error(error.message);
    }
  };

  const updateUserEmail = async (newEmail: string, currentPassword: string) => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No user is currently logged in');
      }
      
      // Reauthenticate user before email change
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      console.log('✅ User reauthenticated');
      
      await updateEmail(auth.currentUser, newEmail);
      console.log('✅ Email updated successfully to:', newEmail);
    } catch (error: any) {
      console.error('❌ Email update error:', error.message);
      throw new Error(error.message);
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No user is currently logged in');
      }
      
      // Reauthenticate user before password change
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      console.log('✅ User reauthenticated');
      
      await updatePassword(auth.currentUser, newPassword);
      console.log('✅ Password updated successfully');
    } catch (error: any) {
      console.error('❌ Password update error:', error.message);
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
    sendVerificationEmail,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};