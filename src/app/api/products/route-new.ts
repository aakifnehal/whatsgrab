// Products API Route - Simplified for WhatsApp integration
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Get all products from database (no auth required)
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        merchants (
          business_name,
          phone_number,
          contact_name
        )
      `)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      products: products || []
    })

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, description, category, image_url, merchant_id } = body

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400 }
      )
    }

    // If no merchant_id provided, create a default one
    let finalMerchantId = merchant_id

    if (!finalMerchantId) {
      // Create or get default merchant
      const { data: defaultMerchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('phone_number', 'default')
        .single()

      if (merchantError || !defaultMerchant) {
        // Create default merchant
        const { data: newMerchant, error: createError } = await supabase
          .from('merchants')
          .insert({
            phone_number: 'default',
            business_name: 'WhatsGrapp Demo Store',
            contact_name: 'Demo User',
            status: 'active'
          })
          .select()
          .single()

        if (createError || !newMerchant) {
          return NextResponse.json(
            { success: false, error: 'Failed to create merchant' },
            { status: 500 }
          )
        }
        finalMerchantId = newMerchant.id
      } else {
        finalMerchantId = defaultMerchant.id
      }
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        merchant_id: finalMerchantId,
        name,
        price: parseFloat(price),
        description: description || '',
        image_url: image_url || null,
        active: true,
        stock: 100 // Default stock
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      product: product
    })

  } catch (error) {
    console.error('Products POST API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, price, description, image_url } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        price: parseFloat(price),
        description,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      product: product
    })

  } catch (error) {
    console.error('Products PUT API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Products DELETE API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
