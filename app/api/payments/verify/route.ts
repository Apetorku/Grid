import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get('reference')

    console.log('Verifying payment with reference:', reference)

    if (!reference) {
      return NextResponse.redirect(new URL('/client?error=no_reference', request.url))
    }

    // Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    console.log('Paystack verification response:', data)

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.redirect(new URL('/client?error=payment_failed', request.url))
    }

    const supabase = await createClient()

    // Get the payment record first to get project_id
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('paystack_reference', reference)
      .single()

    if (fetchError || !existingPayment) {
      console.error('Payment record not found:', fetchError)
      return NextResponse.redirect(new URL('/client?error=payment_not_found', request.url))
    }

    console.log('Found payment record:', existingPayment)

    // Update payment record
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'escrowed',
        paystack_transaction_id: data.data.id,
        escrow_date: new Date().toISOString(),
      } as any)
      .eq('paystack_reference', reference)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating payment:', updateError)
    }

    const paymentData = payment as any
    const projectId = existingPayment.project_id

    console.log('Payment updated, project_id:', projectId)

    if (projectId) {
      // Update project status
      await supabase
        .from('projects')
        .update({ status: 'in_progress' } as any)
        .eq('id', projectId)

      // Create notification for developer
      if (existingPayment.developer_id) {
        const { error: devNotifError } = await supabase.from('notifications').insert({
          user_id: existingPayment.developer_id,
          title: 'New Project Payment Received',
          message: 'A client has paid for a project. You can now start working on it.',
          type: 'success',
          link: `/developer/projects/${projectId}`,
        } as any)
        if (devNotifError) {
          console.error('Failed to create developer notification:', devNotifError)
        }
      }

      // Create notification for client
      if (existingPayment.client_id) {
        const { error: clientNotifError } = await supabase.from('notifications').insert({
          user_id: existingPayment.client_id,
          title: 'Payment Successful',
          message: 'Your payment has been secured in escrow. The developer will start working on your project.',
          type: 'success',
          link: `/client/projects/${projectId}`,
        } as any)
        if (clientNotifError) {
          console.error('Failed to create client notification:', clientNotifError)
        }
      }
    }

    return NextResponse.redirect(
      new URL(`/client/projects/${projectId}?payment=success`, request.url)
    )
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.redirect(new URL('/client?error=verification_failed', request.url))
  }
}
