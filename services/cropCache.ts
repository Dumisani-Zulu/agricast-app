import { CropRecommendationResponse } from '../types/crop';

// In-memory cache for crop recommendations
const cache: Map<string, { data: CropRecommendationResponse; timestamp: number }> = new Map();

// Cache duration: 30 minutes (reduced from 1 hour for more weather-responsive recommendations)
const CACHE_DURATION = 30 * 60 * 1000;

/**
 * Get cached recommendations for a location
 */
export const getCachedRecommendations = (locationName: string): CropRecommendationResponse | null => {
  const cached = cache.get(locationName);
  
  if (!cached) {
    console.log('💾 [CropCache] No cache found for', locationName);
    return null;
  }
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_DURATION) {
    console.log('⏰ [CropCache] Cache expired for', locationName, `(${Math.round(age / 60000)} minutes old)`);
    cache.delete(locationName);
    return null;
  }
  
  console.log('✅ [CropCache] Cache hit for', locationName, `(${Math.round(age / 60000)} minutes old)`);
  return cached.data;
};

/**
 * Save recommendations to cache
 */
export const setCachedRecommendations = (locationName: string, data: CropRecommendationResponse): void => {
  console.log('💾 [CropCache] Caching recommendations for', locationName);
  cache.set(locationName, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Clear cache for a specific location
 */
export const clearCacheForLocation = (locationName: string): void => {
  console.log('🗑️ [CropCache] Clearing cache for', locationName);
  cache.delete(locationName);
};

/**
 * Clear all cached recommendations
 */
export const clearAllCache = (): void => {
  console.log('🗑️ [CropCache] Clearing all cache');
  cache.clear();
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    size: cache.size,
    locations: Array.from(cache.keys()),
  };
};
