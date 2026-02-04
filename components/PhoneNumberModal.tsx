"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bell, X } from "lucide-react";

export default function PhoneNumberModal() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    checkUserPhone();
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
        setUserId(user.id);
        // Show modal after a short delay
        setTimeout(() => setOpen(true), 2000);
      }
    } catch (error) {
      console.error("Error checking phone:", error);
    }
  };

  const handleSave = async () => {
    if (!phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase.from("users") as any)
        .update({ phone: phone.trim() })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Phone number saved! You'll now receive SMS notifications.");
      setOpen(false);
      
      // Refresh the page to update all components
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to save phone number");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setOpen(false);
    toast.info("You can add your phone number later in your profile");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-slate-panel border-slate-border">
        <DialogHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/30">
            <Bell className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center text-white">
            📱 Stay Updated with SMS
          </DialogTitle>
          <DialogDescription className="text-center text-slate-300 text-base">
            Add your phone number to receive instant SMS notifications for:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-green-400">✓</span>
            <span>Payment confirmations</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-green-400">✓</span>
            <span>Project updates</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-green-400">✓</span>
            <span>Meeting invitations</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-green-400">✓</span>
            <span>Important notifications</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white font-semibold">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0241234567 or +233241234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 text-base border-slate-border bg-slate-card text-white"
            autoFocus
          />
          <p className="text-xs text-slate-400">
            Standard SMS rates may apply
          </p>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-slate-400 hover:text-white"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white font-semibold shadow-lg shadow-electric-blue/30"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
