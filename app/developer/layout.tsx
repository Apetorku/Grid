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
  User as UserIcon,
  Bell,
  X,
  MessageSquare,
  Video,
} from "lucide-react";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface DeveloperLayoutProps {
  children: React.ReactNode;
}

export default function DeveloperLayout({ children }: DeveloperLayoutProps) {
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
    { href: "/developer", icon: Home, label: "Dashboard" },
    { href: "/developer/projects", icon: FolderKanban, label: "Projects" },
    { href: "/developer/messages", icon: MessageSquare, label: "Messages" },
    { href: "/developer/meetings", icon: Video, label: "Meetings" },
    { href: "/developer/notifications", icon: Bell, label: "Notifications" },
    { href: "/developer/profile", icon: UserIcon, label: "Profile" },
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
      <header className="border-b bg-slate-700/50 backdrop-blur-lg border-slate-border fixed top-0 left-0 right-0 z-40 shadow-md">
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
              href="/developer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/Grid Nexus Logo.png"
                alt="GridNexus Logo"
                width={40}
                height={40}
                className="w-10 h-auto object-contain brightness-0 invert"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-electric-blue to-electric-cyan bg-clip-text text-transparent">
                GridNexus <span className="text-sm text-white/70">Dev</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown userRole="developer" />
            <Link href="/developer/profile">
              <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity border-2 border-electric-blue">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="text-xs bg-electric-blue/20 text-white">
                  {getInitials(user?.full_name || "")}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-white hover:text-electric-blue hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-50 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-slate-panel w-64 h-full p-4 shadow-xl border-r border-slate-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-electric-blue hover:bg-white/10"
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
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-white",
                    isActive(item.href)
                      ? "bg-gradient-to-r from-electric-blue to-electric-cyan shadow-lg shadow-electric-blue/30"
                      : "hover:bg-white/10 hover:text-electric-blue",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-slate-border">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-10 w-10 border-2 border-electric-blue">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-electric-blue/20 text-white">
                    {getInitials(user?.full_name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-slate-400">Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-14 bottom-0 bg-slate-panel border-r border-slate-border w-64 z-30 hidden md:block shadow-xl">
        <div className="p-4 h-full flex flex-col">
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-white",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-electric-blue to-electric-cyan shadow-lg shadow-electric-blue/30"
                    : "hover:bg-white/10 hover:text-electric-blue",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-slate-border mt-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-10 w-10 border-2 border-electric-blue">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-electric-blue/20 text-white">
                  {getInitials(user?.full_name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">
                  {user?.full_name}
                </p>
                <p className="text-xs text-slate-400">Developer</p>
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
