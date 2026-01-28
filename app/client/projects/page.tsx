"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  FolderOpen,
  Clock,
  DollarSign,
  User,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProjects = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Fetching projects for client:", user.id);

      const { data, error } = await supabase
        .from("projects")
        .select("*, developer:developer_id(full_name)")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching client projects:", error);
      }

      console.log("Client projects fetched:", data?.length, data);

      if (data) {
        setProjects(data as any);
        setFilteredProjects(data as any);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Navy Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-electric-cyan/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/client">
              <Button
                size="icon"
                className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white shadow-lg shadow-electric-blue/30"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold">My Projects</h1>
              <p className="text-slate-300 text-lg">
                View and manage all your projects
              </p>
            </div>
          </div>
          <Link href="/client/new-project">
            <Button
              size="lg"
              className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white font-semibold shadow-lg shadow-electric-blue/30"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Search projects by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 text-lg border-slate-border bg-slate-panel text-white focus:border-electric-blue rounded-xl"
        />
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card className="bg-slate-card border-slate-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-electric-blue to-electric-cyan mb-4 shadow-lg shadow-electric-blue/30">
                <FolderOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {searchQuery ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-slate-400 mb-6 text-center max-w-md">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start your journey by creating your first project!"}
              </p>
              {!searchQuery && (
                <Link href="/client/new-project">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white font-semibold shadow-lg shadow-electric-blue/30"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Project
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="group relative overflow-hidden bg-slate-panel border-slate-border hover:border-electric-blue hover:shadow-xl hover:shadow-electric-blue/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-blue/10 to-transparent rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center flex-shrink-0 shadow-lg shadow-electric-blue/30">
                      <FolderOpen className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-xl text-white group-hover:text-electric-blue transition-colors">
                        {project.title}
                      </CardTitle>
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shadow-sm ${getStatusColor(project.status)}`}
                  >
                    {project.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm text-slate-300">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                    {project.estimated_cost && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-white">
                          {formatCurrency(project.estimated_cost)}
                        </span>
                      </div>
                    )}
                    {project.developer && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>
                          {(project as any).developer?.full_name ||
                            "Not assigned"}
                        </span>
                      </div>
                    )}
                  </div>
                  <Link href={`/client/projects/${project.id}`}>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white font-semibold shadow-lg shadow-electric-blue/30"
                    >
                      View Details
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Footer */}
      {filteredProjects.length > 0 && (
        <Card className="bg-slate-panel border-slate-border">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-4 rounded-xl bg-slate-card shadow-sm border border-slate-border">
                <div className="text-3xl font-bold text-electric-blue">
                  {filteredProjects.length}
                </div>
                <div className="text-sm text-slate-300 font-medium mt-1">
                  Total Projects
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-card shadow-sm border border-slate-border">
                <div className="text-3xl font-bold text-orange-500">
                  {
                    filteredProjects.filter((p) =>
                      ["pending_review", "approved", "in_progress"].includes(
                        p.status,
                      ),
                    ).length
                  }
                </div>
                <div className="text-sm text-slate-300 font-medium mt-1">
                  Active
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-card shadow-sm border border-slate-border">
                <div className="text-3xl font-bold text-green-500">
                  {
                    filteredProjects.filter((p) =>
                      ["completed", "delivered"].includes(p.status),
                    ).length
                  }
                </div>
                <div className="text-sm text-slate-300 font-medium mt-1">
                  Completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
