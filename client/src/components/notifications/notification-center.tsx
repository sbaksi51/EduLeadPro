import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  CheckCircle,
  X,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";
import { type LeadWithCounselor } from "@shared/schema";

interface Notification {
  id: string;
  type: "overdue" | "new_lead" | "follow_up" | "conversion" | "alert";
  title: string;
  message: string;
  leadId?: number;
  priority: "high" | "medium" | "low";
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: string;
    variant?: "default" | "outline" | "destructive";
  }>;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: leads } = useQuery<LeadWithCounselor[]>({
    queryKey: ["/api/leads"],
  });

  const { data: overdueFollowUps } = useQuery({
    queryKey: ["/api/follow-ups/overdue"],
  });

  useEffect(() => {
    if (leads) {
      generateNotifications(leads);
    }
  }, [leads]);

  useEffect(() => {
    if (overdueFollowUps && Array.isArray(overdueFollowUps) && overdueFollowUps.length > 0) {
      generateOverdueNotifications(overdueFollowUps);
    }
  }, [overdueFollowUps]);

  const generateNotifications = (leadsData: LeadWithCounselor[]) => {
    const newNotifications: Notification[] = [];
    
    // Check for new leads
    const newLeads = leadsData.filter(lead => lead.status === "new");
    if (newLeads.length > 0) {
      newNotifications.push({
        id: `new-leads-${Date.now()}`,
        type: "new_lead",
        title: "New Leads Awaiting Assignment",
        message: `${newLeads.length} new leads need counselor assignment`,
        priority: "high",
        timestamp: new Date(),
        read: false,
        actions: [
          { label: "Assign Counselors", action: "assign", variant: "default" },
          { label: "View Leads", action: "view", variant: "outline" }
        ]
      });
    }

    // Check for interested leads without recent contact
    const staleInterestedLeads = leadsData.filter(lead => 
      lead.status === "interested" && 
      (!lead.lastContactedAt || 
        (new Date().getTime() - new Date(lead.lastContactedAt).getTime()) > 5 * 24 * 60 * 60 * 1000)
    );
    
    if (staleInterestedLeads.length > 0) {
      newNotifications.push({
        id: `stale-interested-${Date.now()}`,
        type: "alert",
        title: "Interested Leads Need Attention",
        message: `${staleInterestedLeads.length} interested leads haven't been contacted in 5+ days`,
        priority: "high",
        timestamp: new Date(),
        read: false,
        actions: [
          { label: "Schedule Calls", action: "schedule", variant: "default" },
          { label: "Send WhatsApp", action: "whatsapp", variant: "outline" }
        ]
      });
    }

    setNotifications(prev => [...prev.filter(n => n.read), ...newNotifications]);
  };

  const generateOverdueNotifications = (overdueData: any[]) => {
    if (overdueData.length > 0) {
      const overdueNotification: Notification = {
        id: `overdue-${Date.now()}`,
        type: "overdue",
        title: "Overdue Follow-ups",
        message: `${overdueData.length} follow-ups are overdue and need immediate attention`,
        priority: "high",
        timestamp: new Date(),
        read: false,
        actions: [
          { label: "Mark Complete", action: "complete", variant: "default" },
          { label: "Reschedule", action: "reschedule", variant: "outline" }
        ]
      };
      
      setNotifications(prev => [overdueNotification, ...prev]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleAction = (notification: Notification, actionType: string) => {
    markAsRead(notification.id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "overdue": return <AlertTriangle className="text-red-500" size={16} />;
      case "new_lead": return <UserCheck className="text-blue-500" size={16} />;
      case "follow_up": return <Clock className="text-orange-500" size={16} />;
      case "conversion": return <CheckCircle className="text-green-500" size={16} />;
      default: return <Bell className="text-gray-500" size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500 bg-red-50";
      case "medium": return "border-l-orange-500 bg-orange-50";
      case "low": return "border-l-blue-500 bg-blue-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="p-2 text-gray-400 hover:text-gray-600 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications at this time
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-l-4 rounded-r-lg ${getPriorityColor(notification.priority)} ${
                    notification.read ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>

                  {notification.actions && (
                    <div className="flex gap-2 mt-3">
                      {notification.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.variant || "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => handleAction(notification, action.action)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Phone size={12} className="mr-1" />
                Call Queue
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Mail size={12} className="mr-1" />
                Email List
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare size={12} className="mr-1" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}