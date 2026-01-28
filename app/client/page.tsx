"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Project, DashboardStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  FolderOpen,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

export default function ClientDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    total_revenue: 0,
    pending_payments: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch projects
      const { data: projects } = await supabase
        .from("projects")
        .select("*, developer:developer_id(full_name)")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (projects && projects.length > 0) {
        setRecentProjects(projects as any);

        // Calculate stats
        setStats({
          total_projects: projects.length,
          active_projects: projects.filter((p: any) =>
            ["pending_review", "approved", "in_progress"].includes(p.status),
          ).length,
          completed_projects: projects.filter((p: any) =>
            ["completed", "delivered"].includes(p.status),
          ).length,
          total_revenue: projects.reduce(
            (sum: number, p: any) => sum + (p.final_cost || 0),
            0,
          ),
          pending_payments: projects.filter((p: any) => p.status === "approved")
            .length,
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
    <div className="space-y-8 pb-8">
      {/* Welcome Section with Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700 p-8 text-white border border-slate-border shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 via-transparent to-electric-cyan/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Welcome Back! 👋</h1>
            <p className="text-slate-300 text-lg">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/client/projects">
              <Button
                variant="secondary"
                size="lg"
                className="bg-slate-card hover:bg-slate-panel text-white border border-slate-border"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                All Projects
              </Button>
            </Link>
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
      </div>

      {/* Stats Grid with Enhanced Design */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border border-slate-border hover:border-electric-blue hover:shadow-2xl hover:shadow-electric-blue/20 transition-all duration-300 hover:-translate-y-1 bg-slate-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-blue/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Projects
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/30">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats.total_projects}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-semibold">All time</span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-border hover:border-electric-blue hover:shadow-2xl hover:shadow-electric-blue/20 transition-all duration-300 hover:-translate-y-1 bg-slate-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-cyan/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Active Projects
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/30">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats.active_projects}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3 text-electric-cyan" />
              <span className="text-electric-cyan font-semibold">
                In progress
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-border hover:border-electric-blue hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 bg-slate-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Completed
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats.completed_projects}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-semibold">
                Successfully delivered
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-border hover:border-electric-blue hover:shadow-2xl hover:shadow-electric-blue/20 transition-all duration-300 hover:-translate-y-1 bg-slate-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-light/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Invested
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/30">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(stats.total_revenue)}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-electric-cyan" />
              <span className="text-electric-cyan font-semibold">
                Total project cost
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects with Enhanced Cards */}
      <Card className="border border-slate-border shadow-2xl bg-slate-card">
        <CardHeader className="bg-gradient-to-r from-navy-950 to-navy-800 border-b border-slate-border">
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white">
                Recent Projects
              </CardTitle>
              <p className="text-sm text-slate-300 mt-1">
                Your latest project activities
              </p>
            </div>
            <Link href="/client/projects">
              <Button
                variant="outline"
                size="lg"
                className="font-semibold border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white"
              >
                View All
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {recentProjects.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-electric-blue/20 to-electric-cyan/20 mb-4">
                <FolderOpen className="h-10 w-10 text-electric-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No projects yet
              </h3>
              <p className="text-slate-300 mb-6 max-w-md mx-auto">
                Start your journey by creating your first project. Our
                developers are ready to bring your ideas to life!
              </p>
              <Link href="/client/new-project">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white font-semibold shadow-lg shadow-electric-blue/30"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative flex items-center justify-between p-6 border border-slate-border rounded-xl hover:border-electric-blue hover:shadow-2xl hover:shadow-electric-blue/20 transition-all duration-300 bg-slate-panel"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center flex-shrink-0 shadow-md shadow-electric-blue/30">
                      <FolderOpen className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-bold text-lg text-white group-hover:text-electric-blue transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(project.created_at)}</span>
                        </div>
                        {project.developer && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{(project.developer as any).full_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace("_", " ").toUpperCase()}
                    </span>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
