import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Settings,
  BarChart3,
  Database,
  Upload
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import AddLeadModal from "@/components/leads/add-lead-modal";
import LeadDetailModal from "@/components/leads/lead-detail-modal";
import LeadStatusBadge from "@/components/leads/lead-status-badge";
import CSVImport from "@/components/leads/csv-import";
import CampaignManager from "@/components/campaigns/campaign-manager";
import ERPConnector from "@/components/erp-integration/erp-connector";
import { type LeadWithCounselor } from "@shared/schema";

export default function LeadManagement() {
  const [activeTab, setActiveTab] = useState("leads");
  const [selectedLead, setSelectedLead] = useState<LeadWithCounselor | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const { data: leads, isLoading } = useQuery<LeadWithCounselor[]>({
    queryKey: ["/api/leads"],
  });

  const { data: leadStats } = useQuery<{
    totalLeads: number;
    hotLeads: number;
    conversions: number;
    newLeadsToday: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  }) || [];

  const openLeadDetail = (lead: LeadWithCounselor) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-purple-100 text-purple-800";
      case "interested": return "bg-yellow-100 text-yellow-800";
      case "enrolled": return "bg-green-100 text-green-800";
      case "dropped": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Not contacted";
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
      <div className="space-y-6">
        {/* Header with Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{leadStats?.totalLeads || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                  <p className="text-3xl font-bold text-orange-600">{leadStats?.hotLeads || 0}</p>
                </div>
                <Phone className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversions</p>
                  <p className="text-3xl font-bold text-green-600">{leadStats?.conversions || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Today</p>
                  <p className="text-3xl font-bold text-blue-600">{leadStats?.newLeadsToday || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Management System</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="leads" className="flex items-center gap-2">
                  <Users size={16} />
                  Lead Database
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  Campaign Manager
                </TabsTrigger>
                <TabsTrigger value="erp" className="flex items-center gap-2">
                  <Database size={16} />
                  ERP Integration
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leads" className="space-y-6">
                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search leads by name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="enrolled">Enrolled</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="google_ads">Google Ads</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="walk_in">Walk-in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Add New Lead
                  </Button>
                </div>

                {/* Leads Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Class/Stream
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Counselor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                              Loading leads...
                            </td>
                          </tr>
                        ) : filteredLeads.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                              No leads found matching your criteria
                            </td>
                          </tr>
                        ) : (
                          filteredLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-sm font-medium text-blue-600">
                                        {lead.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                    <div className="text-sm text-gray-500 capitalize">
                                      {lead.source.replace('_', ' ')}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{lead.phone}</div>
                                <div className="text-sm text-gray-500">{lead.email || "No email"}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {lead.class} {lead.stream}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={getStatusColor(lead.status)}>
                                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {lead.counselor?.name || "Unassigned"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(lead.lastContactedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openLeadDetail(lead)}
                                  >
                                    View Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`tel:${lead.phone}`, '_self');
                                    }}
                                  >
                                    <Phone size={14} />
                                  </Button>
                                  {lead.email && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`mailto:${lead.email}`, '_self');
                                      }}
                                    >
                                      <Mail size={14} />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {filteredLeads.filter(l => l.status === "new").length}
                        </p>
                        <p className="text-sm text-gray-600">New Leads</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {filteredLeads.filter(l => l.status === "interested").length}
                        </p>
                        <p className="text-sm text-gray-600">Interested</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {filteredLeads.filter(l => l.status === "enrolled").length}
                        </p>
                        <p className="text-sm text-gray-600">Enrolled</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="campaigns">
                <CampaignManager />
              </TabsContent>

              <TabsContent value="erp">
                <ERPConnector />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                  <p className="text-gray-600 mb-4">Comprehensive analytics and reporting coming soon</p>
                  <Button variant="outline">
                    <Settings size={16} className="mr-2" />
                    Configure Analytics
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Modals */}
        <AddLeadModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
        />

        <LeadDetailModal
          lead={selectedLead}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
        />
      </div>
  );
}