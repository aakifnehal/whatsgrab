// WhatsApp Webhook API Route
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { WhatsAppMessage } from '@/types'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Save merchant to database using the helper function
async function saveMerchant(phone: string, businessName: string, category: string, contactName: string) {
  try {
    const { data, error } = await supabase.rpc('upsert_merchant', {
      p_phone_number: phone,
      p_business_name: businessName,
      p_contact_name: contactName,
      p_category: category
    })
    
    if (error) {
      console.error('Error saving merchant:', error)
      return null
    }
    
    console.log('✅ Merchant saved successfully:', businessName, 'for phone:', phone)
    return data
  } catch (error) {
    console.error('Error saving merchant:', error)
    return null
  }
}

// Save product to database using the helper function
async function saveProduct(merchantPhone: string, name: string, price: number, description: string = '') {
  try {
    const { data, error } = await supabase.rpc('create_product', {
      p_merchant_phone: merchantPhone,
      p_name: name,
      p_price: price,
      p_description: description,
      p_category: 'general',
      p_stock: 100
    })

    if (error) {
      console.error('Error saving product:', error)
      return null
    }
    
    console.log('✅ Product saved successfully:', name, 'for merchant:', merchantPhone)
    return data
  } catch (error) {
    console.error('Error saving product:', error)
    return null
  }
}

// Save order to database
async function saveOrder(customerPhone: string, productName: string, amount: number, merchantPhone: string) {
  try {
    // Get merchant ID
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('phone_number', merchantPhone)
      .single()

    const { data, error } = await supabase
      .from('whatsapp_orders')
      .insert({
        customer_phone: customerPhone,
        merchant_phone: merchantPhone,
        merchant_id: merchant?.id || null,
        product_name: productName,
        amount: amount,
        status: 'pending'
      })
      .select()

    if (error) {
      console.error('Error saving order:', error)
      return null
    }
    
    console.log('✅ Order saved successfully:', productName, 'for customer:', customerPhone)
    return data?.[0]
  } catch (error) {
    console.error('Error saving order:', error)
    return null
  }
}

// Save WhatsApp message to database
async function saveMessage(from: string, to: string, body: string, messageType: string = 'incoming') {
  try {
    // Try to get merchant ID if this is from a known merchant
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('phone_number', from)
      .single()

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        from_number: from,
        to_number: to,
        message_body: body,
        message_type: messageType,
        merchant_id: merchant?.id || null,
        session_id: `session_${from.replace('+', '')}_${Date.now()}`
      })
      .select()

    if (error) {
      console.error('Error saving message:', error)
      return null
    }
    
    console.log('✅ Message saved:', messageType, 'from', from, ':', body.substring(0, 50) + '...')
    return data?.[0]
  } catch (error) {
    console.error('Error saving message:', error)
    return null
  }
}

// Embedded WhatsApp functions to avoid import issues
function parseIncomingMessage(webhookData: Record<string, string>): WhatsAppMessage | null {
  try {
    const from = webhookData.From
    const to = webhookData.To
    const body = webhookData.Body
    const messageSid = webhookData.MessageSid

    if (!from || !body) {
      console.log('❓ Missing required fields in webhook data')
      return null
    }

    const phoneNumber = from.replace('whatsapp:', '')

    const message: WhatsAppMessage = {
      messageId: messageSid || `msg_${Date.now()}`,
      from: phoneNumber,
      to: to?.replace('whatsapp:', '') || '',
      body: body.trim(),
      timestamp: new Date().toISOString()
    }

    console.log('📨 Parsed WhatsApp message:', message.from, ':', message.body)
    return message
  } catch (error) {
    console.error('❌ Error parsing WhatsApp message:', error)
    return null
  }
}

