import { Database } from './database.types'

// Supabase Types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Application Types
export type Merchant = Tables<'merchants'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>

// Currency Types
export type Currency = 'SGD' | 'KHR' | 'IDR' | 'MYR' | 'MMK' | 'PHP' | 'THB' | 'VND'

// Locale Types
export type Locale = 'en-SG' | 'th-TH' | 'id-ID' | 'ms-MY' | 'km-KH' | 'my-MM' | 'fil-PH' | 'vi-VN'

// WhatsApp Types
export interface WhatsAppMessage {
  from: string
  to: string
  body: string
  messageId?: string
  timestamp?: string
}

export interface WhatsAppSession {
  phone: string
  merchantId?: string
  step: string
  context: Record<string, unknown>
  lastActivity: string
}

// MCP Context Types
export interface MCPContext {
  currentStep: string
  completed: string[]
  pending: string[]
  data: Record<string, unknown>
  sessionHistory: Array<{
    timestamp: string
    step: string
    input: string
    output: string
  }>
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form Types
export interface StoreFormData {
  storeName: string
  businessDetails: string
  currency: Currency
  locale: Locale
}

export interface ProductFormData {
  name: string
  price: number
  stock: number
  discount?: number
  image?: File
}

// Checkout Types
export interface CheckoutSession {
  merchantId: string
  productId: string
  amount: number
  currency: Currency
  customerPhone?: string
  customerName?: string
}

// Embed Types
export interface EmbedConfig {
  merchantId: string
  productId?: string
  currency: Currency
  theme?: 'light' | 'dark'
  showBranding?: boolean
}

// AI Types
export interface RestockAlert {
  productId: string
  productName: string
  currentStock: number
  recommendedReorder: number
  priority: 'high' | 'medium' | 'low'
}

export interface SalesForecast {
  merchantId: string
  period: string
  predictedSales: number
  confidence: number
  recommendations: string[]
}
