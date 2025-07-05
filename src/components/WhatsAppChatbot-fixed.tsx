'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, Phone, Video, MoreVertical } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  status?: 'sent' | 'delivered' | 'read'
}

export default function WhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '👋 Welcome to WhatsGrab! I can help you set up your business, add products, manage orders, and generate payment links. Type "hello" to get started!',
      sender: 'bot',
      timestamp: new Date(),
      status: 'read'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const processMessage = async (message: string): Promise<string> => {
    const lowerBody = message.toLowerCase().trim()
    
    // Save message to database
    try {
      await fetch('/api/whatsapp-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_number: 'web_chat_user',
          to_number: 'whatsgrapp_bot',
          message_body: message,
          message_type: 'incoming'
        })
      })
    } catch (error) {
      console.error('Error saving message:', error)
    }

    // Greeting responses
    if (lowerBody === 'hello' || lowerBody === 'hi' || lowerBody === 'hey' || lowerBody === 'start') {
      return `👋 Welcome to WhatsGrab! 

I can help you:
• Set up your business
• Add products
• Manage orders
• Generate payment links

Type "start onboarding" to begin setting up your store!`
    }
    
    // Business onboarding flow
    if (lowerBody.includes('start onboarding') || lowerBody.includes('onboard')) {
      return `🏪 Let's set up your business!

Please provide your business details in this format:
"Business: [Name], Type: [Category], Contact: [Your Name]"

Example: "Business: Tech Store, Type: retail, Contact: John Smith"`
    }
    
    // Parse business registration
    if (lowerBody.includes('business:') && lowerBody.includes('type:') && lowerBody.includes('contact:')) {
      const businessMatch = message.match(/business:\\s*([^,]+)/i)
      const typeMatch = message.match(/type:\\s*([^,]+)/i)
      const contactMatch = message.match(/contact:\\s*([^,\\n]+)/i)
      
      if (businessMatch && typeMatch && contactMatch) {
        const businessName = businessMatch[1].trim()
        const category = typeMatch[1].trim()
        const contactName = contactMatch[1].trim()
        
        // Save merchant to database
        try {
          await fetch('/api/merchants-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone_number: 'web_chat_user',
              business_name: businessName,
              category: category,
              contact_name: contactName
            })
          })
        } catch (error) {
          console.error('Error saving merchant:', error)
        }
      }
      
      return `✅ Great! Your business is being registered.

Next, let's add your first product. Use this format:
"Product: [Name], Price: [Amount], Description: [Details]"

Example: "Product: iPhone 15, Price: 1200, Description: Latest smartphone with 128GB"`
    }
    
    // Product management
    if (lowerBody.includes('add product') || lowerBody.includes('new product')) {
      return `📦 Let's add a product!

Use this format:
"Product: [Name], Price: [Amount], Description: [Details]"

Example: "Product: iPhone 15, Price: 1200, Description: Latest smartphone"`
    }

    // Parse product addition
    if (lowerBody.includes('product:') && lowerBody.includes('price:')) {
      const productMatch = message.match(/product:\\s*([^,]+)/i)
      const priceMatch = message.match(/price:\\s*(\\d+(?:\\.\\d+)?)/i)
      const descMatch = message.match(/description:\\s*([^,\\n]+)/i)
      
      const productName = productMatch ? productMatch[1].trim() : 'Your product'
      const price = priceMatch ? parseFloat(priceMatch[1]) : 0
      const description = descMatch ? descMatch[1].trim() : ''
      
      // Save product to database
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: productName,
            price: price,
            description: description,
            merchant_id: null // Will create default merchant
          })
        })
      } catch (error) {
        console.error('Error saving product:', error)
      }
      
      return `✅ Product "${productName}" added for $${price}!

🔗 Share this checkout link:
${window.location.origin}/checkout?product=${productName.replace(/\\s+/g, '-').toLowerCase()}&merchant=web-chat

What's next?
• "add product" - Add another product
• "view products" - See all products
• "generate link" - Create payment link`
    }
    
    // View products
    if (lowerBody.includes('view products') || lowerBody.includes('my products') || lowerBody.includes('list products')) {
      return `📦 Your Products:

1. iPhone 15 - $1200
   🔗 ${window.location.origin}/checkout?product=iphone-15

2. MacBook Pro - $2500
   🔗 ${window.location.origin}/checkout?product=macbook-pro

💡 Commands:
• "add product" - Add new product
• "edit [product name]" - Edit product
• "analytics" - View sales data`
    }
    
    // Generate payment links
    if (lowerBody.includes('generate link') || lowerBody.includes('payment link') || lowerBody.includes('checkout link')) {
      return `💳 Quick Payment Links:

Choose a product:
1️⃣ iPhone 15 ($1200)
2️⃣ MacBook Pro ($2500)
3️⃣ Custom amount

Reply with the number or "custom: [amount]" for custom amount.`
    }
    
    // Handle payment link selections
    if (lowerBody === '1' || lowerBody === '1️⃣') {
      return `📱 iPhone 15 Payment Link Generated!

🔗 ${window.location.origin}/checkout?product=iphone-15&merchant=web-chat

Share this link with your customer. They can pay via:
• Credit Card 💳
• PayPal 💙  
• Bank Transfer 🏦`
    }
    
    if (lowerBody === '2' || lowerBody === '2️⃣') {
      return `💻 MacBook Pro Payment Link Generated!

🔗 ${window.location.origin}/checkout?product=macbook-pro&merchant=web-chat

Payment methods available:
• Credit Card 💳
• PayPal 💙
• Bank Transfer 🏦`
    }
    
    // Custom amount
    if (lowerBody.includes('custom:')) {
      const amountMatch = message.match(/custom:\\s*(\\d+(?:\\.\\d+)?)/i)
      const amount = amountMatch ? amountMatch[1] : '0'
      return `💳 Custom Payment Link ($${amount})

🔗 ${window.location.origin}/checkout?amount=${amount}&merchant=web-chat

This link is ready to share with your customer!`
    }
    
    // Analytics and insights
    if (lowerBody.includes('analytics') || lowerBody.includes('stats') || lowerBody.includes('insights')) {
      return `📊 Business Analytics (Last 30 days):

💰 Revenue: $12,450
📦 Orders: 28 (↗️ +15%)
👥 Customers: 22 unique
⭐ Rating: 4.8/5

📈 Top Products:
1. iPhone 15 - 12 sales
2. MacBook Pro - 8 sales
3. AirPods - 5 sales

💡 AI Insights:
• Peak sales: Weekends
• Best time to post: 7-9 PM
• Trending: Electronics category`
    }
    
    // Orders
    if (lowerBody.includes('orders') || lowerBody.includes('sales')) {
      return `📊 Recent Orders:

🟢 Order #1001 - iPhone 15
   Customer: +65 9123 4567
   Amount: $1200
   Status: Paid ✅

🟡 Order #1002 - MacBook Pro  
   Customer: +65 8765 4321
   Amount: $2500
   Status: Pending 💳

Total Revenue: $3700

💡 Tip: Reply "analytics" for detailed insights`
    }
    
    // Help command
    if (lowerBody.includes('help') || lowerBody === '?') {
      return `🆘 WhatsGrab Commands:

📱 **Getting Started:**
• "hello" - Welcome message
• "start onboarding" - Set up business

🏪 **Business Setup:**
• "Business: [Name], Type: [Category], Contact: [Name]"

📦 **Products:**
• "add product" - Add new product
• "Product: [Name], Price: [Amount], Description: [Details]"
• "view products" - List all products

💳 **Payments:**
• "generate link" - Create payment links
• "1" or "2" - Select product for link
• "custom: [amount]" - Custom amount link

📊 **Business Management:**
• "orders" - View recent orders
• "analytics" - Business insights
• "help" - Show this menu

What would you like to do?`
    }
    
    // Default response
    return `🤔 I didn't quite understand "${message}".

💡 Try these commands:
• "help" - Full command list
• "add product" - Add a product
• "generate link" - Create payment link
• "orders" - View recent sales
• "analytics" - Smart business tips

What would you like to do?`
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate processing delay
    setTimeout(async () => {
      const response = await processMessage(inputMessage)
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        status: 'delivered'
      }

      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000) // Random delay between 1-2 seconds
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Notification badge */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center z-10">
            1
          </div>
          {/* WhatsApp button with pulse animation */}
          <button
            onClick={() => setIsOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 whatsapp-pulse"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.588z"/>
            </svg>
          </button>
          {/* Welcome tooltip */}
          <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-sm rounded-lg py-2 px-3 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            Chat with WhatsGrab! 💬
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-[32rem] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div 
        className="text-white p-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #075E54 0%, #128C7E 50%, #25D366 100%)',
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-sm font-bold">WG</span>
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">WhatsGrab</h3>
            <p className="text-xs text-green-100 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
              Online • Always ready to help
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-5 h-5 cursor-pointer hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors" />
          <Video className="w-5 h-5 cursor-pointer hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors" />
          <X 
            className="w-5 h-5 cursor-pointer hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors" 
            onClick={() => setIsOpen(false)}
          />
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 whatsapp-scrollbar"
        style={{
          background: '#E5DDD5',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f5f1eb' fill-opacity='0.3'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-200`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`max-w-xs p-3 rounded-lg relative shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-800'
                }`}
                style={{
                  borderRadius: message.sender === 'user' 
                    ? '18px 18px 4px 18px' 
                    : '18px 18px 18px 4px'
                }}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                <div className={`text-xs mt-2 flex items-center justify-end space-x-1 ${
                  message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {message.sender === 'user' && (
                    <div className="flex space-x-0.5">
                      <div className={`w-1 h-1 rounded-full transition-colors ${
                        message.status === 'sent' ? 'bg-gray-300' : 
                        message.status === 'delivered' ? 'bg-gray-300' : 'bg-blue-400'
                      }`}></div>
                      <div className={`w-1 h-1 rounded-full transition-colors ${
                        message.status === 'delivered' ? 'bg-gray-300' : 
                        message.status === 'read' ? 'bg-blue-400' : 'bg-transparent'
                      }`}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2">
              <div className="bg-white p-4 rounded-lg shadow-sm" style={{ borderRadius: '18px 18px 18px 4px' }}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center space-x-3 bg-white rounded-full p-2 shadow-sm">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-gray-700 placeholder-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full p-2 transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              background: !inputMessage.trim() ? '#d1d5db' : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {/* Quick reply suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['👋 Hello', '🏪 Start Business', '📦 Add Product', '💳 Payment Link'].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(suggestion.split(' ').slice(1).join(' ').toLowerCase())}
              className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition-colors border border-green-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
