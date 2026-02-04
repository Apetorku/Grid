"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileCompletionBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const isDismissed = sessionStorage.getItem("phone-banner-dismissed");
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    checkUserPhone();

    // Listen for phone number updates
    const handlePhoneUpdate = () => {
      setShow(false);
      setDismissed(true);
    };

    window.addEventListener("phone-number-updated", handlePhoneUpdate);

    return () => {
      window.removeEventListener("phone-number-updated", handlePhoneUpdate);
    };
  }, []);

  const checkUserPhone = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await (supabase.from("users") as any)
        .select("phone, role")
        .eq("id", user.id)
        .single();

      // Only show for clients without phone numbers
      if (userData && userData.role === "client" && !userData.phone) {
        setShow(true);
      }
    } catch (error) {
      console.error("Error checking phone:", error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("phone-banner-dismissed", "true");
  };

  const handleAddPhone = () => {
    router.push("/client/profile");
  };

  if (!show || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-electric-blue to-electric-cyan p-4 shadow-lg relative">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm md:text-base">
              📱 Complete your profile to receive SMS updates
            </p>
            <p className="text-white/90 text-xs md:text-sm">
              Stay informed about payments, meetings, and project updates via SMS
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddPhone}
            size="sm"
            className="bg-white text-electric-blue hover:bg-white/90 font-semibold shadow-lg"
          >
            Add Phone Number
          </Button>
          <button
            onClick={handleDismiss}
            className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
