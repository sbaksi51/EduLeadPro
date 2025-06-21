import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Mail, Phone, Building, Briefcase, Calendar, IndianRupee, ShieldCheck, Trash2, Edit, Save
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Staff {
  id: number;
  name: string;
  employeeId: string;
  role: string;
  department: string;
  salary: number;
  dateOfJoining: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

interface StaffDetailModalProps {
  staff: Staff | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffUpdated?: () => void;
}

export default function StaffDetailModal({ staff, open, onOpenChange, onStaffUpdated }: StaffDetailModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedStaff, setEditedStaff] = useState<Partial<Staff>>({});

  useEffect(() => {
    if (staff) {
      setEditedStaff({ ...staff, salary: staff.salary });
    } else {
      setEditedStaff({});
    }
    setIsEditing(false); // Reset editing state when modal opens or staff changes
  }, [staff, open]);

  const handleInputChange = (field: keyof Staff, value: string | number) => {
    setEditedStaff(prev => ({ ...prev, [field]: value }));
  };

  const updateStaffMutation = useMutation({
    mutationFn: async (updates: Partial<Staff>) => {
      if (!staff) throw new Error("No staff member selected");
      const response = await apiRequest("PUT", `/api/staff/${staff.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setIsEditing(false);
      toast({ title: "Success", description: "Staff details updated successfully." });
      if(onStaffUpdated) onStaffUpdated();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update staff.", variant: "destructive" });
    }
  });

  const handleSave = () => {
    // Convert salary back to number before mutation
    const payload = { ...editedStaff, salary: Number(editedStaff.salary) };
    updateStaffMutation.mutate(payload);
  };
  
  const deleteStaffMutation = useMutation({
    mutationFn: async () => {
      if (!staff) throw new Error("No staff member selected");
      const response = await apiRequest("DELETE", `/api/staff/${staff.id}`);
      return response.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
        toast({ title: "Success", description: "Staff member deleted." });
        onOpenChange(false);
        if(onStaffUpdated) onStaffUpdated();
    },
    onError: (error: any) => {
        toast({ title: "Error", description: error.message || "Failed to delete staff member.", variant: "destructive" });
    }
  });

  if (!staff) return null;

  const getStatusPill = (isActive: boolean) => (
    isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
        <ShieldCheck className="mr-1 h-3 w-3" /> Active
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
        <Trash2 className="mr-1 h-3 w-3" /> Inactive
      </Badge>
    )
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[75vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-gray-500" />
                <div>
                  <h2 className="text-xl font-bold">{staff.name}</h2>
                  <p className="text-sm text-gray-600">{staff.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusPill(staff.isActive !== false)}
              </div>
            </div>
            <DialogDescription className="pt-2">
              Comprehensive information about {staff.name}
            </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto p-6">
            <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="py-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Employee Information</h3>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                            <Edit className="mr-2 h-4 w-4" /> {isEditing ? "Cancel" : "Edit"}
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 size={16} className="mr-2" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the staff member.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteStaffMutation.mutate()}>
                                    Confirm
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                {isEditing ? (
                                    <Input value={editedStaff.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} />
                                ) : (
                                    <div className="flex items-center gap-2"><User size={16} className="text-gray-500" /><span>{staff.name}</span></div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                {isEditing ? (
                                    <Input value={editedStaff.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
                                ) : (
                                    <div className="flex items-center gap-2"><Phone size={16} className="text-gray-500" /><span>{staff.phone || 'N/A'}</span></div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                {isEditing ? (
                                    <Input value={editedStaff.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} />
                                ) : (
                                    <div className="flex items-center gap-2"><Mail size={16} className="text-gray-500" /><span>{staff.email || 'N/A'}</span></div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                                <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-500" /><span>{staff.dateOfJoining ? format(new Date(staff.dateOfJoining), "MMM dd, yyyy") : "N/A"}</span></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                {isEditing ? (
                                    <Select value={editedStaff.department} onValueChange={(val) => handleInputChange('department', val)}>
                                        <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HR">HR</SelectItem>
                                            <SelectItem value="IT">IT</SelectItem>
                                            <SelectItem value="Finance">Finance</SelectItem>
                                            <SelectItem value="Operations">Operations</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex items-center gap-2"><Building size={16} className="text-gray-500" /><span>{staff.department}</span></div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                {isEditing ? (
                                    <Input value={editedStaff.role || ''} onChange={(e) => handleInputChange('role', e.target.value)} />
                                ) : (
                                    <div className="flex items-center gap-2"><Briefcase size={16} className="text-gray-500" /><span>{staff.role}</span></div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                                {isEditing ? (
                                    <Input type="number" value={editedStaff.salary || ''} onChange={(e) => handleInputChange('salary', e.target.value)} />
                                ) : (
                                    <div className="flex items-center gap-2"><IndianRupee size={16} className="text-gray-500" /><span>₹ {Number(staff.salary).toLocaleString()}</span></div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                                <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-gray-500" /><span>{staff.employeeId}</span></div>
                            </div>
                        </div>
                    </div>

                     {isEditing && (
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSave} disabled={updateStaffMutation.isPending}>
                                <Save size={16} className="mr-2" />
                                {updateStaffMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="performance" className="py-6">
                    <p>Performance details will be shown here.</p>
                </TabsContent>
                <TabsContent value="activity" className="py-6">
                    <p>Activity logs will be shown here.</p>
                </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 