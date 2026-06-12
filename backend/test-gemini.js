import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Test script to verify Gemini API connection
async function testGeminiConnection() {
  console.log('🤖 Testing Gemini API connection...\n');

  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in .env file');
    }

    console.log('✅ API Key found in environment variables');

    // Initialize Gemini AI with the correct model name
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    console.log('✅ Gemini AI initialized successfully');
    console.log('✅ Using model: gemini-2.5-flash');
    console.log('📡 Sending test prompt...\n');

    // Send a test message
    const prompt = 'Say "Hello from FlagHouse chatbot! I am ready to help customers shop for flags!" in a friendly, enthusiastic way.';
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log('✅ Response received!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 Gemini Response:');
    console.log(response);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ ✅ ✅ SUCCESS! ✅ ✅ ✅');
    console.log('🎉 Gemini API is working perfectly!');
    console.log('📊 Model: gemini-2.5-flash');
    console.log('🚀 STEP 1 IS COMPLETE!');
    console.log('👉 Ready to move to STEP 2: Build the chatbot backend!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nPlease check:');
    console.error('1. Your API key is correct in .env file');
    console.error('2. You have internet connection');
    console.error('3. The API key has proper permissions\n');
    process.exit(1);
  }
}

testGeminiConnection();
