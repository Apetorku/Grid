import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { arkeselClient } from '@/lib/arkesel/client'
import { resendClient } from '@/lib/resend/client'

export async function GET(_request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ notifications })
  } catch (error: any) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, message, type, link } = await request.json()

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
      } as any)
      .select()
      .single()

    if (error) throw error

    // Send SMS and Email to client if they have contact info
    try {
      const { data: userData } = await (supabase
        .from('users')
        .select('phone, email, role')
        .eq('id', userId)
        .single() as any)

      if (userData?.role === 'client') {
        // Send SMS notification asynchronously
        if (userData.phone) {
          arkeselClient.sendNotification(
            userData.phone,
            title,
            message
          ).catch(err => console.error('SMS failed:', err))
        }

        // Send Email notification asynchronously
        if (userData.email) {
          const emailLink = link ? `${process.env.NEXT_PUBLIC_APP_URL}${link}` : undefined
          resendClient.sendNotificationEmail(
            userData.email,
            title,
            message,
            emailLink
          ).catch(err => console.error('Email failed:', err))
        }
      }
    } catch (notifError) {
      // Log but don't fail the notification creation
      console.error('SMS/Email notification error:', notifError)
    }

    return NextResponse.json({ notification: data })
  } catch (error: any) {
    console.error('Notification creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationId } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await ((supabase
      .from('notifications') as any)
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id))

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Notification update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    )
  }
}
