'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface WhatsAppMessage {
  id: string
  from_number: string
  to_number: string
  message_body: string
  message_type: 'incoming' | 'outgoing'
  created_at: string
}

interface Merchant {
  id: string
  phone_number: string
  business_name: string
  contact_name: string
  category: string
  status: string
  created_at: string
}

export default function WhatsAppMonitor() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'messages' | 'merchants'>('messages')

  useEffect(() => {
    fetchData()
    // Refresh data every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      // Fetch messages
      const messagesResponse = await fetch('/api/whatsapp-messages')
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json()
        setMessages(messagesData.messages || [])
      }

      // Fetch merchants
      const merchantsResponse = await fetch('/api/merchants-list')
      if (merchantsResponse.ok) {
        const merchantsData = await merchantsResponse.json()
        setMerchants(merchantsData.merchants || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove whatsapp: prefix and format
    return phone.replace('whatsapp:', '').replace('+', '+')
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900">WhatsGrapp</span>
            </Link>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/products/manage" className="text-gray-600 hover:text-gray-900">Products</Link>
              <Link href="/whatsapp-monitor" className="text-green-600 font-medium">WhatsApp Monitor</Link>
              <Link href="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Monitor</h1>
            <p className="text-gray-600 mt-2">Real-time view of WhatsApp interactions and merchant registrations</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            🔄 Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button
            onClick={() => setActiveTab('messages')}
            variant={activeTab === 'messages' ? 'default' : 'outline'}
            className="px-6"
          >
            📱 Messages ({messages.length})
          </Button>
          <Button
            onClick={() => setActiveTab('merchants')}
            variant={activeTab === 'merchants' ? 'default' : 'outline'}
            className="px-6"
          >
            🏪 Merchants ({merchants.length})
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm">
            {activeTab === 'messages' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent WhatsApp Messages</h2>
                
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-4 rounded-lg border ${
                          message.message_type === 'incoming' 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              message.message_type === 'incoming' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {message.message_type === 'incoming' ? '📥 Incoming' : '📤 Outgoing'}
                            </span>
                            <span className="font-medium text-gray-900">
                              {message.message_type === 'incoming' 
                                ? `From: ${formatPhoneNumber(message.from_number)}`
                                : `To: ${formatPhoneNumber(message.to_number)}`
                              }
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{message.message_body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600">WhatsApp messages will appear here when users interact with your bot</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'merchants' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Registered Merchants</h2>
                
                {merchants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchants.map((merchant) => (
                      <div key={merchant.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900">
                            {merchant.business_name || 'Unnamed Business'}
                          </h3>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            merchant.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {merchant.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Contact:</span>
                            <p className="text-gray-600">{merchant.contact_name || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Phone:</span>
                            <p className="text-gray-600">{formatPhoneNumber(merchant.phone_number || '')}</p>
                          </div>
                          {merchant.category && (
                            <div>
                              <span className="font-medium text-gray-700">Category:</span>
                              <p className="text-gray-600 capitalize">{merchant.category}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-700">Registered:</span>
                            <p className="text-gray-600">{formatTime(merchant.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏪</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No merchants yet</h3>
                    <p className="text-gray-600">Merchants who register via WhatsApp will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📱 How to Test</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>1. Send a WhatsApp message to your Twilio sandbox number</p>
            <p>2. Try these commands:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>&quot;hello&quot; - Get welcome message</li>
              <li>&quot;start onboarding&quot; - Begin merchant registration</li>
              <li>&quot;Business: Tech Store, Type: retail, Contact: John Smith&quot; - Register business</li>
              <li>&quot;Product: iPhone 15, Price: 1200, Description: Latest smartphone&quot; - Add product</li>
            </ul>
            <p>3. Watch this page for real-time updates of all interactions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
