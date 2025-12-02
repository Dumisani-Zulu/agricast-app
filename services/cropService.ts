import { geminiModels } from '../config/gemini';
import { WeatherData } from '../weather/api';
import { CropRecommendationResponse, WeatherAnalysis, Crop } from '../types/crop';
import { getCachedRecommendations, setCachedRecommendations } from './cropCache';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  getOfflineSavedCrops,
  setOfflineSavedCrops,
  addCropToOfflineStorage,
  deleteCropFromOfflineStorage,
  clearOfflineSavedCrops,
  getPendingSyncs,
  clearPendingSyncs,
  setLastSyncTime,
  isOnline,
  isSyncNeeded,
} from './offlineStorage';

// Track ongoing requests to prevent duplicates
const ongoingRequests: Map<string, Promise<CropRecommendationResponse>> = new Map();

/**
 * Get fast basic recommendations based on weather analysis
 * Returns immediately without AI call for instant display
 */
const getQuickRecommendations = (
  analysis: WeatherAnalysis,
  locationName: string
): CropRecommendationResponse => {
  console.log('⚡ [CropService] Generating quick recommendations...');
  
  // Determine suitable crops based on rainfall and temperature
  const { totalRainfall, averageTemperature, seasonType } = analysis;
  
  interface QuickCrop {
    name: string;
    id: string;
    icon: string;
    scientificName: string;
    category: string;
    score: number;
    waterReq: string;
    tempMin: number;
    tempMax: number;
  }
  
  const cropDatabase: QuickCrop[] = [
    // High water crops
    { name: 'Maize', id: 'maize', icon: '🌽', scientificName: 'Zea mays', category: 'Grain', score: 85, waterReq: 'Medium', tempMin: 18, tempMax: 32 },
    { name: 'Rice', id: 'rice', icon: '🌾', scientificName: 'Oryza sativa', category: 'Grain', score: 80, waterReq: 'High', tempMin: 20, tempMax: 35 },
    { name: 'Beans', id: 'beans', icon: '🫘', scientificName: 'Phaseolus vulgaris', category: 'Legume', score: 82, waterReq: 'Medium', tempMin: 15, tempMax: 30 },
    { name: 'Groundnuts', id: 'groundnuts', icon: '🥜', scientificName: 'Arachis hypogaea', category: 'Legume', score: 83, waterReq: 'Low', tempMin: 20, tempMax: 30 },
    
    // Drought-tolerant crops
    { name: 'Cassava', id: 'cassava', icon: '🌿', scientificName: 'Manihot esculenta', category: 'Root Crop', score: 88, waterReq: 'Low', tempMin: 18, tempMax: 35 },
    { name: 'Sweet Potato', id: 'sweet-potato', icon: '🍠', scientificName: 'Ipomoea batatas', category: 'Root Crop', score: 86, waterReq: 'Low', tempMin: 18, tempMax: 32 },
    { name: 'Millet', id: 'millet', icon: '🌾', scientificName: 'Pennisetum glaucum', category: 'Grain', score: 84, waterReq: 'Low', tempMin: 22, tempMax: 35 },
    { name: 'Sorghum', id: 'sorghum', icon: '🌾', scientificName: 'Sorghum bicolor', category: 'Grain', score: 85, waterReq: 'Low', tempMin: 20, tempMax: 35 },
    
    // Vegetables
    { name: 'Tomatoes', id: 'tomatoes', icon: '🍅', scientificName: 'Solanum lycopersicum', category: 'Vegetable', score: 80, waterReq: 'Medium', tempMin: 18, tempMax: 28 },
    { name: 'Cabbage', id: 'cabbage', icon: '🥬', scientificName: 'Brassica oleracea', category: 'Vegetable', score: 78, waterReq: 'Medium', tempMin: 12, tempMax: 25 },
    { name: 'Onions', id: 'onions', icon: '🧅', scientificName: 'Allium cepa', category: 'Vegetable', score: 79, waterReq: 'Medium', tempMin: 15, tempMax: 28 },
    { name: 'Rape', id: 'rape', icon: '🥬', scientificName: 'Brassica napus', category: 'Vegetable', score: 77, waterReq: 'Medium', tempMin: 10, tempMax: 25 },
  ];
  
  // Filter crops based on weather
  const suitableCrops = cropDatabase.filter(crop => {
    // Temperature check
    if (averageTemperature < crop.tempMin || averageTemperature > crop.tempMax) return false;
    
    // Water requirement check
    if (totalRainfall > 70 && crop.waterReq === 'Low') return false;
    if (totalRainfall < 20 && crop.waterReq === 'High') return false;
    if (totalRainfall < 40 && crop.waterReq === 'High') return false;
    
    return true;
  });
  
  // Sort by score and take top 6
  const topCrops = suitableCrops.sort((a, b) => b.score - a.score).slice(0, 6);
  
  const weatherSummary = totalRainfall > 50 
    ? `Current conditions show ${totalRainfall}mm rainfall with ${averageTemperature}°C temperature - favorable for wet-season crops. ${seasonType === 'WET_SEASON' ? 'Rainy season is ideal for maize, beans, and vegetables.' : 'Moderate rainfall supports diverse crop selection.'}`
    : `Dry conditions with ${totalRainfall}mm rainfall and ${averageTemperature}°C temperature. Focus on drought-resistant crops like cassava, millet, and sorghum for best results.`;
  
  const recommendations = topCrops.map(crop => ({
    crop: {
      id: crop.id,
      name: crop.name,
      scientificName: crop.scientificName,
      category: crop.category,
      description: `Well-suited for current ${totalRainfall}mm rainfall conditions`,
      icon: crop.icon,
      optimalTemperature: { min: crop.tempMin, max: crop.tempMax, unit: '°C' as const },
      waterRequirement: crop.waterReq as 'Low' | 'Medium' | 'High',
      growingSeasonDays: 90,
      sunlightRequirement: 'Full Sun' as const,
      soilType: ['Loamy', 'Well-drained'],
      plantingDepth: '2-5cm',
      spacing: '30cm x 60cm',
      plantingTime: totalRainfall > 40 ? 'Rainy season' : 'With irrigation or at start of rains',
      careInstructions: [`Water requirement: ${crop.waterReq}`, 'Regular weeding', 'Monitor for pests'],
      commonPests: ['Aphids', 'Caterpillars'],
      commonDiseases: ['Leaf spot', 'Root rot'],
      harvestTime: '90-120 days after planting',
      harvestYield: '2-4 tonnes/hectare',
      storageInstructions: 'Store in cool, dry place',
    },
    suitabilityScore: crop.score,
    reasoning: `With ${totalRainfall}mm rainfall and ${averageTemperature}°C temperature, this ${crop.waterReq.toLowerCase()}-water crop is well-suited to current conditions.`,
    benefits: [`Suited to ${crop.waterReq.toLowerCase()} water availability`, 'Matches temperature range'],
    warnings: totalRainfall < 30 && crop.waterReq !== 'Low' ? ['May require supplemental irrigation'] : [],
  }));
  
  return {
    locationName,
    weatherSummary,
    recommendations,
    generalAdvice: totalRainfall > 40 
      ? 'Take advantage of rainfall for planting water-responsive crops. Ensure good drainage.'
      : 'Focus on drought-resistant varieties. Consider irrigation for optimal yields.',
  };
};

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
 * With caching, deduplication, and quick fallback
 */
