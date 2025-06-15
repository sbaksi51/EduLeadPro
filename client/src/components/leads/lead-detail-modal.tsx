import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  MessageSquare,
  FileText,
  Brain,
  Save,
  Edit,
  Plus,
  Clock,
  Target
} from "lucide-react";
import VoiceNotes from "@/components/counseling/voice-notes";
import { type LeadWithCounselor, type User as UserType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LeadDetailModalProps {
  lead: LeadWithCounselor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FollowUpForm {
  scheduledAt: string;
  remarks: string;
  outcome: string;
}

export default function LeadDetailModal({ lead, open, onOpenChange }: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState(() => {
    return window.location.hash.slice(1) || "details";
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(lead || {});
  const [followUpForm, setFollowUpForm] = useState<FollowUpForm>({
    scheduledAt: "",
    remarks: "",
    outcome: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: counselors } = useQuery<UserType[]>({
    queryKey: ["/api/counselors"],
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", `/api/leads/${lead?.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsEditing(false);
      toast({
        title: "Lead Updated",
        description: "Lead information has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update lead information",
        variant: "destructive"
      });
    }
  });

  const createFollowUpMutation = useMutation({
    mutationFn: async (followUpData: any) => {
      const response = await apiRequest("POST", "/api/follow-ups", {
        ...followUpData,
        leadId: lead?.id,
        counselorId: lead?.counselorId || 1
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setFollowUpForm({ scheduledAt: "", remarks: "", outcome: "" });
      toast({
        title: "Follow-up Scheduled",
        description: "Follow-up has been scheduled successfully",
      });
    }
  });

  const predictMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/leads/${lead?.id}/predict`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "AI Prediction Generated",
        description: `Admission likelihood: ${data.likelihood}% (Confidence: ${(data.confidence * 100).toFixed(0)}%)`,
      });
    },
    onError: () => {
      toast({
        title: "Prediction Failed",
        description: "Unable to generate AI prediction at this time",
        variant: "destructive"
      });
    }
  });

  const saveChanges = () => {
    updateLeadMutation.mutate(editForm);
  };

  const scheduleFollowUp = () => {
    if (!followUpForm.scheduledAt) {
      toast({
        title: "Missing Information",
        description: "Please select a follow-up date and time",
        variant: "destructive"
      });
      return;
    }

    createFollowUpMutation.mutate({
      scheduledAt: new Date(followUpForm.scheduledAt),
      remarks: followUpForm.remarks,
      outcome: followUpForm.outcome
    });
  };

  if (!lead) return null;

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

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User size={24} />
              <div>
                <h2 className="text-xl font-bold">{lead.name}</h2>
                <p className="text-sm text-gray-600">{lead.class} {lead.stream}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(lead.status)}>
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </Badge>
              {lead.admissionLikelihood && (
                <Badge variant="outline" className="text-blue-600">
                  {Number(lead.admissionLikelihood).toFixed(0)}% likely
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Comprehensive information about {lead.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="followups">Follow-ups</TabsTrigger>
            <TabsTrigger value="voice-notes">Voice Notes</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Lead Information</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit size={16} className="mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <span>{lead.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <Input
                      value={editForm.email || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <span>{lead.email || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <Input
                      value={editForm.address || ""}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span>{lead.address || "Not provided"}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class & Stream
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={editForm.class}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, class: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Class 9">Class 9</SelectItem>
                          <SelectItem value="Class 10">Class 10</SelectItem>
                          <SelectItem value="Class 11">Class 11</SelectItem>
                          <SelectItem value="Class 12">Class 12</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={editForm.stream || ""}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, stream: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="Commerce">Commerce</SelectItem>
                          <SelectItem value="Arts">Arts</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <span>{lead.class} {lead.stream}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  {isEditing ? (
                    <Select
                      value={editForm.status}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="enrolled">Enrolled</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Badge>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Counselor
                  </label>
                  {isEditing ? (
                    <Select
                      value={editForm.counselorId?.toString() || ""}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, counselorId: Number(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {counselors?.map((counselor) => (
                          <SelectItem key={counselor.id} value={counselor.id.toString()}>
                            {counselor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{lead.counselor?.name || "Unassigned"}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Source
                  </label>
                  <span className="capitalize">{lead.source.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {lead.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                {isEditing ? (
                  <Textarea
                    value={editForm.notes || ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{lead.notes}</p>
                )}
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={saveChanges} disabled={updateLeadMutation.isPending}>
                  <Save size={16} className="mr-2" />
                  {updateLeadMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="followups" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Follow-up History</h3>
              <Button
                onClick={() => predictMutation.mutate()}
                disabled={predictMutation.isPending}
                variant="outline"
                size="sm"
              >
                <Brain size={16} className="mr-2" />
                {predictMutation.isPending ? "Generating..." : "AI Prediction"}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule New Follow-up</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={followUpForm.scheduledAt}
                      onChange={(e) => setFollowUpForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Outcome
                    </label>
                    <Select
                      value={followUpForm.outcome}
                      onValueChange={(value) => setFollowUpForm(prev => ({ ...prev, outcome: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="visit">Campus Visit</SelectItem>
                        <SelectItem value="document">Document Collection</SelectItem>
                        <SelectItem value="meeting">In-person Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <Textarea
                    value={followUpForm.remarks}
                    onChange={(e) => setFollowUpForm(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Add any notes for this follow-up..."
                    rows={3}
                  />
                </div>
                <Button onClick={scheduleFollowUp} disabled={createFollowUpMutation.isPending}>
                  <Plus size={16} className="mr-2" />
                  {createFollowUpMutation.isPending ? "Scheduling..." : "Schedule Follow-up"}
                </Button>
              </CardContent>
            </Card>

            {lead.followUps && lead.followUps.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Previous Follow-ups</h4>
                {lead.followUps.map((followUp) => (
                  <div key={followUp.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <span className="font-medium">
                          {formatDate(followUp.scheduledAt)}
                        </span>
                      </div>
                      <Badge variant={followUp.completedAt ? "default" : "outline"}>
                        {followUp.completedAt ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                    {followUp.remarks && (
                      <p className="text-sm text-gray-600 mt-2">{followUp.remarks}</p>
                    )}
                    {followUp.outcome && (
                      <p className="text-sm text-blue-600 mt-1">
                        <span className="font-medium">Outcome:</span> {followUp.outcome}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="voice-notes">
            <VoiceNotes
              leadId={lead.id}
              leadName={lead.name}
              onSave={(notes, summary) => {
                updateLeadMutation.mutate({ notes: notes + "\n\nSummary: " + summary });
              }}
            />
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target size={18} className="mr-2" />
                    Admission Likelihood
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lead.admissionLikelihood ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {Number(lead.admissionLikelihood).toFixed(0)}%
                      </div>
                      <p className="text-sm text-gray-600">
                        Based on current engagement and profile
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">No prediction available</p>
                      <Button
                        onClick={() => predictMutation.mutate()}
                        disabled={predictMutation.isPending}
                      >
                        <Brain size={16} className="mr-2" />
                        Generate Prediction
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lead.status === "new" && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          Initial Contact Required
                        </p>
                        <p className="text-xs text-blue-700">
                          Schedule first call within 24 hours
                        </p>
                      </div>
                    )}
                    {lead.status === "interested" && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">
                          High Priority Lead
                        </p>
                        <p className="text-xs text-green-700">
                          Schedule campus visit and send enrollment details
                        </p>
                      </div>
                    )}
                    {!lead.lastContactedAt && (
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm font-medium text-orange-900">
                          No Contact History
                        </p>
                        <p className="text-xs text-orange-700">
                          Immediate follow-up recommended
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}