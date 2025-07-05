// Merchants API - No authentication required
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get all merchants from database
    const { data: merchants, error } = await supabase
      .from('merchants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch merchants' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      merchants: merchants || []
    })

  } catch (error) {
    console.error('Merchants API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone_number, business_name, contact_name, category } = body

    // Validate required fields
    if (!phone_number || !business_name) {
      return NextResponse.json(
        { success: false, error: 'Phone number and business name are required' },
        { status: 400 }
      )
    }

    // Use the upsert_merchant function if available, otherwise insert directly
    try {
      const { data: merchantId, error: rpcError } = await supabase.rpc('upsert_merchant', {
        p_phone_number: phone_number,
        p_business_name: business_name,
        p_contact_name: contact_name || null,
        p_category: category || null
      })

      if (rpcError) throw rpcError

      // Get the full merchant record
      const { data: merchant, error: selectError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', merchantId)
        .single()

      if (selectError) throw selectError

      return NextResponse.json({
        success: true,
        merchant: merchant
      })

    } catch {
      // Fallback to direct insert if RPC function doesn't exist
      const { data: merchant, error } = await supabase
        .from('merchants')
        .upsert({
          phone_number,
          business_name,
          contact_name: contact_name || null,
          category: category || null,
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to save merchant' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        merchant: merchant
      })
    }

  } catch (error) {
    console.error('Merchants POST API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
