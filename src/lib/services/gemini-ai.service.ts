import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export interface ChatContext {
  merchantName?: string
  products?: Array<{
    id: string
    name: string
    price: number
    description: string
  }>
  userMessage: string
  chatHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface AIResponse {
  text: string
  intent: 'greeting' | 'product_inquiry' | 'merchant_registration' | 'add_product' | 'checkout' | 'general' | 'help'
  suggestions?: string[]
  productRecommendations?: string[]
  nextAction?: {
    type: 'show_products' | 'register_merchant' | 'add_product' | 'checkout' | 'continue_chat'
    data?: Record<string, unknown>
  }
}

export class GeminiAIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  private systemPrompt = `
You are WhatsGrab AI, an intelligent assistant for WhatsGrapp - a WhatsApp-based e-commerce platform.

Your role:
- Help users discover and purchase products
- Assist merchants with product management
- Provide intelligent product recommendations
- Guide users through the checkout process
- Answer questions about the platform

Key capabilities:
1. Product Discovery: Help users find products by name, category, or description
2. Merchant Support: Guide new merchants through registration and product addition
3. Smart Recommendations: Suggest products based on user preferences
4. Checkout Assistance: Help users complete purchases
5. Platform Navigation: Explain how WhatsGrapp works

Response Guidelines:
- Keep responses concise and friendly
- Use emojis appropriately for WhatsApp-style communication
- Always provide helpful quick reply options
- When recommending products, include price and brief description
- For merchant registration, gather: name, phone, business type
- For product addition, gather: name, price, description

Available Actions:
- show_products: Display product catalog
- register_merchant: Start merchant registration
- add_product: Add new product for merchants
- checkout: Proceed to payment
- continue_chat: Keep conversation going

Always end responses with 2-3 quick reply suggestions that are contextually relevant.
`

  async generateResponse(context: ChatContext): Promise<AIResponse> {
    // Check if API key is available
    if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'your_api_key_here') {
      console.log('⚠️ Gemini API key not configured, using enhanced fallback responses')
      return this.getEnhancedFallbackResponse(context)
    }

    try {
      // Build conversation history for context
      const conversationHistory = context.chatHistory
        .slice(-5) // Keep last 5 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      // Build product context if available
      const productContext = context.products?.length 
        ? `Available products:\n${context.products.map(p => `- ${p.name}: $${p.price} - ${p.description}`).join('\n')}`
        : 'No products currently available.'

      const prompt = `
${this.systemPrompt}

Current Context:
${productContext}

Merchant: ${context.merchantName || 'Unknown'}

Recent Conversation:
${conversationHistory}

User Message: "${context.userMessage}"

Please provide a helpful response with:
1. A friendly, conversational reply
2. Intent classification
3. 2-3 quick reply suggestions
4. Any relevant product recommendations
5. Next action if applicable

Respond in JSON format:
{
  "text": "Your response here",
  "intent": "intent_type",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "productRecommendations": ["product1", "product2"],
  "nextAction": {
    "type": "action_type",
    "data": {}
  }
}
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Try to parse JSON response
      try {
        const parsedResponse = JSON.parse(text)
        return this.validateAndEnhanceResponse(parsedResponse, context)
      } catch {
        // Fallback if JSON parsing fails
        return this.createFallbackResponse(text, context)
      }
    } catch (error) {
      console.error('Gemini AI Error:', error)
      return this.getEnhancedFallbackResponse(context)
    }
  }

  private getEnhancedFallbackResponse(context: ChatContext): AIResponse {
    const message = context.userMessage.toLowerCase().trim()
    
    // Enhanced intent detection
    if (message.includes('hello') || message.includes('hi') || message.includes('start') || message.includes('hey')) {
      return {
        text: `🎉 Welcome to WhatsGrab! I'm your AI business assistant.

I can help you with:
🏪 Setting up your business profile
📦 Adding and managing products  
💳 Creating payment links
📊 Analytics and insights
🛒 Processing orders

What would you like to do first?`,
        intent: 'greeting',
        suggestions: ['Setup Business 🏪', 'Add Product 📦', 'Browse Products 🛍️']
      }
    }
    
    if (message.includes('business') || message.includes('setup') || message.includes('merchant') || message.includes('register')) {
      return {
        text: `🏪 Let's set up your business profile!

Please provide your business details in this format:
"Business Name, Phone Number, Description"

📝 Example:
"Tech Store, +65 9123 4567, We sell latest electronics and gadgets"

This will register your business on WhatsGrab!`,
        intent: 'merchant_registration',
        suggestions: ['Tech Store Example', 'Fashion Boutique Setup', 'Food Business Setup']
      }
    }
    
    if (message.includes('product') || message.includes('add') || message.includes('item') || message.includes('sell')) {
      return {
        text: `📦 Ready to add a new product!

Use this format:
"Product Name, Price, Description"

📱 Examples:
• iPhone 15, 1200, Latest smartphone with advanced camera
• MacBook Pro, 2500, Professional laptop for creators
• AirPods Pro, 300, Wireless earbuds with noise cancellation

I'll create a checkout link for you instantly!`,
        intent: 'add_product',
        suggestions: ['iPhone 15, 1200, Latest smartphone', 'MacBook Pro, 2500, Professional laptop', 'Samsung Galaxy, 800, Android phone']
      }
    }
    
    if (message.includes('buy') || message.includes('purchase') || message.includes('checkout') || message.includes('payment')) {
      const productRecommendations = context.products?.slice(0, 3).map(p => p.name) || []
      return {
        text: `🛒 Ready to help you with checkout!

${productRecommendations.length > 0 
  ? `Here are some popular products:\n${productRecommendations.map((name, i) => `${i + 1}. ${name}`).join('\n')}\n\nJust tell me which one you'd like to buy!`
  : 'Tell me which product you\'d like to purchase, or browse our products first.'
}

I can generate instant payment links for any product!`,
        intent: 'checkout',
        suggestions: productRecommendations.length > 0 
          ? productRecommendations.slice(0, 3)
          : ['Browse Products 🛍️', 'View All Items 👀', 'Get Help 💡'],
        productRecommendations
      }
    }
    
    if (message.includes('show') || message.includes('list') || message.includes('browse') || message.includes('products')) {
      const productList = context.products?.length 
        ? context.products.slice(0, 5).map(p => `• ${p.name} - $${p.price}`).join('\n')
        : 'No products available yet. Add some products first!'
        
      return {
        text: `🛍️ Here's what's available:

${productList}

${context.products?.length ? 'Tell me which one interests you, or I can help you add more products!' : 'Would you like to add your first product?'}`,
        intent: 'product_inquiry',
        suggestions: context.products?.length 
          ? ['Add More Products 📦', 'Create Payment Link 💳', 'View All Details 👀']
          : ['Add First Product 📦', 'Setup Business 🏪', 'Get Help 💡'],
        productRecommendations: context.products?.slice(0, 3).map(p => p.name) || []
      }
    }
    
    if (message.includes('help') || message.includes('support') || message.includes('how') || message.includes('?')) {
      return {
        text: `💡 I'm here to help! Here's what I can do:

🏪 **Business Setup**: Register your merchant profile
📦 **Product Management**: Add, edit, and organize products
💳 **Payment Links**: Generate instant checkout links
📊 **Analytics**: Track sales and customer data
🛒 **Order Processing**: Handle customer purchases

What would you like to learn more about?`,
        intent: 'help',
        suggestions: ['Business Setup Guide 🏪', 'Add Product Tutorial 📦', 'Payment Links 💳']
      }
    }
    
    // Handle business registration (comma-separated format)
    if (message.includes(',') && (message.includes('store') || message.includes('shop') || message.includes('business') || message.includes('company'))) {
      const parts = context.userMessage.split(',').map(p => p.trim())
      if (parts.length >= 3) {
        return {
          text: `✅ Perfect! I'll register "${parts[0]}" for you.

📋 Business Details:
• Name: ${parts[0]}
• Phone: ${parts[1]}
• Description: ${parts[2]}

Your business will be live on WhatsGrab in moments! 🚀

🎯 Next steps:
📦 Add your first product
💳 Create payment links
📊 Start tracking analytics`,
          intent: 'merchant_registration',
          suggestions: ['Add First Product 📦', 'Create Payment Link 💳', 'View Dashboard 📊'],
          nextAction: {
            type: 'register_merchant',
            data: { name: parts[0], phone: parts[1], description: parts[2] }
          }
        }
      }
    }
    
    // Handle product addition (comma-separated format)
    if (message.includes(',') && !message.includes('business') && !message.includes('store')) {
      const parts = context.userMessage.split(',').map(p => p.trim())
      if (parts.length >= 3) {
        const productName = parts[0]
        const price = parts[1]
        return {
          text: `✅ "${productName}" added successfully!

💰 Price: $${price}
📝 Description: ${parts[2]}

🔗 **Instant Checkout Link:**
${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/checkout?product=${productName.replace(/\s+/g, '-').toLowerCase()}&merchant=web-chat

Share this link with customers for instant purchases! 🚀`,
          intent: 'add_product',
          suggestions: ['Add Another Product 📦', 'View All Products 👀', 'Create Payment Link 💳'],
          nextAction: {
            type: 'add_product',
            data: { name: productName, price: parseFloat(price) || 99.99, description: parts[2] }
          }
        }
      }
    }
    
    // Default intelligent response
    return {
      text: `I understand you're asking about "${context.userMessage}". 

I'm your WhatsGrab AI assistant and I can help you with:

🏪 **Business Setup** - Register your merchant profile
📦 **Product Management** - Add and organize your inventory  
💳 **Payment Processing** - Generate instant checkout links
📊 **Analytics** - Track your business performance
🛒 **Customer Support** - Handle orders and inquiries

What specific area would you like help with?`,
      intent: 'general',
      suggestions: ['Setup Business 🏪', 'Add Product 📦', 'Browse Products 🛍️']
    }
  }

  private validateAndEnhanceResponse(response: Record<string, unknown>, context: ChatContext): AIResponse {
    // Ensure all required fields are present
    const validatedResponse: AIResponse = {
      text: typeof response.text === 'string' ? response.text : 'I understand. How can I help you further?',
      intent: this.classifyIntent(typeof response.intent === 'string' ? response.intent : context.userMessage),
      suggestions: Array.isArray(response.suggestions) 
        ? response.suggestions.slice(0, 3)
        : this.getDefaultSuggestions(typeof response.intent === 'string' ? response.intent : 'general'),
      productRecommendations: Array.isArray(response.productRecommendations) 
        ? response.productRecommendations
        : [],
      nextAction: this.isValidNextAction(response.nextAction) ? response.nextAction : undefined
    }

    return validatedResponse
  }

  private isValidNextAction(action: unknown): action is AIResponse['nextAction'] {
    if (!action || typeof action !== 'object') return false
    const actionObj = action as Record<string, unknown>
    return typeof actionObj.type === 'string' && 
           ['show_products', 'register_merchant', 'add_product', 'checkout', 'continue_chat'].includes(actionObj.type)
  }

  private classifyIntent(message: string): AIResponse['intent'] {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting'
    }
    
    if (lowerMessage.includes('register') || lowerMessage.includes('merchant') || lowerMessage.includes('business')) {
      return 'merchant_registration'
    }
    
    if (lowerMessage.includes('add product') || lowerMessage.includes('new product') || lowerMessage.includes('sell')) {
      return 'add_product'
    }
    
    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('checkout') || lowerMessage.includes('pay')) {
      return 'checkout'
    }
    
    if (lowerMessage.includes('product') || lowerMessage.includes('show') || lowerMessage.includes('list') || lowerMessage.includes('browse')) {
      return 'product_inquiry'
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('how')) {
      return 'help'
    }
    
    return 'general'
  }

  private getDefaultSuggestions(intent: string): string[] {
    const suggestionMap: Record<string, string[]> = {
      greeting: ['Browse Products 🛍️', 'Register as Merchant 🏪', 'Get Help 💡'],
      product_inquiry: ['Show All Products 📱', 'Search iPhone 📱', 'Browse Categories 🗂️'],
      merchant_registration: ['Start Registration 📝', 'Learn More 📖', 'View Requirements 📋'],
      add_product: ['Add New Product ➕', 'Manage Products 📦', 'View My Store 🏪'],
      checkout: ['Proceed to Payment 💳', 'View Cart 🛒', 'Continue Shopping 🛍️'],
      help: ['Browse Products 🛍️', 'Contact Support 📞', 'View Tutorial 📺'],
      general: ['Browse Products 🛍️', 'Register Merchant 🏪', 'Get Help 💡']
    }
    
    return suggestionMap[intent] || suggestionMap.general
  }

  private createFallbackResponse(text: string, context: ChatContext): AIResponse {
    return {
      text: text.length > 10 ? text : 'I understand. How can I help you today?',
      intent: this.classifyIntent(context.userMessage),
      suggestions: ['Browse Products 🛍️', 'Register as Merchant 🏪', 'Get Help 💡']
    }
  }

  private createErrorResponse(): AIResponse {
    return {
      text: 'I apologize, but I\'m having trouble processing your request right now. How else can I help you?',
      intent: 'general',
      suggestions: ['Browse Products 🛍️', 'Try Again 🔄', 'Contact Support 📞']
    }
  }

  // Product recommendation based on user query
  async getProductRecommendations(query: string, products: Array<{ id: string; name: string; price: number; description: string }>): Promise<string[]> {
    if (!products.length) return []
    
    try {
      const prompt = `
Given this product query: "${query}"
And these available products: ${JSON.stringify(products, null, 2)}

Recommend the top 3 most relevant products based on the query.
Return only the product names as a JSON array.
Example: ["iPhone 15", "Samsung Galaxy", "MacBook Pro"]
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      try {
        return JSON.parse(text)
      } catch {
        // Fallback to simple keyword matching
        return products
          .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(p => p.name)
      }
    } catch (error) {
      console.error('Product recommendation error:', error)
      return []
    }
  }
}

export const geminiAI = new GeminiAIService()
