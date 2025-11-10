export interface Crop {
  id: string;
  name: string;
  scientificName: string;
  category: string; // e.g., "Vegetable", "Grain", "Fruit"
  description: string;
  icon: string; // emoji or icon name
  
  // Growing conditions
  optimalTemperature: {
    min: number;
    max: number;
    unit: string;
  };
  waterRequirement: 'Low' | 'Medium' | 'High';
  growingSeasonDays: number;
  sunlightRequirement: 'Full Sun' | 'Partial Shade' | 'Shade';
  soilType: string[];
  
  // Planting information
  plantingDepth: string;
  spacing: string;
  plantingTime: string;
  
  // Care instructions
  careInstructions: string[];
  commonPests: string[];
  commonDiseases: string[];
  
  // Harvest information
  harvestTime: string;
  harvestYield: string;
  storageInstructions: string;
  
  // AI recommendation data
  suitabilityScore?: number; // 0-100
  weatherMatch?: {
    temperature: boolean;
    rainfall: boolean;
    overall: string;
  };
  tips?: string[];
}

export interface WeatherAnalysis {
  averageTemperature: number;
  totalRainfall: number;
  averageHumidity?: number;
  uvIndex: number;
  windSpeed: number;
  conditions: string;
  seasonType?: string; // WET_SEASON, DRY_SEASON, MODERATE_WET, TRANSITION
}

export interface CropRecommendation {
  crop: Crop;
  suitabilityScore: number;
  reasoning: string;
  warnings?: string[];
  benefits: string[];
}

export interface CropRecommendationResponse {
  locationName: string;
  weatherSummary: string;
  recommendations: CropRecommendation[];
  generalAdvice: string;
}
