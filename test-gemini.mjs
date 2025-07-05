// Test Gemini API directly
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

async function testGeminiDirect() {
  try {
    console.log('🧪 Testing Gemini API directly...')
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = "Hello! Can you help me with e-commerce?"
    console.log(`📝 Prompt: ${prompt}`)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log(`✅ Gemini Response: ${text}`)
    return true
  } catch (error) {
    console.error('❌ Gemini API Error:', error)
    return false
  }
}

testGeminiDirect()
