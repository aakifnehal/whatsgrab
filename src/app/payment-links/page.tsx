'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  description: string
}

export default function PaymentLinks() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [generatedLink, setGeneratedLink] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePaymentLink = () => {
    if (selectedProduct) {
      const baseUrl = window.location.origin
      const link = `${baseUrl}/checkout?product=${selectedProduct.id}&qty=${quantity}`
      setGeneratedLink(link)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    alert('Payment link copied to clipboard!')
  }

  const shareViaWhatsApp = () => {
    const message = `🛒 Check out this amazing product!\n\n${selectedProduct?.name}\n💰 $${selectedProduct?.price}\n\n🔗 Buy now: ${generatedLink}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
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
              <Link href="/payment-links" className="text-green-600 font-medium">Payment Links</Link>
              <Link href="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Link Generator</h1>
          <p className="text-gray-600 mt-2">Create instant payment links for your products to share via WhatsApp</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Select Product</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedProduct?.id === product.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-green-600">${product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">You need to add products before creating payment links</p>
                <Link href="/products/manage">
                  <Button>Add Products</Button>
                </Link>
              </div>
            )}

            {selectedProduct && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full"
                    />
                  </div>
                  <div className="pt-6">
                    <Button onClick={generatePaymentLink} className="px-8">
                      Generate Link
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated Link */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Link</h2>
            
            {selectedProduct ? (
              <div className="space-y-6">
                {/* Product Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Product</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">${selectedProduct.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-green-600">${(selectedProduct.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Generated Link */}
                {generatedLink && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Generated Payment Link
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          value={generatedLink}
                          readOnly
                          className="flex-1 bg-gray-50"
                        />
                        <Button onClick={copyToClipboard} variant="outline">
                          📋 Copy
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button onClick={shareViaWhatsApp} className="w-full" size="lg">
                        📱 Share via WhatsApp
                      </Button>
                      
                      <div className="text-center">
                        <Link href={generatedLink} target="_blank">
                          <Button variant="outline" className="w-full">
                            🔗 Preview Checkout Page
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">QR Code</h4>
                      <div className="flex items-center justify-center h-32 bg-white rounded border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <span className="text-2xl block mb-2">📱</span>
                          <span className="text-sm">QR Code would appear here</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        Customers can scan this QR code to access the payment link
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No product selected</h3>
                <p className="text-gray-600">Select a product from the left to generate a payment link</p>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Pro Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📱 WhatsApp Sharing</h4>
              <p className="text-gray-600">Share payment links directly in WhatsApp for instant purchases</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📊 Track Performance</h4>
              <p className="text-gray-600">Monitor link clicks and conversions in your analytics dashboard</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔒 Secure Payments</h4>
              <p className="text-gray-600">All payment links are secure and encrypted for customer safety</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">⚡ Instant Setup</h4>
              <p className="text-gray-600">No additional setup required - links work immediately after generation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
