
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CropsScreen from '../screens/CropsScreen';
import CropDetailScreen from '../screens/CropDetailScreen';

const Stack = createNativeStackNavigator();

const CropsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#111827' },
      }}
    >
      <Stack.Screen name="CropsList" component={CropsScreen} />
      <Stack.Screen
        name="CropDetail"
        component={(props: React.ComponentProps<typeof CropDetailScreen>) => <CropDetailScreen {...props} />}
      />
    </Stack.Navigator>
  );
};

export default CropsNavigator;
