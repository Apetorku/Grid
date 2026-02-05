import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

export async function POST(request: NextRequest) {
  try {
    const { projectId, amount, paymentType = 'initial' } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate payment amount based on type
    const paymentAmount = paymentType === 'initial' 
      ? amount * 0.6  // 60% for initial payment
      : paymentType === 'final'
      ? amount * 0.4  // 40% for final payment
      : amount        // 100% for full payment (legacy)

    // Get project details
    const { data: project } = await supabase
      .from('projects')
      .select('*, developer:developer_id(id)')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const projectData = project as any

    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(paymentAmount * 100), // Convert to pesewas (GHS cents)
        currency: 'GHS',
        metadata: {
          project_id: projectId,
          client_id: user.id,
          developer_id: projectData.developer_id,
          payment_type: paymentType,
          full_amount: amount,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
      }),
    })

    const data = await response.json()

    console.log('Paystack initialization response:', data)

    if (!data.status) {
      throw new Error('Failed to initialize payment')
    }

    // Create payment record
    const { data: paymentRecord, error: paymentError } = await supabase.from('payments').insert({
      project_id: projectId,
      client_id: user.id,
      developer_id: projectData.developer_id,
      amount: paymentAmount,
      payment_type: paymentType,
      status: 'pending',
      paystack_reference: data.data.reference,
      metadata: {
        access_code: data.data.access_code,
        full_project_amount: amount,
        payment_percentage: paymentType === 'initial' ? 60 : paymentType === 'final' ? 40 : 100,
      },
    } as any)
    .select()
    .single()

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      throw new Error('Failed to create payment record: ' + paymentError.message)
    }

    console.log('Payment record created:', paymentRecord)

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error: any) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment initialization failed' },
      { status: 500 }
    )
  }
}
