"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        setUser(data);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-bg flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-border bg-slate-panel p-6 hidden md:block shadow-xl">
        <Link
          href="/admin"
          className="mb-8 flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/images/Grid Nexus Logo.png"
            alt="GridNexus Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-electric-cyan bg-clip-text text-transparent">
            GridNexus Admin
          </h2>
        </Link>
        <nav className="space-y-2">
          <Link href="/admin">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 hover:text-electric-blue"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/projects">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 hover:text-electric-blue"
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Projects
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 hover:text-electric-blue"
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 hover:text-electric-blue"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-border bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700 px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="border-2 border-electric-blue">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-electric-blue/20 text-white">
                    {getInitials(user?.full_name || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-slate-300">Administrator</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-white hover:text-electric-blue hover:bg-white/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
