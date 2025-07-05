// WhatsApp Messages API - No authentication required
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get all WhatsApp messages from database
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100) // Limit to last 100 messages

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: messages || []
    })

  } catch (error) {
    console.error('WhatsApp Messages API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { from_number, to_number, message_body, message_type } = body

    // Validate required fields
    if (!from_number || !to_number || !message_body || !message_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Try to get merchant ID if this is from a known merchant
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('phone_number', from_number)
      .single()

    // Save message to database
    const { data: message, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        from_number,
        to_number,
        message_body,
        message_type,
        merchant_id: merchant?.id || null,
        session_id: `web_${from_number.replace('+', '')}_${Date.now()}`
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: message
    })

  } catch (error) {
    console.error('WhatsApp Messages POST API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
