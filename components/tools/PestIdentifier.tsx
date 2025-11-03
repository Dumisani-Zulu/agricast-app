import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { geminiModels } from '../../config/gemini';

interface PestResult {
  pestName: string;
  scientificName: string;
  confidence: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical' | 'N/A';
  affectedCrops: string[];
  lifeStage: string;
  damageType: string[];
  identificationFeatures: string[];
  biologicalControl: string[];
  chemicalControl: string[];
  culturalControl: string[];
  preventionMethods: string[];
  estimatedDamage: string;
  seasonalActivity: string;
}

const PestIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and gallery permissions are needed to identify pests.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const analyzeImage = async (uri: string) => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Convert image to base64
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64 = base64String.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });

      const model = geminiModels.vision;
      
      const prompt = `You are an expert agricultural entomologist specializing in crop pests in Zambia and Africa. Analyze this image to identify any pest or insect damage on crops.

Please analyze the image and respond in the following JSON format ONLY (no additional text):
{
  "pestName": "Common name of the pest or 'No Pest Detected' if none found",
  "scientificName": "Scientific name of the pest",
  "confidence": "High/Medium/Low",
  "severity": "Low/Medium/High/Critical or N/A if no pest",
  "affectedCrops": ["List", "of", "crops", "commonly", "affected"],
  "lifeStage": "Life stage observed (egg, larva, nymph, adult, etc.)",
  "damageType": ["Type", "of", "damage", "caused"],
  "identificationFeatures": ["Key", "identifying", "features", "visible"],
  "biologicalControl": ["Biological", "control", "methods"],
  "chemicalControl": ["Chemical", "pesticides", "recommended"],
  "culturalControl": ["Cultural", "and", "mechanical", "control", "methods"],
  "preventionMethods": ["Prevention", "strategies"],
  "estimatedDamage": "Potential crop damage percentage or description",
  "seasonalActivity": "When this pest is most active"
}

If the image is not clear or does not show a pest, set pestName to "Unable to identify - please provide a clearer image" and keep other fields minimal.

Focus on pests common in Zambian agriculture such as:
- Fall Armyworm (Spodoptera frugiperda) - major maize pest
- African Bollworm (Helicoverpa armigera) - cotton, tomatoes
- Aphids (various species) - vegetables, legumes
- Whiteflies (Bemisia tabaci) - cassava, vegetables
- Stem Borers (Chilo partellus, Busseola fusca) - maize, sorghum
- Locusts and Grasshoppers - various crops
- Cutworms - vegetables, maize
- Red Spider Mites - beans, vegetables
- Bean Beetle (Acanthoscelides obtectus) - stored beans
- Termites - various crops

Provide practical, locally-available solutions suitable for Zambian smallholder farmers.`;

      const imagePart = {
        inlineData: {
          data: base64data,
          mimeType: 'image/jpeg',
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();
      
      // Extract JSON from the response
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      const parsedResult = JSON.parse(jsonText);
      setResult(parsedResult);
      
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again with a clearer photo of the pest or damage.');
      Alert.alert(
        'Analysis Failed',
        'Could not analyze the image. Please ensure you have a clear photo and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageCapture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        await analyzeImage(imageUri);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleImageGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        await analyzeImage(imageUri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    setAnalyzing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-orange-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'alert-octagon';
      case 'High': return 'alert';
      case 'Medium': return 'alert-circle';
      case 'Low': return 'information';
      default: return 'help-circle';
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 p-4">
        
        {/* Header Card */}
        {!selectedImage && (
          <View className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 mb-6">
            <FontAwesome5 
              name="bug" 
              size={64} 
              color="white" 
              style={{ alignSelf: 'center' }}
            />
            <Text className="text-white text-center mt-4 text-lg font-semibold">
              AI-Powered Pest Identification
            </Text>
            <Text className="text-white/80 text-center mt-2 text-sm">
              Capture images of pests or crop damage to identify the pest and get control recommendations
            </Text>
          </View>
        )}

        {/* Image Upload Section */}
        {!selectedImage && (
          <View>
            <TouchableOpacity
              className="bg-yellow-600 rounded-xl p-4 mb-4 flex-row items-center justify-center"
              onPress={handleImageCapture}
            >
              <MaterialCommunityIcons name="camera" size={24} color="white" />
              <Text className="text-white font-semibold ml-2 text-lg">Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-blue-600 rounded-xl p-4 mb-4 flex-row items-center justify-center"
              onPress={handleImageGallery}
            >
              <MaterialCommunityIcons name="image" size={24} color="white" />
              <Text className="text-white font-semibold ml-2 text-lg">Choose from Gallery</Text>
            </TouchableOpacity>

            {/* Tips Section */}
            <View className="bg-gray-800 rounded-xl p-4 mt-2">
              <View className="flex-row items-center mb-3">
                <Ionicons name="bulb" size={20} color="#fbbf24" />
                <Text className="text-white font-semibold ml-2">Photography Tips:</Text>
              </View>
              <View className="space-y-2">
                <View className="flex-row items-start mb-2">
                  <Text className="text-yellow-400 mr-2">•</Text>
                  <Text className="text-gray-300 text-sm flex-1">Take close-up photos of the pest if visible</Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-yellow-400 mr-2">•</Text>
                  <Text className="text-gray-300 text-sm flex-1">Capture damage patterns on leaves or stems</Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-yellow-400 mr-2">•</Text>
                  <Text className="text-gray-300 text-sm flex-1">Use good lighting and avoid shadows</Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-yellow-400 mr-2">•</Text>
                  <Text className="text-gray-300 text-sm flex-1">Multiple angles help improve accuracy</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Selected Image Display */}
        {selectedImage && (
          <View className="bg-gray-800 rounded-xl p-4 mb-4">
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-64 rounded-lg"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="bg-red-600 rounded-lg p-3 mt-4 flex-row items-center justify-center"
              onPress={resetAnalysis}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Analyze Different Image</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Analyzing Indicator */}
        {analyzing && (
          <View className="bg-gray-800 rounded-xl p-8 items-center mb-4">
            <ActivityIndicator size="large" color="#fbbf24" />
            <Text className="text-white text-lg font-semibold mt-4">Analyzing Image...</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              Our AI is identifying the pest and analyzing the damage
            </Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-4">
            <View className="flex-row items-start">
              <MaterialCommunityIcons name="alert-circle" size={24} color="#ef4444" />
              <View className="flex-1 ml-3">
                <Text className="text-red-400 font-semibold mb-1">Analysis Error</Text>
                <Text className="text-red-200 text-sm">{error}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Results Display */}
        {result && !analyzing && (
          <View className="mb-6">
            {/* Pest Name & Severity */}
            <View className="bg-gray-800 rounded-xl p-5 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs mb-1">Identified Pest</Text>
                  <Text className="text-white text-2xl font-bold">{result.pestName}</Text>
                  <Text className="text-gray-400 text-sm italic mt-1">{result.scientificName}</Text>
                </View>
                {result.severity !== 'N/A' && (
                  <View className={`${getSeverityColor(result.severity)} px-4 py-2 rounded-full flex-row items-center`}>
                    <MaterialCommunityIcons 
                      name={getSeverityIcon(result.severity)} 
                      size={16} 
                      color="white" 
                    />
                    <Text className="text-white font-bold ml-1">{result.severity}</Text>
                  </View>
                )}
              </View>
              
              <View className="flex-row items-center pt-3 border-t border-gray-700">
                <View className="flex-1 mr-3">
                  <Text className="text-gray-400 text-xs mb-1">Life Stage</Text>
                  <Text className="text-white font-semibold">{result.lifeStage}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs mb-1">Confidence</Text>
                  <Text className="text-yellow-400 font-semibold">{result.confidence}</Text>
                </View>
              </View>
            </View>

            {/* Affected Crops */}
            {result.affectedCrops && result.affectedCrops.length > 0 && (
              <View className="bg-gray-800 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="sprout" size={20} color="#10b981" />
                  <Text className="text-white font-bold text-lg ml-2">Commonly Affected Crops</Text>
                </View>
                <View className="flex-row flex-wrap">
                  {result.affectedCrops.map((crop, index) => (
                    <View key={index} className="bg-green-900/30 border border-green-700 rounded-lg px-3 py-1 mr-2 mb-2">
                      <Text className="text-green-300 text-sm">{crop}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Identification Features */}
            {result.identificationFeatures && result.identificationFeatures.length > 0 && (
              <View className="bg-gray-800 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="eye" size={20} color="#60a5fa" />
                  <Text className="text-white font-bold text-lg ml-2">Identification Features</Text>
                </View>
                {result.identificationFeatures.map((feature, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-blue-400 mr-2">•</Text>
                    <Text className="text-gray-300 flex-1">{feature}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Damage Type */}
            {result.damageType && result.damageType.length > 0 && (
              <View className="bg-orange-900/30 border border-orange-700 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="alert" size={20} color="#fb923c" />
                  <Text className="text-white font-bold text-lg ml-2">Type of Damage</Text>
                </View>
                {result.damageType.map((damage, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-orange-400 mr-2">⚠</Text>
                    <Text className="text-orange-100 flex-1">{damage}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Biological Control */}
            {result.biologicalControl && result.biologicalControl.length > 0 && (
              <View className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="leaf" size={20} color="#10b981" />
                  <Text className="text-white font-bold text-lg ml-2">Biological Control</Text>
                </View>
                {result.biologicalControl.map((control, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-emerald-400 mr-2">🌿</Text>
                    <Text className="text-emerald-100 flex-1">{control}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Chemical Control */}
            {result.chemicalControl && result.chemicalControl.length > 0 && (
              <View className="bg-red-900/30 border border-red-700 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="flask" size={20} color="#f87171" />
                  <Text className="text-white font-bold text-lg ml-2">Chemical Control</Text>
                </View>
                {result.chemicalControl.map((chemical, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-red-400 mr-2">💊</Text>
                    <Text className="text-red-100 flex-1">{chemical}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Cultural Control */}
            {result.culturalControl && result.culturalControl.length > 0 && (
              <View className="bg-purple-900/30 border border-purple-700 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="account-group" size={20} color="#c084fc" />
                  <Text className="text-white font-bold text-lg ml-2">Cultural & Mechanical Control</Text>
                </View>
                {result.culturalControl.map((method, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-purple-400 mr-2">✓</Text>
                    <Text className="text-purple-100 flex-1">{method}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Prevention Methods */}
            {result.preventionMethods && result.preventionMethods.length > 0 && (
              <View className="bg-blue-900/30 border border-blue-700 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="shield-check" size={20} color="#60a5fa" />
                  <Text className="text-white font-bold text-lg ml-2">Prevention Methods</Text>
                </View>
                {result.preventionMethods.map((prevention, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-blue-400 mr-2">→</Text>
                    <Text className="text-blue-100 flex-1">{prevention}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Additional Info */}
            <View className="bg-gray-800 rounded-xl p-5 mb-4">
              <View className="flex-col justify-center items-center mb-3 pb-3 border-b border-gray-700">
                <Text className="text-xl font-bold text-gray-400">Estimated Damage</Text>
                <Text className="text-orange-400 font-semibold">{result.estimatedDamage}</Text>
              </View>
              <View className="flex-col justify-center items-center">
                <Text className="text-xl font-bold text-gray-400">Seasonal Activity</Text>
                <Text className="text-yellow-400 font-semibold">{result.seasonalActivity}</Text>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              className="bg-yellow-600 rounded-xl p-4 flex-row items-center justify-center"
              onPress={resetAnalysis}
            >
              <MaterialCommunityIcons name="camera-plus" size={24} color="white" />
              <Text className="text-white font-semibold ml-2 text-lg">Identify Another Pest</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Disclaimer */}
        {result && (
          <View className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={20} color="#fbbf24" />
              <View className="flex-1 ml-3">
                <Text className="text-yellow-400 font-semibold mb-1">Disclaimer</Text>
                <Text className="text-yellow-200/80 text-xs">
                  This AI analysis is for informational purposes only. Always follow local pesticide regulations 
                  and consult with agricultural extension officers for proper pest management strategies.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PestIdentifier;