# Crop Recommendation Feature

## Overview
The Crop Recommendation feature is the main functionality of the Agricast app. It analyzes current weather forecast data and uses Gemini AI to suggest the most suitable crops for farmers to plant in their location.

## How It Works

### 1. Weather Data Collection
- The app uses the Open-Meteo API to fetch 7-day weather forecasts
- Collects data on temperature, rainfall, wind speed, and UV index
- Automatically detects user's location or uses a default location (Lusaka)

### 2. Weather Analysis
The `cropService.ts` analyzes weather data to calculate:
- **Average Temperature**: Mean temperature over the next 7 days
- **Total Rainfall**: Cumulative precipitation expected
- **Wind Speed**: Average wind conditions
- **UV Index**: Maximum UV exposure
- **Weather Conditions**: Summary description (e.g., "Warm, Moderate Rain")

### 3. AI-Powered Recommendations
Gemini AI processes the weather analysis and provides:
- **4 Crop Recommendations** tailored to the weather conditions
- **Suitability Score** (0-100%) for each crop
- **Reasoning** explaining why each crop is recommended
- **Benefits** of planting each crop in current conditions
- **Warnings** about potential challenges

### 4. Detailed Crop Information
Each recommended crop includes comprehensive data:
- Scientific name and category
- Optimal growing conditions
- Planting instructions
- Care and maintenance tips
- Common pests and diseases
- Harvest information
- Storage guidelines

## Features

### Crops Screen
- **Weather-Based Recommendations**: Displays 4 AI-recommended crops
- **Weather Summary**: Overview of current forecast conditions
- **Crop Cards**: Interactive cards showing key information
- **Suitability Scores**: Visual indicators of how well each crop matches conditions
- **General Advice**: Context-specific farming tips
- **Pull-to-Refresh**: Update recommendations with latest weather data

### Crop Detail Screen
Comprehensive information for each crop including:
- **Growing Conditions**: Temperature, water, sunlight, soil requirements
- **Planting Guide**: When, how deep, spacing information
- **Care Instructions**: Step-by-step maintenance guide
- **Pest & Disease Info**: Common problems and how to identify them
- **Harvest Details**: When to harvest, expected yields, storage tips
- **Pro Tips**: Additional AI-generated farming wisdom

## Files Structure

```
services/
  ├── cropService.ts          # AI-powered crop recommendation logic
types/
  ├── crop.ts                 # TypeScript interfaces for crops
screens/
  ├── CropsScreen.tsx         # Main recommendations screen
  └── CropDetailScreen.tsx    # Detailed crop information
navigation/
  └── CropsNavigator.tsx      # Navigation stack for crops feature
```

## API Integration

### Gemini AI Model
- **Model**: `gemini-2.5-flash`
- **Purpose**: Generate intelligent crop recommendations based on weather
- **Features Used**:
  - Text generation for recommendations
  - JSON-formatted responses
  - Context-aware analysis

### Weather API
- **Provider**: Open-Meteo
- **Endpoints**: 
  - Forecast API for weather data
  - Geocoding API for location search
- **Data Points**: Temperature, precipitation, wind, UV index

## Usage Flow

1. **App Opens** → Detects location → Fetches weather data
2. **Weather Analysis** → Analyzes forecast for next 7 days
3. **AI Processing** → Gemini generates crop recommendations
4. **Display** → Shows 4 recommended crops with scores
5. **User Interaction** → Tap crop card to see full details
6. **Detail View** → Complete growing guide and information

## Key Benefits

### For Farmers
- **Data-Driven Decisions**: Recommendations based on actual weather forecasts
- **Risk Reduction**: Avoid crops unsuitable for current conditions
- **Increased Yields**: Plant crops optimized for the weather
- **Expert Guidance**: AI-powered agricultural advice
- **Local Relevance**: Considers regional climate patterns

### Technical Features
- **Real-time Updates**: Pull-to-refresh for latest data
- **Offline Fallback**: Cached recommendations when offline
- **Smart Caching**: Reduces API calls and improves performance
- **Error Handling**: Graceful degradation if APIs fail
- **Responsive UI**: Beautiful, intuitive interface

## Future Enhancements

### Planned Features
- [ ] Soil type integration with recommendations
- [ ] Historical crop performance data
- [ ] Seasonal calendar view
- [ ] Crop rotation suggestions
- [ ] Market price integration
- [ ] Community crop success sharing
- [ ] Multi-language support
- [ ] Offline AI model for basic recommendations
- [ ] Push notifications for optimal planting times
- [ ] Integration with satellite imagery

### Advanced AI Features
- [ ] Image-based soil analysis
- [ ] Pest prediction based on weather
- [ ] Yield forecasting
- [ ] Disease outbreak warnings
- [ ] Personalized farm planning

## Best Practices

### For Users
1. **Enable Location Services**: For accurate local weather data
2. **Check Regularly**: Weather changes, so do recommendations
3. **Read Full Details**: Don't just rely on the score
4. **Consider Local Knowledge**: Combine AI advice with traditional wisdom
5. **Plan Ahead**: Use forecast data to time your planting

### For Developers
1. **Cache Responses**: Reduce API costs and improve speed
2. **Handle Errors**: Always have fallback recommendations
3. **Test Regularly**: Weather APIs can change
4. **Monitor Usage**: Track Gemini API quota
5. **Update Prompts**: Refine AI prompts based on user feedback

## Troubleshooting

### No Recommendations Showing
- Check internet connection
- Verify Gemini API key is set
- Ensure location permissions are granted
- Try pull-to-refresh

### Inaccurate Recommendations
- Weather data might be for wrong location
- Check that location name is correct
- Try searching for a specific city

### Slow Loading
- Weather API might be slow
- Gemini AI can take 5-10 seconds
- This is normal, be patient

## Performance Metrics

### Target Performance
- Weather data fetch: < 2 seconds
- AI recommendations: < 10 seconds
- Screen navigation: < 500ms
- Total time to recommendations: < 15 seconds

### API Limits
- **Gemini AI**: 60 requests/minute (free tier)
- **Open-Meteo**: No strict limits
- **Recommended**: Cache for 6-12 hours

## Contributing

When adding new features:
1. Follow existing code patterns
2. Update TypeScript types
3. Add error handling
4. Test with various weather conditions
5. Update this documentation

---

**Note**: This feature requires active internet connection and valid Gemini API key. See `GEMINI_API_SETUP.md` for configuration instructions.
