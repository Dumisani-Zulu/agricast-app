import { geminiModels } from '../config/gemini';
import { WeatherData } from '../weather/api';
import { CropRecommendationResponse, WeatherAnalysis, Crop } from '../types/crop';
import { getCachedRecommendations, setCachedRecommendations } from './cropCache';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Track ongoing requests to prevent duplicates
const ongoingRequests: Map<string, Promise<CropRecommendationResponse>> = new Map();

/**
 * Analyze weather data to extract key metrics
 */
export const analyzeWeatherData = (weatherData: WeatherData): WeatherAnalysis => {
  console.log('🌤️ [CropService] Analyzing weather data...');
  const startTime = Date.now();
  
  const hourly = weatherData.hourly;
  
  // Calculate averages for the forecast period (next 7 days = 168 hours)
  const forecastHours = Math.min(168, hourly.temperature_2m.length);
  
  let totalTemp = 0;
  let totalRain = 0;
  let totalWind = 0;
  let maxUV = 0;
  
  for (let i = 0; i < forecastHours; i++) {
    totalTemp += hourly.temperature_2m[i];
    totalRain += hourly.precipitation[i] || 0;
    totalWind += hourly.wind_speed_10m[i];
    maxUV = Math.max(maxUV, hourly.uv_index[i] || 0);
  }
  
  const avgTemp = totalTemp / forecastHours;
  const avgWind = totalWind / forecastHours;
  
  // Determine season type and conditions based on rainfall
  let conditions = '';
  let seasonType = '';
  
  // Temperature classification
  if (avgTemp > 28) conditions = 'Hot';
  else if (avgTemp > 23) conditions = 'Warm';
  else if (avgTemp > 18) conditions = 'Mild';
  else conditions = 'Cool';
  
  // Rainfall classification - critical for crop selection
  if (totalRain > 70) {
    conditions += ', Very Wet (Rainy Season)';
    seasonType = 'WET_SEASON';
  } else if (totalRain > 40) {
    conditions += ', Moderate Rain (Early/Late Rainy Season)';
    seasonType = 'MODERATE_WET';
  } else if (totalRain > 20) {
    conditions += ', Light Rain (Dry-Wet Transition)';
    seasonType = 'TRANSITION';
  } else {
    conditions += ', Dry (Dry Season)';
    seasonType = 'DRY_SEASON';
  }
  
  const analysis = {
    averageTemperature: Math.round(avgTemp * 10) / 10,
    totalRainfall: Math.round(totalRain * 10) / 10,
    uvIndex: Math.round(maxUV * 10) / 10,
    windSpeed: Math.round(avgWind * 10) / 10,
    conditions,
    seasonType, // Added for better crop filtering
  };
  
  console.log(`✅ [CropService] Weather analysis complete in ${Date.now() - startTime}ms`, analysis);
  return analysis;
};

/**
 * Get crop recommendations based on weather data using Gemini AI
 * With caching and deduplication
 */
export const getCropRecommendations = async (
  weatherData: WeatherData,
  locationName: string,
  useCache: boolean = true
): Promise<CropRecommendationResponse> => {
  console.log(`🌾 [CropService] Getting crop recommendations for ${locationName}...`);
  
  // Check cache first
  if (useCache) {
    const cached = getCachedRecommendations(locationName);
    if (cached) {
      console.log('⚡ [CropService] Returning cached recommendations (instant)');
      return cached;
    }
  }
  
  // Check if there's already a request in progress for this location
  const cacheKey = locationName.toLowerCase();
  if (ongoingRequests.has(cacheKey)) {
    console.log('⏳ [CropService] Request already in progress, waiting...');
    return ongoingRequests.get(cacheKey)!;
  }
  
  const startTime = Date.now();
  
  // Create the request promise
  const requestPromise = (async () => {
    try {
      const analysis = analyzeWeatherData(weatherData);
      console.log('🤖 [CropService] Sending request to Gemini AI...');
      const aiStartTime = Date.now();
      
      const model = geminiModels.text;

      // Optimized concise prompt for faster AI response
      const prompt = `Expert Zambian agricultural advisor: Recommend 6 crops for ${locationName} based on weather forecast.

WEATHER DATA (Next 14 days):
- Temperature: ${analysis.averageTemperature}°C (${analysis.conditions})
- Rainfall: ${analysis.totalRainfall}mm
- Season: ${analysis.seasonType}

FILTERING RULES:
- Rainfall >70mm → High-water crops (rice, taro, water-tolerant maize)
- Rainfall 40-70mm → Medium-water crops (maize, beans, groundnuts, vegetables)
- Rainfall 20-40mm → Drought-tolerant crops (cassava, sweet potato, millet)
- Rainfall <20mm → Drought-resistant only (cassava, millet, sorghum, groundnuts)
- Temp >28°C → Exclude cool crops (cabbage, peas). Include: cotton, sorghum, millet
- Temp <18°C → Exclude heat crops. Include: cabbage, peas, potatoes

Return ONLY valid JSON (no markdown):
{
  "weatherSummary": "2-sentence summary stating if conditions favor wet/dry season crops",
  "recommendations": [
    {
      "crop": {
        "id": "crop-name",
        "name": "Crop Name",
        "scientificName": "Scientific",
        "category": "Grain/Vegetable/Legume/Root Crop",
        "description": "Why this crop suits current weather (1 sentence)",
        "icon": "🌽",
        "optimalTemperature": {"min": 15, "max": 30, "unit": "°C"},
        "waterRequirement": "Low/Medium/High",
        "growingSeasonDays": 90,
        "sunlightRequirement": "Full Sun",
        "soilType": ["Loamy"],
        "plantingDepth": "2-5cm",
        "spacing": "25cm x 75cm",
        "plantingTime": "Season based on rainfall",
        "careInstructions": ["Tip 1", "Tip 2", "Tip 3"],
        "commonPests": ["Pest 1", "Pest 2"],
        "commonDiseases": ["Disease 1", "Disease 2"],
        "harvestTime": "90-120 days",
        "harvestYield": "3-5 tonnes/ha",
        "storageInstructions": "Storage tip"
      },
      "suitabilityScore": 85,
      "reasoning": "With ${analysis.totalRainfall}mm rainfall and ${analysis.averageTemperature}°C, this crop...",
      "benefits": ["Weather-matched benefit"],
      "warnings": ["Weather risk if applicable"]
    }
  ],
  "generalAdvice": "Key tip for ${analysis.totalRainfall}mm rainfall"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ [CropService] Gemini AI responded in ${Date.now() - aiStartTime}ms`);
      console.log('📄 [CropService] Raw AI response length:', text.length);
      
      // Extract JSON from the response - handle markdown code blocks
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      // Find JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('🔍 [CropService] Parsing JSON response...');
        const jsonData = JSON.parse(jsonMatch[0]);
        
        const result = {
          locationName,
          weatherSummary: jsonData.weatherSummary,
          recommendations: jsonData.recommendations,
          generalAdvice: jsonData.generalAdvice,
        };
        
        // Cache the result
        setCachedRecommendations(locationName, result);
        
        console.log(`✨ [CropService] Successfully generated ${result.recommendations.length} crop recommendations in ${Date.now() - startTime}ms`);
        console.log('🌾 [CropService] Recommended crops:', result.recommendations.map((r: any) => r.crop.name).join(', '));
        
        return result;
      }
      
      throw new Error('Unable to parse AI response - no valid JSON found');
    } catch (error) {
      console.error('❌ [CropService] Error getting crop recommendations:', error);
      console.error('⏱️ [CropService] Failed after', Date.now() - startTime, 'ms');
      throw error;
    } finally {
      // Remove from ongoing requests
      ongoingRequests.delete(cacheKey);
    }
  })();
  
  // Store the ongoing request
  ongoingRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
};

