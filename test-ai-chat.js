// Test AI Chat API
const testMessages = [
  "hello",
  "I want to setup my business",
  "Tech Store, +65 9123 4567, We sell latest electronics and gadgets",
  "add product",
  "iPhone 15, 1200, Latest smartphone with advanced camera",
  "show me all products",
  "help me create a payment link"
]

async function testAIChat() {
  console.log('🤖 Testing AI-Powered WhatsApp Chatbot with Gemini')
  console.log('=' .repeat(50))
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i]
    console.log(`\n💬 User: "${message}"`)
    
    try {
      const response = await fetch('http://localhost:3000/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          merchantName: 'test-user',
          chatHistory: []
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log(`🤖 AI Response: ${data.response.text}`)
        console.log(`📋 Intent: ${data.response.intent}`)
        if (data.response.suggestions) {
          console.log(`💡 Suggestions: ${data.response.suggestions.join(', ')}`)
        }
        if (data.response.productRecommendations && data.response.productRecommendations.length > 0) {
          console.log(`🛍️ Product Recommendations: ${data.response.productRecommendations.join(', ')}`)
        }
      } else {
        console.log(`❌ Error: ${data.error}`)
        // Still show fallback response if available
        if (data.response) {
          console.log(`🔄 Fallback: ${data.response.text}`)
        }
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`)
    }
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('✅ AI Chat Test Complete!')
  console.log('\n💡 Try opening the chatbot on the website:')
  console.log('   http://localhost:3000')
  console.log('   Click the WhatsApp icon to test the AI chatbot!')
}

// Test other endpoints too
async function testAllEndpoints() {
  console.log('\n🔍 Testing All API Endpoints')
  console.log('-' .repeat(30))
  
  // Test products endpoint
  try {
    const productsResponse = await fetch('http://localhost:3000/api/products')
    const productsData = await productsResponse.json()
    console.log(`📦 Products API: ${productsData.success ? '✅ Working' : '❌ Failed'}`)
    if (productsData.products) {
      console.log(`   Found ${productsData.products.length} products`)
    }
  } catch (error) {
    console.log(`📦 Products API: ❌ Failed - ${error.message}`)
  }
  
  // Test merchants endpoint
  try {
    const merchantsResponse = await fetch('http://localhost:3000/api/merchants-list')
    const merchantsData = await merchantsResponse.json()
    console.log(`🏪 Merchants API: ${merchantsData.success ? '✅ Working' : '❌ Failed'}`)
  } catch (error) {
    console.log(`🏪 Merchants API: ❌ Failed - ${error.message}`)
  }
  
  // Test messages endpoint
  try {
    const messagesResponse = await fetch('http://localhost:3000/api/whatsapp-messages')
    const messagesData = await messagesResponse.json()
    console.log(`💬 Messages API: ${messagesData.success ? '✅ Working' : '❌ Failed'}`)
  } catch (error) {
    console.log(`💬 Messages API: ❌ Failed - ${error.message}`)
  }
}

// Run tests
testAllEndpoints().then(() => {
  console.log('\nStarting AI Chat Tests...\n')
  testAIChat()
})
