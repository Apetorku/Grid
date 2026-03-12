"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video } from "lucide-react";

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meetingData, setMeetingData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sessionId = params.sessionId as string;

  useEffect(() => {
    if (!sessionId || sessionId === "undefined") {
      setError("Invalid meeting link");
      setLoading(false);
      return;
    }
    loadMeetingData();

    // Listen for Jitsi meeting end events
    const handleMessage = (event: MessageEvent) => {
      // Check if message is from Jitsi
      if (event.origin !== "https://meet.jit.si") return;

      // Jitsi sends various events - we want to catch hangup/leave events
      if (event.data?.type === "video-conference-left" || 
          event.data?.event === "readyToClose") {
        console.log("Meeting ended, redirecting to dashboard");
        handleLeaveMeeting();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [sessionId]);

  const loadMeetingData = async () => {
    try {
      const supabase = createClient();

      console.log("Loading meeting data for session:", sessionId);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Please log in to join meeting");
        setLoading(false);
        return;
      }

      // Get user role
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData) {
        setUserRole((userData as any).role || "");
      }

      const { data: session, error: sessionError } = await supabase
        .from("screen_sessions")
        .select("*, project:projects(id, title)")
        .eq("id", sessionId)
        .single();

      if (sessionError) {
        setError("Meeting not found");
        setLoading(false);
        return;
      }

      if (!session) {
        setError("Meeting not found");
        setLoading(false);
        return;
      }

      console.log("✅ Meeting data loaded:", session);
      setMeetingData(session);
      setLoading(false);
    } catch (err) {
      setError("Failed to load meeting");
      setLoading(false);
    }
  };

  const handleLeaveMeeting = () => {
    // Redirect to appropriate dashboard based on user role
    if (userRole === "developer") {
      router.push("/developer");
    } else if (userRole === "client") {
      router.push("/client");
    } else {
      router.push("/");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
        <div className="bg-slate-panel border border-slate-border rounded-2xl p-8 max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Meeting Not Found
          </h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={handleLeaveMeeting} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-slate-panel/95 backdrop-blur-sm border-b border-slate-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveMeeting}
              className="border-slate-border text-white hover:border-electric-blue"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Leave Meeting
            </Button>
            {meetingData?.project && (
              <div className="text-sm">
                <span className="text-slate-400">Project:</span>
                <span className="text-white font-semibold ml-2">
                  {meetingData.project.title}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-slate-300">Live Meeting</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-navy-950/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-electric-blue/50">
              <Video className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Joining Meeting...
            </h3>
            <p className="text-slate-400 mb-4">
              Please wait while we connect you
            </p>
            <Button
              onClick={() => setLoading(false)}
              variant="outline"
              size="sm"
              className="border-slate-border text-white hover:border-electric-blue"
            >
              Continue to Meeting
            </Button>
          </div>
        </div>
      )}

      {/* Jitsi Container */}
      <div className="absolute top-16 left-0 right-0 bottom-0">
        {meetingData && (
          <iframe
            ref={iframeRef}
            src={
              meetingData.daily_room_url ||
              `https://meet.jit.si/${meetingData.daily_room_name}`
            }
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
      </div>
    </div>
  );
}
