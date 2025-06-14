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
import { mockNotifications } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "high" | "medium" | "low";
  action: {
    type: string;
    id: string;
  };
}

interface NotificationCategory {
  type: string;
  label: string;
  count: number;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications.notifications as Notification[]
  );
  const [categories] = useState<NotificationCategory[]>(mockNotifications.categories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = selectedCategory
    ? notifications.filter(n => n.type === selectedCategory)
    : notifications;

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
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
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount}
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
              disabled={unreadCount === 0}
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
                          {format(new Date(notification.timestamp), "MMM d, h:mm a")}
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
        </ScrollArea>

        {filteredNotifications.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}