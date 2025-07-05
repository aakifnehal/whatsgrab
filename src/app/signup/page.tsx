// FILE: src/app/signup/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignUpPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isAwaitingOtp, setIsAwaitingOtp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const supabase = createClient()
  const router = useRouter()

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // IMPORTANT: Use E.164 format for phone numbers, e.g., +12223334444
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
      options: {
        channel: 'whatsapp',
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setIsAwaitingOtp(true)
    }
    setIsLoading(false)
  }

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms', // Supabase uses 'sms' type for WhatsApp OTP verification
    })

    if (error) {
      setError(error.message)
    } else {
      // On successful login, we need to check if they have a merchant profile.
      // For now, let's just redirect to a temporary dashboard page.
      console.log('Successfully signed in!', data.session)
      router.push('/dashboard')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create your Account</h1>
          <p className="text-gray-500">
            {isAwaitingOtp
              ? 'We sent a code to your WhatsApp.'
              : 'Enter your phone to get started.'}
          </p>
        </div>

        {!isAwaitingOtp ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="sr-only">Phone Number</label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. +12223334444"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Code via WhatsApp'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="sr-only">OTP</label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>
        )}

        {error && <p className="text-sm text-center text-red-500">{error}</p>}
      </div>
    </div>
  )
}