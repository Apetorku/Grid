import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get session details
    const { data: session } = await supabase
      .from('screen_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const sessionData = session as any

    // Verify user is part of the session
    if (sessionData.host_id !== user.id && sessionData.participant_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Redirect to meeting room
    return NextResponse.redirect(sessionData.daily_room_url)
  } catch (error: any) {
    console.error('Join meeting error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to join meeting' },
      { status: 500 }
    )
  }
}
