import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Bell, User, Shield, Database, Calculator, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    overdueFollowups: true,
    newLeads: false,
    dailyReports: true,
  });

  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@school.edu",
    phone: "+1 (555) 123-4567",
    role: "Admissions Head",
  });

  const [systemSettings, setSystemSettings] = useState({
    autoAssignment: true,
    followupReminders: "24",
    leadTimeout: "30",
    workingHours: "9:00 AM - 6:00 PM",
    customInstituteName: "",
  });

  const { toast } = useToast();

  const [selectedTab, setSelectedTab] = useState(() => {
    return window.location.hash.slice(1) || "profile";
  });

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    window.location.hash = value;
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notifications updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSaveSystem = () => {
    // Save custom institute name to localStorage
    localStorage.setItem("customInstituteName", systemSettings.customInstituteName);
    
    toast({
      title: "System settings updated",
      description: "System configuration has been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header className="py-4" />
      
      <main className="p-6">
        <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Payroll
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={profile.role}
                      disabled
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile}>Save Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailAlerts: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Overdue Follow-ups</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about overdue follow-up tasks
                    </p>
                  </div>
                  <Switch
                    checked={notifications.overdueFollowups}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, overdueFollowups: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>New Lead Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Instant notifications for new leads
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newLeads}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newLeads: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily summary reports
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dailyReports}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, dailyReports: checked })
                    }
                  />
                </div>
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  Configure system-wide settings and automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-assign New Leads</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically assign leads to available counselors
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.autoAssignment}
                    onCheckedChange={(checked) =>
                      setSystemSettings({ ...systemSettings, autoAssignment: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followup-reminder">Follow-up Reminder (hours)</Label>
                  <Select
                    value={systemSettings.followupReminders}
                    onValueChange={(value) =>
                      setSystemSettings({ ...systemSettings, followupReminders: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="72">72 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-timeout">Lead Timeout (days)</Label>
                  <Select
                    value={systemSettings.leadTimeout}
                    onValueChange={(value) =>
                      setSystemSettings({ ...systemSettings, leadTimeout: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="45">45 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working-hours">Working Hours</Label>
                  <Input
                    id="working-hours"
                    value={systemSettings.workingHours}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, workingHours: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-institute-name" className="text-base font-semibold">Institute Name</Label>
                  <Input
                    id="custom-institute-name"
                    placeholder="Enter your institute name"
                    value={systemSettings.customInstituteName}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, customInstituteName: e.target.value })
                    }
                    className="text-lg"
                  />
                </div>
                <Button onClick={handleSaveSystem}>Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Settings</CardTitle>
                  <CardDescription>Configure payroll calculation parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Payment Method</Label>
                      <Select defaultValue="bank">
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Day</Label>
                      <Select defaultValue="25">
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 28}, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Working Days per Month</Label>
                      <Input 
                        type="number" 
                        defaultValue="30" 
                        placeholder="Enter working days"
                        min="1"
                        max="31"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Daily Rate Calculation</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue placeholder="Select calculation method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">Salary ÷ 30 days</SelectItem>
                          <SelectItem value="26">Salary ÷ 26 days</SelectItem>
                          <SelectItem value="22">Salary ÷ 22 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Allowance Settings</CardTitle>
                  <CardDescription>Configure salary allowances and benefits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>HRA Percentage</Label>
                      <Input 
                        type="number" 
                        defaultValue="0" 
                        placeholder="Enter HRA percentage"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>PF Percentage</Label>
                      <Input 
                        type="number" 
                        defaultValue="0" 
                        placeholder="Enter PF percentage"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Transport Allowance</Label>
                      <Input 
                        type="number" 
                        defaultValue="0" 
                        placeholder="Enter transport allowance"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Medical Allowance</Label>
                      <Input 
                        type="number" 
                        defaultValue="0" 
                        placeholder="Enter medical allowance"
                        min="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Change Password</Button>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Session Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage active sessions and login history
                  </p>
                  <Button variant="outline">View Active Sessions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}