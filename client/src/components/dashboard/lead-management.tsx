import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Mail, Phone, Clock, User, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";

// Mock data for lead database
const mockLeadData = {
  totalLeads: 1250,
  activeLeads: 450,
  hotLeads: 85,
  conversionRate: 32,
  recentLeads: [
    {
      id: "L001",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      source: "Website",
      status: "Hot",
      lastContact: "2024-03-15T10:30:00",
      notes: "Interested in Data Science program, scheduled follow-up call",
      assignedTo: "Sarah Johnson"
    },
    {
      id: "L002",
      name: "Emily Chen",
      email: "emily.chen@email.com",
      phone: "+1 (555) 234-5678",
      source: "Referral",
      status: "Warm",
      lastContact: "2024-03-14T15:45:00",
      notes: "Considering Business Administration, needs scholarship info",
      assignedTo: "Michael Brown"
    },
    {
      id: "L003",
      name: "Robert Wilson",
      email: "robert.wilson@email.com",
      phone: "+1 (555) 345-6789",
      source: "Social Media",
      status: "New",
      lastContact: "2024-03-15T09:15:00",
      notes: "Interested in Computer Science, requested program details",
      assignedTo: "Sarah Johnson"
    },
    {
      id: "L004",
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      phone: "+1 (555) 456-7890",
      source: "Website",
      status: "Hot",
      lastContact: "2024-03-14T14:20:00",
      notes: "Ready to enroll in Nursing program, needs financial aid info",
      assignedTo: "Michael Brown"
    },
    {
      id: "L005",
      name: "David Kim",
      email: "david.kim@email.com",
      phone: "+1 (555) 567-8901",
      source: "Email Campaign",
      status: "Warm",
      lastContact: "2024-03-15T11:00:00",
      notes: "Interested in Engineering, requested campus tour",
      assignedTo: "Sarah Johnson"
    }
  ],
  leadSources: [
    {
      source: "Website",
      count: 450,
      conversionRate: 35
    },
    {
      source: "Referral",
      count: 280,
      conversionRate: 42
    },
    {
      source: "Social Media",
      count: 320,
      conversionRate: 28
    },
    {
      source: "Email Campaign",
      count: 200,
      conversionRate: 25
    }
  ],
  leadStatus: [
    {
      status: "Hot",
      count: 85,
      color: "red"
    },
    {
      status: "Warm",
      count: 165,
      color: "orange"
    },
    {
      status: "New",
      count: 200,
      color: "blue"
    }
  ]
};

export default function LeadManagement() {
  const [, setLocation] = useLocation();
  const { data: leadData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/lead-management"],
    queryFn: () => Promise.resolve(mockLeadData),
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "hot":
        return "bg-red-100 text-red-700 border-red-200";
      case "warm":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "new":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lead Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                <span>Lead Overview</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Overview of lead management metrics</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/leads")}
                className="text-primary-600 hover:text-primary-700"
              >
                View All Leads
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {leadData?.totalLeads.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-100">
                <p className="text-sm font-medium text-gray-600">Active Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {leadData?.activeLeads.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-100">
                <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {leadData?.hotLeads.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-100">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {leadData?.conversionRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Leads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                <span>Recent Leads</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Recently added and updated leads</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/leads/new")}
                className="text-primary-600 hover:text-primary-700"
              >
                Add New Lead
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadData?.recentLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 mr-1" />
                          {lead.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-1" />
                          {lead.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {format(new Date(lead.lastContact), 'MMM d, h:mm a')}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/leads/${lead.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lead Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <span>Lead Sources</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Distribution of leads by source</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leadData?.leadSources.map((source, index) => (
                <motion.div
                  key={source.source}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{source.source}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {source.count.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white text-green-600 border-green-200">
                      {source.conversionRate}% conversion
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 