export const getCropRecommendations = async (
  weatherData: WeatherData,
  locationName: string,
  useCache: boolean = true,
  useQuickFallback: boolean = false // New parameter for instant recommendations
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
  
  // If quick fallback requested, return instant recommendations
  if (useQuickFallback) {
    const analysis = analyzeWeatherData(weatherData);
    const quickRecs = getQuickRecommendations(analysis, locationName);
    console.log('⚡ [CropService] Returning quick recommendations (instant)');
    return quickRecs;
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
      
      // Extract JSON from the response - handle markdown code blocks and various formats
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present (various formats)
      jsonText = jsonText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      
      // Try multiple strategies to extract JSON
      let jsonData = null;
      
      // Strategy 1: Try parsing the whole text as JSON
      try {
        jsonData = JSON.parse(jsonText);
        console.log('🔍 [CropService] Parsed JSON directly');
      } catch (e) {
        // Strategy 2: Find JSON object using regex
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            jsonData = JSON.parse(jsonMatch[0]);
            console.log('🔍 [CropService] Parsed JSON via regex match');
          } catch (e2) {
            // Strategy 3: Try to fix common JSON issues
            let fixedJson = jsonMatch[0]
              .replace(/,\s*}/g, '}')  // Remove trailing commas before }
              .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
              .replace(/'/g, '"')       // Replace single quotes with double quotes
              .replace(/(\w+):/g, '"$1":') // Add quotes to unquoted keys
              .replace(/""(\w+)":/g, '"$1":'); // Fix double-quoted keys
            
            try {
              jsonData = JSON.parse(fixedJson);
              console.log('🔍 [CropService] Parsed JSON after fixing common issues');
            } catch (e3) {
              console.error('❌ [CropService] JSON parsing failed after all strategies');
              console.error('📄 [CropService] Raw response:', text.substring(0, 500));
            }
          }
        }
      }
      
      if (jsonData && jsonData.recommendations) {
        const result = {
          locationName,
          weatherSummary: jsonData.weatherSummary || `Weather analysis for ${locationName}`,
          recommendations: jsonData.recommendations,
          generalAdvice: jsonData.generalAdvice || 'Follow local agricultural best practices.',
        };
        
        // Cache the result
        setCachedRecommendations(locationName, result);
        
        console.log(`✨ [CropService] Successfully generated ${result.recommendations.length} crop recommendations in ${Date.now() - startTime}ms`);
        console.log('🌾 [CropService] Recommended crops:', result.recommendations.map((r: any) => r.crop?.name || r.name).join(', '));
        
        return result;
      }
      
      // If AI parsing failed, fall back to quick recommendations
      console.warn('⚠️ [CropService] AI parsing failed, using quick fallback');
      const quickRecs = getQuickRecommendations(analysis, locationName);
      setCachedRecommendations(locationName, quickRecs);
      return quickRecs;
    } catch (error) {
      console.error('❌ [CropService] Error getting crop recommendations:', error);
      console.error('⏱️ [CropService] Failed after', Date.now() - startTime, 'ms');
      
      // Fall back to quick recommendations instead of throwing
      console.warn('⚠️ [CropService] Using quick fallback due to error');
      try {
        const analysis = analyzeWeatherData(weatherData);
        const quickRecs = getQuickRecommendations(analysis, locationName);
        setCachedRecommendations(locationName, quickRecs);
        return quickRecs;
      } catch (fallbackError) {
        console.error('❌ [CropService] Quick fallback also failed:', fallbackError);
        throw error; // Throw original error if fallback fails
      }
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

export const saveCropRecommendation = async (crop: Crop): Promise<{ success: boolean; message: string }> => {
  // Always save to offline storage first
  const offlineResult = await addCropToOfflineStorage(crop);
  if (!offlineResult.success) {
    return offlineResult; // Already saved (duplicate)
  }

  // Try to sync with Firebase if online and authenticated
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user && await isOnline()) {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);

      console.log(`💾 [CropService] Syncing crop to Firebase for user ${user.uid}...`);
      
      await updateDoc(userDocRef, {
        savedCrops: arrayUnion(crop)
      }).catch(async (error) => {
        if (error.code === 'not-found') {
          await setDoc(userDocRef, { savedCrops: [crop] });
        } else {
          throw error;
        }
      });
      
      console.log(`✅ [CropService] Crop synced to Firebase successfully.`);
      await setLastSyncTime();
    } catch (error) {
      console.warn('⚠️ [CropService] Firebase sync failed, will retry later:', error);
      // Crop is already saved offline, so return success
    }
  } else {
    console.log('📱 [CropService] Saved offline (will sync when online)');
  }
  
  return { success: true, message: 'Crop saved successfully!' };
};

