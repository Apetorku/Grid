"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { MessageSquare, Clock, Mail } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ProjectWithMessages {
  id: string;
  title: string;
  developer_id: string;
  developer?: {
    full_name: string;
    avatar_url?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
    sender_role: string;
  };
  unreadCount: number;
}

export default function ClientMessagesPage() {
  const [projects, setProjects] = useState<ProjectWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProjectsWithMessages();
  }, []);

  const fetchProjectsWithMessages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all client's projects with developer info
      const { data: projectsData, error: projectsError } = await (
        supabase.from("projects") as any
      )
        .select(
          `
          id,
          title,
          developer_id,
          developer:users!projects_developer_id_fkey(full_name, avatar_url)
        `,
        )
        .eq("client_id", user.id)
        .order("updated_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch last message and unread count for each project
      const projectsWithMessages = await Promise.all(
        (projectsData || []).map(async (project: any) => {
          // Get last message
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at, sender_role")
            .eq("project_id", project.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id)
            .eq("sender_role", "developer")
            .eq("read", false);

          return {
            ...project,
            lastMessage: lastMsg || undefined,
            unreadCount: count || 0,
          };
        }),
      );

      setProjects(projectsWithMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Navy Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-electric-cyan/10"></div>
        <div className="relative flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/30">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Messages</h1>
            <p className="text-slate-300 text-lg">
              View all your project conversations
            </p>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-slate-card border-slate-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center mb-4 shadow-lg shadow-electric-blue/30">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No messages yet
            </h3>
            <p className="text-slate-400">Start a project to begin messaging</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/client/projects/${project.id}?tab=communication`}
            >
              <Card className="bg-slate-panel border-slate-border hover:border-electric-blue hover:shadow-xl hover:shadow-electric-blue/20 transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-14 w-14 border-2 border-electric-blue shadow-lg shadow-electric-blue/20 group-hover:scale-110 transition-transform">
                        <AvatarImage src={project.developer?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-electric-blue to-electric-cyan text-white font-bold text-lg">
                          {getInitials(project.developer?.full_name || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl text-white group-hover:text-electric-blue transition-colors">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm mt-1 text-slate-400">
                          <Mail className="h-4 w-4" />
                          <span>with {project.developer?.full_name}</span>
                        </CardDescription>
                      </div>
                    </div>
                    {project.unreadCount > 0 && (
                      <Badge className="bg-gradient-to-r from-electric-blue to-electric-cyan text-white ml-2 px-3 py-1 shadow-lg shadow-electric-blue/30">
                        {project.unreadCount} new
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                {project.lastMessage && (
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-2 text-sm">
                      <p className="text-slate-300 flex-1 truncate">
                        <span className="font-medium text-white">
                          {project.lastMessage.sender_role === "client"
                            ? "You"
                            : project.developer?.full_name}
                          :
                        </span>{" "}
                        {project.lastMessage.content}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(
                          new Date(project.lastMessage.created_at),
                          { addSuffix: true },
                        )}
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
  );
}
