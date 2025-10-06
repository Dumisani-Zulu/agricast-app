import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { fetchWeather, WeatherData, getCityCoordinates } from '../api';
import { prefetchCropRecommendations } from '../../services/cropService';

export interface UseWeatherOptions {
  latitude?: number;
  longitude?: number;
  auto?: boolean; // if true will fetch immediately
  defaultLocation?: string; // default city name
}

interface WeatherState {
  loading: boolean;
  isReady: boolean; // New flag
  error?: string;
  data?: WeatherData;
  coords?: { latitude: number; longitude: number };
  locationName?: string;
}

export const useWeather = ({ latitude, longitude, auto = true, defaultLocation = 'Lusaka' }: UseWeatherOptions = {}) => {
  const [state, setState] = useState<WeatherState>({ loading: !!auto, isReady: false });

  const getLocation = useCallback(async () => {
    if (latitude != null && longitude != null) return { latitude, longitude };

    // Try to get coordinates for default location first
    const defaultCoords = getCityCoordinates(defaultLocation);
    if (defaultCoords) {
      return defaultCoords;
    }

    // Fall back to user's current location
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // If location permission denied, use Lusaka as ultimate fallback
      return getCityCoordinates('lusaka') || { latitude: -15.4067, longitude: 28.2871 };
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  }, [latitude, longitude, defaultLocation]);

  const load = useCallback(async () => {
    console.log('🌦️ [useWeather] Loading weather for', defaultLocation);
    setState(s => ({ ...s, loading: true, isReady: false, error: undefined }));
    try {
      const coords = await getLocation();
      console.log('📍 [useWeather] Coordinates:', coords);
      const data = await fetchWeather({ latitude: coords.latitude, longitude: coords.longitude, past_days: 14, forecast_days: 16 });
      console.log('✅ [useWeather] Weather loaded for', defaultLocation);
      
      // Prefetch crop recommendations in the background and wait for it
      console.log('🌾 [useWeather] Prefetching crop recommendations...');
      await prefetchCropRecommendations(data, defaultLocation);
      console.log('✅ [useWeather] Prefetch complete. System is ready.');

      setState({ loading: false, data, coords, locationName: defaultLocation, isReady: true });
      
    } catch (e: any) {
      console.error('❌ [useWeather] Failed to load weather:', e.message);
      setState(s => ({ ...s, loading: false, error: e.message || 'Failed to load weather', isReady: false }));
    }
  }, [getLocation, defaultLocation]);

  const loadForLocation = useCallback(async (coords: { latitude: number; longitude: number }, locationName: string) => {
    console.log('🌦️ [useWeather] Loading weather for new location:', locationName);
    setState(s => ({ ...s, loading: true, isReady: false, error: undefined }));
    try {
      const data = await fetchWeather({ latitude: coords.latitude, longitude: coords.longitude, past_days: 14, forecast_days: 16 });
      console.log('✅ [useWeather] Weather loaded for', locationName);
      
      // Prefetch crop recommendations in the background and wait for it
      console.log('🌾 [useWeather] Prefetching crop recommendations for', locationName);
      await prefetchCropRecommendations(data, locationName);
      console.log('✅ [useWeather] Prefetch complete for new location. System is ready.');

      setState({ loading: false, data, coords, locationName, isReady: true });
      
    } catch (e: any) {
      console.error('❌ [useWeather] Failed to load weather:', e.message);
      setState(s => ({ ...s, loading: false, error: e.message || 'Failed to load weather', isReady: false }));
    }
  }, []);

  useEffect(() => {
    if (auto) load();
  }, [auto, load]);

  return {
    ...state,
    reload: load,
    loadForLocation,
  };
};
