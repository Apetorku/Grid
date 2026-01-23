'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { MessageSquare, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ProjectWithMessages {
  id: string
  title: string
  client_id: string
  client?: {
    full_name: string
    avatar_url?: string
  }
  lastMessage?: {
    content: string
    created_at: string
    sender_role: string
  }
  unreadCount: number
}

export default function DeveloperMessagesPage() {
  const [projects, setProjects] = useState<ProjectWithMessages[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProjectsWithMessages()
  }, [])

  const fetchProjectsWithMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all developer's projects with client info
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          client_id,
          client:users!projects_client_id_fkey(full_name, avatar_url)
        `)
        .eq('developer_id', user.id)
        .order('updated_at', { ascending: false })

      if (projectsError) throw projectsError

      // Fetch last message and unread count for each project
      const projectsWithMessages = await Promise.all(
        (projectsData || []).map(async (project) => {
          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at, sender_role')
            .eq('project_id', project.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .eq('sender_role', 'client')
            .eq('read', false)

          return {
            ...project,
            lastMessage: lastMsg || undefined,
            unreadCount: count || 0
          }
        })
      )

      setProjects(projectsWithMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">View all your project conversations</p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">Your project conversations will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/developer/projects/${project.id}?tab=communication`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={project.client?.avatar_url} />
                        <AvatarFallback>{getInitials(project.client?.full_name || '')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-sm">
                          <span>with {project.client?.full_name}</span>
                        </CardDescription>
                      </div>
                    </div>
                    {project.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2">
                        {project.unreadCount}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                {project.lastMessage && (
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-2 text-sm">
                      <p className="text-muted-foreground flex-1 truncate">
                        <span className="font-medium">
                          {project.lastMessage.sender_role === 'developer' ? 'You' : project.client?.full_name}:
                        </span>{' '}
                        {project.lastMessage.content}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(project.lastMessage.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
