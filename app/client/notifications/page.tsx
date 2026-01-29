"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        console.error("Failed to fetch notifications:", res.status);
        return;
      }
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);
      await Promise.all(
        unreadIds.map((id) =>
          fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId: id }),
          }),
        ),
      );
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const _getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-8 pb-8">
      {/* Navy Gradient Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-electric-cyan/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center shadow-lg shadow-electric-blue/30">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Notifications</h1>
              <p className="text-slate-300 text-lg">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              size="lg"
              className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white shadow-lg shadow-electric-blue/30"
            >
              <Check className="h-5 w-5 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          size="lg"
          className={
            filter === "all"
              ? "bg-gradient-to-r from-electric-blue to-electric-cyan text-white shadow-lg shadow-electric-blue/30"
              : "border-slate-border text-white hover:border-electric-blue hover:text-electric-blue"
          }
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </Button>
        <Button
          size="lg"
          className={
            filter === "unread"
              ? "bg-gradient-to-r from-electric-blue to-electric-cyan text-white shadow-lg shadow-electric-blue/30"
              : "border-slate-border text-white hover:border-electric-blue hover:text-electric-blue"
          }
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </Button>
      </div>

      {loading ? (
        <Card className="bg-slate-card border-slate-border">
          <CardContent className="py-16">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-electric-blue"></div>
              <p className="ml-4 text-slate-300">Loading notifications...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="bg-slate-card border-slate-border">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-electric-blue to-electric-cyan mb-4 shadow-lg shadow-electric-blue/30">
                <Bell className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                No notifications
              </h3>
              <p className="text-sm text-slate-400">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "You haven't received any notifications yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-lg bg-slate-panel border-slate-border hover:border-electric-blue ${
                !notification.is_read ? "border-l-4 border-l-electric-blue" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-white">
                          {notification.title}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${getTypeBadgeColor(notification.type)}`}
                        >
                          {notification.type.toUpperCase()}
                        </span>
                        {!notification.is_read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap bg-slate-card px-3 py-1 rounded-full">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          { addSuffix: true },
                        )}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-4">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3">
                      {notification.link && (
                        <Link href={notification.link}>
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-electric-blue/90 hover:to-electric-cyan/90 text-white font-semibold shadow-lg shadow-electric-blue/30"
                          >
                            View Details
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      {!notification.is_read && (
                        <Button
                          size="lg"
                          variant="outline"
                          className="font-semibold border-slate-border text-white hover:border-electric-blue hover:text-electric-blue"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark as read
                        </Button>
                      )}
                    </div>
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
