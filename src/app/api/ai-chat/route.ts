import { NextRequest, NextResponse } from 'next/server'
import { geminiAI, ChatContext } from '@/lib/services/gemini-ai.service'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, merchantName, chatHistory } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Fetch available products for context
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, description')
      .order('created_at', { ascending: false })
      .limit(20)

    if (productsError) {
      console.error('Error fetching products:', productsError)
    }

    // Build context for AI
    const context: ChatContext = {
      merchantName: merchantName || 'Unknown',
      products: products || [],
      userMessage: message,
      chatHistory: Array.isArray(chatHistory) ? chatHistory : []
    }

    // Get AI response
    const aiResponse = await geminiAI.generateResponse(context)

    // Handle special actions that require database operations
    if (aiResponse.nextAction) {
      switch (aiResponse.nextAction.type) {
        case 'register_merchant':
          if (aiResponse.nextAction.data) {
            const merchantData = aiResponse.nextAction.data as { name: string; phone: string; description: string }
            try {
              // Use the merchants-list endpoint format
              const merchantResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/merchants-list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phone_number: merchantData.phone,
                  business_name: merchantData.name,
                  contact_name: merchantData.name,
                  category: merchantData.description
                })
              })
              
              const merchantResult = await merchantResponse.json()
              if (merchantResult.success) {
                console.log(`✅ Merchant "${merchantData.name}" registered successfully via API`)
              } else {
                console.error('Error registering merchant via API:', merchantResult.error)
              }
            } catch (error) {
              console.error('Error calling merchant registration API:', error)
            }
          }
          break

        case 'add_product':
          if (aiResponse.nextAction.data) {
            const productData = aiResponse.nextAction.data as { name: string; price: number; description: string }
            try {
              // Use the products endpoint
              const productResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: productData.name,
                  price: productData.price,
                  description: productData.description,
                  merchant_id: merchantName || 'web-chat'
                })
              })
              
              const productResult = await productResponse.json()
              if (productResult.success) {
                console.log(`✅ Product "${productData.name}" added successfully via API`)
              } else {
                console.error('Error adding product via API:', productResult.error)
              }
            } catch (error) {
              console.error('Error calling product addition API:', error)
            }
          }
          break
      }
    }

    // Log the conversation for analytics with enhanced data
    const logData = {
      phone_number: 'web-chat',
      merchant_name: merchantName || 'web-chat',
      message_body: message,
      message_type: 'incoming' as const,
      ai_response: aiResponse.text,
      intent: aiResponse.intent,
      metadata: JSON.stringify({
        suggestions: aiResponse.suggestions,
        productRecommendations: aiResponse.productRecommendations,
        nextAction: aiResponse.nextAction,
        chatHistory: chatHistory?.slice(-3) || [],
        timestamp: new Date().toISOString(),
        productCount: products?.length || 0
      })
    }

    const { error: logError } = await supabase
      .from('whatsapp_messages')
      .insert(logData)

    if (logError) {
      console.error('Error logging conversation:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      response: aiResponse
    })

  } catch (error) {
    console.error('AI Chat API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process chat message',
        response: {
          text: 'I apologize, but I\'m having trouble processing your request right now. How else can I help you?',
          intent: 'general',
          suggestions: ['Browse Products 🛍️', 'Try Again 🔄', 'Contact Support 📞']
        }
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AI Chat API is running',
    endpoints: {
      POST: 'Send a chat message for AI processing'
    }
  })
}
