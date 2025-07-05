'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface WhatsAppMessage {
  id: string
  from_number: string
  to_number: string
  message_body: string
  message_type: 'incoming' | 'outgoing'
  created_at: string
  business_name?: string
  contact_name?: string
}

interface Merchant {
  id: string
  phone_number: string
  business_name: string
  contact_name: string
  status: string
  created_at: string
}

export default function TestDashboard() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [testPhone, setTestPhone] = useState('+6512345678')
  const [testMessage, setTestMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      const [messagesRes, merchantsRes] = await Promise.all([
        fetch('/api/whatsapp-messages'),
        fetch('/api/merchants-list')
      ])
      
      const messagesData = await messagesRes.json()
      const merchantsData = await merchantsRes.json()
      
      if (messagesData.success) {
        setMessages(messagesData.messages || [])
      }
      
      if (merchantsData.success) {
        setMerchants(merchantsData.merchants || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const sendTestMessage = async () => {
    if (!testMessage.trim() || !testPhone.trim()) return
    
    setLoading(true)
    try {
      const formData = new URLSearchParams()
      formData.append('From', `whatsapp:${testPhone}`)
      formData.append('To', 'whatsapp:+14155238886')
      formData.append('Body', testMessage)
      formData.append('MessageSid', `test_${Date.now()}`)

      const response = await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      })

      if (response.ok) {
        setTestMessage('')
        setTimeout(fetchData, 1000) // Refresh data after 1 second
      } else {
        console.error('Failed to send test message')
      }
    } catch (error) {
      console.error('Error sending test message:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const quickTestMessages = [
    'hello',
    'start onboarding',
    'Business: Test Store, Type: retail, Contact: John Doe',
    'Product: iPhone 15, Price: 1200, Description: Latest smartphone',
    'add product',
    'view products',
    'orders',
    'analytics'
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">WhatsGrapp Test Dashboard</h1>
        
        {/* Alert about message limit */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800">📱 Twilio Sandbox Limit Reached</h3>
          <p className="text-yellow-700 mt-1">
            You&apos;ve hit the 9 messages/day limit. Use this dashboard to test functionality without sending actual WhatsApp messages.
            Data will still be saved to the database.
          </p>
        </div>

        {/* Test Message Sender */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Message Sender</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="Phone number (e.g., +6512345678)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
            <Input
              placeholder="Test message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
            />
            <Button onClick={sendTestMessage} disabled={loading}>
              {loading ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickTestMessages.map((msg, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setTestMessage(msg)}
                className="text-xs"
              >
                {msg.substring(0, 20)}...
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Merchants */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🏪 Registered Merchants ({merchants.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {merchants.map((merchant) => (
                <div key={merchant.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50">
                  <div className="font-medium">{merchant.business_name}</div>
                  <div className="text-sm text-gray-600">{merchant.phone_number}</div>
                  <div className="text-sm text-gray-500">
                    {merchant.contact_name} • {merchant.status}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(merchant.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {merchants.length === 0 && (
                <p className="text-gray-500">No merchants registered yet</p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">💬 WhatsApp Messages ({messages.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-3 rounded-lg ${
                    message.message_type === 'incoming' 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'bg-green-50 border-l-4 border-green-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {message.message_type === 'incoming' ? '📥 From' : '📤 To'}: {message.from_number}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm">{message.message_body}</div>
                  {message.business_name && (
                    <div className="text-xs text-gray-600 mt-1">
                      Business: {message.business_name}
                    </div>
                  )}
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-gray-500">No messages yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" onClick={fetchData}>
              🔄 Refresh Data
            </Button>
            <Button variant="outline" onClick={() => window.open('/whatsapp-monitor', '_blank')}>
              📊 WhatsApp Monitor
            </Button>
            <Button variant="outline" onClick={() => window.open('/products/manage', '_blank')}>
              📦 Manage Products
            </Button>
            <Button variant="outline" onClick={() => window.open('/dashboard', '_blank')}>
              📈 Dashboard
            </Button>
          </div>
        </div>

        {/* Solutions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-800 mb-3">💡 Solutions for Message Limit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700">Option 1: Upgrade Twilio (Recommended)</h4>
              <p className="text-blue-600 text-sm">
                Upgrade to a paid Twilio account for unlimited messages and remove sandbox restrictions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700">Option 2: Reset Tomorrow</h4>
              <p className="text-blue-600 text-sm">
                The 9-message limit resets every 24 hours. You can continue testing tomorrow.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700">Option 3: Use This Dashboard</h4>
              <p className="text-blue-600 text-sm">
                Test all functionality here without sending actual WhatsApp messages.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-700">Option 4: Different Phone Number</h4>
              <p className="text-blue-600 text-sm">
                Try using a different phone number if you have access to one.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
