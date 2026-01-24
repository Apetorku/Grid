'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [includeHosting, setIncludeHosting] = useState(false)
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [needsDocumentation, setNeedsDocumentation] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const calculateEstimate = () => {
    // New pricing model:
    // ₵1,500 per person (base price with documentation ready)
    // +₵800 per person if documentation needs to be created
    // +₵350 for hosting
    // +₵250 for multiple files (>3)
    
    const basePerPerson = 1500
    const documentationCostPerPerson = 800
    
    let totalCost = basePerPerson * numberOfPeople
    
    // Add documentation cost if needed
    if (needsDocumentation) {
      totalCost += documentationCostPerPerson * numberOfPeople
    }
    
    // Add hosting cost (one-time, not per person)
    if (includeHosting) {
      totalCost += 350
    }
    
    // Add file handling cost if many files
    if (files.length > 3) {
      totalCost += 250
    }
    
    return totalCost
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Ensure user record exists using API route with service role
      const ensureUserResponse = await fetch('/api/ensure-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || '',
          role: 'client',
        }),
      })

      if (!ensureUserResponse.ok) {
        const errorText = await ensureUserResponse.text()
        console.error('Ensure user error:', ensureUserResponse.status, errorText)
        toast.error('Failed to verify user account. Please try again.')
        return
      }

      const ensureUserData = await ensureUserResponse.json()
      
      if (ensureUserData.error) {
        console.error('Ensure user error:', ensureUserData)
        throw new Error(ensureUserData.error || 'Failed to verify user account')
      }

      console.log('User ensured:', ensureUserData)

      const estimatedCost = calculateEstimate()

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          client_id: user.id,
          title,
          description,
          requirements,
          include_hosting: includeHosting,
          number_of_people: numberOfPeople,
          needs_documentation: needsDocumentation,
          estimated_cost: estimatedCost,
          status: 'pending_review',
        } as any)
        .select()
        .single()

      if (projectError) {
        console.error('Project creation error:', projectError)
        throw projectError
      }

      const projectData = project as any

      // Upload files if any
      if (files.length > 0 && project) {
        console.log('Uploading files:', files.length)
        for (const file of files) {
          const fileName = `${projectData.id}/${Date.now()}-${file.name}`
          console.log('Uploading file to storage:', fileName)
          
          const { data: fileData, error: uploadError } = await supabase.storage
            .from('project-files')
            .upload(fileName, file)

          if (uploadError) {
            console.error('File upload error:', uploadError)
            toast.error(`Failed to upload ${file.name}: ${uploadError.message}`)
            continue
          }

          if (fileData) {
            console.log('File uploaded successfully:', fileData.path)
            const { data: { publicUrl } } = supabase.storage
              .from('project-files')
              .getPublicUrl(fileData.path)

            console.log('Inserting file record to database:', file.name)
            const { error: dbError } = await supabase.from('project_files').insert({
              project_id: projectData.id,
              uploaded_by: user.id,
              file_name: file.name,
              file_url: publicUrl,
              file_type: file.type,
              file_size: file.size,
            } as any)

            if (dbError) {
              console.error('Database insert error:', dbError)
              toast.error(`Failed to save ${file.name} record: ${dbError.message}`)
            } else {
              console.log('File record saved successfully:', file.name)
            }
          }
        }
      }

      toast.success('Project submitted successfully!')
      router.push(`/client/projects/${projectData.id}`)
    } catch (error: any) {
      console.error('Full error:', error)
      toast.error(error.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/client">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">Tell us about your website project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Provide information about your website project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g., E-commerce Website for Fashion Store"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe what you want to build..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Detailed Requirements *</Label>
              <Textarea
                id="requirements"
                placeholder="List specific features, pages, functionality, design preferences, etc."
                rows={6}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfPeople">Number of People in Group *</Label>
              <Input
                id="numberOfPeople"
                type="number"
                min="1"
                max="100"
                placeholder="e.g., 5"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                required
              />
              <p className="text-xs text-muted-foreground">
                How many people are in your group/team?
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="needsDocumentation"
                checked={needsDocumentation}
                onChange={(e) => setNeedsDocumentation(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="needsDocumentation" className="cursor-pointer">
                We need documentation created (+₵800 per person)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hosting"
                checked={includeHosting}
                onChange={(e) => setIncludeHosting(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="hosting" className="cursor-pointer">
                Include hosting and deployment (+₵350)
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Documentation</CardTitle>
            <CardDescription>
              Upload any relevant files (wireframes, designs, documents)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, images up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                </label>
              </div>
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Estimate</CardTitle>
            <CardDescription>
              Based on your requirements, here's the pricing breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Base price ({numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'} × ₵1,500)
                </span>
                <span className="font-medium">
                  ₵{(1500 * numberOfPeople).toLocaleString()}
                </span>
              </div>
              
              {needsDocumentation && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Documentation ({numberOfPeople} × ₵800)
                  </span>
                  <span className="font-medium">
                    ₵{(800 * numberOfPeople).toLocaleString()}
                  </span>
                </div>
              )}
              
              {includeHosting && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hosting & Deployment</span>
                  <span className="font-medium">₵350</span>
                </div>
              )}
              
              {files.length > 3 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Multiple files handling</span>
                  <span className="font-medium">₵250</span>
                </div>
              )}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Estimate</span>
                  <span className="text-3xl font-bold text-primary">
                    ₵{calculateEstimate().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              This is a preliminary estimate. Final pricing will be confirmed after developer review.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Project'}
          </Button>
        </div>
      </form>
    </div>
  )
}
