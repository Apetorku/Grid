"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Clock, CheckCircle2, DollarSign } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

export default function DeveloperDashboard() {
  const [stats, setStats] = useState({
    pending_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    total_earnings: 0,
  });
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch pending review projects
      const { data: pending } = await supabase
        .from("projects")
        .select("*, client:client_id(full_name)")
        .eq("status", "pending_review")
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch developer's active projects
      const { data: active } = await supabase
        .from("projects")
        .select("*, client:client_id(full_name)")
        .eq("developer_id", user.id)
        .in("status", ["approved", "in_progress"])
        .order("created_at", { ascending: false });

      // Fetch all developer's projects for stats
      const { data: allProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("developer_id", user.id);

      if (pending) setPendingProjects(pending as any);
      if (active) setActiveProjects(active as any);

      if (allProjects) {
        setStats({
          pending_projects: pending?.length || 0,
          active_projects: active?.length || 0,
          completed_projects: allProjects.filter((p: any) =>
            ["completed", "delivered"].includes(p.status),
          ).length,
          total_earnings: allProjects
            .filter((p: any) =>
              ["in_progress", "completed", "delivered"].includes(p.status),
            )
            .reduce((sum: number, p: any) => sum + (p.final_cost || 0), 0),
        });
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Developer Dashboard</h1>
          <p className="text-slate-300">Manage your projects and earnings</p>
        </div>
        <Link href="/developer/projects">
          <Button
            variant="outline"
            className="border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white"
          >
            View All Projects
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-panel border-slate-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Pending Review
            </CardTitle>
            <Briefcase className="h-4 w-4 text-electric-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.pending_projects}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-panel border-slate-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Active Projects
            </CardTitle>
            <Clock className="h-4 w-4 text-electric-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.active_projects}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-panel border-slate-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.completed_projects}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-panel border-slate-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
              {formatCurrency(stats.total_earnings)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Review Projects */}
      <Card className="bg-slate-panel border-slate-border">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-navy-950 to-navy-800 border-b border-slate-border">
          <CardTitle className="text-white">Projects Awaiting Review</CardTitle>
          <Link href="/developer/projects?filter=pending_review">
            <Button
              variant="ghost"
              size="sm"
              className="text-electric-blue hover:text-white hover:bg-electric-blue/20"
            >
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingProjects.length === 0 ? (
            <p className="text-center py-8 text-slate-400">
              No pending projects at the moment
            </p>
          ) : (
            <div className="space-y-4">
              {pendingProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-slate-border rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {project.client?.full_name} •{" "}
                      {formatDate(project.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-green-500">
                      {formatCurrency(project.estimated_cost || 0)}
                    </span>
                    <Link href={`/developer/projects/${project.id}`}>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:shadow-lg hover:shadow-electric-blue/30"
                      >
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card className="bg-slate-panel border-slate-border">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-navy-950 to-navy-800 border-b border-slate-border">
          <CardTitle className="text-white">Your Active Projects</CardTitle>
          <Link href="/developer/projects?filter=in_progress">
            <Button
              variant="ghost"
              size="sm"
              className="text-electric-blue hover:text-white hover:bg-electric-blue/20"
            >
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {activeProjects.length === 0 ? (
            <p className="text-center py-8 text-slate-400">
              No active projects
            </p>
          ) : (
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-slate-border rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {project.client?.full_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace("_", " ").toUpperCase()}
                    </span>
                    <Link href={`/developer/projects/${project.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
