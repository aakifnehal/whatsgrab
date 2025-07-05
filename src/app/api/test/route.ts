// Test API Route
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'WhatsGrapp API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      whatsapp_webhook: '/api/whatsapp/webhook',
      merchants: '/api/merchants',
      products: '/api/products'
    },
    status: 'healthy'
  })
}
