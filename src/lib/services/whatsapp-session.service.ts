// Database service functions for WhatsApp sessions
import { createClient as createServerClient } from '@/lib/supabase/server'
import { MCPContext } from '@/types'

export interface WhatsAppSessionData {
  id?: string
  phone: string
  merchant_id?: string
  current_step: string
  session_data: Record<string, unknown>
  last_activity?: string
  expires_at?: string
}

// Server-side functions (WhatsApp sessions are typically managed server-side)
export class WhatsAppSessionService {
  private async getSupabase() {
    return await createServerClient()
  }

  async getSession(phone: string): Promise<WhatsAppSessionData | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('phone', phone)
      .gt('expires_at', new Date().toISOString())
      .order('last_activity', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching WhatsApp session:', error)
      return null
    }

    return data
  }

  async createSession(sessionData: {
    phone: string
    merchant_id?: string
    current_step: string
    session_data?: Record<string, unknown>
  }): Promise<WhatsAppSessionData | null> {
    const supabase = await this.getSupabase()
    
    // First, expire any existing sessions for this phone
    await this.expireSessionsForPhone(sessionData.phone)

    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .insert([{
        ...sessionData,
        session_data: sessionData.session_data || {},
        last_activity: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating WhatsApp session:', error)
      return null
    }

    return data
  }

  async updateSession(phone: string, updates: {
    current_step?: string
    session_data?: Record<string, unknown>
    merchant_id?: string
  }): Promise<WhatsAppSessionData | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .update({
        ...updates,
        last_activity: new Date().toISOString()
      })
      .eq('phone', phone)
      .gt('expires_at', new Date().toISOString())
      .select()
      .order('last_activity', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error updating WhatsApp session:', error)
      return null
    }

    return data
  }

  async updateSessionData(phone: string, newData: Record<string, unknown>): Promise<boolean> {
    const session = await this.getSession(phone)
    if (!session) return false

    const updatedSessionData = {
      ...session.session_data,
      ...newData
    }

    const result = await this.updateSession(phone, {
      session_data: updatedSessionData
    })

    return result !== null
  }

  async expireSession(phone: string): Promise<boolean> {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('whatsapp_sessions')
      .update({ expires_at: new Date().toISOString() })
      .eq('phone', phone)

    return !error
  }

  async expireSessionsForPhone(phone: string): Promise<boolean> {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('whatsapp_sessions')
      .update({ expires_at: new Date().toISOString() })
      .eq('phone', phone)
      .gt('expires_at', new Date().toISOString())

    return !error
  }

  async cleanupExpiredSessions(): Promise<number> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (error) {
      console.error('Error cleaning up expired sessions:', error)
      return 0
    }

    return data?.length || 0
  }

  async getActiveSessionsCount(): Promise<number> {
    const supabase = await this.getSupabase()
    const { count, error } = await supabase
      .from('whatsapp_sessions')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', new Date().toISOString())

    if (error) {
      console.error('Error counting active sessions:', error)
      return 0
    }

    return count || 0
  }

  // MCP Context helpers
  async getMCPContext(phone: string): Promise<MCPContext | null> {
    const session = await this.getSession(phone)
    if (!session || !session.session_data) return null

    return session.session_data.mcpContext as MCPContext || null
  }

  async updateMCPContext(phone: string, mcpContext: Partial<MCPContext>): Promise<boolean> {
    const session = await this.getSession(phone)
    if (!session) return false

    const currentMCP = session.session_data.mcpContext as MCPContext || {
      currentStep: 'start',
      completed: [],
      pending: [],
      data: {},
      sessionHistory: []
    }

    const updatedMCP: MCPContext = {
      ...currentMCP,
      ...mcpContext,
      data: { ...currentMCP.data, ...mcpContext.data }
    }

    return await this.updateSessionData(phone, { mcpContext: updatedMCP })
  }

  async addMCPHistoryEntry(phone: string, entry: {
    step: string
    input: string
    output: string
  }): Promise<boolean> {
    const mcpContext = await this.getMCPContext(phone)
    if (!mcpContext) return false

    const newEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    }

    const updatedHistory = [...mcpContext.sessionHistory, newEntry]

    return await this.updateMCPContext(phone, {
      sessionHistory: updatedHistory
    })
  }
}

// Export instance
export const whatsappSessionService = new WhatsAppSessionService()
