// MCP Chat Handler - Manages conversation flow and context
import { whatsappSessionService } from './whatsapp-session.service'
import { merchantService } from './merchant.service'
import { productService } from './product.service'
import { whatsappService } from './whatsapp.service'
import { MCPContext, Currency, Locale } from '@/types'
import { formatCurrency, generateCheckoutUrl } from '@/lib/utils'

export interface ChatStep {
  id: string
  prompt: string
  validate?: (input: string) => boolean | string
  next?: string | ((input: string, context: MCPContext) => string)
  handler?: (input: string, phone: string, context: MCPContext) => Promise<void>
}

export class MCPChatHandler {
  private steps: Map<string, ChatStep> = new Map()

  constructor() {
    this.initializeSteps()
  }

  private initializeSteps() {
    // Welcome step
    this.steps.set('start', {
      id: 'start',
      prompt: `🎉 Welcome to WhatsGrapp!

Let's set up your online store in minutes:

1️⃣ START - Create a new store
2️⃣ STATUS - Check your store status  
3️⃣ HELP - Get assistance

Reply with a number or keyword to continue.`,
      next: (input: string) => {
        const normalized = input.toLowerCase().trim()
        if (['1', 'start', 'create'].includes(normalized)) return 'store_name'
        if (['2', 'status', 'check'].includes(normalized)) return 'status_check'
        if (['3', 'help', 'assistance'].includes(normalized)) return 'help'
        return 'start' // Invalid input, stay on same step
      }
    })

    // Store name step
    this.steps.set('store_name', {
      id: 'store_name',
      prompt: `🏪 What's your store name?

Examples:
• "Sarah's Bakery"
• "Tech Gadgets Store" 
• "Fashion Boutique"

Enter your store name:`,
      validate: (input: string) => {
        if (input.length < 2) return 'Store name must be at least 2 characters'
        if (input.length > 50) return 'Store name must be less than 50 characters'
        return true
      },
      next: 'business_details'
    })

    // Business details step
    this.steps.set('business_details', {
      id: 'business_details',
      prompt: `📝 Tell me about your business:

What do you sell? Who are your customers?

Examples:
• "Fresh baked goods and custom cakes for local customers"
• "Electronics and accessories for tech enthusiasts"
• "Trendy clothing for young professionals"

Describe your business:`,
      validate: (input: string) => {
        if (input.length < 10) return 'Please provide more details (at least 10 characters)'
        if (input.length > 200) return 'Please keep it under 200 characters'
        return true
      },
      next: 'currency_selection'
    })

    // Currency selection step
    this.steps.set('currency_selection', {
      id: 'currency_selection',
      prompt: `💰 Choose your currency:

1️⃣ SGD - Singapore Dollar
2️⃣ THB - Thai Baht
3️⃣ IDR - Indonesian Rupiah
4️⃣ MYR - Malaysian Ringgit
5️⃣ PHP - Philippine Peso
6️⃣ VND - Vietnamese Dong
7️⃣ KHR - Cambodian Riel
8️⃣ MMK - Myanmar Kyat

Reply with the number:`,
      validate: (input: string) => {
        const num = parseInt(input.trim())
        return num >= 1 && num <= 8 ? true : 'Please select a number from 1-8'
      },
      next: 'store_creation',
      handler: this.handleCurrencySelection.bind(this)
    })

    // Store creation step
    this.steps.set('store_creation', {
      id: 'store_creation',
      prompt: `✅ Creating your store...`,
      handler: this.handleStoreCreation.bind(this),
      next: 'add_product_prompt'
    })

    // Add product prompt
    this.steps.set('add_product_prompt', {
      id: 'add_product_prompt',
      prompt: `🎉 Store created successfully! 

Would you like to add your first product?

1️⃣ YES - Add a product
2️⃣ NO - Get my store links
3️⃣ HELP - Learn about products

Reply with a number:`,
      next: (input: string) => {
        const normalized = input.toLowerCase().trim()
        if (['1', 'yes', 'add'].includes(normalized)) return 'product_name'
        if (['2', 'no', 'links'].includes(normalized)) return 'store_complete'
        if (['3', 'help', 'learn'].includes(normalized)) return 'product_help'
        return 'add_product_prompt'
      }
    })

    // Product name step
    this.steps.set('product_name', {
      id: 'product_name',
      prompt: `📦 What's your product name?

Examples:
• "Chocolate Chip Cookies"
• "Wireless Bluetooth Headphones"
• "Cotton T-Shirt - Blue"

Enter product name:`,
      validate: (input: string) => {
        if (input.length < 2) return 'Product name must be at least 2 characters'
        if (input.length > 100) return 'Product name must be less than 100 characters'
        return true
      },
      next: 'product_price'
    })

    // Product price step
    this.steps.set('product_price', {
      id: 'product_price',
      prompt: `💲 What's the price?

Enter just the number (e.g., 29.99 or 150):`,
      validate: (input: string) => {
        const price = parseFloat(input.replace(/[^\d.]/g, ''))
        if (isNaN(price) || price <= 0) return 'Please enter a valid price'
        if (price > 999999) return 'Price is too high'
        return true
      },
      next: 'product_stock'
    })

    // Product stock step
    this.steps.set('product_stock', {
      id: 'product_stock',
      prompt: `📊 How many do you have in stock?

Enter quantity (e.g., 50):`,
      validate: (input: string) => {
        const stock = parseInt(input.replace(/[^\d]/g, ''))
        if (isNaN(stock) || stock < 0) return 'Please enter a valid quantity'
        if (stock > 999999) return 'Quantity is too high'
        return true
      },
      next: 'product_creation',
      handler: this.handleProductCreation.bind(this)
    })

    // Product creation step
    this.steps.set('product_creation', {
      id: 'product_creation',
      prompt: `✅ Creating your product...`,
      next: 'product_complete'
    })

    // Product complete step
    this.steps.set('product_complete', {
      id: 'product_complete',
      prompt: `🎉 Product added successfully!

Would you like to:

1️⃣ Add another product
2️⃣ Get checkout link for this product
3️⃣ Get embed code
4️⃣ Finish setup

Reply with a number:`,
      next: (input: string) => {
        const normalized = input.toLowerCase().trim()
        if (['1', 'another', 'add'].includes(normalized)) return 'product_name'
        if (['2', 'link', 'checkout'].includes(normalized)) return 'checkout_link'
        if (['3', 'embed', 'code'].includes(normalized)) return 'embed_code'
        if (['4', 'finish', 'done'].includes(normalized)) return 'store_complete'
        return 'product_complete'
      }
    })

    // Store complete step
    this.steps.set('store_complete', {
      id: 'store_complete',
      prompt: '', // Will be generated dynamically
      handler: this.handleStoreComplete.bind(this),
      next: 'end'
    })
  }

