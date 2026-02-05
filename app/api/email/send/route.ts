import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resendClient } from '@/lib/resend/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, email, subject, message, link } = await request.json()

    // Validate required fields
    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: 'Email, subject, and message are required' },
        { status: 400 }
      )
    }

    // If userId is provided, verify the user exists and get their email
    let targetEmail = email
    let targetUser: any = null

    if (userId) {
      const { data: userData, error: userError } = await (supabase
        .from('users')
        .select('email, full_name, role')
        .eq('id', userId)
        .single() as any)

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      targetUser = userData
      targetEmail = userData.email || email
    }

    // Check if email is available
    if (!targetEmail) {
      return NextResponse.json(
        { error: 'No email address available for this user' },
        { status: 400 }
      )
    }

    // Send email
    const success = await resendClient.sendNotificationEmail(
      targetEmail,
      subject,
      message,
      link
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      recipient: targetEmail,
      user: targetUser?.full_name,
    })
  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