export const getSavedCropRecommendations = async (): Promise<Crop[]> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  // Get offline crops first (always available)
  const offlineCrops = await getOfflineSavedCrops();
  
  // If not authenticated or offline, return offline data
  if (!user || !(await isOnline())) {
    console.log(`📱 [CropService] Returning ${offlineCrops.length} offline saved crops`);
    return offlineCrops;
  }
  
  // Check if sync is needed
  const needsSync = await isSyncNeeded();
  
  if (needsSync) {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);

      console.log(`📂 [CropService] Fetching saved crops from Firebase for user ${user.uid}...`);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists() && docSnap.data().savedCrops) {
        const firebaseCrops = docSnap.data().savedCrops as Crop[];
        console.log(`✅ [CropService] Found ${firebaseCrops.length} crops in Firebase.`);
        
        // Merge offline and Firebase crops (deduplicate)
        const mergedCrops = mergeCrops(offlineCrops, firebaseCrops);
        
        // Update offline storage with merged data
        await setOfflineSavedCrops(mergedCrops);
        
        // Process any pending sync operations
        await processPendingSyncs();
        
        await setLastSyncTime();
        return mergedCrops;
      }
    } catch (error) {
      console.warn('⚠️ [CropService] Firebase fetch failed, returning offline data:', error);
    }
  }
  
  return offlineCrops;
};

/**
 * Merge offline and Firebase crops, removing duplicates
 */
