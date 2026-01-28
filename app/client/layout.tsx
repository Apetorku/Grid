"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  Menu,
  LogOut,
  Home,
  FolderKanban,
  Plus,
  User as UserIcon,
  Bell,
  X,
  MessageSquare,
  Video,
} from "lucide-react";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
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

  const navItems = [
    { href: "/client", icon: Home, label: "Dashboard" },
    { href: "/client/projects", icon: FolderKanban, label: "My Projects" },
    { href: "/client/new-project", icon: Plus, label: "New Project" },
    { href: "/client/messages", icon: MessageSquare, label: "Messages" },
    { href: "/client/meetings", icon: Video, label: "Meetings" },
    { href: "/client/notifications", icon: Bell, label: "Notifications" },
    { href: "/client/profile", icon: UserIcon, label: "Profile" },
  ];

  const isActive = (path: string) => pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-bg">
      {/* Top Header */}
      <header className="border-b border-slate-border bg-slate-panel/80 backdrop-blur-md fixed top-0 left-0 right-0 z-40 shadow-lg shadow-black/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link
              href="/client"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/Grid Nexus Logo.png"
                alt="GridNexus Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-electric-blue via-electric-cyan to-electric-light bg-clip-text text-transparent">
                GridNexus
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown userRole="client" />
            <Link href="/client/profile">
              <Avatar className="h-9 w-9 cursor-pointer hover:scale-110 transition-transform border-2 border-electric-blue shadow-md shadow-electric-blue/30">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-electric-blue to-electric-cyan text-white font-bold">
                  {getInitials(user?.full_name || "")}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-red-500/10 hover:text-red-400 text-slate-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-slate-panel w-64 h-full p-4 shadow-2xl border-r border-slate-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/Grid Nexus Logo.png"
                  alt="GridNexus Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <h2 className="text-lg font-bold bg-gradient-to-r from-electric-blue to-electric-cyan bg-clip-text text-transparent">
                  Menu
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                    isActive(item.href)
                      ? "bg-gradient-to-r from-electric-blue to-electric-cyan text-white shadow-lg shadow-electric-blue/30"
                      : "hover:bg-slate-card text-slate-300 hover:text-white",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-slate-border">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-10 w-10 border-2 border-electric-blue shadow-md shadow-electric-blue/20">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-electric-blue to-electric-cyan text-white font-bold">
                    {getInitials(user?.full_name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">
                    {user?.full_name}
                  </p>
                  <p className="text-xs bg-gradient-to-r from-electric-blue to-electric-cyan bg-clip-text text-transparent font-semibold">
                    Client
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-14 bottom-0 bg-slate-panel backdrop-blur-md border-r border-slate-border w-64 z-30 hidden md:block shadow-2xl">
        <div className="p-4 h-full flex flex-col">
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-electric-blue to-electric-cyan text-white shadow-lg shadow-electric-blue/30"
                    : "hover:bg-slate-card text-slate-300 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-slate-border mt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-10 w-10 border-2 border-electric-blue shadow-md shadow-electric-blue/20">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-electric-blue to-electric-cyan text-white font-bold">
                  {getInitials(user?.full_name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-white">
                  {user?.full_name}
                </p>
                <p className="text-xs bg-gradient-to-r from-electric-blue to-electric-cyan bg-clip-text text-transparent font-semibold">
                  Client
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-14 md:pl-64">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
