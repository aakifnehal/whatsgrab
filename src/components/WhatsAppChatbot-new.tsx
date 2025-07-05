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

    // Core commands with exact matching
    if (lowerBody === 'hello' || lowerBody === 'hi' || lowerBody === 'start') {
      return `🎉 Welcome to WhatsGrab! Your AI business assistant.

I can help you with:
🏪 Setting up your business profile
📦 Adding and managing products  
💳 Creating payment links
📊 Analytics and insights
🛒 Processing orders

Type any option to get started!`
    }

    if (lowerBody.includes('business') || lowerBody.includes('setup') || lowerBody.includes('merchant')) {
      return `🏪 Let's set up your business!

Please provide:
1️⃣ Business Name
2️⃣ Contact Number  
3️⃣ Business Description

Example: "Tech Store, +65 9123 4567, We sell latest electronics and gadgets"`
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
          
          return `✅ Business "${parts[0]}" registered successfully!

🎯 Next steps:
📦 Add products: "iPhone 15, 1200, Latest smartphone with advanced features"
💳 Create payment links
📊 Monitor your analytics

Your business is now live on WhatsGrab! 🚀`
        } catch (error) {
          return `❌ Error registering business. Please try again or contact support.`
        }
      }
    }

    if (lowerBody.includes('product') || lowerBody.includes('add') || lowerBody.includes('item')) {
      return `📦 Add a new product!

Format: "Product Name, Price, Description"

Examples:
• iPhone 15, 1200, Latest smartphone with advanced camera
• MacBook Pro, 2500, Professional laptop for creators
• AirPods Pro, 300, Wireless earbuds with noise cancellation

Or try these quick options:
1️⃣ iPhone 15 ($1200)
2️⃣ MacBook Pro ($2500)`
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
          
          return `✅ Product "${productName}" added for $${price}!

🔗 Share this checkout link:
${window.location.origin}/checkout?product=${productName.replace(/\s+/g, '-').toLowerCase()}&merchant=web-chat

💡 You can also:
📦 Add more products
📊 View analytics  
💳 Create custom payment links`
        } catch (error) {
          return `❌ Error adding product. Please try again.`
        }
      }
    }

    // Quick product options
    if (lowerBody === '1' || lowerBody === '1️⃣') {
      return `💰 iPhone 15 Payment Link Generated!

🔗 ${window.location.origin}/checkout?product=iphone-15&merchant=web-chat

Features:
• Advanced Camera System 📸
• A17 Pro Chip ⚡
• All-day Battery 🔋
• 128GB Storage 💾

Share this link with your customers!`
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
      const amountMatch = message.match(/custom:\s*(\d+(?:\.\d+)?)/i)
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
   Status: Pending 📋

🔵 Order #1003 - AirPods Pro
   Customer: +65 5555 1234  
   Amount: $300
   Status: Shipped 🚚

💡 Tip: Use /checkout links to convert faster!`
    }

    // Payment links
    if (lowerBody.includes('payment') || lowerBody.includes('link') || lowerBody.includes('checkout')) {
      return `💳 Payment Link Generator

Quick options:
1️⃣ iPhone 15 ($1200)
2️⃣ MacBook Pro ($2500)
💰 Custom amount: "custom: 150"

Or add a new product:
📦 "Product Name, Price, Description"

All links work instantly and accept multiple payment methods! 🚀`
    }

    // Help
    if (lowerBody.includes('help') || lowerBody === '?') {
      return `🆘 WhatsGrab Help Center

🏪 Business Setup: "business setup"
📦 Add Products: "ProductName, Price, Description"  
💳 Payment Links: "payment links"
📊 Analytics: "analytics"
🛒 Orders: "orders"

💡 Examples:
• "iPhone 15, 1200, Latest smartphone"
• "custom: 299" (for custom amount)
• "analytics" (view stats)

Need more help? Just ask! 😊`
    }

    // Default response
    return `🤔 I didn't quite understand that. 

Try these commands:
🏪 "business setup" - Register your business
📦 "add product" - Add new products  
💳 "payment links" - Generate checkout links
📊 "analytics" - View your stats
🆘 "help" - Full command list

Or just say "hello" to start fresh! 👋`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
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

    // Simulate typing delay
    setTimeout(async () => {
      const response = await processMessage(inputMessage)
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        status: 'read'
      }
      
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
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
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)}></div>
      
      {/* Android phone frame */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl" style={{ width: '380px', height: '720px' }}>
          {/* Phone frame outer */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2.5rem] shadow-inner"></div>
          
          {/* Screen bezel */}
          <div className="relative w-full h-full bg-black rounded-[2rem] overflow-hidden">
            {/* Status bar */}
            <div className="h-6 bg-gray-900 flex items-center justify-between px-4 text-white text-xs">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-2 border border-white rounded-sm">
                  <div className="w-3 h-1 bg-white rounded-sm"></div>
                </div>
                <span>100%</span>
              </div>
            </div>
            
            {/* WhatsApp UI */}
            <div className="w-full h-full bg-white flex flex-col" style={{ height: 'calc(100% - 1.5rem)' }}>
              {/* WhatsApp Header */}
              <div 
                className="text-white p-4 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, #075E54 0%, #128C7E 50%, #25D366 100%)',
                }}
              >
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    ←
                  </button>
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
                            : '18px 18px 18px 4px',
                        }}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.text}
                        </div>
                        <div className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
                          message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          <span>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {message.sender === 'user' && (
                            <div className="flex">
                              <svg className="w-3 h-3" viewBox="0 0 16 15" fill="none">
                                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l3.61 3.467c.143.14.361.125.484-.033L10.91 3.379a.366.366 0 0 0-.063-.512z" fill="currentColor"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-lg rounded-bl-sm shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border">
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
          </div>
        </div>
      </div>
    </>
  )
}
