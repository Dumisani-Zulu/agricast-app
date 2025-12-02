import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PrivacySettingsScreen from '../screens/profile/PrivacySettingsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import MySavedItemsScreen from '../screens/profile/MySavedItemsScreen';
import SavedCropDetailScreen from '../screens/profile/SavedCropDetailScreen';
import SavedDiseaseDetailScreen from '../screens/profile/SavedDiseaseDetailScreen';
import SavedPestDetailScreen from '../screens/profile/SavedPestDetailScreen';

const Stack = createNativeStackNavigator();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f172a' }
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="MySavedItems" component={MySavedItemsScreen} />
      <Stack.Screen name="SavedCropDetail" component={SavedCropDetailScreen} />
      <Stack.Screen name="SavedDiseaseDetail" component={SavedDiseaseDetailScreen} />
      <Stack.Screen name="SavedPestDetail" component={SavedPestDetailScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;