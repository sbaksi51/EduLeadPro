import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { 
  Bot, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Award,
  AlertTriangle,
  Target,
  BookOpen,
  Star,
  Plus,
  Download,
  Calculator,
  FileText,
  CheckCircle,
  BarChart3,
  PieChart,
  TrendingDown,
  Smile,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
  Cell
} from "recharts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertStaffSchema, type InsertStaff } from "@shared/schema";

interface Staff {
  id: number;
  name: string;
  employeeId: string;
  role: string;
  department: string;
  salary: number;
  joiningDate: string;
  phone?: string;
  email?: string;
}

interface Attendance {
  id: number;
  staffId: number;
  date: string;
  status: string;
  hoursWorked: number;
  remarks?: string;
}

interface StaffPerformanceAnalysis {
  staffId: number;
  performanceScore: number;
  attendancePattern: string;
  salaryRecommendation: number;
  trainingNeeds: string[];
  promotionEligibility: boolean;
  insights: string[];
}

interface Payroll {
  id: number;
  staffId: number;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
  generatedAt: string;
}

interface PayrollGeneration {
  staffId: number;
  month: number;
  year: number;
  workingDays: number;
  attendedDays: number;
  overtimeHours: number;
  allowances: {
    hra: number;
    transport: number;
    medical: number;
    performance: number;
  };
  deductions: {
    pf: number;
    esi: number;
    tax: number;
    other: number;
  };
}

interface DepartmentAnalytics {
  department: string;
  totalStaff: number;
  averageSalary: number;
  averagePerformance: number;
  averageAttendance: number;
  budgetUtilization: number;
  projectCompletion: number;
  employeeSatisfaction: number;
  monthlyTrends: {
    month: string;
    performance: number;
    attendance: number;
    salary: number;
  }[];
}

