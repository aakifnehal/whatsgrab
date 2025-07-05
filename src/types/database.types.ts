// Database types for WhatsGrapp
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string
          phone_number: string
          business_name: string
          contact_name: string | null
          category: string | null
          status: 'active' | 'inactive' | 'pending'
          email: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone_number: string
          business_name: string
          contact_name?: string | null
          category?: string | null
          status?: 'active' | 'inactive' | 'pending'
          email?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone_number?: string
          business_name?: string
          contact_name?: string | null
          category?: string | null
          status?: 'active' | 'inactive' | 'pending'
          email?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          merchant_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: string | null
          stock: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category?: string | null
          stock?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string | null
          stock?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_phone: string
          merchant_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          amount: number
          status: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_phone: string
          merchant_id?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          amount: number
          status?: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_phone?: string
          merchant_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          amount?: number
          status?: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      whatsapp_messages: {
        Row: {
          id: string
          from_number: string
          to_number: string
          message_body: string
          message_type: 'incoming' | 'outgoing'
          merchant_id: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_number: string
          to_number: string
          message_body: string
          message_type: 'incoming' | 'outgoing'
          merchant_id?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_number?: string
          to_number?: string
          message_body?: string
          message_type?: 'incoming' | 'outgoing'
          merchant_id?: string | null
          session_id?: string | null
          created_at?: string
        }
      }
      whatsapp_orders: {
        Row: {
          id: string
          customer_phone: string
          merchant_phone: string
          merchant_id: string | null
          product_name: string
          product_id: string | null
          quantity: number
          amount: number
          status: 'pending' | 'confirmed' | 'paid' | 'cancelled'
          whatsapp_message_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_phone: string
          merchant_phone: string
          merchant_id?: string | null
          product_name: string
          product_id?: string | null
          quantity?: number
          amount: number
          status?: 'pending' | 'confirmed' | 'paid' | 'cancelled'
          whatsapp_message_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_phone?: string
          merchant_phone?: string
          merchant_id?: string | null
          product_name?: string
          product_id?: string | null
          quantity?: number
          amount?: number
          status?: 'pending' | 'confirmed' | 'paid' | 'cancelled'
          whatsapp_message_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      merchant_products: {
        Row: {
          merchant_id: string
          phone_number: string
          business_name: string
          contact_name: string | null
          merchant_category: string | null
          merchant_status: string
          product_id: string | null
          product_name: string | null
          description: string | null
          price: number | null
          image_url: string | null
          product_category: string | null
          stock: number | null
          active: boolean | null
          product_created_at: string | null
        }
      }
      whatsapp_conversation: {
        Row: {
          id: string
          from_number: string
          to_number: string
          message_body: string
          message_type: string
          session_id: string | null
          created_at: string
          business_name: string | null
          contact_name: string | null
        }
      }
    }
    Functions: {
      upsert_merchant: {
        Args: {
          p_phone_number: string
          p_business_name: string
          p_contact_name?: string
          p_category?: string
        }
        Returns: string
      }
      create_product: {
        Args: {
          p_merchant_phone: string
          p_name: string
          p_price: number
          p_description?: string
          p_category?: string
          p_image_url?: string
          p_stock?: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