/**
 * Prefetch crop recommendations in the background (doesn't throw errors)
 */
export const prefetchCropRecommendations = async (
  weatherData: WeatherData,
  locationName: string
): Promise<void> => {
  console.log('🚀 [CropService] Prefetching recommendations for', locationName);
  
  try {
    await getCropRecommendations(weatherData, locationName, true);
  } catch (error) {
    console.warn('⚠️ [CropService] Prefetch failed (non-critical):', error);
    // Silently fail - prefetch is optional
  }
};

/**
 * Get detailed information about a specific crop using AI
 */
export const getCropDetails = async (cropName: string, weatherData?: WeatherData): Promise<Crop> => {
  try {
    const model = geminiModels.text;
    
    let weatherContext = '';
    if (weatherData) {
      const analysis = analyzeWeatherData(weatherData);
      weatherContext = `
      
Current weather conditions:
- Temperature: ${analysis.averageTemperature}°C
- Rainfall: ${analysis.totalRainfall}mm

Provide tips specific to these weather conditions.`;
    }

    const prompt = `You are an expert agricultural advisor. Provide comprehensive information about growing ${cropName}.${weatherContext}

Provide the information in the following JSON format:

{
  "id": "unique-id",
  "name": "${cropName}",
  "scientificName": "Scientific name",
  "category": "Vegetable/Grain/Fruit/Legume",
  "description": "Detailed description of the crop and its uses",
  "icon": "🌽 (relevant emoji)",
  "optimalTemperature": {
    "min": 15,
    "max": 30,
    "unit": "°C"
  },
  "waterRequirement": "Low/Medium/High",
  "growingSeasonDays": 90,
  "sunlightRequirement": "Full Sun/Partial Shade/Shade",
  "soilType": ["Loamy", "Sandy", "Clay"],
  "plantingDepth": "2-3 cm",
  "spacing": "30cm between plants, 60cm between rows",
  "plantingTime": "Best planting season/months",
  "careInstructions": ["Detailed instruction 1", "Detailed instruction 2", "Detailed instruction 3", "Detailed instruction 4"],
  "commonPests": ["pest1", "pest2", "pest3"],
  "commonDiseases": ["disease1", "disease2", "disease3"],
  "harvestTime": "Detailed harvest timing and signs",
  "harvestYield": "Expected yield per hectare or area",
  "storageInstructions": "Detailed storage and preservation methods",
  "tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"]
}

Make it practical and specific for small-scale farmers.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Unable to parse AI response');
  } catch (error) {
    console.error('Error getting crop details:', error);
    throw error;
  }
};

export const saveCropRecommendation = async (crop: Crop): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = getFirestore();
  const userDocRef = doc(db, 'users', user.uid);

  console.log(`💾 [CropService] Saving crop recommendation for user ${user.uid}...`);
  
  await updateDoc(userDocRef, {
    savedCrops: arrayUnion(crop)
  }).catch(async (error) => {
    if (error.code === 'not-found') {
      await setDoc(userDocRef, { savedCrops: [crop] });
    } else {
      throw error;
    }
  });
  console.log(`✅ [CropService] Crop recommendation saved successfully.`);
};

export const getSavedCropRecommendations = async (): Promise<Crop[]> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = getFirestore();
  const userDocRef = doc(db, 'users', user.uid);

  console.log(`📂 [CropService] Fetching saved crop recommendations for user ${user.uid}...`);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists() && docSnap.data().savedCrops) {
    console.log(`✅ [CropService] Found ${docSnap.data().savedCrops.length} saved crops.`);
    return docSnap.data().savedCrops as Crop[];
  } else {
    console.log(`ℹ️ [CropService] No saved crops found for this user.`);
    return [];
  }
};
