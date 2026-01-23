const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!

export interface PaystackConfig {
  publicKey: string
  currency: string
}

export const paystackConfig: PaystackConfig = {
  publicKey: paystackPublicKey,
  currency: 'GHS',
}

export interface PaymentData {
  email: string
  amount: number
  currency?: string
  metadata?: {
    project_id: string
    client_id: string
    developer_id: string
    [key: string]: any
  }
  callback_url?: string
}

export async function initializePayment(data: PaymentData) {
  try {
    const response = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Payment initialization failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Paystack initialization error:', error)
    throw error
  }
}

export async function verifyPayment(reference: string) {
  try {
    const response = await fetch(`/api/payments/verify?reference=${reference}`)
    
    if (!response.ok) {
      throw new Error('Payment verification failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Paystack verification error:', error)
    throw error
  }
}
