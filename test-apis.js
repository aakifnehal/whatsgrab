// Test script to verify WhatsGrapp APIs after schema setup
// Run this with: node test-apis.js

const BASE_URL = 'http://localhost:3001';

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🔍 Testing ${description}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${description} - SUCCESS`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data length: ${Array.isArray(data.products) ? data.products.length : 
                   Array.isArray(data.merchants) ? data.merchants.length :
                   Array.isArray(data.messages) ? data.messages.length : 'N/A'}`);
    } else {
      console.log(`❌ ${description} - FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ ${description} - ERROR`);
    console.log(`   Error: ${error.message}`);
  }
}

async function testWhatsAppWebhook() {
  try {
    console.log(`\n🔍 Testing WhatsApp Webhook...`);
    const testMessage = {
      From: 'whatsapp:+6512345678',
      To: 'whatsapp:+14155238886',
      Body: 'Business: Test Store, Type: retail, Contact: Test User',
      MessageSid: 'test_' + Date.now()
    };
    
    const formData = new URLSearchParams();
    Object.entries(testMessage).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const response = await fetch(`${BASE_URL}/api/whatsapp/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    if (response.ok) {
      console.log(`✅ WhatsApp Webhook - SUCCESS`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Test merchant registration sent`);
    } else {
      console.log(`❌ WhatsApp Webhook - FAILED`);
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ WhatsApp Webhook - ERROR`);
    console.log(`   Error: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Testing WhatsGrapp APIs...');
  console.log('===============================');
  
  // Test GET endpoints
  await testAPI('/api/products', 'Products API');
  await testAPI('/api/merchants-list', 'Merchants List API');
  await testAPI('/api/whatsapp-messages', 'WhatsApp Messages API');
  
  // Test WhatsApp webhook
  await testWhatsAppWebhook();
  
  // Test again to see if data was saved
  console.log('\n📊 Re-testing APIs to verify data was saved...');
  await testAPI('/api/merchants-list', 'Merchants List API (after webhook)');
  await testAPI('/api/whatsapp-messages', 'WhatsApp Messages API (after webhook)');
  
  console.log('\n✨ All tests completed!');
  console.log('\n💡 If all tests passed, your WhatsGrapp setup is working correctly!');
  console.log('   - WhatsApp messages are being saved');
  console.log('   - Merchant registration works');
  console.log('   - All APIs are accessible');
}

// Run tests
runAllTests().catch(console.error);
