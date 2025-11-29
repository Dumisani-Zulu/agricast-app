import { createContext, useContext, useCallback, useEffect, useState, FC, ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeather, WeatherData, getCityCoordinates } from '../weather/api';
import { prefetchCropRecommendations } from '../services/cropService';

const CACHED_LOCATION_KEY = '@agricast_cached_location';
const CACHED_WEATHER_KEY = '@agricast_cached_weather';

interface CachedLocation {
  latitude: number;
  longitude: number;
  locationName: string;
  timestamp: number;
}

export interface UseWeatherOptions {
  auto?: boolean;
  defaultLocation?: string;
}

interface WeatherState {
  loading: boolean;
  isReady: boolean;
  error?: string;
  data?: WeatherData;
  coords?: { latitude: number; longitude: number };
  locationName?: string;
  reload: () => Promise<void>;
  loadForLocation: (coords: { latitude: number; longitude: number }, locationName: string) => Promise<void>;
}

const WeatherContext = createContext<WeatherState | undefined>(undefined);

interface WeatherProviderProps {
  children: ReactNode;
  options?: UseWeatherOptions;
}

// Cache location for faster subsequent loads
const cacheLocation = async (latitude: number, longitude: number, locationName: string) => {
  try {
    const cached: CachedLocation = { latitude, longitude, locationName, timestamp: Date.now() };
    await AsyncStorage.setItem(CACHED_LOCATION_KEY, JSON.stringify(cached));
  } catch (e) {
    console.warn('Failed to cache location:', e);
  }
};

// Cache weather data for instant display on app restart
const cacheWeatherData = async (data: WeatherData, locationName: string) => {
  try {
    await AsyncStorage.setItem(CACHED_WEATHER_KEY, JSON.stringify({
      data,
      locationName,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to cache weather data:', e);
  }
};

// Get cached location (valid for 1 hour)
const getCachedLocation = async (): Promise<CachedLocation | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHED_LOCATION_KEY);
    if (cached) {
      const parsed: CachedLocation = JSON.parse(cached);
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp < oneHour) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to get cached location:', e);
  }
  return null;
};

// Get cached weather data (valid for 30 minutes)
const getCachedWeatherData = async (): Promise<{ data: WeatherData; locationName: string } | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHED_WEATHER_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const thirtyMinutes = 30 * 60 * 1000;
      if (Date.now() - parsed.timestamp < thirtyMinutes) {
        // Re-parse the time arrays as Date objects
        if (parsed.data?.hourly?.time) {
          parsed.data.hourly.time = parsed.data.hourly.time.map((t: string) => new Date(t));
        }
        return { data: parsed.data, locationName: parsed.locationName };
      }
    }
  } catch (e) {
    console.warn('Failed to get cached weather data:', e);
  }
  return null;
};