  async processMessage(phone: string, message: string): Promise<string> {
    try {
      // Get or create session
      let session = await whatsappSessionService.getSession(phone)
      
      if (!session) {
        session = await whatsappSessionService.createSession({
          phone,
          current_step: 'start',
          session_data: {}
        })
      }

      if (!session) {
        return 'Sorry, there was an error starting our conversation. Please try again later.'
      }

      const currentStep = this.steps.get(session.current_step)
      if (!currentStep) {
        return 'Sorry, something went wrong. Type START to begin again.'
      }

      // Get MCP context
      const mcpContext = await whatsappSessionService.getMCPContext(phone) || {
        currentStep: session.current_step,
        completed: [],
        pending: [],
        data: {},
        sessionHistory: []
      }

      // Validate input if validator exists
      if (currentStep.validate) {
        const validation = currentStep.validate(message)
        if (validation !== true) {
          return `❌ ${validation}\n\n${currentStep.prompt}`
        }
      }

      // Store the input in context
      mcpContext.data[currentStep.id] = message

      // Execute step handler if exists
      if (currentStep.handler) {
        await currentStep.handler(message, phone, mcpContext)
      }

      // Add to history
      await whatsappSessionService.addMCPHistoryEntry(phone, {
        step: currentStep.id,
        input: message,
        output: 'processed'
      })

      // Determine next step
      let nextStepId: string
      if (typeof currentStep.next === 'function') {
        nextStepId = currentStep.next(message, mcpContext)
      } else {
        nextStepId = currentStep.next || 'end'
      }

      // Update session
      await whatsappSessionService.updateSession(phone, {
        current_step: nextStepId
      })

      // Update MCP context
      mcpContext.currentStep = nextStepId
      mcpContext.completed.push(currentStep.id)
      await whatsappSessionService.updateMCPContext(phone, mcpContext)

      // Get next step and return prompt
      const nextStep = this.steps.get(nextStepId)
      if (nextStep) {
        return nextStep.prompt
      }

      return 'Thank you for using WhatsGrapp! Type START anytime to create another store.'

    } catch (error) {
      console.error('Error processing message:', error)
      return 'Sorry, there was an error processing your message. Please try again.'
    }
  }

