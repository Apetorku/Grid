"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Meeting {
  id: string;
  project_id: string;
  daily_room_name: string;
  daily_room_url: string;
  created_at: string;
  project: {
    id: string;
    title: string;
    developer: {
      full_name: string;
    } | null;
  };
}

export default function ClientMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("video_sessions")
      .select(
        `
        *,
        project:projects(
          id,
          title,
          developer:developer_id(full_name)
        )
      `,
      )
      .or(`creator_id.eq.${user.id},participant_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMeetings(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
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
            <Video className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Meetings</h1>
            <p className="text-slate-300 text-lg">
              View and join your project meetings
            </p>
          </div>
        </div>
      </div>

      {meetings.length === 0 ? (
        <Card className="bg-slate-card border-slate-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center mb-4 shadow-lg shadow-electric-blue/30">
              <Video className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No meetings yet
            </h3>
            <p className="text-slate-400 text-center">
              Meetings can be started from project pages.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="bg-slate-panel border-slate-border hover:border-electric-blue hover:shadow-xl hover:shadow-electric-blue/20 transition-all duration-300"
            >
              <CardHeader className="bg-gradient-to-r from-navy-900/50 to-navy-800/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/30">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl text-white">
                        {meeting.project?.title || "Project Meeting"}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <User className="h-4 w-4" />
                        <span>
                          with{" "}
                          {meeting.project?.developer?.full_name || "Developer"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-slate-card text-slate-300 border-slate-border">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(meeting.created_at), {
                      addSuffix: true,
                    })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-card px-4 py-2 rounded-lg border border-slate-border">
                    <Clock className="h-4 w-4" />
                    <span>
                      Room:{" "}
                      <span className="font-semibold text-white">
                        {meeting.daily_room_name}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/client/projects/${meeting.project_id}`}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="font-semibold border-slate-border text-white hover:border-electric-blue hover:text-electric-blue"
                      >
                        View Project
                      </Button>
                    </Link>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white font-semibold shadow-lg shadow-electric-blue/30"
                      onClick={() =>
                        window.open(meeting.daily_room_url, "_blank")
                      }
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
