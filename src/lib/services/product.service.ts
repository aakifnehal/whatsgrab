// Database service functions for products
import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { Product, ApiResponse } from '@/types'

// Client-side functions
export class ProductService {
  private supabase = createClient()

  async getProductsByMerchant(merchantId: string): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data || []
  }

  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching product:', error)
      return null
    }

    return data
  }

  async createProduct(productData: {
    merchant_id: string
    name: string
    price: number
    stock: number
    discount?: number
    image_url?: string
    description?: string
  }): Promise<ApiResponse<Product>> {
    const { data, error } = await this.supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('products')
      .update({ active: false })
      .eq('id', id)

    return !error
  }

  async updateStock(id: string, stock: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('products')
      .update({ stock })
      .eq('id', id)

    return !error
  }

  async getLowStockProducts(merchantId: string, threshold: number = 3): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('active', true)
      .lte('stock', threshold)
      .order('stock', { ascending: true })

    if (error) {
      console.error('Error fetching low stock products:', error)
      return []
    }

    return data || []
  }
}

// Server-side functions
export class ServerProductService {
  private async getSupabase() {
    return await createServerClient()
  }

  async getAllActiveProducts(): Promise<Product[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        merchant:merchants(id, store_name, currency, locale)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data || []
  }

  async getProduct(id: string): Promise<Product | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        merchant:merchants(id, store_name, currency, locale)
      `)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching product:', error)
      return null
    }

    return data
  }

  async searchProducts(query: string): Promise<Product[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        merchant:merchants(id, store_name, currency, locale)
      `)
      .eq('active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching products:', error)
      return []
    }

    return data || []
  }

  async getProductsByMerchant(merchantId: string): Promise<Product[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching merchant products:', error)
      return []
    }

    return data || []
  }
}

// Export instances
export const productService = new ProductService()
export const serverProductService = new ServerProductService()
