"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_clients: 0,
    total_developers: 0,
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    total_revenue: 0,
    pending_revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch users
      const { data: users } = await supabase.from("users").select("role");
      const { data: projects } = await supabase
        .from("projects")
        .select("status, final_cost, estimated_cost");
      const { data: _payments } = await (supabase
        .from("payments") as any)
        .select("amount, status");

      if (users) {
        setStats((prev) => ({
          ...prev,
          total_users: users.length,
          total_clients: users.filter((u: any) => u.role === "client").length,
          total_developers: users.filter((u: any) => u.role === "developer")
            .length,
        }));
      }

      if (projects) {
        setStats((prev) => ({
          ...prev,
          total_projects: projects.length,
          active_projects: projects.filter((p: any) =>
            ["pending_review", "approved", "in_progress"].includes(p.status),
          ).length,
          completed_projects: projects.filter((p: any) =>
            ["completed", "delivered"].includes(p.status),
          ).length,
          total_revenue: projects
            .filter((p: any) => p.status === "delivered")
            .reduce(
              (sum: number, p: any) =>
                sum + (p.final_cost || p.estimated_cost || 0),
              0,
            ),
          pending_revenue: projects
            .filter((p: any) =>
              ["approved", "in_progress", "completed"].includes(p.status),
            )
            .reduce(
              (sum: number, p: any) =>
                sum + (p.final_cost || p.estimated_cost || 0),
              0,
            ),
        }));
      }

      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-300">Platform statistics and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-panel border-slate-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-electric-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.total_users}
            </div>
            <p className="text-xs text-slate-400">
              {stats.total_clients} clients • {stats.total_developers}{" "}
              developers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-panel border-slate-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Projects
            </CardTitle>
            <Briefcase className="h-4 w-4 text-electric-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.total_projects}
            </div>
            <p className="text-xs text-slate-400">
              {stats.active_projects} active • {stats.completed_projects}{" "}
              completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-panel border-slate-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
              {formatCurrency(stats.total_revenue)}
            </div>
            <p className="text-xs text-slate-400">From completed projects</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-panel border-slate-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Pending Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
              {formatCurrency(stats.pending_revenue)}
            </div>
            <p className="text-xs text-slate-400">In progress projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-panel border-slate-border">
          <CardHeader className="bg-gradient-to-r from-navy-950 to-navy-800 border-b border-slate-border">
            <CardTitle className="text-white">Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  Project Success Rate
                </span>
                <span className="font-bold text-white">
                  {stats.total_projects > 0
                    ? Math.round(
                        (stats.completed_projects / stats.total_projects) * 100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Active Users</span>
                <span className="font-bold text-white">
                  {stats.total_users}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  Average Project Value
                </span>
                <span className="font-bold text-green-500">
                  {formatCurrency(
                    stats.total_projects > 0
                      ? stats.total_revenue / stats.completed_projects
                      : 0,
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Monitor and manage the platform from this dashboard. Use the
              sidebar to navigate to different sections.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