async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  try {
    // Check if Twilio credentials are available
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('📱 Debug mode - would send:', message, 'to:', to)
      return true
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886'
    const whatsappNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    
    console.log('📱 Sending WhatsApp message from:', phoneNumber, 'to:', whatsappNumber)
    
    const result = await client.messages.create({
      body: message,
      from: phoneNumber,
      to: whatsappNumber
    })

    console.log('✅ WhatsApp message sent:', result.sid)
    return true
  } catch (error: unknown) {
    console.error('❌ Error sending WhatsApp message:', error)
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 63007) {
        console.error('🔍 Error 63007: Channel not found - check Twilio sandbox settings')
      } else if (error.code === 63038) {
        console.error('🚫 Error 63038: Daily message limit exceeded (9 messages/day for sandbox)')
        console.error('💡 Consider upgrading to a paid Twilio account for unlimited messages')
        // Return true to continue processing but skip actual sending
        return true
      } else if (error.code === 21408) {
        console.error('🚫 Error 21408: Permission to send an SMS/WhatsApp has not been enabled')
      }
    }
    
    return false
  }
}

async function processMessage(from: string, body: string): Promise<string> {
  // Enhanced MCP chat processing with conversation flow
  const lowerBody = body.toLowerCase().trim()
  
  // Save incoming message to database
  await saveMessage(from, process.env.TWILIO_PHONE_NUMBER || '', body, 'incoming')
  
  // Greeting responses (only for specific greetings)
  if (lowerBody === 'hello' || lowerBody === 'hi' || lowerBody === 'hey' || lowerBody === 'start') {
    const response = `👋 Welcome to WhatsGrapp! 

I can help you:
• Set up your business
• Add products
• Manage orders
• Generate payment links

Type "start onboarding" to begin setting up your store!`
    
    // Save outgoing message
    await saveMessage(process.env.TWILIO_PHONE_NUMBER || '', from, response, 'outgoing')
    return response
  }
  
  // Business onboarding flow
  if (lowerBody.includes('start onboarding') || lowerBody.includes('onboard')) {
    const response = `🏪 Let's set up your business!

Please provide your business details in this format:
"Business: [Name], Type: [Category], Contact: [Your Name]"

Example: "Business: Tech Store, Type: retail, Contact: John Smith"`
    
    await saveMessage(process.env.TWILIO_PHONE_NUMBER || '', from, response, 'outgoing')
    return response
  }
  
  // Parse business registration
  if (lowerBody.includes('business:') && lowerBody.includes('type:') && lowerBody.includes('contact:')) {
    // Extract business details
    const businessMatch = body.match(/business:\s*([^,]+)/i)
    const typeMatch = body.match(/type:\s*([^,]+)/i)
    const contactMatch = body.match(/contact:\s*([^,\n]+)/i)
    
    if (businessMatch && typeMatch && contactMatch) {
      const businessName = businessMatch[1].trim()
      const category = typeMatch[1].trim()
      const contactName = contactMatch[1].trim()
      
      // Save merchant to database
      await saveMerchant(from, businessName, category, contactName)
    }
    
    const response = `✅ Great! Your business is being registered.

Next, let's add your first product. Use this format:
"Product: [Name], Price: [Amount], Description: [Details]"

Example: "Product: iPhone 15, Price: 1200, Description: Latest smartphone with 128GB"`
    
    await saveMessage(process.env.TWILIO_PHONE_NUMBER || '', from, response, 'outgoing')
    return response
  }
  
  // Product management
  if (lowerBody.includes('add product') || lowerBody.includes('new product')) {
    const response = `📦 Let's add a product!

Use this format:
"Product: [Name], Price: [Amount], Description: [Details]"

Example: "Product: iPhone 15, Price: 1200, Description: Latest smartphone"`
    
    await saveMessage(process.env.TWILIO_PHONE_NUMBER || '', from, response, 'outgoing')
    return response
  }

  
  // Parse product addition
  if (lowerBody.includes('product:') && lowerBody.includes('price:')) {
    const productMatch = body.match(/product:\s*([^,]+)/i)
    const priceMatch = body.match(/price:\s*(\d+(?:\.\d+)?)/i)
    const descMatch = body.match(/description:\s*([^,\n]+)/i)
    
    const productName = productMatch ? productMatch[1].trim() : 'Your product'
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0
    const description = descMatch ? descMatch[1].trim() : ''
    
    // Save product to database
    await saveProduct(from, productName, price, description)
    
    const response = `✅ Product "${productName}" added for SGD $${price}!

🔗 Share this checkout link:
http://localhost:3001/checkout?product=${productName.replace(/\s+/g, '-').toLowerCase()}&merchant=${from.replace('+', '')}

What's next?
• "add product" - Add another product
• "view products" - See all products
• "generate link" - Create payment link`
    
    await saveMessage(process.env.TWILIO_PHONE_NUMBER || '', from, response, 'outgoing')
    return response
  }
  
  // View products
  if (lowerBody.includes('view products') || lowerBody.includes('my products') || lowerBody.includes('list products')) {
    return `📦 Your Products:

1. iPhone 15 - SGD $1200
   🔗 http://localhost:3000/buy/iphone-15

2. MacBook Pro - SGD $2500
   🔗 http://localhost:3000/buy/macbook-pro

💡 Commands:
• "add product" - Add new product
• "edit [product name]" - Edit product
• "analytics" - View sales data`
  }
  
  // Order management
  if (lowerBody.includes('orders') || lowerBody.includes('sales')) {
    return `📊 Recent Orders:

🟢 Order #1001 - iPhone 15
   Customer: +65 9123 4567
   Amount: SGD $1200
   Status: Paid ✅

🟡 Order #1002 - MacBook Pro  
   Customer: +65 8765 4321
   Amount: SGD $2500
   Status: Pending 💳

Total Revenue: SGD $3700`
  }
  
  // Generate payment links
  if (lowerBody.includes('generate link') || lowerBody.includes('payment link') || lowerBody.includes('checkout link')) {
    return `💳 Quick Payment Links:

Choose a product:
1️⃣ iPhone 15 (SGD $1200)
2️⃣ MacBook Pro (SGD $2500)
3️⃣ Custom amount

Reply with the number or "custom: [amount]" for custom amount.`
  }
  
  // Handle payment link selections
  if (lowerBody === '1' || lowerBody === '1️⃣') {
    return `� iPhone 15 Payment Link Generated!

🔗 http://localhost:3000/pay/iphone-15?merchant=${from.replace('+', '')}

Share this link with your customer. They can pay via:
• GrabPay 🟢
• PayNow 💙  
• Credit Card 💳
• Bank Transfer 🏦`
  }
  
  if (lowerBody === '2' || lowerBody === '2️⃣') {
    return `💳 MacBook Pro Payment Link Generated!

🔗 http://localhost:3000/pay/macbook-pro?merchant=${from.replace('+', '')}

Payment methods available:
• GrabPay 🟢
• PayNow 💙
• Credit Card 💳  
• Bank Transfer 🏦`
  }
  
  // Custom amount
  if (lowerBody.includes('custom:')) {
    const amountMatch = body.match(/custom:\s*(\d+(?:\.\d+)?)/i)
    const amount = amountMatch ? amountMatch[1] : '0'
    return `💳 Custom Payment Link (SGD $${amount})

🔗 http://localhost:3000/pay/custom-${amount}?merchant=${from.replace('+', '')}

This link is ready to share with your customer!`
  }
  
  // Analytics and insights
  if (lowerBody.includes('analytics') || lowerBody.includes('stats') || lowerBody.includes('insights')) {
    return `📊 Business Analytics (Last 30 days):

💰 Revenue: SGD $12,450
📦 Orders: 28 (↗️ +15%)
👥 Customers: 22 unique
⭐ Rating: 4.8/5

🔥 Top Products:
1. iPhone 15 - 12 sales
2. MacBook Pro - 8 sales
3. AirPods - 15 sales

💡 AI Insight: Consider restocking AirPods - high demand!`
  }
  
  // Inventory management
  if (lowerBody.includes('inventory') || lowerBody.includes('stock')) {
    return `📦 Inventory Status:

🟢 iPhone 15: 5 units
🟡 MacBook Pro: 2 units (Low stock!)
🔴 AirPods: 0 units (Out of stock)

🚨 Restock Alerts:
• MacBook Pro - Order 10 units
• AirPods - Order 20 units

Type "restock [product]" to get supplier contacts.`
  }
  
  // Customer support
  if (lowerBody.includes('support') || lowerBody.includes('customer service')) {
    return `🎧 Customer Support Tools:

📞 Recent Customer Queries:
• Payment issue - Order #1001
• Delivery delay - Order #1002

📝 Quick Responses:
• "refund [order#]" - Process refund
• "track [order#]" - Tracking info
• "contact customer [phone]" - Send message

Need help? Type "help support"`
  }
  
  // AI-powered features
  if (lowerBody.includes('ai') || lowerBody.includes('smart') || lowerBody.includes('predict')) {
    return `� AI Business Assistant:

🔮 Predictions:
• 25% sales increase expected next month
• iPhone 16 launch will boost sales
• Best time to post: 2-4 PM weekdays

💡 Smart Suggestions:
• Bundle AirPods with iPhone (↗️ 30% revenue)
• Offer 5% early bird discount
• Target customers who bought MacBook

Type "ai insights" for more!`
  }
  
  // Help menu
  if (lowerBody.includes('help') || lowerBody === '?') {
    return `🤝 WhatsGrapp Help Center

🏪 BUSINESS SETUP:
• "start onboarding" - Register business
• "business info" - View/edit details

📦 PRODUCT MANAGEMENT:
• "add product" - Add new product
• "view products" - List all products
• "inventory" - Check stock levels

💳 PAYMENTS & ORDERS:
• "generate link" - Create payment links
• "orders" - View recent orders
• "analytics" - Business insights

🤖 AI FEATURES:
• "ai insights" - Smart predictions
• "smart pricing" - Optimize prices
• "customer insights" - Buyer patterns

Just type naturally - I understand! 😊`
  }
  
  // Smart pricing
  if (lowerBody.includes('smart pricing') || lowerBody.includes('optimize price')) {
    return `💰 Smart Pricing Recommendations:

📱 iPhone 15: Current SGD $1200
   💡 Suggested: SGD $1180 (↗️ 12% more sales)
   
💻 MacBook Pro: Current SGD $2500  
   💡 Suggested: SGD $2450 (↗️ 8% more sales)
   
🎧 AirPods: Current SGD $250
   � Suggested: SGD $280 (↗️ Premium positioning)

Based on competitor analysis & demand patterns.
Type "apply pricing" to update.`
  }
  
  // Default response for unrecognized messages
  return `🤔 I didn't quite understand "${body}".

💡 Try these commands:
• "help" - Full command list
• "add product" - Add a product
• "generate link" - Create payment link
• "orders" - View recent sales
• "ai insights" - Smart business tips

What would you like to do?`
}

