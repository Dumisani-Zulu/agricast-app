
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ToolsScreen from '../screens/ToolsScreen';
import CropDiseaseIdentifier from '../components/tools/CropDiseaseIdentifier';
import PestIdentifier from '../components/tools/PestIdentifier';
import SoilHealthChecker from '../components/tools/SoilHealthChecker';
import MarketPrices from '../components/tools/MarketPrices';

const Stack = createNativeStackNavigator();

const ToolsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ToolsList" 
        component={ToolsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CropDiseaseIdentifier" 
        component={CropDiseaseIdentifier}
        options={{ title: 'Crop Disease Identifier' }}
      />
      <Stack.Screen 
        name="PestIdentifier" 
        component={PestIdentifier}
        options={{ title: 'Pest Identifier' }}
      />
      <Stack.Screen 
        name="SoilHealthChecker" 
        component={SoilHealthChecker}
        options={{ title: 'Soil Health Checker' }}
      />
      <Stack.Screen 
        name="MarketPrices" 
        component={MarketPrices}
        options={{ title: 'Market Prices' }}
      />
    </Stack.Navigator>
  );
};

export default ToolsNavigator;