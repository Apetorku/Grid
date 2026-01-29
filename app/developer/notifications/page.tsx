"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Check } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6 p-6 bg-gradient-to-r from-navy-950 via-navy-800 to-navy-700 rounded-lg border border-slate-border shadow-lg">
        <Link href="/developer">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-electric-blue hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
            <Bell className="h-8 w-8 text-electric-blue" />
            Notifications
          </h1>
          <p className="text-slate-300">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className={
            filter === "all"
              ? "bg-gradient-to-r from-electric-blue to-electric-cyan shadow-lg shadow-electric-blue/30"
              : "border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white"
          }
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
          className={
            filter === "unread"
              ? "bg-gradient-to-r from-electric-blue to-electric-cyan shadow-lg shadow-electric-blue/30"
              : "border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white"
          }
        >
          Unread ({unreadCount})
        </Button>
      </div>

      {loading ? (
        <Card className="bg-slate-panel border-slate-border">
          <CardContent className="py-8">
            <p className="text-center text-slate-400">
              Loading notifications...
            </p>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="bg-slate-panel border-slate-border">
          <CardContent className="py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 mx-auto text-electric-blue mb-4" />
              <p className="text-lg font-medium mb-2 text-white">
                No notifications
              </p>
              <p className="text-sm text-slate-400">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "You haven't received any notifications yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md bg-slate-panel border-slate-border ${
                !notification.is_read ? "border-l-4 border-l-electric-blue" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">
                          {notification.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadgeColor(notification.type)}`}
                        >
                          {notification.type}
                        </span>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-electric-blue" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          { addSuffix: true },
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      {notification.link && (
                        <Link href={notification.link}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white"
                          >
                            View Details
                          </Button>
                        </Link>
                      )}
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <Check className="h-3 w-3 mr-1" />
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
