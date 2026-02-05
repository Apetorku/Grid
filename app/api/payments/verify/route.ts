import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { arkeselClient } from '@/lib/arkesel/client'
import { resendClient } from '@/lib/resend/client'

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

    const projectId = (existingPayment as any).project_id

    // Update payment record
    const { error: updateError } = await (supabase
      .from('payments') as any)
      .update({
        status: 'escrowed',
        paystack_transaction_id: data.data.id,
        escrow_date: new Date().toISOString(),
      })
      .eq('paystack_reference', reference)

    if (updateError) {
      console.error('Error updating payment:', updateError)
    }

    console.log('Payment updated, project_id:', projectId)

    if (projectId) {
      // Update project status
      await (supabase
        .from('projects') as any)
        .update({ status: 'in_progress' })
        .eq('id', projectId)

      // Create notification for developer
      if ((existingPayment as any).developer_id) {
        const { error: devNotifError } = await supabase.from('notifications').insert({
          user_id: (existingPayment as any).developer_id,
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
      if ((existingPayment as any).client_id) {
        const { error: clientNotifError } = await supabase.from('notifications').insert({
          user_id: (existingPayment as any).client_id,
          title: 'Payment Successful',
          message: 'Your payment has been secured in escrow. The developer will start working on your project.',
          type: 'success',
          link: `/client/projects/${projectId}`,
        } as any)
        if (clientNotifError) {
          console.error('Failed to create client notification:', clientNotifError)
        }

        // Send SMS and Email to client
        try {
          const { data: clientData } = await (supabase
            .from('users')
            .select('phone, email')
            .eq('id', (existingPayment as any).client_id)
            .single() as any)
          
          if (clientData?.phone) {
            arkeselClient.sendNotification(
              clientData.phone,
              'Payment Successful',
              'Your payment has been secured in escrow. The developer will start working on your project.'
            ).catch(err => console.error('SMS failed:', err))
          }

          if (clientData?.email) {
            const projectLink = `${process.env.NEXT_PUBLIC_APP_URL}/client/projects/${projectId}`
            resendClient.sendNotificationEmail(
              clientData.email,
              'Payment Successful',
              'Your payment has been secured in escrow. The developer will start working on your project.',
              projectLink
            ).catch(err => console.error('Email failed:', err))
          }
        } catch (notifError) {
          console.error('Failed to send payment notifications:', notifError)
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
