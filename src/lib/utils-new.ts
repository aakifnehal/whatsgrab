import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Currency, Locale } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting utilities
export function formatCurrency(amount: number, currency: Currency, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Phone number utilities
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Add + if not present and ensure it starts with country code
  if (!digits.startsWith('65') && !digits.startsWith('60') && !digits.startsWith('62')) {
    return `+65${digits}` // Default to Singapore
  }
  
  return `+${digits}`
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

// Date utilities
export function formatDate(date: string | Date, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

export function formatDateTime(date: string | Date, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

// URL utilities
export function generateCheckoutUrl(merchantId: string, productId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/checkout/${merchantId}/${productId}`
}

export function generateEmbedCode(merchantId: string, productId: string, type: 'js' | 'react'): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  if (type === 'js') {
    return `<script src="${baseUrl}/embed/whatsgrapp.js"></script>
<script>
  WhatsGrapp.init({
    merchantId: "${merchantId}",
    productId: "${productId}",
    theme: "light"
  });
</script>`
  } else {
    return `import { WhatsGrappWidget } from "@whatsgrapp/embed";

export default function MyComponent() {
  return (
    <WhatsGrappWidget
      merchantId="${merchantId}"
      productId="${productId}"
      theme="light"
    />
  );
}`
  }
}

// Currency and locale mappings
export const CURRENCY_LOCALE_MAP: Record<Currency, Locale> = {
  SGD: 'en-SG',
  KHR: 'km-KH',
  IDR: 'id-ID',
  MYR: 'ms-MY',
  MMK: 'my-MM',
  PHP: 'fil-PH',
  THB: 'th-TH',
  VND: 'vi-VN',
}

export const SUPPORTED_CURRENCIES: Currency[] = ['SGD', 'KHR', 'IDR', 'MYR', 'MMK', 'PHP', 'THB', 'VND']
export const SUPPORTED_LOCALES: Locale[] = ['en-SG', 'th-TH', 'id-ID', 'ms-MY', 'km-KH', 'my-MM', 'fil-PH', 'vi-VN']
