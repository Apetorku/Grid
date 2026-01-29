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
import { Mail, Calendar, Shield, Code } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DeveloperProfilePage() {
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

      const { data: userData } = (await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()) as { data: any };

      if (userData) {
        setUser({ ...authUser, ...userData });
        setFullName(userData.full_name || "");
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
            <Code className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Developer Profile</h1>
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
                <p className="text-sm text-slate-400">Role</p>
                <p className="font-semibold text-white capitalize">
                  {user.role || "Developer"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-card rounded-xl border border-slate-border">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/20">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Member Since</p>
                <p className="font-semibold text-white">
                  {user.created_at ? formatDate(user.created_at) : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card className="bg-slate-panel border-slate-border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-navy-900/50 to-navy-800/50 border-b border-slate-border">
          <CardTitle className="text-xl text-white">Update Profile</CardTitle>
          <CardDescription className="text-slate-300">
            Change your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-slate-card border-slate-border text-white placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-slate-card border-slate-border text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <Button
              type="submit"
              disabled={updating}
              className="w-full bg-gradient-to-r from-electric-blue to-electric-cyan hover:shadow-lg hover:shadow-electric-blue/30 text-white font-semibold"
            >
              {updating ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-slate-panel border-slate-border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-navy-900/50 to-navy-800/50 border-b border-slate-border">
          <CardTitle className="text-xl text-white">
            Security Settings
          </CardTitle>
          <CardDescription className="text-slate-300">
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-card rounded-xl border border-slate-border">
              <div>
                <h4 className="font-semibold text-white">Password</h4>
                <p className="text-sm text-slate-400">
                  Change your account password
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleChangePassword}
                className="border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white"
              >
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-card rounded-xl border border-slate-border">
              <div>
                <h4 className="font-semibold text-white">Account ID</h4>
                <p className="text-sm text-slate-400 font-mono">{user.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
