import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { arkeselClient } from '@/lib/arkesel/client'
import { resendClient } from '@/lib/resend/client'

// Using Jitsi Meet - completely free!
const JITSI_DOMAIN = 'meet.jit.si'

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, client_id, developer_id, title')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      console.error('Project fetch error:', projectError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify user is part of the project
    const projectData = project as any
    if (projectData.client_id !== user.id && projectData.developer_id !== user.id) {
      console.error('Authorization failed - User:', user.id, 'Client:', projectData.client_id, 'Developer:', projectData.developer_id)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create unique room name for Jitsi
    const roomName = `GridNexus-${projectId}-${Date.now()}`
    const roomUrl = `https://${JITSI_DOMAIN}/${roomName}`

    // Save session to database
    const { data: session, error: sessionError } = await supabase
      .from('screen_sessions')
      .insert({
        project_id: projectId,
        host_id: user.id,
        participant_id: projectData.client_id === user.id ? projectData.developer_id : projectData.client_id,
        daily_room_name: roomName,
        daily_room_url: roomUrl,
      } as any)
      .select()
      .single()

    if (sessionError || !session) {
      console.error('Failed to create session:', sessionError)
      return NextResponse.json({ error: 'Failed to save meeting session' }, { status: 500 })
    }

    const sessionData = session as any

    // Notify the other user
    const otherUserId = projectData.client_id === user.id ? projectData.developer_id : projectData.client_id
    await supabase.from('notifications').insert({
      user_id: otherUserId,
      title: 'Meeting Started',
      message: 'A meeting has been started for your project. Click to join.',
      type: 'info',
      link: `/api/meetings/join?sessionId=${sessionData.id}`,
    } as any)

    // Send SMS and Email if the other user is a client
    try {
      const { data: otherUser } = await (supabase
        .from('users')
        .select('phone, email, role')
        .eq('id', otherUserId)
        .single() as any)
      
      if (otherUser?.role === 'client') {
        const meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meetings/${sessionData.id}`
        const message = `A meeting has been started for your project: ${projectData.title}. Join now!`

        if (otherUser.phone) {
          arkeselClient.sendNotification(
            otherUser.phone,
            'Meeting Started',
            `${message} ${meetingUrl}`
          ).catch(err => console.error('SMS failed:', err))
        }

        if (otherUser.email) {
          resendClient.sendNotificationEmail(
            otherUser.email,
            'Meeting Started',
            message,
            meetingUrl
          ).catch(err => console.error('Email failed:', err))
        }
      }
    } catch (notifError) {
      console.error('Failed to send meeting notifications:', notifError)
    }

    return NextResponse.json({
      roomUrl: roomUrl,
      sessionId: sessionData.id,
    })
  } catch (error: any) {
    console.error('Meeting creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
