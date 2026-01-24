'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Video, Calendar, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Meeting {
  id: string
  project_id: string
  daily_room_name: string
  daily_room_url: string
  created_at: string
  project: {
    id: string
    title: string
    client: {
      full_name: string
    } | null
  }
}

export default function DeveloperMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('video_sessions')
      .select(`
        *,
        project:projects(
          id,
          title,
          client:client_id(full_name)
        )
      `)
      .or(`creator_id.eq.${user.id},participant_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMeetings(data as any)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meetings</h1>
        <p className="text-muted-foreground">View and join your project meetings</p>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No meetings yet. Meetings can be started from project pages.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {meeting.project?.title || 'Project Meeting'}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>with {meeting.project?.client?.full_name || 'Client'}</span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(meeting.created_at), { addSuffix: true })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Room: {meeting.daily_room_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/developer/projects/${meeting.project_id}`}>
                      <Button variant="outline" size="sm">
                        View Project
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => window.open(meeting.daily_room_url, '_blank')}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
