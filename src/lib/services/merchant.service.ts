// Database service functions for merchants
import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { Merchant, ApiResponse } from '@/types'

// Client-side functions
export class MerchantService {
  private supabase = createClient()

  async getMerchantByPhone(phone: string): Promise<Merchant | null> {
    const { data, error } = await this.supabase
      .from('merchants')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching merchant:', error)
      return null
    }

    return data
  }

  async createMerchant(merchantData: {
    phone: string
    store_name: string
    business_details: string
    currency: string
    locale: string
  }): Promise<ApiResponse<Merchant>> {
    const { data, error } = await this.supabase
      .from('merchants')
      .insert([merchantData])
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

  async updateMerchant(id: string, updates: Partial<Merchant>): Promise<ApiResponse<Merchant>> {
    const { data, error } = await this.supabase
      .from('merchants')
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

  async updateMCPContext(merchantId: string, mcpContext: Record<string, unknown>): Promise<boolean> {
    const { error } = await this.supabase
      .from('merchants')
      .update({ mcp_context: mcpContext })
      .eq('id', merchantId)

    return !error
  }

  async getMCPContext(merchantId: string): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.supabase
      .from('merchants')
      .select('mcp_context')
      .eq('id', merchantId)
      .single()

    if (error) {
      console.error('Error fetching MCP context:', error)
      return null
    }

    return data?.mcp_context as Record<string, unknown> || {}
  }
}

// Server-side functions
export class ServerMerchantService {
  private async getSupabase() {
    return await createServerClient()
  }

  async getMerchantByPhone(phone: string): Promise<Merchant | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching merchant:', error)
      return null
    }

    return data
  }

  async createMerchant(merchantData: {
    phone: string
    store_name: string
    business_details: string
    currency: string
    locale: string
  }): Promise<ApiResponse<Merchant>> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('merchants')
      .insert([merchantData])
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

  async getAllMerchants(): Promise<Merchant[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching merchants:', error)
      return []
    }

    return data || []
  }
}

// Export instances
export const merchantService = new MerchantService()
export const serverMerchantService = new ServerMerchantService()
