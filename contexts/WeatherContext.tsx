import { createContext, useContext, useCallback, useEffect, useState, FC, ReactNode } from 'react';
import * as Location from 'expo-location';
import { fetchWeather, WeatherData, getCityCoordinates } from '../weather/api';
import { prefetchCropRecommendations } from '../services/cropService';

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
    const defaultCoords = getCityCoordinates(defaultLocation);
    if (defaultCoords) return defaultCoords;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return getCityCoordinates('lusaka') || { latitude: -15.4067, longitude: 28.2871 };
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  }, [defaultLocation]);

  const load = useCallback(async () => {
    console.log('🌦️ [WeatherProvider] Loading weather for', defaultLocation);
    setState(s => ({ ...s, loading: true, isReady: false, error: undefined }));
    try {
      const coords = await getLocation();
      const data = await fetchWeather({ latitude: coords.latitude, longitude: coords.longitude, past_days: 14, forecast_days: 16 });
      console.log('✅ [WeatherProvider] Weather loaded for', defaultLocation);

      console.log('🌾 [WeatherProvider] Prefetching crop recommendations...');
      await prefetchCropRecommendations(data, defaultLocation);
      console.log('✅ [WeatherProvider] Prefetch complete. System is ready.');

      setState({ loading: false, data, coords, locationName: defaultLocation, isReady: true });
    } catch (e: any) {
      console.error('❌ [WeatherProvider] Failed to load weather:', e.message);
      setState(s => ({ ...s, loading: false, error: e.message || 'Failed to load weather', isReady: false }));
    }
  }, [getLocation, defaultLocation]);

  const loadForLocation = useCallback(async (coords: { latitude: number; longitude: number }, locationName: string) => {
    console.log('🌦️ [WeatherProvider] Loading weather for new location:', locationName);
    setState(s => ({ ...s, loading: true, isReady: false, error: undefined, locationName }));
    try {
      const data = await fetchWeather({ latitude: coords.latitude, longitude: coords.longitude, past_days: 14, forecast_days: 16 });
      console.log('✅ [WeatherProvider] Weather loaded for', locationName);

      console.log('🌾 [WeatherProvider] Prefetching crop recommendations for', locationName);
      await prefetchCropRecommendations(data, locationName);
      console.log('✅ [WeatherProvider] Prefetch complete for new location. System is ready.');

      setState({ loading: false, data, coords, locationName, isReady: true });
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
