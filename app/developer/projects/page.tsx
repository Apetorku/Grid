'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Search, Filter } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

export default function DeveloperProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProjects = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch ALL projects (both assigned and available)
      const { data: allProjects, error } = await supabase
        .from('projects')
        .select('*, client:client_id(full_name, email)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects:', error)
        setLoading(false)
        return
      }

      // Filter to show:
      // 1. Projects assigned to this developer
      // 2. Projects pending review (available to accept)
      const visibleProjects = (allProjects || []).filter((p: any) => 
        p.developer_id === user.id || p.status === 'pending_review'
      )

      console.log('Total projects:', allProjects?.length)
      console.log('Visible projects:', visibleProjects.length)
      console.log('Projects:', visibleProjects)

      setProjects(visibleProjects as any)
      setFilteredProjects(visibleProjects as any)
      setLoading(false)
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    let filtered = projects

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus)
    }

    setFilteredProjects(filtered)
  }, [searchQuery, filterStatus, projects])

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/developer">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">All Projects</h1>
            <p className="text-muted-foreground">Browse and manage your projects</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'pending_review' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('pending_review')}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('approved')}
            size="sm"
          >
            Approved
          </Button>
          <Button
            variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('in_progress')}
            size="sm"
          >
            In Progress
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('completed')}
            size="sm"
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No projects found matching your filters' 
                  : 'No projects available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{project.title}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Client:</span>{' '}
                      {(project as any).client?.full_name || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {formatDate(project.created_at)}
                    </div>
                    {project.estimated_cost && (
                      <div>
                        <span className="font-medium">Budget:</span>{' '}
                        {formatCurrency(project.estimated_cost)}
                      </div>
                    )}
                    {project.final_cost && (
                      <div>
                        <span className="font-medium">Price:</span>{' '}
                        {formatCurrency(project.final_cost)}
                      </div>
                    )}
                  </div>
                  <Link href={`/developer/projects/${project.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Footer */}
      {filteredProjects.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{filteredProjects.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {filteredProjects.filter(p => p.status === 'pending_review').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {filteredProjects.filter(p => ['approved', 'in_progress'].includes(p.status)).length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {filteredProjects.filter(p => ['completed', 'delivered'].includes(p.status)).length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
