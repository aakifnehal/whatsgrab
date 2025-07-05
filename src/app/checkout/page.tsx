'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  description: string
  image_url?: string
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const productParam = searchParams.get('product') // Can be ID or name
  const merchantParam = searchParams.get('merchant')
  const amountParam = searchParams.get('amount')
  const quantity = parseInt(searchParams.get('qty') || '1')
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'card'
  })

  useEffect(() => {
    if (productParam || amountParam) {
      if (amountParam) {
        // Handle custom amount checkout
        setProduct({
          id: 'custom',
          name: `Custom Payment - $${amountParam}`,
          price: parseFloat(amountParam),
          description: 'Custom payment amount'
        })
        setLoading(false)
      } else {
        fetchProduct(productParam!)
      }
    } else {
      setLoading(false)
    }
  }, [productParam, amountParam])

  const fetchProduct = async (productIdentifier: string) => {
    try {
      // First try to fetch all products and find by name
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.products) {
          // Try to find product by name (case-insensitive)
          let foundProduct = data.products.find((p: Product) => 
            p.name.toLowerCase().replace(/\s+/g, '-') === productIdentifier.toLowerCase() ||
            p.name.toLowerCase() === productIdentifier.toLowerCase().replace(/-/g, ' ') ||
            p.id === productIdentifier
          )
          
          if (!foundProduct) {
            // Create a default product if not found
            foundProduct = {
              id: 'default',
              name: productIdentifier.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              price: 99.99,
              description: 'Product details will be confirmed during checkout'
            }
          }
          
          setProduct(foundProduct)
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching product:', error)
      // Create a fallback product
      setProduct({
        id: 'fallback',
        name: productIdentifier.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        price: 99.99,
        description: 'Product details will be confirmed during checkout'
      })
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo({
      ...customerInfo,
      [field]: value
    })
  }

  const handleSubmit = async () => {
    setProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setOrderPlaced(true)
      setProcessing(false)
    }, 2000)
  }

  const total = product ? product.price * quantity : 0

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Order success state
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your purchase. You&apos;ll receive a confirmation email shortly.</p>
          <div className="space-y-2">
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Place Another Order
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-bold text-gray-900">WhatsGrapp</span>
            </Link>
            <div className="text-sm text-gray-600">
              Secure Checkout
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="flex items-center space-x-4 p-4 border rounded-lg mb-4">
              {product.image_url ? (
                <Image 
                  src={product.image_url} 
                  alt={product.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold">${product.price}</span>
                  <span className="text-sm text-gray-500">Qty: {quantity}</span>
                </div>
              </div>
            </div>

            {merchantParam && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Merchant:</strong> {merchantParam.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <Input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <Input
                    type="text"
                    value={customerInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <Input
                    type="text"
                    value={customerInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="ZIP Code"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={customerInfo.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash on Delivery</option>
                </select>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={processing || !customerInfo.name || !customerInfo.email || !customerInfo.phone}
                className="w-full mt-6"
                size="lg"
              >
                {processing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Place Order - $${total.toFixed(2)}`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
