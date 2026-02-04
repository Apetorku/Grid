import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { arkeselClient } from '@/lib/arkesel/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, phoneNumber, title, message } = await request.json()

    // Validate required fields
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // If userId is provided, verify the user exists and get their phone
    let targetPhone = phoneNumber
    let targetUser: any = null

    if (userId) {
      const { data: userData, error: userError } = await (supabase
        .from('users')
        .select('phone, full_name, role')
        .eq('id', userId)
        .single() as any)

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      targetUser = userData
      targetPhone = userData.phone || phoneNumber
    }

    // Check if phone number is available
    if (!targetPhone) {
      return NextResponse.json(
        { error: 'No phone number available for this user' },
        { status: 400 }
      )
    }

    // Send SMS
    const success = await arkeselClient.sendNotification(
      targetPhone,
      title || 'GridNexus Notification',
      message
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send SMS' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      recipient: targetPhone,
      user: targetUser?.full_name,
    })
  } catch (error: any) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send SMS' },
      { status: 500 }
    )
  }
}
