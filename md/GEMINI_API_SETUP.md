# Gemini AI API Integration Guide

## Overview
This document explains how to set up and configure the Gemini AI API for the Agricast app.

## What is Gemini AI?
Gemini is Google's advanced AI model that can analyze images and generate intelligent text responses. In the Agricast app, it powers:
- **Crop Disease Identification**: Analyze plant images to detect diseases
- **Pest Identification**: Identify pests and get treatment recommendations
- **Soil Health Analysis**: Get intelligent recommendations based on soil test data
- **Agricultural Advice**: Ask questions and get expert farming guidance

## Getting Your API Key

### Step 1: Visit Google AI Studio
Go to: https://aistudio.google.com/app/apikey

### Step 2: Sign in
Sign in with your Google account

### Step 3: Create API Key
1. Click on "Create API Key" or "Get API Key"
2. Select an existing Google Cloud project or create a new one
3. Copy the generated API key

### Step 4: Add to Your Project
1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Copy the contents from `.env.example`
3. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

## Configuration Files

### `config/gemini.ts`
This file initializes the Gemini AI client and exports configured models:
- **vision model**: For analyzing images (crop diseases, pests) using `gemini-2.5-flash`
- **text model**: For text-based analysis (soil health, advice) using `gemini-2.5-flash`

### Environment Variables
The app uses `EXPO_PUBLIC_GEMINI_API_KEY` to access the Gemini API. This variable:
- Must be prefixed with `EXPO_PUBLIC_` to be available in React Native
- Should be kept secure and never committed to version control
- Is loaded automatically by Expo from the `.env` file

## Security Best Practices

1. **Never commit your `.env` file** to version control
   - The `.env` file is already in `.gitignore`
   - Only commit `.env.example` as a template

2. **Keep your API key secure**
   - Don't share your API key publicly
   - Don't hardcode it in your source code
   - Use environment variables only

3. **Monitor API usage**
   - Check your API usage at: https://console.cloud.google.com
   - Set up billing alerts if using paid tier
   - Be aware of rate limits

## API Limits & Pricing

### Free Tier
- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per month

### Rate Limits
If you exceed rate limits, you'll receive an error. The app will display a user-friendly message.

For more details, visit: https://ai.google.dev/pricing

## Troubleshooting

### "API key not set" warning
- Check if `.env` file exists in project root
- Verify the variable name is exactly `EXPO_PUBLIC_GEMINI_API_KEY`
- Restart the Expo development server after changing `.env`

### "Failed to analyze" errors
- Verify your API key is valid
- Check your internet connection
- Ensure you haven't exceeded rate limits
- Check the console for detailed error messages

### API key not working
- Verify the API key is correctly copied (no extra spaces)
- Check that the API is enabled in Google Cloud Console
- Make sure your project has billing enabled (if using paid tier)

## Testing the Integration

After setup, test each feature:
1. **Crop Disease Identifier**: Upload a plant image
2. **Pest Identifier**: Upload a pest image
3. **Soil Health Checker**: Enter soil test data

The app will show loading indicators while processing and display results when complete.

## Development vs Production

### Development
- Use a development API key
- Test with sample images
- Monitor API usage closely

### Production
- Use a separate production API key
- Implement error handling
- Add rate limiting if needed
- Consider caching responses for similar queries

## Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [API Pricing](https://ai.google.dev/pricing)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs for detailed error messages
3. Verify your API key and configuration
4. Check Google Cloud Console for API status

---

**Note**: The Gemini API requires an active internet connection. Ensure your device/emulator has network access when testing.
