import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DAILY_API_KEY = process.env.DAILY_API_SECRET!

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project details
    const { data: project } = await supabase
      .from('projects')
      .select('*, client_id, developer_id')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const projectData = project as any

    // Verify user is part of the project
    if (projectData.client_id !== user.id && projectData.developer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create Daily.co room
    const roomName = `gridnexus-${projectId}-${Date.now()}`
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: false,
          start_video_off: false,
          start_audio_off: false,
          max_participants: 2,
        },
      }),
    })

    const data = await response.json()

    if (!data.url) {
      throw new Error('Failed to create meeting room')
    }

    // Save session to database
    const { data: session } = await supabase
      .from('screen_sessions')
      .insert({
        project_id: projectId,
        host_id: user.id,
        participant_id: projectData.client_id === user.id ? projectData.developer_id : projectData.client_id,
        daily_room_name: roomName,
        daily_room_url: data.url,
      } as any)
      .select()
      .single()

    const sessionData = session as any

    // Notify the other user
    const otherUserId = projectData.client_id === user.id ? projectData.developer_id : projectData.client_id
    await supabase.from('notifications').insert({
      user_id: otherUserId,
      title: 'Meeting Started',
      message: 'A meeting has been started for your project. Click to join.',
      type: 'info',
      link: `/api/meetings/join?sessionId=${sessionData?.id}`,
    } as any)

    return NextResponse.json({
      roomUrl: data.url,
      sessionId: sessionData?.id,
    })
  } catch (error: any) {
    console.error('Meeting creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
