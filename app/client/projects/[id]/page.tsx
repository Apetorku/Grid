'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Project, Message } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, getStatusColor, getInitials, formatCurrency } from '@/lib/utils'
import { generateInvoice, generateReceipt, generateContract } from '@/lib/pdfGenerator'
import { toast } from 'sonner'
import { Send, Download, Video, CheckCircle, FileText, Receipt, FileSignature, Paperclip, Smile, Loader2, Phone } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import dynamic from 'next/dynamic'

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [acceptingDelivery, setAcceptingDelivery] = useState(false)
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const supabase = createClient()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)
      
      fetchProject()
      fetchMessages()
      
      // Subscribe to real-time messages
      const channel = supabase
        .channel(`project-${params.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${params.id}`
        }, (payload) => {
          console.log('New message received:', payload)
          fetchMessages()
        })
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          if (payload.userId !== user?.id) {
            setOtherUserTyping(true)
            setTimeout(() => setOtherUserTyping(false), 3000)
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
    
    init()
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchProject = async () => {    if (!params.id || Array.isArray(params.id)) return
        const { data, error } = await supabase
      .from('projects')
      .select('*, developer:developer_id(full_name, email), client:client_id(full_name, email)')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
    }
    if (data) {
      console.log('Project data loaded:', data)
      setProject(data)
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
      console.log('Fetched messages:', data)
      setMessages(data)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      supabase.channel(`project-${params.id}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId }
      })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && !attachedFile) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !project) return

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

      // Client always sends to developer
      const receiverId = project.developer_id

      if (!receiverId) {
        toast.error('Cannot send message: No developer assigned to this project yet')
        setSendingMessage(false)
        return
      }

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
        console.error('Error details:', JSON.stringify(error, null, 2))
        toast.error(`Failed to send message: ${error.message || 'Unknown error'}`)
      } else {
        setNewMessage('')
        setAttachedFile(null)
        fetchMessages()
        
        // Create notification for developer
        try {
          await supabase.from('notifications').insert({
            user_id: receiverId,
            title: 'New Message',
            message: `You have a new message from ${user.email} about ${project.title}`,
            type: 'info',
            link: `/developer/projects/${project.id}`,
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

  const handlePayment = async () => {
    if (!project) return
    
    setPaymentLoading(true)
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          amount: project.final_cost || project.estimated_cost,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Payment initialization failed:', response.status, errorText)
        toast.error('Payment initialization failed. Please try again.')
        setPaymentLoading(false)
        return
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response content type:', contentType)
        toast.error('Invalid server response. Please try again.')
        setPaymentLoading(false)
        return
      }

      const data = await response.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      }
    } catch (error) {
      toast.error('Failed to initialize payment')
      setPaymentLoading(false)
    }
  }

  const acceptDelivery = async () => {
    if (!project) return

    setAcceptingDelivery(true)
    // @ts-ignore - Supabase type issue
    const result = await supabase
      .from('projects')
      .update({ status: 'delivered' })
      .eq('id', project.id)

    if (!result.error) {
      toast.success('Project accepted! Payment released.')
      fetchProject()
    } else {
      toast.error('Failed to accept delivery')
    }
    setAcceptingDelivery(false)
  }

  const downloadInvoice = async () => {
    if (!project) {
      toast.error('Project not loaded')
      return
    }
    
    setDownloadingDoc('invoice')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch client and developer separately
    const clientResult: any = await supabase.from('users').select('full_name, email').eq('id', project.client_id).single()
    const developerResult: any = await supabase.from('users').select('full_name, email').eq('id', project.developer_id).single()

    if (!clientResult.data || !developerResult.data) {
      console.error('Failed to fetch user data:', { clientResult, developerResult })
      toast.error('Could not load user information')
      setDownloadingDoc(null)
      return
    }
    
    generateInvoice(project as any, clientResult.data, developerResult.data)
    toast.success('Invoice downloaded!')
    setDownloadingDoc(null)
  }

  const downloadReceipt = async () => {
    if (!project) {
      toast.error('Project not loaded')
      return
    }
    
    setDownloadingDoc('receipt')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    console.log('Fetching payment for project:', project.id)
    
    // Fetch payment data and user data
    const paymentResult: any = await supabase.from('payments').select('*').eq('project_id', project.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    const clientResult: any = await supabase.from('users').select('full_name, email').eq('id', project.client_id).single()
    const developerResult: any = await supabase.from('users').select('full_name, email').eq('id', project.developer_id).single()

    console.log('Full payment result:', JSON.stringify(paymentResult, null, 2))
    console.log('Has error?', !!paymentResult.error)
    console.log('Has data?', !!paymentResult.data)

    if (paymentResult.error) {
      console.error('Payment error details:', paymentResult.error)
      toast.error(`Payment error: ${paymentResult.error.message || 'Unable to fetch payment data'}`)
      return
    }

    if (!paymentResult.data) {
      toast.error('No payment found for this project. Payment may not have been made yet.')
      return
    }

    if (!clientResult.data || !developerResult.data) {
      toast.error('Could not load user information')
      return
    }

    generateReceipt(project as any, clientResult.data, developerResult.data, paymentResult.data as any)
    toast.success('Receipt downloaded!')
    setDownloadingDoc(null)
  }

  const downloadContract = async () => {
    if (!project) {
      toast.error('Project not loaded')
      return
    }
    
    setDownloadingDoc('contract')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Fetch client and developer separately
    const clientResult: any = await supabase.from('users').select('full_name, email').eq('id', project.client_id).single()
    const developerResult: any = await supabase.from('users').select('full_name, email').eq('id', project.developer_id).single()

    if (!clientResult.data || !developerResult.data) {
      console.error('Failed to fetch user data:', { clientResult, developerResult })
      toast.error('Could not load user information')
      return
    }
    
    generateContract(project as any, clientResult.data, developerResult.data)
    toast.success('Contract downloaded!')
    setDownloadingDoc(null)
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
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4 p-4 bg-muted/30 rounded-lg">
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
                {otherUserTyping && (
                  <div className="flex gap-2 items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">...</AvatarFallback>
                    </Avatar>
                    <div className="bg-card border rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
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
              
              {/* Input Area */}
              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
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
                  onClick={() => document.getElementById('file-upload')?.click()}
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
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
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
                <Button 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
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
              
              {/* Documents Section */}
              {project.status !== 'pending_review' && (
                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-semibold text-sm mb-3">Documents</h3>
                  
                  {/* Contract - Available after developer accepts */}
                  {['approved', 'in_progress', 'completed', 'delivered'].includes(project.status) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={downloadContract}
                      disabled={downloadingDoc === 'contract'}
                    >
                      {downloadingDoc === 'contract' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FileSignature className="h-4 w-4 mr-2" />
                          Download Contract
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Invoice - Available after developer accepts */}
                  {['approved', 'in_progress', 'completed', 'delivered'].includes(project.status) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={downloadInvoice}
                      disabled={downloadingDoc === 'invoice'}
                    >
                      {downloadingDoc === 'invoice' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Download Invoice
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Receipt - Available after payment */}
                  {['in_progress', 'completed', 'delivered'].includes(project.status) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={downloadReceipt}
                      disabled={downloadingDoc === 'receipt'}
                    >
                      {downloadingDoc === 'receipt' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Receipt className="h-4 w-4 mr-2" />
                          Download Receipt
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
              
              {/* Show accept delivery button when completed */}
              {project.status === 'completed' && (
                <Button 
                  className="w-full" 
                  onClick={acceptDelivery}
                  disabled={acceptingDelivery}
                >
                  {acceptingDelivery ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept & Release Payment
                    </>
                  )}
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
