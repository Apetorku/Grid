import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

export async function POST(request: NextRequest) {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(await request.json()))
      .digest('hex')

    const signature = request.headers.get('x-paystack-signature')

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = await request.json()
    const { event, data } = body

    const supabase = await createClient()

    if (event === 'charge.success') {
      // Update payment and project status
      await (supabase
        .from('payments') as any)
        .update({
          status: 'escrowed',
          paystack_transaction_id: data.id,
          escrow_date: new Date().toISOString(),
        })
        .eq('paystack_reference', data.reference)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