const mergeCrops = (offlineCrops: Crop[], firebaseCrops: Crop[]): Crop[] => {
  const cropMap = new Map<string, Crop>();
  
  // Add Firebase crops first
  for (const crop of firebaseCrops) {
    const key = crop.id || crop.name.toLowerCase();
    cropMap.set(key, crop);
  }
  
  // Add/overwrite with offline crops (they may be newer)
  for (const crop of offlineCrops) {
    const key = crop.id || crop.name.toLowerCase();
    cropMap.set(key, crop);
  }
  
  return Array.from(cropMap.values());
};

/**
 * Process pending sync operations
 */
const processPendingSyncs = async (): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user || !(await isOnline())) return;
  
  const pendingSyncs = await getPendingSyncs();
  if (pendingSyncs.length === 0) return;
  
  console.log(`🔄 [CropService] Processing ${pendingSyncs.length} pending syncs...`);
  
  const db = getFirestore();
  const userDocRef = doc(db, 'users', user.uid);
  
  try {
    // Get current Firebase state
    const docSnap = await getDoc(userDocRef);
    let firebaseCrops: Crop[] = [];
    if (docSnap.exists() && docSnap.data().savedCrops) {
      firebaseCrops = docSnap.data().savedCrops as Crop[];
    }
    
    // Apply pending operations
    for (const sync of pendingSyncs) {
      if (sync.type === 'add' && sync.crop) {
        const exists = firebaseCrops.some(c => c.id === sync.crop!.id || c.name === sync.crop!.name);
        if (!exists) {
          firebaseCrops.push(sync.crop);
        }
      } else if (sync.type === 'delete' && sync.cropId) {
        firebaseCrops = firebaseCrops.filter(c => c.id !== sync.cropId && c.name !== sync.cropId);
      } else if (sync.type === 'clear') {
        firebaseCrops = [];
      }
    }
    
    // Save updated crops to Firebase
    await setDoc(userDocRef, { savedCrops: firebaseCrops }, { merge: true });
    
    // Clear pending syncs
    await clearPendingSyncs();
    
    console.log(`✅ [CropService] Pending syncs processed successfully`);
  } catch (error) {
    console.error('❌ [CropService] Error processing pending syncs:', error);
  }
};

// Delete a saved crop recommendation
export const deleteSavedCropRecommendation = async (cropId: string): Promise<void> => {
  // Delete from offline storage first
  await deleteCropFromOfflineStorage(cropId);
  
  // Try to sync with Firebase if online
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user && await isOnline()) {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);

      console.log(`🗑️ [CropService] Syncing deletion to Firebase for ${cropId}...`);
      
      // Get current saved crops from Firebase
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists() && docSnap.data().savedCrops) {
        const existingCrops = docSnap.data().savedCrops as Crop[];
        const filteredCrops = existingCrops.filter(crop => crop.id !== cropId && crop.name !== cropId);
        await setDoc(userDocRef, { savedCrops: filteredCrops }, { merge: true });
      }
      
      console.log(`✅ [CropService] Deletion synced to Firebase successfully.`);
    } catch (error) {
      console.warn('⚠️ [CropService] Firebase deletion sync failed:', error);
      // Deletion is already saved offline with pending sync
    }
  } else {
    console.log('📱 [CropService] Deleted offline (will sync when online)');
  }
};

// Clear all saved crop recommendations
export const clearAllSavedCropRecommendations = async (): Promise<void> => {
  // Clear offline storage first
  await clearOfflineSavedCrops();
  
  // Try to sync with Firebase if online
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user && await isOnline()) {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);

      console.log(`🗑️ [CropService] Syncing clear all to Firebase...`);
      await setDoc(userDocRef, { savedCrops: [] }, { merge: true });
      console.log(`✅ [CropService] Clear all synced to Firebase successfully.`);
    } catch (error) {
      console.warn('⚠️ [CropService] Firebase clear sync failed:', error);
      // Clear is already saved offline with pending sync
    }
  } else {
    console.log('📱 [CropService] Cleared offline (will sync when online)');
  }
};

/**
 * Force sync with Firebase (call when app comes online)
 */
export const syncSavedCropsWithFirebase = async (): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user || !(await isOnline())) {
    console.log('⏭️ [CropService] Skipping sync - offline or not authenticated');
    return;
  }
  
  console.log('🔄 [CropService] Starting Firebase sync...');
  
  try {
    // Process any pending syncs
    await processPendingSyncs();
    
    // Refresh from Firebase
    await getSavedCropRecommendations();
    
    console.log('✅ [CropService] Firebase sync completed');
  } catch (error) {
    console.error('❌ [CropService] Sync failed:', error);
  }
};
