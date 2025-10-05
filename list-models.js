// List available Gemini models
// Run this with: node list-models.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: EXPO_PUBLIC_GEMINI_API_KEY is not set');
  process.exit(1);
}

console.log('🔑 API Key found:', API_KEY.substring(0, 10) + '...\n');

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  console.log('📋 Fetching available Gemini models...\n');
  
  try {
    const models = await genAI.listModels();
    
    console.log('✅ Available models:');
    console.log('─'.repeat(80));
    
    for await (const model of models) {
      console.log(`\n📦 Model: ${model.name}`);
      console.log(`   Display Name: ${model.displayName || 'N/A'}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
    }
    
    console.log('\n' + '─'.repeat(80));
    console.log('\n✨ Use one of these model names in your configuration.\n');
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    console.log('\nThis might mean:');
    console.log('1. Your API key is invalid');
    console.log('2. The Gemini API is not enabled for your project');
    console.log('3. You need to create a new API key at: https://aistudio.google.com/app/apikey');
  }
}

listModels();
