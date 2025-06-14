import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Smile
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
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
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

  const handleGeneratePayroll = (staffMember: Staff) => {
    const payrollDetails = calculatePayrollDetails(staffMember);
    
    const payrollData: PayrollGeneration = {
      staffId: staffMember.id,
      month: selectedMonth,
      year: selectedYear,
      workingDays: payrollDetails.workingDays,
      attendedDays: payrollDetails.attendedDays,
      overtimeHours: payrollDetails.overtimeHours,
      allowances: payrollDetails.allowances,
      deductions: payrollDetails.deductions
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
  const displayStaff = staff.length > 0 ? staff : mockStaff;

  // Use API data if available, otherwise fallback to mock data
  const displayDepartmentAnalytics = departmentAnalytics.length > 0 ? departmentAnalytics : mockDepartmentAnalytics;

  return (
    <div className="space-y-6">
      <Header 
        title="Staff Management with AI Insights" 
        subtitle="AI-powered staff performance analysis and management recommendations"
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStaff.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayStaff.length > 0 
                ? (displayStaff.reduce((sum, s) => sum + getStaffAttendanceRate(s.id), 0) / displayStaff.length).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Performers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayStaff.filter(s => getStaffAttendanceRate(s.id) >= 90).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayStaff.filter(s => getStaffAttendanceRate(s.id) < 70).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Management</CardTitle>
          <CardDescription>
            Generate payroll for individual staff or bulk processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
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

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Staff Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Generation</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="departments">Department Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Directory with AI Analysis</CardTitle>
              <CardDescription>
                Complete staff overview with AI-powered performance insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Payroll Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayStaff.map((member) => {
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
                        <TableCell className="capitalize">{member.department}</TableCell>
                        <TableCell>
                          <Badge className={getAttendanceColor(attendanceRate)}>
                            {attendanceRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>₹{member.salary.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(member.joiningDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedStaff(member);
                              setAiAnalysisOpen(true);
                              aiAnalysisMutation.mutate(member.id);
                            }}
                          >
                            <Bot className="mr-1 h-3 w-3" />
                            AI Analysis
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayStaff.map((member) => {
              const attendanceRate = getStaffAttendanceRate(member.id);
              const performanceScore = Math.min(100, attendanceRate + 10); // Simple calculation
              
              return (
                <Card key={member.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                      <Badge className={getPerformanceColor(performanceScore)}>
                        {performanceScore.toFixed(0)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Attendance:</span>
                        <span className="font-medium">{attendanceRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <span className="font-medium capitalize">{member.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Salary:</span>
                        <span className="font-medium">₹{member.salary.toLocaleString()}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedStaff(member);
                          setAiAnalysisOpen(true);
                          aiAnalysisMutation.mutate(member.id);
                        }}
                      >
                        <Bot className="mr-1 h-3 w-3" />
                        Get AI Insights
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI-Powered Staff Insights
              </CardTitle>
              <CardDescription>
                Get intelligent recommendations for staff performance improvement and management decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Select a staff member and click "AI Analysis" to get personalized performance insights and recommendations.
                </p>
                <p className="text-sm text-muted-foreground">
                  AI analysis includes attendance patterns, performance scoring, salary recommendations, and training needs assessment.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Generation</CardTitle>
              <CardDescription>
                Generate payroll for individual staff members or process bulk payroll
              </CardDescription>
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
                        <TableCell>{payrollDetails.workingDays}</TableCell>
                        <TableCell>{payrollDetails.attendedDays}</TableCell>
                        <TableCell>₹{payrollDetails.basicSalary.toLocaleString()}</TableCell>
                        <TableCell>₹{payrollDetails.netSalary.toLocaleString()}</TableCell>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGeneratePayroll(member)}
                            disabled={generatePayrollMutation.isPending}
                          >
                            <Calculator className="mr-1 h-3 w-3" />
                            {generatePayrollMutation.isPending ? 'Generating...' : 'Generate Payroll'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayDepartmentAnalytics.map((dept: DepartmentAnalytics) => (
              <Card key={dept.department} className="border-l-4" style={{ borderLeftColor: getDepartmentColor(dept.department) }}>
                <CardHeader>
                  <CardTitle>{dept.department}</CardTitle>
                  <CardDescription>Department Analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Basic Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Staff</p>
                        <p className="text-2xl font-bold">{dept.totalStaff}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Salary</p>
                        <p className="text-2xl font-bold">₹{dept.averageSalary.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Progress Metrics */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Budget Utilization</Label>
                          <span className="text-sm font-medium">{dept.budgetUtilization}%</span>
                        </div>
                        <Progress value={dept.budgetUtilization} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Project Completion</Label>
                          <span className="text-sm font-medium">{dept.projectCompletion}%</span>
                        </div>
                        <Progress value={dept.projectCompletion} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Employee Satisfaction</Label>
                          <span className="text-sm font-medium">{dept.employeeSatisfaction}%</span>
                        </div>
                        <Progress 
                          value={dept.employeeSatisfaction} 
                          className="h-2"
                          style={{ backgroundColor: getSatisfactionColor(dept.employeeSatisfaction) }}
                        />
                      </div>
                    </div>

                    {/* Monthly Trends Chart */}
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dept.monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="performance" 
                            stroke="#8884d8" 
                            name="Performance"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="attendance" 
                            stroke="#82ca9d" 
                            name="Attendance"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="salary" 
                            stroke="#ffc658" 
                            name="Salary"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Department Health Indicators */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Smile className="h-4 w-4" style={{ color: getSatisfactionColor(dept.employeeSatisfaction) }} />
                        <span className="text-sm">Satisfaction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" style={{ color: dept.averagePerformance >= 80 ? '#4CAF50' : '#FFC107' }} />
                        <span className="text-sm">Performance</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Analysis Dialog */}
      <Dialog open={aiAnalysisOpen} onOpenChange={setAiAnalysisOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Performance Analysis for {selectedStaff?.name}
            </DialogTitle>
            <DialogDescription>
              Comprehensive AI-powered staff performance analysis and recommendations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {aiAnalysisMutation.isPending ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Analyzing staff performance with AI...</p>
              </div>
            ) : aiAnalysisMutation.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Performance Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {aiAnalysisMutation.data.performanceScore}%
                      </div>
                      <Badge className={getPerformanceColor(aiAnalysisMutation.data.performanceScore)}>
                        {aiAnalysisMutation.data.performanceScore >= 85 ? "Excellent" : 
                         aiAnalysisMutation.data.performanceScore >= 70 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Salary Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        ₹{aiAnalysisMutation.data.salaryRecommendation.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {aiAnalysisMutation.data.salaryRecommendation > (selectedStaff?.salary || 0) 
                          ? `+₹${(aiAnalysisMutation.data.salaryRecommendation - (selectedStaff?.salary || 0)).toLocaleString()} increase`
                          : "Current salary maintained"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Promotion Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={aiAnalysisMutation.data.promotionEligibility ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {aiAnalysisMutation.data.promotionEligibility ? "Eligible" : "Not Eligible"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Attendance Pattern Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{aiAnalysisMutation.data.attendancePattern}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Training Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysisMutation.data.trainingNeeds.map((need, index) => (
                        <Badge key={index} variant="outline">
                          {need}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiAnalysisMutation.data.insights.map((insight: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}