export async function GET(request: NextRequest) {
  // Webhook verification for Twilio
  try {
    const searchParams = request.nextUrl.searchParams
    const echoStr = searchParams.get('echostr')
    
    if (echoStr) {
      return new NextResponse(echoStr, { status: 200 })
    }
    
    return new NextResponse('WhatsApp Webhook', { status: 200 })
  } catch (error) {
    console.error('Webhook verification error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📞 WhatsApp webhook called')
    
    // Parse the webhook body - handle both JSON and FormData
    const contentType = request.headers.get('content-type') || ''
    let webhookData: Record<string, string> = {}
    
    if (contentType.includes('application/json')) {
      // Handle JSON requests (for testing)
      const jsonBody = await request.json()
      webhookData = jsonBody
      console.log('📝 JSON webhook data received:', webhookData)
    } else {
      // Handle FormData requests (from Twilio)
      const body = await request.formData()
      
      // Convert FormData to object
      for (const [key, value] of body.entries()) {
        webhookData[key] = value.toString()
      }
      console.log('📝 FormData webhook data received:', webhookData)
    }

    // Parse the incoming message
    const message = parseIncomingMessage(webhookData)
    
    if (!message) {
      console.log('❓ No valid message found in webhook')
      return new NextResponse('No message', { status: 200 })
    }

    console.log('✅ Parsed message from', message.from, ':', message.body)

    // Process the message and get response
    const response = await processMessage(message.from, message.body)
    
    if (response) {
      console.log('💬 Generated response:', response.substring(0, 50) + '...')
      
      // Try to send response back to user
      const success = await sendWhatsAppMessage(message.from, response)
      
      if (success) {
        console.log('✅ Response sent successfully')
      } else {
        console.log('⚠️ Could not send response (likely hit daily limit), but data was still processed')
        // Save the outgoing message even if we couldn't send it
        await saveMessage(process.env.TWILIO_PHONE_NUMBER || '', message.from, response, 'outgoing')
      }
    } else {
      console.log('ℹ️ No response generated for this message')
    }

    return new NextResponse('OK', { status: 200 })

  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
