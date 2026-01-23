'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Project, Message } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'
import { Send, Download, Video, CheckCircle } from 'lucide-react'

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProject()
    fetchMessages()
  }, [params.id])

  const fetchProject = async () => {    if (!params.id || Array.isArray(params.id)) return
        const { data } = await supabase
      .from('projects')
      .select('*, developer:developer_id(full_name)')
      .eq('id', params.id)
      .single()

    if (data) setProject(data)
    setLoading(false)
  }

  const fetchMessages = async () => {
    if (!params.id || Array.isArray(params.id)) return
    
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(full_name, avatar_url)')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !project) return

    const { error } = await supabase.from('messages').insert({
      project_id: project.id,
      sender_id: user.id,
      receiver_id: project.developer_id,
      message: newMessage,
    } as any)

    if (!error) {
      setNewMessage('')
      fetchMessages()
      toast.success('Message sent')
    }
  }

  const handlePayment = async () => {
    if (!project) return
    
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          amount: project.final_cost || project.estimated_cost,
        }),
      })

      const data = await response.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      }
    } catch (error) {
      toast.error('Failed to initialize payment')
    }
  }

  const acceptDelivery = async () => {
    if (!project) return

    const { error } = await supabase
      .from('projects')
      .update({ status: 'delivered' } as any)
      .eq('id', project.id)

    if (!error) {
      toast.success('Project accepted! Payment released.')
      fetchProject()
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>
  }

  if (!project) {
    return <div className="text-center py-12">Project not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <p className="text-muted-foreground">{project.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {project.requirements}
                </p>
              </div>
              {project.repository_url && (
                <div>
                  <h3 className="font-semibold mb-2">Repository</h3>
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {project.repository_url}
                  </a>
                </div>
              )}
              {project.hosting_url && (
                <div>
                  <h3 className="font-semibold mb-2">Live Website</h3>
                  <a
                    href={project.hosting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {project.hosting_url}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {message.sender?.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.created_at, 'relative')}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(project.estimated_cost || 0)}
                </p>
              </div>
              {project.final_cost && (
                <div>
                  <p className="text-sm text-muted-foreground">Final Cost</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(project.final_cost)}
                  </p>
                </div>
              )}
              
              {/* Show Pay Now button only if approved and not paid */}
              {project.status === 'approved' && (
                <Button className="w-full" onClick={handlePayment}>
                  Pay Now
                </Button>
              )}
              
              {/* Show payment status for in_progress, completed, delivered */}
              {['in_progress', 'completed', 'delivered'].includes(project.status) && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">✓ Payment Secured</p>
                  <p className="text-xs text-green-600 mt-1">
                    Funds are held in escrow until project completion
                  </p>
                </div>
              )}
              
              {/* Show accept delivery button when completed */}
              {project.status === 'completed' && (
                <Button className="w-full" onClick={acceptDelivery}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept & Release Payment
                </Button>
              )}
              
              {/* Show delivered status */}
              {project.status === 'delivered' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">✓ Project Delivered</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Payment has been released to developer
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                <Video className="mr-2 h-4 w-4" />
                Start Meeting
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Files
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(project.created_at)}</p>
              </div>
              {project.started_at && (
                <div>
                  <p className="text-muted-foreground">Started</p>
                  <p className="font-medium">{formatDate(project.started_at)}</p>
                </div>
              )}
              {project.estimated_duration && (
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{project.estimated_duration} days</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
