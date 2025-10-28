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
  
  // Determine general conditions
  let conditions = 'Moderate';
  if (avgTemp > 30) conditions = 'Hot and Dry';
  else if (avgTemp > 25) conditions = 'Warm';
  else if (avgTemp > 15) conditions = 'Mild';
  else conditions = 'Cool';
  
  if (totalRain > 50) conditions += ', Rainy';
  else if (totalRain > 20) conditions += ', Moderate Rain';
  else conditions += ', Low Rain';
  
  const analysis = {
    averageTemperature: Math.round(avgTemp * 10) / 10,
    totalRainfall: Math.round(totalRain * 10) / 10,
    uvIndex: Math.round(maxUV * 10) / 10,
    windSpeed: Math.round(avgWind * 10) / 10,
    conditions,
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

      // Optimized prompt - more concise, focused on Zambian crops
      const prompt = `You are an expert-level agricultural advisor and agronomist specializing in Zambian agriculture. Your task is to provide highly accurate and actionable crop recommendations for a farmer in ${locationName}.

**Farmer's Context:**
- **Location:** ${locationName}, Zambia
- **Weather Forecast (Next 14 Days):**
  - Average Temperature: ${analysis.averageTemperature}°C
  - Total Rainfall: ${analysis.totalRainfall}mm
  - General Conditions: ${analysis.conditions}

**Your Goal:**
Analyze the provided weather data and recommend **6 diverse and suitable crops**. Your recommendations must be practical for a Zambian farmer.

**CRITICAL INSTRUCTIONS:**
1.  **Expert Analysis:** Don't just list crops. Deeply analyze the interplay between temperature, rainfall, and conditions. For example, high rainfall and high temperature might increase fungal disease risk.
2.  **Crop Diversity:** Recommend a mix of crop types: staple foods (like maize), cash crops (like cotton or tobacco, if suitable), legumes (for soil health), and vegetables. Include at least one drought-tolerant option if conditions are dry.
3.  **Justify Everything:** Your reasoning for each crop is the most important part. Clearly explain *why* a crop is suitable based on the specific weather data.
4.  **Actionable Advice:** Provide practical, concise advice a farmer can act on immediately.
5.  **Strict JSON Output:** You MUST return ONLY a single, valid JSON object. Do not include any text, explanations, or markdown formatting before or after the JSON block.

**JSON STRUCTURE:**
{
  "weatherSummary": "A 2-sentence expert summary of the upcoming weather's implications for farming.",
  "recommendations": [
    {
      "crop": {
        "id": "crop-name-lowercase-with-hyphens",
        "name": "Crop Name",
        "scientificName": "Scientific Name",
        "category": "Grain/Vegetable/Legume/Root Crop/Cash Crop",
        "description": "A 1-2 sentence description of the crop and its relevance in Zambia.",
        "icon": "🌽",
        "optimalTemperature": {"min": 15, "max": 30, "unit": "°C"},
        "waterRequirement": "Low/Medium/High",
        "growingSeasonDays": 90,
        "sunlightRequirement": "Full Sun/Partial Shade",
        "soilType": ["Loamy", "Well-drained"],
        "plantingDepth": "e.g., 2-5cm",
        "spacing": "e.g., 25cm x 75cm",
        "plantingTime": "Optimal planting window for the region.",
        "careInstructions": ["Key care instruction 1", "Key care instruction 2", "Key care instruction 3"],
        "commonPests": ["Pest 1", "Pest 2"],
        "commonDiseases": ["Disease 1", "Disease 2"],
        "harvestTime": "e.g., 90-120 days after planting",
        "harvestYield": "e.g., 3-5 tonnes/hectare",
        "storageInstructions": "Brief storage advice."
      },
      "suitabilityScore": 90,
      "reasoning": "Detailed reasoning (2-3 sentences) directly linking the crop's needs to the provided weather data (temp, rain).",
      "benefits": ["Primary benefit (e.g., High market demand)", "Secondary benefit (e.g., Improves soil nitrogen)"],
      "warnings": ["A potential risk based on the forecast (e.g., 'High humidity may increase risk of blight.')"]
    }
  ],
  "generalAdvice": "A critical farming tip for the upcoming 14 days based on the weather summary."
}

**Crops to consider (focus on what's suitable):** Maize, Groundnuts, Beans, Sunflower, Sweet Potato, Cassava, Tobacco, Cotton, Sorghum, Millet, Tomatoes, Rape, Cabbage, Onions.

Begin your analysis now and return only the JSON.`;

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
