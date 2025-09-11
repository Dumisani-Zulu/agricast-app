import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { fetchWeather, WeatherData, getCityCoordinates } from '../api';

export interface UseWeatherOptions {
  latitude?: number;
  longitude?: number;
  auto?: boolean; // if true will fetch immediately
  defaultLocation?: string; // default city name
}

interface WeatherState {
  loading: boolean;
  error?: string;
  data?: WeatherData;
  coords?: { latitude: number; longitude: number };
  locationName?: string;
}

export const useWeather = ({ latitude, longitude, auto = true, defaultLocation = 'Lusaka' }: UseWeatherOptions = {}) => {
  const [state, setState] = useState<WeatherState>({ loading: !!auto });

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
    setState(s => ({ ...s, loading: true, error: undefined }));
    try {
      const coords = await getLocation();
      const data = await fetchWeather({ latitude: coords.latitude, longitude: coords.longitude, past_days: 14, forecast_days: 16 });
      setState({ loading: false, data, coords, locationName: defaultLocation });
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e.message || 'Failed to load weather' }));
    }
  }, [getLocation, defaultLocation]);

  const loadForLocation = useCallback(async (coords: { latitude: number; longitude: number }, locationName: string) => {
    setState(s => ({ ...s, loading: true, error: undefined }));
    try {
      const data = await fetchWeather({ latitude: coords.latitude, longitude: coords.longitude, past_days: 14, forecast_days: 16 });
      setState({ loading: false, data, coords, locationName });
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e.message || 'Failed to load weather' }));
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
