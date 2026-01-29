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
import { MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ProjectWithMessages {
  id: string;
  title: string;
  client_id: string;
  client?: {
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

export default function DeveloperMessagesPage() {
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

      // Fetch all developer's projects with client info
      const { data: projectsData, error: projectsError } = await (
        supabase.from("projects") as any
      )
        .select(
          `
          id,
          title,
          client_id,
          client:users!projects_client_id_fkey(full_name, avatar_url)
        `,
        )
        .eq("developer_id", user.id)
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
            .eq("sender_role", "client")
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        <p className="text-slate-300">View all your project conversations</p>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-slate-panel border-slate-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-electric-blue mb-4" />
            <p className="text-slate-300">No messages yet</p>
            <p className="text-sm text-slate-400">
              Your project conversations will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/developer/projects/${project.id}?tab=communication`}
            >
              <Card className="hover:bg-white/5 transition-colors cursor-pointer bg-slate-panel border-slate-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12 border-2 border-electric-blue">
                        <AvatarImage src={project.client?.avatar_url} />
                        <AvatarFallback className="bg-electric-blue/20 text-white">
                          {getInitials(project.client?.full_name || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-white">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-sm text-slate-400">
                          <span>with {project.client?.full_name}</span>
                        </CardDescription>
                      </div>
                    </div>
                    {project.unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="ml-2 bg-electric-blue text-white"
                      >
                        {project.unreadCount}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                {project.lastMessage && (
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-2 text-sm">
                      <p className="text-slate-300 flex-1 truncate">
                        <span className="font-medium text-white">
                          {project.lastMessage.sender_role === "developer"
                            ? "You"
                            : project.client?.full_name}
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
