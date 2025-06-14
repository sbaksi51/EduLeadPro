import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LeadStatusBadge from "@/components/leads/lead-status-badge";
import { type LeadWithCounselor } from "@shared/schema";

export default function RecentLeadsTable() {
  const [, setLocation] = useLocation();
  const { data: leads, isLoading } = useQuery<LeadWithCounselor[]>({
    queryKey: ["/api/dashboard/recent-leads"],
    queryFn: () => Promise.resolve(mockRecentLeads),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getInitialsColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-pink-100 text-pink-600', 
      'bg-purple-100 text-purple-600',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600'
    ];
    return colors[name.length % colors.length];
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Not scheduled";
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Leads</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-600 hover:text-primary-700"
            onClick={() => setLocation("/leads")}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Counselor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Follow-up
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads?.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getInitialsColor(lead.name)}`}>
                        <span className="font-medium text-sm">{getInitials(lead.name)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                        <p className="text-sm text-gray-500">{lead.class} {lead.stream}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {lead.source.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {lead.counselor?.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {lead.followUps && lead.followUps.length > 0 ? (
                      <span className={`font-medium ${
                        new Date(lead.followUps[0].scheduledAt) < new Date() && !lead.followUps[0].completedAt
                          ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatDate(lead.followUps[0].scheduledAt)}
                      </span>
                    ) : (
                      <span className="text-gray-500">No follow-up</span>
                    )}
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// --- MOCK DATA INJECTION START ---
const mockRecentLeads = [
  {
    id: 3,
    name: "Robert Wilson",
    email: "robert.wilson@email.com",
    phone: "+1 (555) 345-6789",
    class: "Class 11",
    stream: "Arts",
    status: "contacted",
    source: "facebook",
    counselorId: 1,
    counselor: { id: 1, username: "sarahj", password: "", role: "counselor", name: "Sarah Johnson", email: "sarah.johnson@email.com" },
    lastContactedAt: new Date("2024-03-15T09:15:00"),
    parentName: "Paul Wilson",
    parentPhone: "+1 (555) 765-4321",
    address: "789 Pine Rd, City",
    admissionLikelihood: "50.00",
    notes: "Interested in Computer Science, requested program details",
    createdAt: new Date("2024-03-13T11:00:00"),
    assignedAt: new Date("2024-03-13T11:30:00"),
    followUps: [
      {
        id: 1,
        leadId: 3,
        counselorId: 1,
        scheduledAt: new Date("2024-03-20T10:00:00"),
        completedAt: null,
        remarks: "Call scheduled",
        outcome: null,
        createdAt: new Date("2024-03-13T12:00:00")
      }
    ]
  },
  {
    id: 4,
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    phone: "+1 (555) 456-7890",
    class: "Class 9",
    stream: "Science",
    status: "enrolled",
    source: "website",
    counselorId: 2,
    counselor: { id: 2, username: "michaelb", password: "", role: "counselor", name: "Michael Brown", email: "michael.brown@email.com" },
    lastContactedAt: new Date("2024-03-14T14:20:00"),
    parentName: "Carlos Garcia",
    parentPhone: "+1 (555) 654-3210",
    address: "321 Maple St, City",
    admissionLikelihood: "95.00",
    notes: "Ready to enroll in Nursing program, needs financial aid info",
    createdAt: new Date("2024-03-14T12:00:00"),
    assignedAt: new Date("2024-03-14T12:30:00"),
    followUps: []
  },
  {
    id: 5,
    name: "David Kim",
    email: "david.kim@email.com",
    phone: "+1 (555) 567-8901",
    class: "Class 10",
    stream: "Commerce",
    status: "dropped",
    source: "google_ads",
    counselorId: 1,
    counselor: { id: 1, username: "sarahj", password: "", role: "counselor", name: "Sarah Johnson", email: "sarah.johnson@email.com" },
    lastContactedAt: new Date("2024-03-15T11:00:00"),
    parentName: "Anna Kim",
    parentPhone: "+1 (555) 543-2109",
    address: "654 Cedar Ave, City",
    admissionLikelihood: "20.00",
    notes: "Interested in Engineering, requested campus tour",
    createdAt: new Date("2024-03-15T13:00:00"),
    assignedAt: new Date("2024-03-15T13:30:00"),
    followUps: []
  }
];
// --- MOCK DATA INJECTION END ---
