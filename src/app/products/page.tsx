'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Heart, Eye } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  description: string
  image_url?: string
  merchant_phone?: string
  created_at?: string
}

interface Merchant {
  phone: string
  business_name?: string
  business_type?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid') // grid or list

  useEffect(() => {
    fetchProducts()
    fetchMerchants()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.products) {
          setProducts(data.products)
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMerchants = async () => {
    try {
      const response = await fetch('/api/merchants-list')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.merchants) {
          setMerchants(data.merchants)
        }
      }
    } catch (error) {
      console.error('Error fetching merchants:', error)
    }
  }

  const getMerchantInfo = (phone: string) => {
    return merchants.find(m => m.phone === phone)
  }

  const getUniqueCategories = () => {
    const categories = new Set<string>()
    products.forEach(product => {
      const merchant = getMerchantInfo(product.merchant_phone || '')
      if (merchant?.business_type) {
        categories.add(merchant.business_type)
      }
    })
    return Array.from(categories)
  }

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (selectedCategory === 'all') return matchesSearch
      
      const merchant = getMerchantInfo(product.merchant_phone || '')
      const matchesCategory = merchant?.business_type === selectedCategory
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        case 'newest':
        default:
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      }
    })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleAddToCart = (product: Product) => {
    // For now, redirect to checkout
    const checkoutUrl = `/checkout?product=${product.name.replace(/\s+/g, '-').toLowerCase()}&merchant=${product.merchant_phone}`
    window.open(checkoutUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WG</span>
              </div>
              <span className="font-bold text-xl">WhatsGrapp Store</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/merchant/onboard" className="text-gray-600 hover:text-gray-900">
                Sell on WhatsGrapp
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                >
                  <div className="w-4 h-4 flex flex-col space-y-1">
                    <div className="bg-current h-0.5 rounded"></div>
                    <div className="bg-current h-0.5 rounded"></div>
                    <div className="bg-current h-0.5 rounded"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            All Products ({filteredProducts.length})
          </h1>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No products available yet.'}
            </p>
            <div className="mt-6">
              <Link href="/merchant/onboard">
                <Button>Add Your Products</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {filteredProducts.map((product) => {
              const merchant = getMerchantInfo(product.merchant_phone || '')
              
              return viewMode === 'grid' ? (
                // Grid View
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">No Image</p>
                        </div>
                      )}
                    </div>
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{product.description}</p>
                    
                    {merchant && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500">
                          Sold by: <span className="font-medium">{merchant.business_name || merchant.phone}</span>
                        </p>
                        {merchant.business_type && (
                          <p className="text-xs text-gray-400">{merchant.business_type}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 text-sm py-2"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Buy Now
                      </Button>
                      <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // List View
                <div key={product.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full rounded-lg"
                        />
                      ) : (
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                          {merchant && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Sold by: <span className="font-medium">{merchant.business_name || merchant.phone}</span>
                              </p>
                              {merchant.business_type && (
                                <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs mt-1">
                                  {merchant.business_type}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</p>
                          <div className="mt-3 flex items-center space-x-2">
                            <Button 
                              onClick={() => handleAddToCart(product)}
                              className="text-sm"
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Buy Now
                            </Button>
                            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                              <Heart className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2025 WhatsGrapp. All rights reserved. | 
              <Link href="/merchant/onboard" className="text-green-600 hover:text-green-700 ml-1">
                Start Selling
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
