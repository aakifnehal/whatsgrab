'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  id: string
  phone_number: string
  merchant_name: string
  message_body: string
  message_type: 'incoming' | 'outgoing'
  ai_response?: string
  intent?: string
  metadata?: string
  created_at: string
}

interface Merchant {
  id: string
  name: string
  phone: string
  business_name?: string
  contact_name?: string
  category?: string
  created_at: string
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  merchant_id: string
  created_at: string
}

export default function DatabaseMonitorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchData = async () => {
    try {
      // Fetch messages
      const messagesResponse = await fetch('/api/whatsapp-messages')
      const messagesData = await messagesResponse.json()
      if (messagesData.success) {
        setMessages(messagesData.messages || [])
      }

      // Fetch merchants
      const merchantsResponse = await fetch('/api/merchants-list')
      const merchantsData = await merchantsResponse.json()
      if (merchantsData.success) {
        setMerchants(merchantsData.merchants || [])
      }

      // Fetch products
      const productsResponse = await fetch('/api/products')
      const productsData = await productsResponse.json()
      if (productsData.success) {
        setProducts(productsData.products || [])
      }

      setLastUpdate(new Date())
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getMessageTypeColor = (type: string) => {
    return type === 'incoming' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
  }

  const getIntentColor = (intent?: string) => {
    const colors: Record<string, string> = {
      greeting: 'bg-purple-100 text-purple-800',
      merchant_registration: 'bg-orange-100 text-orange-800',
      add_product: 'bg-cyan-100 text-cyan-800',
      product_inquiry: 'bg-indigo-100 text-indigo-800',
      checkout: 'bg-green-100 text-green-800',
      help: 'bg-yellow-100 text-yellow-800',
      general: 'bg-gray-100 text-gray-800',
      fallback: 'bg-red-100 text-red-800'
    }
    return colors[intent || 'general'] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading database data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Database Monitor</h1>
              <p className="text-gray-600">Real-time view of all saved data</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={fetchData}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
              <Link
                href="/"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🏠 Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{messages.length}</h3>
                <p className="text-gray-600">Total Messages</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <span className="text-2xl">🏪</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{merchants.length}</h3>
                <p className="text-gray-600">Registered Merchants</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{products.length}</h3>
                <p className="text-gray-600">Products Added</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">🕒</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{formatTime(lastUpdate.toISOString()).split(',')[1]}</h3>
                <p className="text-gray-600">Last Updated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">💬 Recent Messages ({messages.slice(-10).length} of {messages.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From/To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.slice(-10).reverse().map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(message.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMessageTypeColor(message.message_type)}`}>
                        {message.message_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.phone_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {message.message_body}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.intent && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getIntentColor(message.intent)}`}>
                          {message.intent}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Merchants */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">🏪 Recent Merchants ({merchants.slice(-5).length} of {merchants.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {merchants.slice(-5).reverse().map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(merchant.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {merchant.business_name || merchant.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {merchant.contact_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {merchant.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {merchant.category || 'General'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📦 Recent Products ({products.slice(-5).length} of {products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.slice(-5).reverse().map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(product.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.merchant_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {product.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
