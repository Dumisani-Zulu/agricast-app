import { geminiModels } from '../config/gemini';
import { WeatherData } from '../weather/api';
import { CropRecommendationResponse, WeatherAnalysis, Crop } from '../types/crop';
import { getCachedRecommendations, setCachedRecommendations } from './cropCache';

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
      const prompt = `You are an agricultural advisor for Zambian farmers. Based on weather forecast for ${locationName}, recommend 4 suitable crops.

Weather (Next 7 Days):
- Temp: ${analysis.averageTemperature}°C
- Rain: ${analysis.totalRainfall}mm
- Conditions: ${analysis.conditions}

IMPORTANT: Focus on crops commonly grown in Zambia (maize, groundnuts, beans, sunflower, sweet potato, cassava, tobacco, cotton, sorghum, millet, vegetables like tomatoes, rape, cabbage, onions).

Return ONLY valid JSON:
{
  "weatherSummary": "Brief weather summary (max 2 sentences)",
  "recommendations": [
    {
      "crop": {
        "id": "crop-name-lowercase",
        "name": "Crop Name",
        "scientificName": "Scientific name",
        "category": "Grain/Vegetable/Legume/Root Crop",
        "description": "1-2 sentence description",
        "icon": "🌽",
        "optimalTemperature": {"min": 15, "max": 30, "unit": "°C"},
        "waterRequirement": "Low/Medium/High",
        "growingSeasonDays": 90,
        "sunlightRequirement": "Full Sun",
        "soilType": ["Loamy"],
        "plantingDepth": "2-3cm",
        "spacing": "30cm x 60cm",
        "plantingTime": "Best season",
        "careInstructions": ["tip1", "tip2", "tip3"],
        "commonPests": ["pest1", "pest2"],
        "commonDiseases": ["disease1", "disease2"],
        "harvestTime": "When to harvest",
        "harvestYield": "Expected yield",
        "storageInstructions": "Storage method"
      },
      "suitabilityScore": 85,
      "reasoning": "Why suitable (1 sentence)",
      "benefits": ["benefit1", "benefit2"],
      "warnings": ["warning if any"]
    }
  ],
  "generalAdvice": "Farming tip for current conditions (1-2 sentences)"
}

Provide 4 diverse crops. Return ONLY the JSON, no markdown.`;

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