export const WeatherProvider: FC<WeatherProviderProps> = ({
  children,
  options = {},
}) => {
  const { auto = true, defaultLocation = 'Lusaka' } = options;
  const [state, setState] = useState<Omit<WeatherState, 'reload' | 'loadForLocation'>>({
    loading: !!auto,
    isReady: false,
  });

  const getLocation = useCallback(async () => {
    // First, try to use cached location for instant display
    const cachedLoc = await getCachedLocation();
    if (cachedLoc) {
      console.log('📍 [WeatherProvider] Using cached location:', cachedLoc.locationName);
      return { latitude: cachedLoc.latitude, longitude: cachedLoc.longitude };
    }

    // Try to get city coordinates from default location
    const defaultCoords = getCityCoordinates(defaultLocation);
    if (defaultCoords) {
      cacheLocation(defaultCoords.latitude, defaultCoords.longitude, defaultLocation);
      return defaultCoords;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      const fallback = getCityCoordinates('lusaka') || { latitude: -15.4067, longitude: 28.2871 };
      cacheLocation(fallback.latitude, fallback.longitude, 'Lusaka');
      return fallback;
    }

    // Use LOW accuracy for faster initial load, then update in background
    try {
      const loc = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Low,
        timeInterval: 5000,
        mayShowUserSettingsDialog: false,
      });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      cacheLocation(coords.latitude, coords.longitude, defaultLocation);
      return coords;
    } catch (e) {
      console.warn('Location fetch failed, trying last known location:', e);
      // Fallback to last known location
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        return { latitude: lastKnown.coords.latitude, longitude: lastKnown.coords.longitude };
      }
      // Ultimate fallback
      const fallback = getCityCoordinates('lusaka') || { latitude: -15.4067, longitude: 28.2871 };
      return fallback;
    }
  }, [defaultLocation]);

  const load = useCallback(async () => {
    console.log('🌦️ [WeatherProvider] Loading weather for', defaultLocation);
    
    // Try to show cached data immediately for instant display
    const cachedWeather = await getCachedWeatherData();
    if (cachedWeather) {
      console.log('⚡ [WeatherProvider] Showing cached weather data instantly');
      setState({ 
        loading: false, 
        data: cachedWeather.data, 
        locationName: cachedWeather.locationName, 
        isReady: true 
      });
    } else {
      setState(s => ({ ...s, loading: true, isReady: false, error: undefined }));
    }
    
    try {
      const coords = await getLocation();
      const data = await fetchWeather({ latitude: coords.latitude, longitude: coords.longitude, past_days: 14, forecast_days: 16 });
      console.log('✅ [WeatherProvider] Weather loaded for', defaultLocation);

      // Cache the weather data for next time
      cacheWeatherData(data, defaultLocation);

      // Set ready immediately after weather loads - don't block on crop prefetch
      setState({ loading: false, data, coords, locationName: defaultLocation, isReady: true });

      // Prefetch crops in background (non-blocking)
      console.log('🌾 [WeatherProvider] Prefetching crop recommendations in background...');
      prefetchCropRecommendations(data, defaultLocation)
        .then(() => console.log('✅ [WeatherProvider] Background prefetch complete.'))
        .catch((err) => console.warn('⚠️ [WeatherProvider] Background prefetch failed:', err.message));
    } catch (e: any) {
      console.error('❌ [WeatherProvider] Failed to load weather:', e.message);
      // Only show error if we don't have cached data
      if (!cachedWeather) {
        setState(s => ({ ...s, loading: false, error: e.message || 'Failed to load weather', isReady: false }));
      }
    }
  }, [getLocation, defaultLocation]);

  const loadForLocation = useCallback(async (coords: { latitude: number; longitude: number }, locationName: string) => {
    console.log('🌦️ [WeatherProvider] Loading weather for new location:', locationName);
    setState(s => ({ ...s, loading: true, isReady: false, error: undefined, locationName }));
    try {
      const data = await fetchWeather({ latitude: coords.latitude, longitude: coords.longitude, past_days: 14, forecast_days: 16 });
      console.log('✅ [WeatherProvider] Weather loaded for', locationName);

      // Cache both location and weather data
      cacheLocation(coords.latitude, coords.longitude, locationName);
      cacheWeatherData(data, locationName);

      // Set ready immediately after weather loads - don't block on crop prefetch
      setState({ loading: false, data, coords, locationName, isReady: true });

      // Prefetch crops in background (non-blocking)
      console.log('🌾 [WeatherProvider] Prefetching crop recommendations for', locationName, 'in background...');
      prefetchCropRecommendations(data, locationName)
        .then(() => console.log('✅ [WeatherProvider] Background prefetch complete for new location.'))
        .catch((err) => console.warn('⚠️ [WeatherProvider] Background prefetch failed:', err.message));
    } catch (e: any) {
      console.error('❌ [WeatherProvider] Failed to load weather:', e.message);
      setState(s => ({ ...s, loading: false, error: e.message || 'Failed to load weather', isReady: false }));
    }
  }, []);

  useEffect(() => {
    if (auto) load();
  }, [auto, load]);

  const value = {
    ...state,
    reload: load,
    loadForLocation,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export const useWeather = (): WeatherState => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