export default function StaffAI() {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [payrollGenerationOpen, setPayrollGenerationOpen] = useState(false);
  const [bulkPayrollOpen, setBulkPayrollOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(() => {
    return window.location.hash.slice(1) || "overview";
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [editablePayrollData, setEditablePayrollData] = useState<{
    [key: number]: { attendedDays: number | ''; basicSalary: number | ''; netSalary: number }
  }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: staff = [] } = useQuery({ queryKey: ["/api/staff"] });
  const { data: attendance = [] } = useQuery({ queryKey: ["/api/attendance"] });
  const { data: payroll = [] } = useQuery({ queryKey: ["/api/payroll"] });

  // New query for department analytics
  const { data: departmentAnalytics = [] } = useQuery<DepartmentAnalytics[]>({
    queryKey: ["/api/departments/analytics"],
    enabled: selectedTab === "departments"
  });

  // AI Analysis mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async (staffId: number) => {
      const staffMember = (staff as Staff[]).find(s => s.id === staffId);
      const staffAttendance = (attendance as Attendance[]).filter(a => a.staffId === staffId);
      
      if (!staffMember) throw new Error("Staff member not found");

      const response = await fetch("/api/ai/staff-performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId,
          attendance: staffAttendance.map(a => ({
            date: a.date,
            status: a.status,
            hoursWorked: a.hoursWorked
          })),
          salary: staffMember.salary,
          role: staffMember.role,
          joiningDate: staffMember.joiningDate
        }),
      });

      if (!response.ok) throw new Error("Failed to generate AI analysis");
      return response.json() as Promise<StaffPerformanceAnalysis>;
    },
    onSuccess: () => {
      toast({
        title: "AI Analysis Complete",
        description: "Staff performance analysis generated successfully",
      });
    },
  });

  // Payroll generation mutation
  const generatePayrollMutation = useMutation({
    mutationFn: async (payrollData: PayrollGeneration) => {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payrollData),
      });
      if (!response.ok) throw new Error("Failed to generate payroll");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      setPayrollGenerationOpen(false);
      toast({
        title: "Payroll Generated",
        description: "Payroll has been calculated and generated successfully",
      });
    },
  });

  // Bulk payroll generation mutation
  const generateBulkPayrollMutation = useMutation({
    mutationFn: async (bulkData: { month: number; year: number; staffIds: number[] }) => {
      const response = await fetch("/api/payroll/bulk-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bulkData),
      });
      if (!response.ok) throw new Error("Failed to generate bulk payroll");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      setBulkPayrollOpen(false);
      toast({
        title: "Bulk Payroll Generated",
        description: "Payroll has been generated for all selected staff members",
      });
    },
  });

  // Only initialize editable data when staff changes and editablePayrollData is empty
  useEffect(() => {
    if (
      staff && Array.isArray(staff) && staff.length > 0 &&
      Object.keys(editablePayrollData).length === 0
    ) {
      console.log('Initializing editablePayrollData');
      const initialData: { [key: number]: { attendedDays: number | ''; basicSalary: number | ''; netSalary: number } } = {};
      (staff as Staff[]).forEach((member: Staff) => {
        const details = calculatePayrollDetails(member);
        initialData[member.id] = {
          attendedDays: typeof details.attendedDays === 'number' ? details.attendedDays : '',
          basicSalary: typeof details.basicSalary === 'number' ? details.basicSalary : '',
          netSalary: typeof details.netSalary === 'number' ? details.netSalary : 0
        };
      });
      setEditablePayrollData(initialData);
    }
  }, [staff]);

  const getStaffAttendanceRate = (staffId: number) => {
    const staffAttendance = (attendance as Attendance[]).filter(a => a.staffId === staffId);
    const recentAttendance = staffAttendance.slice(-30);
    const presentDays = recentAttendance.filter(a => a.status === 'present').length;
    return recentAttendance.length > 0 ? (presentDays / recentAttendance.length) * 100 : 0;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-blue-100 text-blue-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return "bg-green-100 text-green-800";
    if (rate >= 85) return "bg-blue-100 text-blue-800";
    if (rate >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const calculatePayrollDetails = (staffMember: Staff) => {
    const staffAttendance = (attendance as Attendance[]).filter(
      a => a.staffId === staffMember.id && 
      new Date(a.date).getMonth() + 1 === selectedMonth &&
      new Date(a.date).getFullYear() === selectedYear
    );
    
    const workingDays = 26; // Standard working days per month
    const attendedDays = staffAttendance.filter(a => a.status === 'present').length;
    const overtimeHours = staffAttendance.reduce((sum, a) => sum + (a.hoursWorked > 8 ? a.hoursWorked - 8 : 0), 0);
    const attendanceRate = (attendedDays / workingDays) * 100;
    
    // Calculate basic salary proportional to attendance
    const basicSalary = (staffMember.salary * attendedDays) / workingDays;
    
    // Calculate allowances
    const allowances = {
      hra: basicSalary * 0.08, // 8% HRA
      transport: 2000, // Fixed transport allowance
      medical: 1500, // Fixed medical allowance
      performance: attendanceRate >= 95 ? basicSalary * 0.05 : 0 // 5% performance bonus for >95% attendance
    };
    
    const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
    
    // Calculate deductions
    const grossSalary = basicSalary + totalAllowances;
    const deductions = {
      pf: Math.min(basicSalary * 0.12, 1800), // 12% PF capped at 1800
      esi: grossSalary <= 21000 ? grossSalary * 0.0075 : 0, // 0.75% ESI if gross <= 21k
      tax: grossSalary > 25000 ? (grossSalary - 25000) * 0.05 : 0, // Simple TDS calculation
      other: 0
    };
    
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
    const netSalary = grossSalary - totalDeductions;
    
    return {
      workingDays,
      attendedDays,
      overtimeHours,
      attendanceRate,
      basicSalary,
      allowances,
      totalAllowances,
      deductions,
      totalDeductions,
      grossSalary,
      netSalary
    };
  };

  const getPayrollStatus = (staffId: number) => {
    const staffPayroll = (payroll as Payroll[]).find(
      p => p.staffId === staffId && p.month === selectedMonth && p.year === selectedYear
    );
    return staffPayroll?.status || 'pending';
  };

  // Add new function to calculate net salary
  const calculateNetSalary = (staffMember: Staff, attendedDays: number | '', basicSalary: number | '') => {
    const workingDays = 26; // Standard working days per month
    const nAttendedDays = Number(attendedDays) || 0;
    const nBasicSalary = Number(basicSalary) || 0;
    const attendanceRate = (nAttendedDays / workingDays) * 100;
    
    // Calculate allowances
    const allowances = {
      hra: nBasicSalary * 0.08, // 8% HRA
      transport: 2000, // Fixed transport allowance
      medical: 1500, // Fixed medical allowance
      performance: attendanceRate >= 95 ? nBasicSalary * 0.05 : 0 // 5% performance bonus for >95% attendance
    };
    
    const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
    
    // Calculate deductions
    const grossSalary = nBasicSalary + totalAllowances;
    const deductions = {
      pf: Math.min(nBasicSalary * 0.12, 1800), // 12% PF capped at 1800
      esi: grossSalary <= 21000 ? grossSalary * 0.0075 : 0, // 0.75% ESI if gross <= 21k
      tax: grossSalary > 25000 ? (grossSalary - 25000) * 0.05 : 0, // Simple TDS calculation
      other: 0
    };
    
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
    return grossSalary - totalDeductions;
  };

  const handlePayrollDataChange = (staffId: number, field: 'attendedDays' | 'basicSalary', value: string) => {
    const staffMember = (staff as Staff[]).find(s => s.id === staffId);
    if (!staffMember) return;

    const currentData = editablePayrollData[staffId];
    if (!currentData) return;

    // Convert string to number and handle empty input
    const numericValue = value === '' ? '' : Number(value);
    
    // Validate and constrain values
    let finalValue = numericValue;
    if (field === 'attendedDays') {
      finalValue = numericValue === '' ? '' : Math.max(0, Math.min(Number(numericValue), 26));
    } else if (field === 'basicSalary') {
      finalValue = numericValue === '' ? '' : Math.max(0, Number(numericValue));
    }

    const newData = {
      ...currentData,
      [field]: finalValue
    };

    // Calculate new net salary, always using numbers
    const netSalary = calculateNetSalary(
      staffMember,
      Number(newData.attendedDays) || 0,
      Number(newData.basicSalary) || 0
    );

    setEditablePayrollData(prev => ({
      ...prev,
      [staffId]: {
        ...newData,
        netSalary
      }
    }));
  };

  const handleGeneratePayroll = (staffMember: Staff) => {
    const editedData = editablePayrollData[staffMember.id];
    if (!editedData) return;
    const attendedDays = Number(editedData.attendedDays) || 0;
    const basicSalary = Number(editedData.basicSalary) || 0;

    const payrollData: PayrollGeneration = {
      staffId: staffMember.id,
      month: selectedMonth,
      year: selectedYear,
      workingDays: 26, // Standard working days
      attendedDays,
      overtimeHours: 0, // You might want to add this as an editable field too
      allowances: {
        hra: basicSalary * 0.08,
        transport: 2000,
        medical: 1500,
        performance: (attendedDays / 26) >= 0.95 ? basicSalary * 0.05 : 0
      },
      deductions: {
        pf: Math.min(basicSalary * 0.12, 1800),
        esi: basicSalary <= 21000 ? basicSalary * 0.0075 : 0,
        tax: basicSalary > 25000 ? (basicSalary - 25000) * 0.05 : 0,
        other: 0
      }
    };
    
    generatePayrollMutation.mutate(payrollData);
  };

  const handleBulkPayrollGeneration = () => {
    const staffIds = (staff as Staff[]).map(s => s.id);
    generateBulkPayrollMutation.mutate({
      month: selectedMonth,
      year: selectedYear,
      staffIds
    });
  };

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'IT': '#FF6B6B',
      'HR': '#4ECDC4',
      'Finance': '#45B7D1',
      'Operations': '#96CEB4',
      'Marketing': '#FFEEAD',
      'Sales': '#D4A5A5'
    };
    return colors[department] || '#8884d8';
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#F44336';
  };

  const getDepartmentStats = (department: string) => {
    const deptStaff = (staff as Staff[]).filter(s => s.department === department);
    const deptAttendance = (attendance as Attendance[]).filter(a => 
      deptStaff.some(s => s.id === a.staffId)
    );

    return {
      totalStaff: deptStaff.length,
      averageSalary: deptStaff.reduce((sum, s) => sum + s.salary, 0) / deptStaff.length,
      averageAttendance: getDepartmentAttendanceRate(deptStaff, deptAttendance),
      topPerformers: getTopPerformers(deptStaff),
    };
  };

  const getDepartmentAttendanceRate = (deptStaff: Staff[], deptAttendance: Attendance[]) => {
    const recentAttendance = deptAttendance.slice(-30);
    const presentDays = recentAttendance.filter(a => a.status === 'present').length;
    return recentAttendance.length > 0 ? (presentDays / recentAttendance.length) * 100 : 0;
  };

  const getTopPerformers = (deptStaff: Staff[]) => {
    return deptStaff
      .map(staff => ({
        ...staff,
        performanceScore: calculatePerformanceScore(staff.id)
      }))
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 3);
  };

  const calculatePerformanceScore = (staffId: number) => {
    const staffAttendance = (attendance as Attendance[]).filter(a => a.staffId === staffId);
    const attendanceScore = getStaffAttendanceRate(staffId);
    const overtimeScore = staffAttendance.reduce((sum, a) => sum + (a.hoursWorked > 8 ? 1 : 0), 0) * 5;
    return (attendanceScore * 0.7) + (overtimeScore * 0.3);
  };

  // Mock data for department analytics (for UI testing)
  const mockDepartmentAnalytics: DepartmentAnalytics[] = [
    {
      department: 'IT',
      totalStaff: 12,
      averageSalary: 65000,
      averagePerformance: 85,
      averageAttendance: 92,
      budgetUtilization: 78,
      projectCompletion: 90,
      employeeSatisfaction: 88,
      monthlyTrends: [
        { month: 'Jan', performance: 80, attendance: 90, salary: 64000 },
        { month: 'Feb', performance: 82, attendance: 91, salary: 64500 },
        { month: 'Mar', performance: 85, attendance: 92, salary: 65000 },
        { month: 'Apr', performance: 87, attendance: 93, salary: 65500 },
        { month: 'May', performance: 88, attendance: 94, salary: 66000 },
      ],
    },
    {
      department: 'HR',
      totalStaff: 7,
      averageSalary: 52000,
      averagePerformance: 78,
      averageAttendance: 89,
      budgetUtilization: 65,
      projectCompletion: 80,
      employeeSatisfaction: 75,
      monthlyTrends: [
        { month: 'Jan', performance: 75, attendance: 88, salary: 51000 },
        { month: 'Feb', performance: 77, attendance: 89, salary: 51500 },
        { month: 'Mar', performance: 78, attendance: 90, salary: 52000 },
        { month: 'Apr', performance: 79, attendance: 89, salary: 52500 },
        { month: 'May', performance: 80, attendance: 90, salary: 53000 },
      ],
    },
    {
      department: 'Finance',
      totalStaff: 9,
      averageSalary: 70000,
      averagePerformance: 90,
      averageAttendance: 95,
      budgetUtilization: 82,
      projectCompletion: 95,
      employeeSatisfaction: 92,
      monthlyTrends: [
        { month: 'Jan', performance: 88, attendance: 94, salary: 69000 },
        { month: 'Feb', performance: 89, attendance: 95, salary: 69500 },
        { month: 'Mar', performance: 91, attendance: 96, salary: 70000 },
        { month: 'Apr', performance: 92, attendance: 97, salary: 70500 },
        { month: 'May', performance: 93, attendance: 98, salary: 71000 },
      ],
    },
  ];

  // Mock data for staff directory (for UI testing)
  const mockStaff: Staff[] = [
    { id: 1, name: 'Anjali Mehra', employeeId: 'EMP001', role: 'Teacher', department: 'IT', salary: 60000, joiningDate: '2022-04-10', phone: '9876543210', email: 'anjali.mehra@example.com' },
    { id: 2, name: 'Vikram Patel', employeeId: 'EMP002', role: 'Accountant', department: 'Finance', salary: 55000, joiningDate: '2021-07-15', phone: '9876543211', email: 'vikram.patel@example.com' },
    { id: 3, name: 'Sneha Rao', employeeId: 'EMP003', role: 'HR Manager', department: 'HR', salary: 50000, joiningDate: '2023-01-20', phone: '9876543212', email: 'sneha.rao@example.com' },
  ];

  // Use API data if available, otherwise fallback to mock data
  const displayStaff: Staff[] = (staff as Staff[]).length > 0 ? (staff as Staff[]) : mockStaff;

  // Use API data if available, otherwise fallback to mock data
  const displayDepartmentAnalytics = departmentAnalytics.length > 0 ? departmentAnalytics : mockDepartmentAnalytics;

  // Add Staff Modal logic
  const addStaffForm = useForm<InsertStaff>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      role: "Teacher",
      department: "",
      dateOfJoining: "",
      salary: "",
      address: "",
      emergencyContact: "",
      qualifications: "",
      bankAccountNumber: "",
      ifscCode: "",
      panNumber: "",
    },
  });
  const addStaffMutation = useMutation({
    mutationFn: async (data: InsertStaff) => {
      const response = await apiRequest("POST", "/api/staff", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Staff added successfully" });
      addStaffForm.reset();
      setIsAddStaffOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error adding staff", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });
  const onAddStaffSubmit = (data: InsertStaff) => addStaffMutation.mutate(data);

  // Add state for WhatsApp modal
  const [whatsappModal, setWhatsappModal] = useState<{ open: boolean; staff?: Staff; netSalary?: number }>({ open: false });

  // WhatsApp message generator
  const getSalaryCreditedMessage = (staff: any, netSalary: number) => {
    const instituteName = localStorage.getItem("customInstituteName") || "EduLead Pro";
    return `Dear ${staff.name},\n\nYour salary of ₹${netSalary} has been credited to your account.\n\nThank you for your dedication and hard work.\n\nBest regards,\n${instituteName} Team`;
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    window.location.hash = value;
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Staff Management with AI Insights" 
        subtitle="AI-powered staff performance analysis and management recommendations"
      />

      {/* Quick Stats - removed */}
      {/* Payroll Management with Total Staff */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payroll Management</CardTitle>
            <CardDescription>
              Generate payroll for individual staff or bulk processing
            </CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 mb-1">Total Staff</span>
            <span className="inline-block rounded bg-blue-100 text-blue-800 px-3 py-1 text-lg font-bold">{displayStaff.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4 py-2">
            <div className="flex items-center space-x-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="ml-2 border rounded px-2 py-1"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="ml-2 border rounded px-2 py-1"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={handleBulkPayrollGeneration}
              disabled={generateBulkPayrollMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Calculator className="mr-2 h-4 w-4" />
              {generateBulkPayrollMutation.isPending ? "Generating..." : "Generate All Payroll"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Staff Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Status</TabsTrigger>
        </TabsList>

        {/* Staff Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Staff Directory</CardTitle>
                <CardDescription>Complete staff overview</CardDescription>
              </div>
              <Button onClick={() => setIsAddStaffOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Staff
              </Button>
            </CardHeader>
            <CardContent>
              {/* Filter options */}
              <div className="mb-4 flex gap-4 items-center">
                <Label>Role:</Label>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border rounded px-2 py-1">
                  <option value="all">All</option>
                  {Array.from(new Set(displayStaff.map(s => s.role))).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Joining Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayStaff.filter(s => roleFilter === 'all' || s.role === roleFilter).map((member) => {
                    const attendanceRate = getStaffAttendanceRate(member.id);
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{member.role}</TableCell>
                        <TableCell>
                          <Badge className={getAttendanceColor(attendanceRate)}>
                            {attendanceRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>₹{member.salary.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(member.joiningDate), "MMM dd, yyyy")}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Add Staff Modal */}
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Staff</DialogTitle>
              </DialogHeader>
              <Form {...addStaffForm}>
                <form onSubmit={addStaffForm.handleSubmit(onAddStaffSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={addStaffForm.control} name="employeeId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID *</FormLabel>
                        <FormControl><Input placeholder="EMP001" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addStaffForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl><Input placeholder="Full Name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={addStaffForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="Email" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addStaffForm.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl><Input placeholder="Phone Number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={addStaffForm.control} name="role" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Teacher">Teacher</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Counselor">Counselor</SelectItem>
                              <SelectItem value="Accountant">Accountant</SelectItem>
                              <SelectItem value="HR">HR</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addStaffForm.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl><Input placeholder="Department" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={addStaffForm.control} name="dateOfJoining" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Joining *</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addStaffForm.control} name="salary" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary *</FormLabel>
                        <FormControl><Input type="number" placeholder="Salary" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={addStaffForm.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="Address" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={addStaffForm.control} name="emergencyContact" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl><Input placeholder="Emergency Contact" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addStaffForm.control} name="qualifications" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualifications</FormLabel>
                        <FormControl><Input placeholder="Qualifications" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField control={addStaffForm.control} name="bankAccountNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Account Number</FormLabel>
                        <FormControl><Input placeholder="Bank Account Number" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addStaffForm.control} name="ifscCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl><Input placeholder="IFSC Code" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addStaffForm.control} name="panNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Number</FormLabel>
                        <FormControl><Input placeholder="PAN Number" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddStaffOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addStaffMutation.isPending}>
                      {addStaffMutation.isPending ? "Adding..." : "Add Staff"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Status</CardTitle>
              <CardDescription>Send salary notifications to employees</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Working Days</TableHead>
                    <TableHead>Attended Days</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayStaff.map((member) => {
                    const payrollDetails = calculatePayrollDetails(member);
                    const payrollStatus = getPayrollStatus(member.id);
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{26}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={26}
                            value={
                              editablePayrollData[member.id] && editablePayrollData[member.id].attendedDays !== undefined
                                ? String(editablePayrollData[member.id].attendedDays)
                                : ''
                            }
                            onChange={(e) => handlePayrollDataChange(member.id, 'attendedDays', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={
                              editablePayrollData[member.id] && editablePayrollData[member.id].basicSalary !== undefined
                                ? String(editablePayrollData[member.id].basicSalary)
                                : ''
                            }
                            onChange={(e) => handlePayrollDataChange(member.id, 'basicSalary', e.target.value)}
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          ₹{(editablePayrollData[member.id]?.netSalary ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              payrollStatus === 'processed' ? 'bg-green-100 text-green-800' :
                              payrollStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {payrollStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGeneratePayroll(member)}
                              disabled={generatePayrollMutation.isPending}
                            >
                              {generatePayrollMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                'Generate Payroll'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setWhatsappModal({ open: true, staff: member, netSalary: editablePayrollData[member.id]?.netSalary ?? 0 })}
                            >
                              Send Notification
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* WhatsApp Modal */}
          <Dialog open={whatsappModal.open} onOpenChange={open => setWhatsappModal({ ...whatsappModal, open })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send WhatsApp Notification</DialogTitle>
              </DialogHeader>
              {whatsappModal.staff && (
                <div className="space-y-4">
                  <div>
                    <div className="font-medium">To: {whatsappModal.staff.name}</div>
                    <div className="text-sm text-muted-foreground">{whatsappModal.staff.phone || 'No phone number'}</div>
                  </div>
                  <textarea
                    value={getSalaryCreditedMessage(whatsappModal.staff, whatsappModal.netSalary || 0)}
                    readOnly
                    className="w-full h-24 border rounded px-2 py-1 resize-none bg-muted"
                  />
                  <DialogFooter>
                    <Button
                      asChild
                      disabled={!whatsappModal.staff.phone}
                    >
                      <a
                        href={`https://wa.me/${whatsappModal.staff.phone}?text=${encodeURIComponent(getSalaryCreditedMessage(whatsappModal.staff, whatsappModal.netSalary || 0))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Send via WhatsApp
                      </a>
                    </Button>
                    <Button variant="secondary" onClick={() => setWhatsappModal({ open: false })}>Cancel</Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}