import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { geminiModels } from '../../config/gemini';
import { saveDiseaseIdentification } from '../../services/savedIdentifications';

interface DiseaseResult {
  diseaseName: string;
  confidence: string;
  // include 'N/A' for healthy or unclassified results
  severity: 'Low' | 'Medium' | 'High' | 'Critical' | 'N/A';
  affectedCrop: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
  organicSolutions: string[];
  estimatedYieldLoss: string;
  spreadRisk: string;
}

const CropDiseaseIdentifier = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and gallery permissions are needed to identify crop diseases.',
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
          // Remove the data:image/...;base64, prefix
          const base64 = base64String.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });

      const model = geminiModels.vision;
      
      const prompt = `You are an expert agricultural pathologist specializing in crop diseases in Zambia and Africa. Analyze this image of a crop plant and provide a detailed disease diagnosis.

Please analyze the image and respond in the following JSON format ONLY (no additional text):
{
  "diseaseName": "Name of the disease or 'Healthy Plant' if no disease detected",
  "confidence": "High/Medium/Low",
  "severity": "Low/Medium/High/Critical or N/A if healthy",
  "affectedCrop": "Type of crop identified",
  "symptoms": ["List", "of", "visible", "symptoms"],
  "causes": ["Primary", "causes", "of", "the", "disease"],
  "treatment": ["Treatment", "method", "1", "Treatment", "method", "2"],
  "prevention": ["Prevention", "method", "1", "Prevention", "method", "2"],
  "organicSolutions": ["Organic", "treatment", "options"],
  "estimatedYieldLoss": "Percentage or description",
  "spreadRisk": "Low/Medium/High description of how quickly it spreads"
}

If the image is not clear or is not a crop plant, set diseaseName to "Unable to analyze - please provide a clear image of a crop plant" and keep other fields minimal.

Focus on diseases common in Zambian agriculture like:
- Maize: Gray Leaf Spot, Maize Streak Virus, Northern Corn Leaf Blight, Common Rust
- Tomato: Early Blight, Late Blight, Bacterial Wilt, Leaf Curl Virus
- Beans: Bean Common Mosaic Virus, Rust, Anthracnose
- Cassava: Cassava Mosaic Disease, Brown Streak Disease
- Groundnuts: Leaf Spot, Rosette Disease

Provide practical, locally-available solutions suitable for Zambian farmers.`;

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
      setError('Failed to analyze image. Please try again with a clearer photo of the crop.');
      Alert.alert(
        'Analysis Failed',
        'Could not analyze the image. Please ensure you have a clear photo of a crop plant and try again.',
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

  const handleSaveIdentification = async () => {
    if (!result || !selectedImage) return;

    setSaving(true);
    try {
      const saveResult = await saveDiseaseIdentification(selectedImage, result);
      if (saveResult.success) {
        Alert.alert(
          'Saved Successfully',
          saveResult.message,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Already Saved',
          saveResult.message,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error saving identification:', error);
      Alert.alert(
        'Save Failed',
        'Could not save this identification. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
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
          <View className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-6">
            <MaterialCommunityIcons 
              name="leaf" 
              size={64} 
              color="white" 
              style={{ alignSelf: 'center' }}
            />
            <Text className="text-white text-center mt-4 text-lg font-semibold">
              AI-Powered Disease Detection
            </Text>
            <Text className="text-white/80 text-center mt-2 text-sm">
              Upload or capture an image of your crop to identify diseases and get treatment recommendations
            </Text>
          </View>
        )}

        {/* Image Upload Section */}
        {!selectedImage && (
          <View>
            <TouchableOpacity
              className="bg-green-600 rounded-xl p-4 mb-4 flex-row items-center justify-center"
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
                  <Text className="text-green-400 mr-2">•</Text>
                  <Text className="text-gray-300 text-sm flex-1">Take photos in bright, natural daylight</Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-green-400 mr-2">•</Text>
                  <Text className="text-gray-300 text-sm flex-1">Focus on affected leaves or plant parts</Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-green-400 mr-2">•</Text>
                  <Text className="text-gray-300 text-sm flex-1">Capture close-up images showing symptoms clearly</Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-green-400 mr-2">•</Text>
                  <Text className="text-gray-300 text-sm flex-1">Avoid blurry or backlit photos</Text>
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
            <ActivityIndicator size="large" color="#22c55e" />
            <Text className="text-white text-lg font-semibold mt-4">Analyzing Image...</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              Our AI is examining your crop for diseases and health issues
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
            {/* Disease Name & Severity */}
            <View className="bg-gray-800 rounded-xl p-5 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs mb-1">Diagnosis</Text>
                  <Text className="text-white text-2xl font-bold">{result.diseaseName}</Text>
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
                  <Text className="text-gray-400 text-xs mb-1">Crop Type</Text>
                  <Text className="text-white font-semibold">{result.affectedCrop}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs mb-1">Confidence</Text>
                  <Text className="text-green-400 font-semibold">{result.confidence}</Text>
                </View>
              </View>
            </View>

            {/* Symptoms */}
            {result.symptoms && result.symptoms.length > 0 && (
              <View className="bg-gray-800 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="eye" size={20} color="#f472b6" />
                  <Text className="text-white font-bold text-lg ml-2">Symptoms Detected</Text>
                </View>
                {result.symptoms.map((symptom, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-pink-400 mr-2">•</Text>
                    <Text className="text-gray-300 flex-1">{symptom}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Causes */}
            {result.causes && result.causes.length > 0 && (
              <View className="bg-gray-800 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="help-circle" size={20} color="#fbbf24" />
                  <Text className="text-white font-bold text-lg ml-2">Causes</Text>
                </View>
                {result.causes.map((cause, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-yellow-400 mr-2">•</Text>
                    <Text className="text-gray-300 flex-1">{cause}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Treatment */}
            {result.treatment && result.treatment.length > 0 && (
              <View className="bg-green-900/30 border border-green-700 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="medical-bag" size={20} color="#22c55e" />
                  <Text className="text-white font-bold text-lg ml-2">Treatment Options</Text>
                </View>
                {result.treatment.map((treatment, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-green-400 mr-2">✓</Text>
                    <Text className="text-green-100 flex-1">{treatment}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Organic Solutions */}
            {result.organicSolutions && result.organicSolutions.length > 0 && (
              <View className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="leaf" size={20} color="#10b981" />
                  <Text className="text-white font-bold text-lg ml-2">Organic Solutions</Text>
                </View>
                {result.organicSolutions.map((solution, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-emerald-400 mr-2">🌿</Text>
                    <Text className="text-emerald-100 flex-1">{solution}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Prevention */}
            {result.prevention && result.prevention.length > 0 && (
              <View className="bg-blue-900/30 border border-blue-700 rounded-xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <MaterialCommunityIcons name="shield-check" size={20} color="#60a5fa" />
                  <Text className="text-white font-bold text-lg ml-2">Prevention Measures</Text>
                </View>
                {result.prevention.map((prevention, index) => (
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
                <Text className="text-xl font-bold text-gray-400">Estimated Yield Loss</Text>
                <Text className="text-orange-400 font-semibold">{result.estimatedYieldLoss}</Text>
              </View>
              <View className="flex-col justify-center items-center">
                <Text className="text-xl font-bold text-gray-400">Spread Risk</Text>
                <Text className="text-red-400 font-semibold">{result.spreadRisk}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              className="bg-green-600 rounded-xl p-4 flex-row items-center justify-center mb-3"
              onPress={handleSaveIdentification}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={24} color="white" />
                  <Text className="text-white font-semibold ml-2 text-lg">Save for Offline Review</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-pink-600 rounded-xl p-4 flex-row items-center justify-center"
              onPress={resetAnalysis}
            >
              <MaterialCommunityIcons name="camera-plus" size={24} color="white" />
              <Text className="text-white font-semibold ml-2 text-lg">Analyze Another Plant</Text>
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
                  This AI analysis is for informational purposes only. For accurate diagnosis and treatment, 
                  please consult with a local agricultural extension officer or plant pathologist.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CropDiseaseIdentifier;