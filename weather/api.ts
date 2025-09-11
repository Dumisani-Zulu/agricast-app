import { fetchWeatherApi } from 'openmeteo';

export interface WeatherParams {
  latitude: number;
  longitude: number;
  past_days?: number;
  forecast_days?: number;
}

export interface HourlyWeatherData {
  time: Date[];
  temperature_2m: Float32Array;
  rain: Float32Array;
  precipitation_probability: Float32Array;
  precipitation: Float32Array;
  wind_speed_10m: Float32Array;
  uv_index: Float32Array;
}

export interface WeatherData {
  hourly: HourlyWeatherData;
}

export interface LocationResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Default set of hourly variables we want to request.
const HOURLY_VARS = [
  'temperature_2m',
  'rain',
  'precipitation_probability',
  'precipitation',
  'wind_speed_10m',
  'uv_index',
] as const;

// Geocoding function to convert city names to coordinates
export const searchLocations = async (query: string): Promise<LocationResult[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search locations');
    }
    
    const data = await response.json();
    
    if (!data.results) return [];
    
    return data.results.map((result: any) => ({
      name: result.name,
      country: result.country || '',
      latitude: result.latitude,
      longitude: result.longitude,
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};

// Get coordinates for specific city names (fallback for common cities)
export const getCityCoordinates = (cityName: string): { latitude: number; longitude: number } | null => {
  const cities: Record<string, { latitude: number; longitude: number }> = {
    'lusaka': { latitude: -15.4067, longitude: 28.2871 },
    'london': { latitude: 51.5074, longitude: -0.1278 },
    'new york': { latitude: 40.7128, longitude: -74.0060 },
    'paris': { latitude: 48.8566, longitude: 2.3522 },
    'tokyo': { latitude: 35.6762, longitude: 139.6503 },
    'sydney': { latitude: -33.8688, longitude: 151.2093 },
    'cape town': { latitude: -33.9249, longitude: 18.4241 },
    'nairobi': { latitude: -1.2921, longitude: 36.8219 },
    'lagos': { latitude: 6.5244, longitude: 3.3792 },
    'cairo': { latitude: 30.0444, longitude: 31.2357 },
    'mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'beijing': { latitude: 39.9042, longitude: 116.4074 },
  };
  
  return cities[cityName.toLowerCase()] || null;
};

export const fetchWeather = async ({ latitude, longitude, past_days = 0, forecast_days = 16 }: WeatherParams): Promise<WeatherData> => {
  const params: Record<string, any> = {
    latitude,
    longitude,
    hourly: HOURLY_VARS,
    models: 'best_match',
    past_days,
    forecast_days,
  };
  const url = 'https://api.open-meteo.com/v1/forecast';
  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const hourly = response.hourly();

  if (!hourly) throw new Error('No hourly data in weather response');

  const interval = hourly.interval();
  const start = Number(hourly.time());
  const end = Number(hourly.timeEnd());
  const time: Date[] = [];
  for (let t = start; t < end; t += interval) {
    time.push(new Date((t + utcOffsetSeconds) * 1000));
  }

  const data: WeatherData = {
    hourly: {
      time,
  temperature_2m: (hourly.variables(0)?.valuesArray()) || new Float32Array(),
  rain: (hourly.variables(1)?.valuesArray()) || new Float32Array(),
  precipitation_probability: (hourly.variables(2)?.valuesArray()) || new Float32Array(),
  precipitation: (hourly.variables(3)?.valuesArray()) || new Float32Array(),
  wind_speed_10m: (hourly.variables(4)?.valuesArray()) || new Float32Array(),
  uv_index: (hourly.variables(5)?.valuesArray()) || new Float32Array(),
    },
  };

  return data;
};
