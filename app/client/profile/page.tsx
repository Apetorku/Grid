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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ClientProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: userData } = await (supabase.from("users") as any)
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (userData) {
        setUser({ ...authUser, ...(userData as any) });
        setFullName((userData as any).full_name || "");
      } else {
        setUser(authUser);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { error } = await (supabase.from("users") as any)
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setUser({ ...user, full_name: fullName });
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: prompt("Enter new password (min 6 characters):") || "",
      });

      if (error) throw error;
      toast.success("Password updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-12">User not found</div>;
  }

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      {/* Navy Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-electric-cyan/10"></div>
        <div className="relative flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/30">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">My Profile</h1>
            <p className="text-slate-300 text-lg">
              Manage your account settings
            </p>
          </div>
        </div>
      </div>

      {/* Profile Overview */}
      <Card className="bg-slate-panel border-slate-border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-navy-900/50 to-navy-800/50 border-b border-slate-border">
          <CardTitle className="text-2xl text-white">
            Profile Information
          </CardTitle>
          <CardDescription className="text-base text-slate-300">
            Your personal details and account information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-electric-blue shadow-xl shadow-electric-blue/20">
              <AvatarFallback className="text-3xl bg-gradient-to-br from-electric-blue to-electric-cyan text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {fullName || "No name set"}
              </h3>
              <p className="text-slate-300 flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center gap-3 p-4 bg-slate-card rounded-xl border border-slate-border">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Role</p>
                <p className="font-bold text-white capitalize">
                  {user.role || "client"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-card rounded-xl border border-slate-border">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/20">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Joined</p>
                <p className="font-bold text-white">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-card rounded-xl border border-slate-border">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  Email verified
                </p>
                <p className="font-bold text-white">
                  {user.email_confirmed_at ? "Yes" : "No"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-card rounded-xl border border-slate-border">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/20">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Provider</p>
                <p className="font-bold text-white capitalize">
                  {user.app_metadata?.provider || "email"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card className="bg-slate-panel border-slate-border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-navy-900/50 to-navy-800/50 border-b border-slate-border">
          <CardTitle className="text-2xl text-white">Edit Profile</CardTitle>
          <CardDescription className="text-base text-slate-300">
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-base font-semibold text-white"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 text-base border-slate-border bg-slate-card text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-base font-semibold text-white"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-slate-card/50 h-12 text-base border-slate-border text-slate-400"
              />
              <p className="text-sm text-slate-400">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={updating}
              className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white font-semibold shadow-lg shadow-electric-blue/30"
            >
              {updating ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-slate-panel border-slate-border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-navy-900/50 to-navy-800/50 border-b border-slate-border">
          <CardTitle className="text-2xl text-white">Security</CardTitle>
          <CardDescription className="text-base text-slate-300">
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-card rounded-xl border border-slate-border">
            <div>
              <h4 className="font-bold text-lg text-white">Password</h4>
              <p className="text-sm text-slate-400">
                Change your password to keep your account secure
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={handleChangePassword}
              className="font-semibold border-slate-border text-white hover:border-electric-blue hover:text-electric-blue"
            >
              Change Password
            </Button>
          </div>

          <div className="p-4 bg-slate-card rounded-xl border border-slate-border">
            <h4 className="font-bold text-lg mb-2 text-white">
              Two-Factor Authentication
            </h4>
            <p className="text-sm text-slate-400 mb-4">
              Add an extra layer of security to your account (Coming soon)
            </p>
            <Button
              variant="outline"
              size="lg"
              disabled
              className="font-semibold border-slate-border text-slate-500"
            >
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-slate-panel border-red-500/50 shadow-lg shadow-red-500/10">
        <CardHeader className="bg-gradient-to-r from-red-900/30 to-red-800/30 border-b border-red-500/30">
          <CardTitle className="text-2xl text-red-400">Danger Zone</CardTitle>
          <CardDescription className="text-base text-slate-300">
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between p-4 bg-red-950/30 rounded-xl border border-red-500/30">
            <div>
              <h4 className="font-bold text-lg text-red-400">Delete Account</h4>
              <p className="text-sm text-slate-400">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              size="lg"
              disabled
              className="font-semibold"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
