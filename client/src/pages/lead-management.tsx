import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare,
  //Calendar,
  Settings,
  BarChart3,
  Database,
  Upload,
  Download,
  //BookOpen, // for Class/Stream
  ChevronUp,
  ChevronDown,
  GraduationCap
} from "lucide-react";
import AddLeadModal from "@/components/leads/add-lead-modal";
import LeadDetailModal from "@/components/leads/lead-detail-modal";
import LeadStatusBadge from "@/components/leads/lead-status-badge";
import CSVImport from "@/components/leads/csv-import";
import CampaignManager from "@/components/campaigns/campaign-manager";
import ERPConnector from "@/components/erp-integration/erp-connector";
import { type LeadWithCounselor } from "@shared/schema";
import Header from "@/components/layout/header";
import { Textarea } from "@/components/ui/textarea";
import { useHashState } from "@/hooks/use-hash-state";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

// WhatsApp SVG Icon (Font Awesome style)
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path fill="#47d777" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
);

export default function LeadManagement() {
  const [activeTab, setActiveTab] = useHashState("leads");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const [selectedLead, setSelectedLead] = useState<LeadWithCounselor | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const [sortKey, setSortKey] = useState<string>("student");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data, isLoading } = useQuery<LeadWithCounselor[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads");
      return response.json();
    },
  });
  const [leadsState, setLeadsState] = useState<LeadWithCounselor[]>([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      setLeadsState(data);
    }
  }, [data]);

  // Filter out deleted leads for main view
  const activeLeads = leadsState.filter(lead => lead.status !== "deleted");

  const filteredLeads = activeLeads.filter(lead => {
    const search = searchTerm.trim().toLowerCase();
    if (search === "") return true;
    if (/^[a-z]$/i.test(search)) {
      // Single letter: match name startsWith only
      return lead.name.toLowerCase().startsWith(search);
    } else if (/^\d+$/.test(search)) {
      // Only numbers: match phone
      return lead.phone.includes(search);
    } else if (search.includes("@")) {
      // Contains @: match email
      return lead.email && lead.email.toLowerCase().includes(search);
    } else {
      // Default: match name startsWith
      return lead.name.toLowerCase().startsWith(search);
    }
  });

  let sortedLeads = [...filteredLeads];
  sortedLeads.sort((a, b) => {
    let aValue, bValue;
    if (sortKey === "student") {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else if (sortKey === "lastContact") {
      aValue = a.lastContactedAt || "";
      bValue = b.lastContactedAt || "";
    } else if (sortKey === "class") {
      aValue = a.class || "";
      bValue = b.class || "";
    } else {
      return 0;
    }
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 8;
  const totalPages = Math.ceil(sortedLeads.length / leadsPerPage);
  const paginatedLeads = sortedLeads.slice((currentPage - 1) * leadsPerPage, currentPage * leadsPerPage);

  // Add useEffect to reset currentPage when searchTerm, statusFilter, or sourceFilter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sourceFilter]);

  const queryClient = useQueryClient();
  // Track if a lead was deleted
  const [leadDeleted, setLeadDeleted] = useState(false);

  const openLeadDetail = (lead: LeadWithCounselor) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = (open: boolean) => {
    setIsDetailModalOpen(open);
    if (!open) {
      setSelectedLead(null);
      if (leadDeleted) {
        queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
        setLeadDeleted(false);
      }
    }
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

  const exportLeads = () => {
    if (!leadsState || leadsState.length === 0) return;

    const csvHeaders = [
      "Name", "Email", "Phone", "Class", "Stream", "Status", "Source", 
      "Counselor", "Parent Name", "Parent Phone", "Address", "Last Contacted", "Notes"
    ];

    const csvData = leadsState.map(lead => [
      lead.name,
      lead.email || "",
      lead.phone,
      lead.class,
      lead.stream || "",
      lead.status,
      lead.source,
      lead.counselor?.name || "",
      lead.parentName || "",
      lead.parentPhone || "",
      lead.address || "",
      lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : "",
      lead.notes || ""
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [whatsappLead, setWhatsappLead] = useState<LeadWithCounselor | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const handleLeadDeleted = (deletedId: number) => {
    setLeadsState(prev => {
      const updated = prev.filter(lead => lead.id !== deletedId);
      // If the current page is now empty and not the first page, fallback to page 1
      const totalAfterDelete = updated.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone.includes(searchTerm) ||
          (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
        const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
        return matchesSearch && matchesStatus && matchesSource;
      }).length;
      const totalPagesAfterDelete = Math.ceil(totalAfterDelete / leadsPerPage);
      if (currentPage > totalPagesAfterDelete && currentPage > 1) {
        setCurrentPage(1);
      }
      return updated;
    });
    setIsDetailModalOpen(false);
    setSelectedLead(null);
  };

  return (
    <div className="">
      <Header 
        title="Lead Management" 
        subtitle="Manage and track all leads efficiently" 
        className="pb-2 mt-[15px]"
      />
      <Card>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between py-4">
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
                  <SelectItem value="csv_import">CSV Import</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 ml-4 space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCSVImportOpen(true)}
                className="flex items-center gap-2"
              >
                Import CSV
                <Download size={16} />
              </Button>
              <Button 
                variant="outline" 
                onClick={exportLeads}
                className="flex items-center gap-2"
              >
                Export CSV
                <Upload size={16} />
              </Button>
              {/* Pagination controls moved here for alignment */}
              {totalPages > 1 && (
                <div className="ml-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={e => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                          aria-disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === i + 1}
                            onClick={e => { e.preventDefault(); setCurrentPage(i + 1); }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={e => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                          aria-disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>

          {/* Leads Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => {
                        setSortKey("student");
                        setSortOrder(sortKey === "student" && sortOrder === "asc" ? "desc" : "asc");
                      }}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        Student Details
                        {sortKey === "student" ? (
                          sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : null}
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th
                      onClick={() => {
                        setSortKey("class");
                        setSortOrder(sortKey === "class" && sortOrder === "asc" ? "desc" : "asc");
                      }}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        {/* <BookOpen size={14} /> */} Class/Stream
                        {sortKey === "class" ? (
                          sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : null}
                      </span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Counselor
                    </th>
                    <th
                      onClick={() => {
                        setSortKey("lastContact");
                        setSortOrder(sortKey === "lastContact" && sortOrder === "asc" ? "desc" : "asc");
                      }}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        {/* <Calendar size={14} /> */} Last Contact
                        {sortKey === "lastContact" ? (
                          sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : null}
                      </span>
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
                    paginatedLeads.map((lead) => (
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
                              onClick={e => {
                                e.stopPropagation();
                                setWhatsappLead(lead);
                                const instituteName = localStorage.getItem("customInstituteName") || "EduLead Pro";
                                setWhatsappMessage(`Hi ${lead.name}, thank you for your interest! Please let us know if you have any questions. - ${instituteName} Team`);
                                setWhatsappDialogOpen(true);
                              }}
                            >
                              <WhatsAppIcon className="w-8 h-8" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
        onLeadDeleted={() => selectedLead && handleLeadDeleted(selectedLead.id)}
      />

      <Dialog open={isCSVImportOpen} onOpenChange={setIsCSVImportOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Leads from CSV</DialogTitle>
          </DialogHeader>
          <CSVImport 
            onSuccess={() => setIsCSVImportOpen(false)}
            onClose={() => setIsCSVImportOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
          </DialogHeader>
          {whatsappLead && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">To:</span> {whatsappLead.name} ({whatsappLead.phone})
              </div>
              <div>
                <span className="font-semibold">Message:</span>
                <Textarea
                  value={whatsappMessage}
                  onChange={e => setWhatsappMessage(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  window.open(`https://wa.me/${whatsappLead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                  setWhatsappDialogOpen(false);
                }}
              >
                Open in WhatsApp
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}