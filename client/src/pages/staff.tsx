import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, UserCheck, Clock, IndianRupee, Calendar, Filter, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { format } from "date-fns";

interface Staff {
  id: number;
  employeeId: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  department?: string;
  dateOfJoining: string;
  salary?: string;
  isActive: boolean;
  address?: string;
  emergencyContact?: string;
  qualifications?: string;
}

interface Attendance {
  id: number;
  staffId: number;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  hoursWorked?: string;
  status: string;
  notes?: string;
}

interface Payroll {
  id: number;
  staffId: number;
  month: number;
  year: number;
  basicSalary: string;
  allowances: string;
  deductions: string;
  overtime: string;
  netSalary: string;
  status: string;
}

export default function Staff() {
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().getMonth() + 1);
  const [attendanceYear, setAttendanceYear] = useState(new Date().getFullYear());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch staff data
  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ["/api/staff"],
  });

  // Fetch attendance data
  const { data: attendance = [] } = useQuery({
    queryKey: ["/api/attendance", attendanceMonth, attendanceYear],
  });

  // Fetch payroll data
  const { data: payroll = [] } = useQuery({
    queryKey: ["/api/payroll", attendanceMonth, attendanceYear],
  });

  // Add staff mutation
  const addStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/staff", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setAddStaffOpen(false);
      toast({
        title: "Success",
        description: "Staff member added successfully",
      });
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (staffId: number) => {
      return await apiRequest("/api/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({ staffId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Check-in recorded successfully",
      });
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async (staffId: number) => {
      return await apiRequest("/api/attendance/check-out", {
        method: "POST",
        body: JSON.stringify({ staffId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Check-out recorded successfully",
      });
    },
  });

  const handleAddStaff = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      employeeId: formData.get("employeeId"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      department: formData.get("department"),
      dateOfJoining: formData.get("dateOfJoining"),
      salary: formData.get("salary"),
      address: formData.get("address"),
      emergencyContact: formData.get("emergencyContact"),
      qualifications: formData.get("qualifications"),
    };
    addStaffMutation.mutate(data);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      "Teacher": "bg-blue-100 text-blue-800",
      "Admin": "bg-purple-100 text-purple-800",
      "Counselor": "bg-green-100 text-green-800",
      "Support": "bg-orange-100 text-orange-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "present": "bg-green-100 text-green-800",
      "absent": "bg-red-100 text-red-800",
      "half-day": "bg-yellow-100 text-yellow-800",
      "late": "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredStaff = staff.filter((member: Staff) => 
    filterRole === "all" || member.role === filterRole
  );

  const getTodayAttendance = (staffId: number) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return attendance.find((att: Attendance) => 
      att.staffId === staffId && att.date === today
    );
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Staff Management" 
        subtitle="Manage staff profiles, attendance, and roles"
      />

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Teacher">Teacher</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Counselor">Counselor</SelectItem>
              <SelectItem value="Support">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Enter the details of the new staff member
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input id="employeeId" name="employeeId" required />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" required />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Counselor">Counselor</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" />
                </div>
                <div>
                  <Label htmlFor="dateOfJoining">Date of Joining</Label>
                  <Input id="dateOfJoining" name="dateOfJoining" type="date" required />
                </div>
                <div>
                  <Label htmlFor="salary">Monthly Salary</Label>
                  <Input id="salary" name="salary" type="number" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input id="emergencyContact" name="emergencyContact" />
                </div>
                <div>
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Input id="qualifications" name="qualifications" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddStaffOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addStaffMutation.isPending}>
                  {addStaffMutation.isPending ? "Adding..." : "Add Staff Member"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStaff.map((member: Staff) => {
              const todayAttendance = getTodayAttendance(member.id);
              const isCheckedIn = todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;
              
              return (
                <Card key={member.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {member.employeeId} • {member.department}
                        </CardDescription>
                      </div>
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>{member.phone}</div>
                      {member.email && <div className="text-muted-foreground">{member.email}</div>}
                      <div className="text-muted-foreground">
                        Joined: {format(new Date(member.dateOfJoining), "MMM dd, yyyy")}
                      </div>
                      {todayAttendance && (
                        <Badge className={getStatusColor(todayAttendance.status)}>
                          {todayAttendance.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      {isCheckedIn ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => checkOutMutation.mutate(member.id)}
                          disabled={checkOutMutation.isPending}
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          Check Out
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => checkInMutation.mutate(member.id)}
                          disabled={checkInMutation.isPending}
                        >
                          <UserCheck className="mr-1 h-3 w-3" />
                          Check In
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Select value={attendanceMonth.toString()} onValueChange={(value) => setAttendanceMonth(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {format(new Date(2024, i), "MMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={attendanceYear.toString()} onValueChange={(value) => setAttendanceYear(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record: Attendance) => {
                  const staffMember = staff.find((s: Staff) => s.id === record.staffId);
                  return (
                    <TableRow key={record.id}>
                      <TableCell>{staffMember?.name}</TableCell>
                      <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        {record.checkInTime ? format(new Date(record.checkInTime), "HH:mm") : "-"}
                      </TableCell>
                      <TableCell>
                        {record.checkOutTime ? format(new Date(record.checkOutTime), "HH:mm") : "-"}
                      </TableCell>
                      <TableCell>{record.hoursWorked || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Select value={attendanceMonth.toString()} onValueChange={(value) => setAttendanceMonth(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {format(new Date(2024, i), "MMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={attendanceYear.toString()} onValueChange={(value) => setAttendanceYear(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Payroll
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((record: Payroll) => {
                  const staffMember = staff.find((s: Staff) => s.id === record.staffId);
                  return (
                    <TableRow key={record.id}>
                      <TableCell>{staffMember?.name}</TableCell>
                      <TableCell>₹{parseFloat(record.basicSalary).toLocaleString()}</TableCell>
                      <TableCell>₹{parseFloat(record.allowances).toLocaleString()}</TableCell>
                      <TableCell>₹{parseFloat(record.deductions).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">₹{parseFloat(record.netSalary).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === "paid" ? "default" : "secondary"}>
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}