  private async handleCurrencySelection(input: string, phone: string, context: MCPContext): Promise<void> {
    const currencies = ['SGD', 'THB', 'IDR', 'MYR', 'PHP', 'VND', 'KHR', 'MMK']
    const locales = ['en-SG', 'th-TH', 'id-ID', 'ms-MY', 'fil-PH', 'vi-VN', 'km-KH', 'my-MM']
    
    const index = parseInt(input.trim()) - 1
    context.data.currency = currencies[index]
    context.data.locale = locales[index]
  }

  private async handleStoreCreation(input: string, phone: string, context: MCPContext): Promise<void> {
    try {
      const merchantData = {
        phone,
        store_name: context.data.store_name as string,
        business_details: context.data.business_details as string,
        currency: context.data.currency as string,
        locale: context.data.locale as string
      }

      const result = await merchantService.createMerchant(merchantData)
      
      if (result.success && result.data) {
        context.data.merchant_id = result.data.id
        
        // Update session with merchant ID
        await whatsappSessionService.updateSession(phone, {
          merchant_id: result.data.id
        })
      }
    } catch (error) {
      console.error('Error creating store:', error)
    }
  }

  private async handleProductCreation(input: string, phone: string, context: MCPContext): Promise<void> {
    try {
      const merchantId = context.data.merchant_id as string
      if (!merchantId) return

      const productData = {
        merchant_id: merchantId,
        name: context.data.product_name as string,
        price: parseFloat((context.data.product_price as string).replace(/[^\d.]/g, '')),
        stock: parseInt((context.data.product_stock as string).replace(/[^\d]/g, ''))
      }

      const result = await productService.createProduct(productData)
      
      if (result.success && result.data) {
        context.data.last_product_id = result.data.id
      }
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  private async handleStoreComplete(input: string, phone: string, context: MCPContext): Promise<void> {
    try {
      const merchantId = context.data.merchant_id as string
      const currency = context.data.currency as string
      const storeName = context.data.store_name as string
      
      if (!merchantId) return

      // Get products for this merchant
      const products = await productService.getProductsByMerchant(merchantId)
      
      let message = `🎉 Congratulations! Your store "${storeName}" is ready!

🌐 **Store Dashboard**: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
📱 **Public Store**: ${process.env.NEXT_PUBLIC_APP_URL}/store/${merchantId}

`

      if (products.length > 0) {
        message += `📦 **Your Products:**\n`
        products.forEach(product => {
          const checkoutUrl = generateCheckoutUrl(merchantId, product.id)
          message += `• ${product.name} - ${formatCurrency(product.price, currency as 'SGD', context.data.locale as 'en-SG')}
  💳 Checkout: ${checkoutUrl}\n`
        })
      }

      message += `\n💡 **Next Steps:**
• Share your checkout links with customers
• Add more products through WhatsApp or dashboard
• Track orders and sales

Type "HELP" anytime for assistance!`

      // Send the completion message
      await whatsappService.sendMessage(phone, message)
    } catch (error) {
      console.error('Error completing store setup:', error)
    }
  }
}

// Export singleton instance
export const mcpChatHandler = new MCPChatHandler()
