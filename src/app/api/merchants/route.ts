// Merchants API Route
import { NextRequest, NextResponse } from 'next/server'
import { serverMerchantService } from '@/lib/services/merchant.service'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phone = searchParams.get('phone')

    if (phone) {
      // Get specific merchant by phone
      const merchant = await serverMerchantService.getMerchantByPhone(phone)
      
      if (!merchant) {
        return NextResponse.json(
          { success: false, error: 'Merchant not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: merchant
      })
    } else {
      // Get all merchants
      const merchants = await serverMerchantService.getAllMerchants()
      
      return NextResponse.json({
        success: true,
        data: merchants
      })
    }

  } catch (error) {
    console.error('Merchants API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, store_name, business_details, currency, locale } = body

    // Validate required fields
    if (!phone || !store_name) {
      return NextResponse.json(
        { success: false, error: 'Phone and store name are required' },
        { status: 400 }
      )
    }

    // Check if merchant already exists
    const existingMerchant = await serverMerchantService.getMerchantByPhone(phone)
    if (existingMerchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant with this phone already exists' },
        { status: 409 }
      )
    }

    // Create merchant
    const result = await serverMerchantService.createMerchant({
      phone,
      store_name,
      business_details: business_details || '',
      currency: currency || 'SGD',
      locale: locale || 'en-SG'
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })

  } catch (error) {
    console.error('Create merchant error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Merchant ID is required' },
        { status: 400 }
      )
    }

    // Use service role client for updates
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('merchants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Update merchant error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
