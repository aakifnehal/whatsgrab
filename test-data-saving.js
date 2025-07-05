// Test comprehensive data saving to database
async function testDataSaving() {
  console.log('💾 Testing Comprehensive Data Saving')
  console.log('=' .repeat(50))
  
  // Test scenarios that should save data
  const testScenarios = [
    {
      name: '👋 Greeting',
      message: 'hello',
      expectedActions: ['Log user message', 'Log bot response']
    },
    {
      name: '🏪 Business Registration',
      message: 'Tech Store, +65 9123 4567, We sell latest electronics and gadgets',
      expectedActions: ['Log user message', 'Register merchant', 'Log bot response']
    },
    {
      name: '📦 Product Addition',
      message: 'iPhone 15 Pro, 1399, Latest iPhone with titanium design',
      expectedActions: ['Log user message', 'Add product', 'Log bot response']
    },
    {
      name: '🛍️ Product Inquiry',
      message: 'show me all products',
      expectedActions: ['Log user message', 'Log bot response']
    }
  ]
  
  for (const scenario of testScenarios) {
    console.log(`\n${scenario.name}`)
    console.log(`💬 Message: "${scenario.message}"`)
    console.log(`📋 Expected: ${scenario.expectedActions.join(', ')}`)
    
    try {
      const response = await fetch('http://localhost:3000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: scenario.message,
          merchantName: 'test-merchant',
          chatHistory: []
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ API Response: Success')
        console.log(`🤖 Response: ${data.response.text.substring(0, 100)}...`)
        
        if (data.response.nextAction) {
          console.log(`🎯 Action Triggered: ${data.response.nextAction.type}`)
        }
      } else {
        console.log(`❌ API Response: Failed - ${data.error}`)
      }
      
      // Wait before next test
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.log(`❌ Request Failed: ${error.message}`)
    }
  }
  
  // Check if data was saved by querying the database endpoints
  console.log('\n🔍 Verifying Data in Database')
  console.log('-' .repeat(30))
  
  try {
    // Check messages
    const messagesResponse = await fetch('http://localhost:3000/api/whatsapp-messages')
    const messagesData = await messagesResponse.json()
    
    if (messagesData.success && messagesData.messages) {
      console.log(`💬 Messages in DB: ${messagesData.messages.length}`)
      
      // Show recent messages
      const recentMessages = messagesData.messages
        .slice(-6) // Last 6 messages
        .map(msg => `  ${msg.message_type}: ${msg.message_body?.substring(0, 50)}...`)
        .join('\n')
      
      console.log('📝 Recent Messages:')
      console.log(recentMessages)
    }
    
    // Check merchants
    const merchantsResponse = await fetch('http://localhost:3000/api/merchants-list')
    const merchantsData = await merchantsResponse.json()
    
    if (merchantsData.success && merchantsData.merchants) {
      console.log(`🏪 Merchants in DB: ${merchantsData.merchants.length}`)
      
      const recentMerchants = merchantsData.merchants
        .slice(-3)
        .map(m => `  ${m.name} (${m.phone})`)
        .join('\n')
      
      if (recentMerchants) {
        console.log('🏢 Recent Merchants:')
        console.log(recentMerchants)
      }
    }
    
    // Check products
    const productsResponse = await fetch('http://localhost:3000/api/products')
    const productsData = await productsResponse.json()
    
    if (productsData.success && productsData.products) {
      console.log(`📦 Products in DB: ${productsData.products.length}`)
      
      const recentProducts = productsData.products
        .slice(-3)
        .map(p => `  ${p.name} - $${p.price}`)
        .join('\n')
      
      if (recentProducts) {
        console.log('🛍️ Recent Products:')
        console.log(recentProducts)
      }
    }
    
  } catch (error) {
    console.log(`❌ Database Check Failed: ${error.message}`)
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('✅ Data Saving Test Complete!')
  console.log('\n💡 All chatbot interactions should now be saved to database:')
  console.log('   • User messages and bot responses')
  console.log('   • Business registrations from AI suggestions')
  console.log('   • Product additions from AI suggestions')
  console.log('   • Intent classification and metadata')
  console.log('   • Conversation context and history')
}

// Run the comprehensive test
testDataSaving()
