'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, Phone, Video, MoreVertical } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  status?: 'sent' | 'delivered' | 'read'
  suggestions?: string[]
}

interface AIResponse {
  text: string
  intent: string
  suggestions?: string[]
  productRecommendations?: string[]
  nextAction?: {
    type: string
    data?: Record<string, unknown>
  }
}

export default function WhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '👋 Welcome to WhatsGrab! I\'m your AI assistant powered by Gemini. I can help you set up your business, add products, manage orders, and generate payment links. Type "hello" to get started!',
      sender: 'bot',
      timestamp: new Date(),
      status: 'read',
      suggestions: ['Hello 👋', 'Setup Business 🏪', 'Add Product 📦']
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>(['Hello 👋', 'Setup Business 🏪', 'Add Product 📦'])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const processMessage = async (message: string): Promise<{ text: string; suggestions?: string[] }> => {
    try {
      // Save message to database first
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

      // Get AI response
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          merchantName: 'web-chat',
          chatHistory: messages.slice(-5).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        })
      })

      const data = await response.json()
      
      if (data.success && data.response) {
        const aiResponse: AIResponse = data.response
        
        // Handle special actions
        if (aiResponse.nextAction) {
          switch (aiResponse.nextAction.type) {
            case 'checkout':
              // Auto-navigate to checkout if specific product mentioned
              if (aiResponse.productRecommendations && aiResponse.productRecommendations.length > 0) {
                const productName = aiResponse.productRecommendations[0]
                window.open(`${window.location.origin}/checkout?product=${productName.replace(/\s+/g, '-').toLowerCase()}&merchant=web-chat`, '_blank')
              }
              break
            case 'show_products':
              // Auto-navigate to products page
              window.open(`${window.location.origin}/products`, '_blank')
              break
          }
        }
        
        return {
          text: aiResponse.text,
          suggestions: aiResponse.suggestions
        }
      } else {
        throw new Error('AI response failed')
      }
    } catch {
      // Fallback to basic responses if AI fails
      return getFallbackResponse(message)
    }
  }

  const getFallbackResponse = async (message: string): Promise<{ text: string; suggestions?: string[] }> => {
    const lowerBody = message.toLowerCase().trim()
    
    if (lowerBody === 'hello' || lowerBody === 'hi' || lowerBody === 'start') {
      return {
        text: `🎉 Welcome to WhatsGrab! Your AI business assistant.

I can help you with:
🏪 Setting up your business profile
📦 Adding and managing products  
💳 Creating payment links
📊 Analytics and insights
🛒 Processing orders

Type any option to get started!`,
        suggestions: ['Setup Business 🏪', 'Add Product 📦', 'Browse Products 🛍️']
      }
    }

    if (lowerBody.includes('business') || lowerBody.includes('setup') || lowerBody.includes('merchant')) {
      return {
        text: `🏪 Let's set up your business!

Please provide:
1️⃣ Business Name
2️⃣ Contact Number  
3️⃣ Business Description

Example: "Tech Store, +65 9123 4567, We sell latest electronics and gadgets"`,
        suggestions: ['Tech Store Example', 'Fashion Boutique', 'Food Delivery']
      }
    }

    // Handle business registration
    if (message.includes(',') && (lowerBody.includes('store') || lowerBody.includes('shop') || lowerBody.includes('business'))) {
      const parts = message.split(',').map(p => p.trim())
      if (parts.length >= 3) {
        try {
          await fetch('/api/merchants-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: parts[0],
              phone: parts[1] || 'web-chat',
              description: parts[2] || 'Business registered via web chat'
            })
          })
          
          return {
            text: `✅ Business "${parts[0]}" registered successfully!

🎯 Next steps:
📦 Add products: "iPhone 15, 1200, Latest smartphone with advanced features"
💳 Create payment links
📊 Monitor your analytics

Your business is now live on WhatsGrab! 🚀`,
            suggestions: ['Add Product 📦', 'View Analytics 📊', 'Create Payment Link 💳']
          }
        } catch {
          return {
            text: `❌ Error registering business. Please try again or contact support.`,
            suggestions: ['Try Again 🔄', 'Contact Support 📞', 'Get Help 💡']
          }
        }
      }
    }

    if (lowerBody.includes('product') || lowerBody.includes('add') || lowerBody.includes('item')) {
      return {
        text: `📦 Add a new product!

Format: "Product Name, Price, Description"

Examples:
• iPhone 15, 1200, Latest smartphone with advanced camera
• MacBook Pro, 2500, Professional laptop for creators
• AirPods Pro, 300, Wireless earbuds with noise cancellation

Or try these quick options:`,
        suggestions: ['iPhone 15, 1200, Latest smartphone', 'MacBook Pro, 2500, Professional laptop', 'Browse Products 🛍️']
      }
    }

    // Handle product addition
    if (message.includes(',') && !lowerBody.includes('business') && !lowerBody.includes('store')) {
      const parts = message.split(',').map(p => p.trim())
      if (parts.length >= 3) {
        const productName = parts[0]
        const price = parseFloat(parts[1]) || 99.99
        const description = parts[2]
        
        try {
          await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: productName,
              price: price,
              description: description,
              merchant_id: 'web-chat'
            })
          })
          
          return {
            text: `✅ Product "${productName}" added for $${price}!

🔗 Share this checkout link:
${window.location.origin}/checkout?product=${productName.replace(/\s+/g, '-').toLowerCase()}&merchant=web-chat

💡 You can also:
• Add more products
• View all products
• Generate payment links`,
            suggestions: ['Add Another Product 📦', 'View All Products 👀', 'Create Payment Link 💳']
          }
        } catch {
          return {
            text: `❌ Error adding product. Please try again.`,
            suggestions: ['Try Again 🔄', 'Contact Support 📞', 'View Products 👀']
          }
        }
      }
    }

    // Default response
    return {
      text: `I understand you said "${message}". 

I can help you with:
🏪 Business setup and registration
📦 Adding and managing products
💳 Payment link generation
🛒 Order processing
📊 Analytics and insights

What would you like to do?`,
      suggestions: ['Setup Business 🏪', 'Add Product 📦', 'Browse Products 🛍️']
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputMessage.trim()
    if (!message) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const response = await processMessage(message)
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        status: 'read',
        suggestions: response.suggestions
      }

      setMessages(prev => [...prev, botMessage])
      setCurrentSuggestions(response.suggestions || [])
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '❌ Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        status: 'read',
        suggestions: ['Try Again 🔄', 'Contact Support 📞', 'Get Help 💡']
      }
      setMessages(prev => [...prev, errorMessage])
      setCurrentSuggestions(['Try Again 🔄', 'Contact Support 📞', 'Get Help 💡'])
    }

    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 animate-pulse"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.905 3.488"/>
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Android Phone Frame */}
      <div className="relative">
        {/* Phone Frame */}
        <div className="w-[360px] h-[640px] bg-gray-900 rounded-[40px] p-2 shadow-2xl">
          {/* Screen */}
          <div className="w-full h-full bg-black rounded-[32px] overflow-hidden relative">
            {/* Status Bar */}
            <div className="bg-gray-800 h-8 flex items-center justify-between px-6 text-white text-sm">
              <span>9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2 bg-white rounded-sm"></div>
                <div className="w-4 h-2 bg-white rounded-sm"></div>
                <div className="w-4 h-2 bg-white rounded-sm"></div>
              </div>
            </div>

            {/* WhatsApp Interface */}
            <div className="h-full bg-gray-100 flex flex-col">
              {/* Header */}
              <div className="bg-green-600 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-green-700 rounded-full p-1"
                  >
                    <X size={20} />
                  </button>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    🤖
                  </div>
                  <div>
                    <div className="font-semibold">WhatsGrab AI</div>
                    <div className="text-xs text-green-100">Powered by Gemini • Online</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-white hover:bg-green-700 rounded-full p-2">
                    <Video size={20} />
                  </button>
                  <button className="text-white hover:bg-green-700 rounded-full p-2">
                    <Phone size={20} />
                  </button>
                  <button className="text-white hover:bg-green-700 rounded-full p-2">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[280px] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-green-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                      <div className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.sender === 'user' && (
                          <span className="ml-1">
                            {message.status === 'sent' && '✓'}
                            {message.status === 'delivered' && '✓✓'}
                            {message.status === 'read' && <span className="text-blue-300">✓✓</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-3 rounded-bl-none shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Suggestions */}
              {currentSuggestions.length > 0 && (
                <div className="p-3 bg-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {currentSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="bg-white p-3 flex items-center gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full p-2 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
