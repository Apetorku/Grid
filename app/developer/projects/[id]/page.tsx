'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Project, Message, ProjectDeliverable } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatDate, getStatusColor, getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import { Send, Upload, Video, Paperclip, Smile, Loader2, ArrowLeft, FileText, Download, X } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

export default function DeveloperProjectPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [finalCost, setFinalCost] = useState('')
  const [duration, setDuration] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [hostingUrl, setHostingUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')
  const [deliverables, setDeliverables] = useState<ProjectDeliverable[]>([])
  const [uploadingDeliverable, setUploadingDeliverable] = useState(false)
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null)
  const [deliverableDescription, setDeliverableDescription] = useState('')
  const [projectFiles, setProjectFiles] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)
      
      fetchProject()
      fetchMessages()
      fetchDeliverables()
      fetchProjectFiles()
    }
    init()
  }, [params.id])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const fetchProject = async () => {
    if (!params.id || Array.isArray(params.id)) return
    
    const { data } = await supabase
      .from('projects')
      .select('*, client:client_id(full_name, email)')
      .eq('id', params.id)
      .single()

    if (data) {
      const projectData = data as any
      setProject(projectData)
      setFinalCost(projectData.final_cost?.toString() || projectData.estimated_cost?.toString() || '')
      setDuration(projectData.estimated_duration?.toString() || '')
    }
    setLoading(false)
  }

  const fetchMessages = async () => {
    if (!params.id || Array.isArray(params.id)) return
    
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(full_name, avatar_url), file_url')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true })

    if (data) {
      console.log('Developer fetched messages:', data)
      setMessages(data)
    }
  }

  const fetchDeliverables = async () => {
    if (!params.id || Array.isArray(params.id)) return
    
    const { data, error } = await supabase
      .from('project_deliverables')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching deliverables:', error)
    } else if (data) {
      setDeliverables(data)
    }
  }

  const fetchProjectFiles = async () => {
    if (!params.id || Array.isArray(params.id)) return
    
    console.log('Fetching project files for project:', params.id)
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching project files:', error)
    } else if (data) {
      console.log('Project files fetched:', data.length, 'files')
      console.log('Files:', data)
      setProjectFiles(data)
    }
  }

  const uploadDeliverable = async () => {
    if (!deliverableFile || !project) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUploadingDeliverable(true)

    try {
      // Upload file to storage
      const fileExt = deliverableFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-deliverables')
        .upload(`${project.id}/${fileName}`, deliverableFile)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error(`Failed to upload file: ${uploadError.message}`)
        setUploadingDeliverable(false)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-deliverables')
        .getPublicUrl(uploadData.path)

      // Save deliverable record to database
      const { error: dbError } = await supabase
        .from('project_deliverables')
        .insert({
          project_id: project.id,
          uploaded_by: user.id,
          file_name: deliverableFile.name,
          file_url: publicUrl,
          file_type: deliverableFile.type,
          file_size: deliverableFile.size,
          description: deliverableDescription || null,
        })

      if (dbError) {
        console.error('Database error:', dbError)
        toast.error('Failed to save deliverable record')
        setUploadingDeliverable(false)
        return
      }

      toast.success('Deliverable uploaded successfully!')
      setDeliverableFile(null)
      setDeliverableDescription('')
      fetchDeliverables()
      
      // Create notification for client
      await supabase.from('notifications').insert({
        user_id: project.client_id,
        type: 'info',
        title: 'New Deliverable Uploaded',
        message: `${user.full_name} uploaded a new deliverable: ${deliverableFile.name}`,
        link: `/client/projects/${project.id}?tab=files`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload deliverable')
    } finally {
      setUploadingDeliverable(false)
    }
  }

  const deleteDeliverable = async (deliverable: ProjectDeliverable) => {
    if (!confirm(`Delete ${deliverable.file_name}?`)) return

    try {
      // Extract path from URL
      const urlParts = deliverable.file_url.split('/project-deliverables/')
      if (urlParts.length < 2) {
        toast.error('Invalid file URL')
        return
      }
      const filePath = urlParts[1]

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-deliverables')
        .remove([filePath])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_deliverables')
        .delete()
        .eq('id', deliverable.id)

      if (dbError) {
        console.error('Database deletion error:', dbError)
        toast.error('Failed to delete deliverable')
        return
      }

      toast.success('Deliverable deleted')
      fetchDeliverables()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete deliverable')
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    return mb < 1 ? `${(bytes / 1024).toFixed(2)} KB` : `${mb.toFixed(2)} MB`
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && !attachedFile) return
    if (!project) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSendingMessage(true)

    try {
      let fileUrl = null
      
      // Upload file if attached
      if (attachedFile) {
        console.log('Uploading file:', attachedFile.name)
        const fileExt = attachedFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(`${project.id}/${fileName}`, attachedFile)

          if (uploadError) {
            console.error('File upload error:', uploadError)
            toast.error(`Failed to upload file: ${uploadError.message}`)
            setSendingMessage(false)
            return
          }
          
          console.log('File uploaded:', uploadData)
          
          const { data: { publicUrl } } = supabase.storage
            .from('message-attachments')
            .getPublicUrl(uploadData.path)
          
          fileUrl = publicUrl
          console.log('Public URL:', fileUrl)
        } catch (fileError) {
          console.error('File handling error:', fileError)
          toast.error('Failed to handle file attachment')
          setSendingMessage(false)
          return
        }
      }

      // Developer always sends to client
      const receiverId = project.client_id

      // Prepare message data
      const messageData: any = {
        project_id: project.id,
        sender_id: user.id,
        receiver_id: receiverId,
        message: newMessage || '📎 File attached',
      }

      // Only add file_url if it exists
      if (fileUrl) {
        messageData.file_url = fileUrl
        console.log('Adding file_url to message:', fileUrl)
      }

      console.log('Inserting message:', messageData)

      const { error } = await supabase.from('messages').insert(messageData)

      if (error) {
        console.error('Message insert error:', error)
        toast.error(`Failed to send message: ${error.message || 'Unknown error'}`)
      } else {
        setNewMessage('')
        setAttachedFile(null)
        fetchMessages()
        
        // Create notification for client
        try {
          await supabase.from('notifications').insert({
            user_id: receiverId,
            title: 'New Message from Developer',
            message: `You have a new message about ${project.title}`,
            type: 'info',
            link: `/client/projects/${project.id}`,
          } as any)
        } catch (notifError) {
          console.error('Failed to create notification:', notifError)
          // Don't show error to user, message was sent successfully
        }
        
        toast.success('Message sent')
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const acceptProject = async () => {
    if (!project || !finalCost || !duration) {
      toast.error('Please fill in all fields')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    console.log('Accepting project:', {
      projectId: project.id,
      developerId: user.id,
      finalCost: parseFloat(finalCost),
      duration: parseInt(duration)
    })

    const { data, error } = await supabase
      .from('projects')
      .update({
        developer_id: user.id,
        final_cost: parseFloat(finalCost),
        estimated_duration: parseInt(duration),
        status: 'approved',
      } as any)
      .eq('id', project.id)
      .select()

    if (error) {
      console.error('Error accepting project:', error)
      toast.error('Failed to accept project: ' + error.message)
      return
    }

    console.log('Project accepted successfully:', data)

    // Create notification for client
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: project.client_id,
      title: 'Project Accepted',
      message: `Your project "${project.title}" has been accepted. Final cost: ${finalCost} GHS. Please proceed with payment.`,
      type: 'success',
      link: `/client/projects/${project.id}`,
    } as any)
    
    if (notifError) {
      console.error('Failed to create notification:', notifError)
    }

    toast.success('Project accepted! Waiting for client payment.')
    fetchProject()
  }

  const startProject = async () => {
    const { error } = await supabase
      .from('projects')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (!error) {
      toast.success('Project started!')
      fetchProject()
    }
  }

  const submitDelivery = async () => {
    if (!repoUrl) {
      toast.error('Please provide repository URL')
      return
    }

    const updateData: any = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      repository_url: repoUrl,
    }

    if (project?.include_hosting && hostingUrl) {
      updateData.hosting_url = hostingUrl
    }

    if (!params.id || Array.isArray(params.id)) return

    const { error } = await supabase
      .from('projects')
      .update(updateData as any)
      .eq('id', params.id)

    if (!error) {
      toast.success('Project submitted for review!')
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
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">
            Client: {project.client?.full_name}
          </p>
        </div>
        <Badge className={getStatusColor(project.status)}>
          {project.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {project.requirements}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Include Hosting:</span>
                <Badge variant={project.include_hosting ? "default" : "secondary"}>
                  {project.include_hosting ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Client Requirement Files */}
          <Card>
            <CardHeader>
              <CardTitle>Client's Requirement Files</CardTitle>
            </CardHeader>
            <CardContent>
              {projectFiles.length > 0 ? (
                <div className="space-y-2">
                  {projectFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No requirement files uploaded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Accept Project Form - Only for pending_review */}
          {project.status === 'pending_review' && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Accept Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="finalCost">Final Cost (GHS) *</Label>
                    <Input
                      id="finalCost"
                      type="number"
                      placeholder="150000"
                      value={finalCost}
                      onChange={(e) => setFinalCost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Days) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="14"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={acceptProject} className="w-full">
                  Accept Project
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Start Project - Only for approved */}
          {project.status === 'approved' && (
            <Card>
              <CardHeader>
                <CardTitle>Ready to Start</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Payment has been received in escrow. You can now start working on this project.
                </p>
                <Button onClick={startProject} className="w-full">
                  Start Development
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Submit Delivery - Only for in_progress */}
          {project.status === 'in_progress' && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Completed Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repoUrl">Repository URL *</Label>
                  <Input
                    id="repoUrl"
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                </div>
                {project.include_hosting && (
                  <div className="space-y-2">
                    <Label htmlFor="hostingUrl">Live Website URL *</Label>
                    <Input
                      id="hostingUrl"
                      type="url"
                      placeholder="https://example.com"
                      value={hostingUrl}
                      onChange={(e) => setHostingUrl(e.target.value)}
                    />
                  </div>
                )}
                <Button onClick={submitDelivery} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Submit for Review
                </Button>
              </CardContent>
            </Card>
          )}

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Estimated Cost</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(project.estimated_cost || 0)}
                    </p>
                  </div>
                  {project.final_cost && (
                    <div>
                      <p className="text-muted-foreground">Final Cost</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(project.final_cost)}
                      </p>
                    </div>
                  )}
                  {project.estimated_duration && (
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{project.estimated_duration} days</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(project.created_at)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Video className="mr-2 h-4 w-4" />
                    Start Meeting
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto mb-4 p-4 bg-muted/30 rounded-lg">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.sender_id === currentUserId
                    return (
                      <div key={message.id} className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        {!isOwnMessage && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="text-xs">
                              {getInitials(message.sender?.full_name || 'User')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          <div className={`rounded-2xl px-4 py-2 ${
                            isOwnMessage 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-card border'
                          }`}>
                            {!isOwnMessage && (
                              <p className="text-xs font-semibold mb-1 opacity-70">
                                {message.sender?.full_name}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                            {message.file_url && (
                              <a 
                                href={message.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs underline mt-1 block opacity-80 hover:opacity-100"
                              >
                                📎 View attachment
                              </a>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 px-1">
                            {formatDate(message.created_at, 'relative')}
                          </span>
                        </div>
                        {isOwnMessage && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {getInitials(message.sender?.full_name || 'You')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
              
              {/* File Preview */}
              {attachedFile && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-md">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm flex-1 truncate">{attachedFile.name}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setAttachedFile(null)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              )}
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mb-2">
                  <EmojiPicker 
                    onEmojiClick={(emojiData) => {
                      setNewMessage(prev => prev + emojiData.emoji)
                      setShowEmojiPicker(false)
                    }}
                    width="100%"
                    height="350px"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="file"
                  id="dev-file-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setAttachedFile(e.target.files[0])
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => document.getElementById('dev-file-upload')?.click()}
                  disabled={sendingMessage}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={sendingMessage}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && sendMessage()}
                  disabled={sendingMessage}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={sendingMessage || (!newMessage.trim() && !attachedFile)}
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="mt-6">
          <div className="space-y-6">
            {/* Upload Deliverables Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Deliverables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliverable-file">Select File</Label>
                  <div className="flex gap-2">
                    <input
                      id="deliverable-file"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setDeliverableFile(e.target.files[0])
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('deliverable-file')?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {deliverableFile ? deliverableFile.name : 'Choose File'}
                    </Button>
                    {deliverableFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeliverableFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {deliverableFile && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(deliverableFile.size)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliverable-description">Description (Optional)</Label>
                  <Textarea
                    id="deliverable-description"
                    placeholder="E.g., Final website design, Source code, Documentation..."
                    value={deliverableDescription}
                    onChange={(e) => setDeliverableDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button
                  onClick={uploadDeliverable}
                  disabled={!deliverableFile || uploadingDeliverable}
                  className="w-full"
                >
                  {uploadingDeliverable ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Deliverable
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Uploaded Deliverables List */}
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent>
                {deliverables.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No deliverables uploaded yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {deliverables.map((deliverable) => (
                      <div
                        key={deliverable.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <FileText className="h-8 w-8 text-primary shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{deliverable.file_name}</p>
                          {deliverable.description && (
                            <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{formatFileSize(deliverable.file_size)}</span>
                            <span>•</span>
                            <span>{formatDate(deliverable.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(deliverable.file_url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteDeliverable(deliverable)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Repository & Hosting URLs */}
            <Card>
              <CardHeader>
                <CardTitle>Project Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.repository_url || project.hosting_url ? (
                  <>
                    {project.repository_url && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Repository URL</p>
                        <a
                          href={project.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {project.repository_url}
                        </a>
                      </div>
                    )}
                    {project.hosting_url && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Live Website URL</p>
                        <a
                          href={project.hosting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {project.hosting_url}
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Links will appear here after project submission
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
