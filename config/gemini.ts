import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
// Get your API key from: https://makersuite.google.com/app/apikey
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('Warning: EXPO_PUBLIC_GEMINI_API_KEY is not set. Gemini AI features will not work.');
}

export const genAI = new GoogleGenerativeAI(API_KEY);

// Model configurations for different use cases
export const geminiModels = {
  // For image analysis (crop diseases, pests)
  vision: genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }),
  
  // For text-based analysis (soil health, recommendations)
  text: genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }),
};

export default genAI;
