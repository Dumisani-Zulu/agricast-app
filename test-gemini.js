// Test script for Gemini AI API
// Run this with: node test-gemini.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
require('dotenv').config();

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: EXPO_PUBLIC_GEMINI_API_KEY is not set in .env file');
  console.log('\nPlease:');
  console.log('1. Create a .env file in the project root');
  console.log('2. Add: EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here');
  console.log('3. Get your API key from: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

console.log('🔑 API Key found:', API_KEY.substring(0, 10) + '...');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);
// Using the correct model name
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function testGeminiAPI() {
  console.log('\n🚀 Testing Gemini AI API...\n');

  try {
    // Test 1: Simple text generation
    console.log('📝 Test 1: Simple Agricultural Question');
    console.log('Question: What are the best practices for growing tomatoes?');
    console.log('Generating response...\n');

    const prompt = 'What are the top 3 best practices for growing healthy tomatoes? Keep it brief.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Response received:');
    console.log('─'.repeat(60));
    console.log(text);
    console.log('─'.repeat(60));

    // Test 2: Agricultural advice
    console.log('\n📝 Test 2: Crop Disease Question');
    console.log('Question: What causes leaf yellowing in crops?');
    console.log('Generating response...\n');

    const prompt2 = 'List 3 common causes of leaf yellowing in crop plants. Be concise.';
    const result2 = await model.generateContent(prompt2);
    const response2 = await result2.response;
    const text2 = response2.text();

    console.log('✅ Response received:');
    console.log('─'.repeat(60));
    console.log(text2);
    console.log('─'.repeat(60));

    console.log('\n✨ All tests passed! Gemini AI is working correctly.');
    console.log('🎉 You can now use Gemini AI in your Agricast app!\n');

  } catch (error) {
    console.error('\n❌ Error testing Gemini AI:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n⚠️  Your API key appears to be invalid.');
      console.log('Please check:');
      console.log('1. The API key is correct (no extra spaces)');
      console.log('2. The API is enabled in Google Cloud Console');
      console.log('3. Get a new key from: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('quota')) {
      console.log('\n⚠️  You may have exceeded your API quota.');
      console.log('Check your usage at: https://console.cloud.google.com');
    } else {
      console.log('\n⚠️  Please check your internet connection and API key.');
    }
    
    process.exit(1);
  }
}

// Run the test
testGeminiAPI();
