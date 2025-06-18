import { useState, useEffect } from "react";
import { Bell, Check, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationService, type NotificationStats } from "@/lib/notificationService";
import type { Notification } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface NotificationCategory {
  type: string;
  label: string;
  count: number;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<NotificationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, byType: [] });
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = selectedCategory
    ? notifications.filter(n => n.type === selectedCategory)
    : notifications;

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications(1, undefined, 50);
      setNotifications(data);
      
      // Generate categories from notification types
      const typeCounts = data.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoryLabels: Record<string, string> = {
        admission: "Admissions",
        payment: "Payments",
        attendance: "Attendance",
        exam: "Exams",
        staff: "Staff",
        maintenance: "Maintenance",
        event: "Events",
        parent: "Parent Communication",
        lead: "Leads",
        followup: "Follow-ups"
      };

      const categoryList = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        label: categoryLabels[type] || type.charAt(0).toUpperCase() + type.slice(1),
        count
      }));

      setCategories(categoryList);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await NotificationService.getNotificationStats(1);
      setStats(data);
    } catch (error) {
      console.error("Failed to load notification stats:", error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      loadStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(1);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      loadStats(); // Refresh stats
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await NotificationService.clearAllNotifications(1);
      setNotifications([]);
      setCategories([]);
      loadStats(); // Refresh stats
      toast({
        title: "Success",
        description: "All notifications cleared",
      });
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear all notifications",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-orange-600";
      case "low":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeIcon = (type: string) => {
    // You can add more icons based on notification type
    return <Bell className="h-4 w-4" />;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {stats.unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {stats.unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-2">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={stats.unread === 0}
            >
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Clear all
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 border-b">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <ScrollArea className="w-full">
            <div className="flex items-center gap-2 pb-2 min-w-max">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                className="flex items-center whitespace-nowrap"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category.type}
                  variant={selectedCategory === category.type ? "default" : "outline"}
                  size="sm"
                  className="flex items-center whitespace-nowrap"
                  onClick={() => setSelectedCategory(category.type)}
                >
                  {category.label}
                  {category.count > 0 && (
                    <Badge variant="secondary" className="ml-2 flex items-center justify-center">
                      {category.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading notifications...</div>
            </div>
          ) : (
            <AnimatePresence>
              {filteredNotifications.map(notification => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownMenuItem
                    className={cn(
                      "flex flex-col items-start p-4 cursor-pointer",
                      !notification.read && "bg-muted/50"
                    )}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-start gap-3">
                        <div className={cn("mt-1", getPriorityColor(notification.priority))}>
                          {getTypeIcon(notification.type)}
                        </div>
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <Badge variant="secondary" className="ml-2">
                          New
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>

        {filteredNotifications.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground">
              {selectedCategory ? `No ${selectedCategory} notifications` : "You're all caught up!"}
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}