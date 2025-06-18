import { useState, useEffect, useMemo } from "react";
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
  Loader2,
  MessageSquare,
  Clock
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
import { useHashState } from "@/hooks/use-hash-state";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

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
  isActive?: boolean;
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
  attendedDays?: number;
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
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  employeeName: string;
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
  const [selectedTab, setSelectedTab] = useHashState("overview");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [editablePayrollData, setEditablePayrollData] = useState<{
    [key: number]: { attendedDays: number | ''; basicSalary: number | ''; netSalary: number }
  }>(() => {
    // Load from localStorage on component mount with month/year key
    const key = `editablePayrollData_${selectedMonth}_${selectedYear}`;
    const saved = localStorage.getItem(key);
    console.log('Loading editablePayrollData from localStorage with key:', key, 'data:', saved);
    return saved ? JSON.parse(saved) : {};
  });
  const [manualPayrollInputs, setManualPayrollInputs] = useState<{
    [key: number]: {
      daysWorked: string | number;
      basicSalary: number | '';
      isManual: boolean;
    }
  }>(() => {
    // Load from localStorage on component mount with month/year key
    const key = `manualPayrollInputs_${selectedMonth}_${selectedYear}`;
    const saved = localStorage.getItem(key);
    console.log('Loading manualPayrollInputs from localStorage with key:', key, 'data:', saved);
    return saved ? JSON.parse(saved) : {};
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);
  // const [whatsappModal, setWhatsappModal] = useState<{
  //   open: boolean;
  //   staff: Staff | null;
  //   netSalary: number;
  // }>({ open: false, staff: null, netSalary: 0 });

  // Track previous month/year to detect actual changes
  const [prevMonth, setPrevMonth] = useState(selectedMonth);
  const [prevYear, setPrevYear] = useState(selectedYear);

  // Get user role for permissions
  const userRole = localStorage.getItem('userRole') || 'counselor';
  const isAdmin = userRole === 'admin';
  const canManageStaff = isAdmin || userRole === 'hr';
  const canViewAnalytics = isAdmin || userRole === 'hr' || userRole === 'marketing_head';

  // Fetch data
  const { data: staff = [] } = useQuery({ queryKey: ["/api/staff"] });
  const { data: attendance = [] } = useQuery({ queryKey: ["/api/attendance"] });
  const { data: payroll = [] } = useQuery({ queryKey: ["/api/payroll"] });

  // Save payroll state to localStorage whenever it changes
  useEffect(() => {
    const key = `editablePayrollData_${selectedMonth}_${selectedYear}`;
    console.log('Saving editablePayrollData to localStorage with key:', key, 'data:', editablePayrollData);
    localStorage.setItem(key, JSON.stringify(editablePayrollData));
  }, [editablePayrollData, selectedMonth, selectedYear]);

  useEffect(() => {
    const key = `manualPayrollInputs_${selectedMonth}_${selectedYear}`;
    console.log('Saving manualPayrollInputs to localStorage with key:', key, 'data:', manualPayrollInputs);
    localStorage.setItem(key, JSON.stringify(manualPayrollInputs));
  }, [manualPayrollInputs, selectedMonth, selectedYear]);

  // Clear localStorage only when month/year actually changes (not on initial mount)
  useEffect(() => {
    if ((prevMonth !== selectedMonth || prevYear !== selectedYear) && 
        (prevMonth !== 0 && prevYear !== 0)) { // Skip initial mount
      console.log('Month/Year changed, clearing localStorage');
      const oldKey1 = `editablePayrollData_${prevMonth}_${prevYear}`;
      const oldKey2 = `manualPayrollInputs_${prevMonth}_${prevYear}`;
      localStorage.removeItem(oldKey1);
      localStorage.removeItem(oldKey2);
      setEditablePayrollData({});
      setManualPayrollInputs({});
    }
    setPrevMonth(selectedMonth);
    setPrevYear(selectedYear);
  }, [selectedMonth, selectedYear, prevMonth, prevYear]);

  // Load existing payroll data from database when month/year changes
  useEffect(() => {
    if (payroll && Array.isArray(payroll) && staff && Array.isArray(staff)) {
      const existingPayrollData: { [key: number]: { attendedDays: number | ''; basicSalary: number | ''; netSalary: number } } = {};
      const existingManualInputs: { [key: number]: { daysWorked: string | number; basicSalary: number | ''; isManual: boolean } } = {};
      
      (staff as Staff[]).forEach((member: Staff) => {
        const existingPayroll = (payroll as Payroll[]).find(
          p => p.staffId === member.id && p.month === selectedMonth && p.year === selectedYear
        );
        
        if (existingPayroll) {
          existingPayrollData[member.id] = {
            attendedDays: existingPayroll.attendedDays || 30,
            basicSalary: existingPayroll.basicSalary,
            netSalary: existingPayroll.netSalary
          };
        }
      });
      
      if (Object.keys(existingPayrollData).length > 0) {
        setEditablePayrollData(existingPayrollData);
        const key = `editablePayrollData_${selectedMonth}_${selectedYear}`;
        localStorage.setItem(key, JSON.stringify(existingPayrollData));
      }
    }
  }, [payroll, staff, selectedMonth, selectedYear]);

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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      // Clear localStorage after successful generation
      const key1 = `editablePayrollData_${selectedMonth}_${selectedYear}`;
      const key2 = `manualPayrollInputs_${selectedMonth}_${selectedYear}`;
      localStorage.removeItem(key1);
      localStorage.removeItem(key2);
      setEditablePayrollData({});
      setManualPayrollInputs({});
      toast({
        title: "Payroll Generated Successfully",
        description: `Payroll for ${selectedMonth}/${selectedYear} has been generated and saved.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Generating Payroll",
        description: error.message || "Failed to generate payroll. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Bulk payroll generation mutation
  const generateBulkPayrollMutation = useMutation({
    mutationFn: async (bulkData: { month: number; year: number; staffIds: number[]; payrollData?: PayrollGeneration[] }) => {
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
      // Clear localStorage after successful generation
      const key1 = `editablePayrollData_${selectedMonth}_${selectedYear}`;
      const key2 = `manualPayrollInputs_${selectedMonth}_${selectedYear}`;
      localStorage.removeItem(key1);
      localStorage.removeItem(key2);
      setEditablePayrollData({});
      setManualPayrollInputs({});
      toast({
        title: "Bulk Payroll Generated",
        description: "Payroll has been generated for all selected staff members",
      });
    },
  });

  // PDF generation mutation
  const generateSalarySlipMutation = useMutation({
    mutationFn: async (payrollData: PayrollGeneration & { employeeName: string }) => {
      try {
        // Add timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`/api/payroll/generate-slip/${payrollData.staffId}/${payrollData.month}/${payrollData.year}`, {
          method: "GET",
          headers: {
            "Accept": "application/pdf",
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('PDF generation failed:', response.status, errorText);
          throw new Error(errorText || `Failed to generate salary slip (${response.status})`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
          console.error('Invalid content type received:', contentType);
          throw new Error('Received invalid content type from server');
        }
        
        const blob = await response.blob();
        
        // Verify blob size and type
        if (blob.size === 0) {
          throw new Error('Received empty PDF file');
        }
        
        if (blob.type !== 'application/pdf') {
          console.error('Blob type mismatch:', blob.type);
          throw new Error('Received invalid file format from server');
        }
        
        return blob;
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('PDF generation timed out. Please try again.');
          }
          throw error;
        }
        throw new Error('An unexpected error occurred while generating PDF');
      }
    },
    onSuccess: (blob, variables) => {
      try {
        // Verify that we received a PDF blob
        if (blob.type !== 'application/pdf') {
          toast({
            title: "Error",
            description: "Received invalid file format from server",
            variant: "destructive"
          });
          return;
        }

        // Create download link for PDF with employee name
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.style.display = 'none';
        
        // Clean employee name for filename (remove special characters)
        const cleanName = variables.employeeName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        a.download = `Salary_Slip_${cleanName}_${variables.month}_${variables.year}.pdf`;
        
        // Append to body, click, and cleanup
        document.body.appendChild(a);
        a.click();
        
        // Cleanup with a small delay to ensure download starts
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
        
        toast({
          title: "Salary Slip Generated",
          description: "PDF salary slip has been downloaded successfully.",
        });
      } catch (error) {
        console.error('Error handling PDF download:', error);
        toast({
          title: "Download Error",
          description: "Failed to download PDF. Please try again.",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      console.error('PDF generation error:', error);
      toast({
        title: "Error Generating Salary Slip",
        description: error.message || "Failed to generate salary slip. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Only initialize editable data when staff changes and editablePayrollData is empty
  useEffect(() => {
    if (
      staff && Array.isArray(staff) && staff.length > 0 &&
      Object.keys(editablePayrollData).length === 0
    ) {
      // Check if there's existing payroll data for this month/year
      const hasExistingPayroll = payroll && Array.isArray(payroll) && 
        (payroll as Payroll[]).some(p => p.month === selectedMonth && p.year === selectedYear);
      
      // Only initialize if no existing payroll data
      if (!hasExistingPayroll) {
        console.log('Initializing editablePayrollData');
        const initialData: { [key: number]: { attendedDays: number | ''; basicSalary: number | ''; netSalary: number } } = {};
        (staff as Staff[]).forEach((member: Staff) => {
          const details = calculatePayrollDetails(member);
          initialData[member.id] = {
            attendedDays: typeof details.attendedDays === 'number' ? details.attendedDays : 30, // Default to 30 days
            basicSalary: typeof details.basicSalary === 'number' ? details.basicSalary : member.salary, // Default to full salary
            netSalary: typeof details.netSalary === 'number' ? details.netSalary : member.salary // Default to full salary
          };
        });
        setEditablePayrollData(initialData);
      }
    }
  }, [staff, payroll, selectedMonth, selectedYear]);

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
    const manualInput = manualPayrollInputs[staffMember.id];
    
    // Use manual inputs if available and enabled, otherwise use attendance data
    let workingDays = 30; // Total working days per month
    let attendedDays: number;
    let basicSalary: number;
    let absentDays: number = 0;
    let presentDays: number = 0;
    
    if (manualInput && manualInput.isManual && manualInput.daysWorked !== '') {
      // Use manual days worked with the formula: (Original Salary / 30) × Days Worked
      attendedDays = Number(manualInput.daysWorked);
      presentDays = attendedDays;
      absentDays = workingDays - attendedDays;
      const dailyRate = staffMember.salary / 30;
      basicSalary = dailyRate * attendedDays;
    } else {
      // Use attendance-based calculation
      const staffAttendance = (attendance as Attendance[]).filter(
        a => a.staffId === staffMember.id && 
        a.date && !isNaN(new Date(a.date).getTime()) &&
        new Date(a.date).getMonth() + 1 === selectedMonth &&
        new Date(a.date).getFullYear() === selectedYear
      );
      
      presentDays = staffAttendance.filter(a => a.status === 'present').length;
      
      // If no attendance data for the month, default to 30 days (full month)
      attendedDays = presentDays > 0 ? presentDays : 30;
      absentDays = workingDays - attendedDays;
      
      // Calculate using formula: (Original Salary / 30) × Days Worked
      const dailyRate = staffMember.salary / 30;
      basicSalary = dailyRate * attendedDays;
    }
    
    const staffAttendance = (attendance as Attendance[]).filter(
      a => a.staffId === staffMember.id && 
      a.date && !isNaN(new Date(a.date).getTime()) &&
      new Date(a.date).getMonth() + 1 === selectedMonth &&
      new Date(a.date).getFullYear() === selectedYear
    );
    
    const overtimeHours = staffAttendance.reduce((sum, a) => sum + (a.hoursWorked > 8 ? a.hoursWorked - 8 : 0), 0);
    const attendanceRate = (attendedDays / workingDays) * 100;
    
    // No allowances - all set to 0
    const allowances = {
      hra: 0,
      transport: 0,
      medical: 0,
      performance: 0
    };
    
    const totalAllowances = 0;
    
    // Calculate deductions for absent days
    const dailyRate = staffMember.salary / 30;
    const absentDeduction = absentDays * dailyRate;
    
    const deductions = {
      pf: 0,
      esi: 0,
      tax: 0,
      other: absentDeduction // Deduction for absent days
    };
    
    const totalDeductions = absentDeduction;
    
    // Net salary = basic salary - deductions
    const netSalary = basicSalary - totalDeductions;
    
    return {
      workingDays,
      attendedDays,
      presentDays,
      absentDays,
      overtimeHours,
      attendanceRate,
      basicSalary,
      allowances,
      totalAllowances,
      deductions,
      totalDeductions,
      grossSalary: basicSalary,
      netSalary
    };
  };

  // Add state to track locally generated payrolls for immediate download
  const [locallyGeneratedPayrolls, setLocallyGeneratedPayrolls] = useState<Set<number>>(new Set());

  const getPayrollStatus = (staffId: number) => {
    const staffPayroll = (payroll as Payroll[]).find(
      p => p.staffId === staffId && p.month === selectedMonth && p.year === selectedYear
    );
    // Check if payroll was locally generated (for immediate download access)
    if (locallyGeneratedPayrolls.has(staffId)) {
      return 'processed';
    }
    return staffPayroll?.status || 'pending';
  };

  // Add new function to calculate net salary
  const calculateNetSalary = (staffMember: Staff, attendedDays: number | '', basicSalary: number | '') => {
    const workingDays = 30; // Total working days per month
    const nAttendedDays = Number(attendedDays) || 30; // Default to 30 days if empty or 0
    const nBasicSalary = Number(basicSalary) || staffMember.salary; // Default to full salary if empty or 0
    const attendanceRate = (nAttendedDays / workingDays) * 100;
    
    // Calculate absent days and deductions
    const absentDays = workingDays - nAttendedDays;
    const dailyRate = staffMember.salary / 30;
    const absentDeduction = absentDays * dailyRate;
    
    // No allowances - all set to 0
    const allowances = {
      hra: 0,
      transport: 0,
      medical: 0,
      performance: 0
    };
    
    const totalAllowances = 0;
    
    // Calculate deductions for absent days
    const deductions = {
      pf: 0,
      esi: 0,
      tax: 0,
      other: absentDeduction // Deduction for absent days
    };
    
    const totalDeductions = absentDeduction;
    
    // Net salary = basic salary - deductions
    return nBasicSalary - totalDeductions;
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
      finalValue = numericValue === '' ? '' : Math.max(0, Math.min(Number(numericValue), 30)); // Allow up to 30 days
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
      Number(newData.attendedDays) || 30, // Default to 30 if empty
      Number(newData.basicSalary) || staffMember.salary // Default to full salary if empty
    );

    setEditablePayrollData(prev => ({
      ...prev,
      [staffId]: {
        ...newData,
        netSalary
      }
    }));
  };

  const handleManualPayrollInputChange = (staffId: number, field: 'daysWorked', value: string) => {
    const currentInput = manualPayrollInputs[staffId] || { daysWorked: '', basicSalary: '', isManual: false };
    const numericValue = value === '' ? '' : Number(value);

    // Validate and constrain values
    let finalValue: number | '';
    if (field === 'daysWorked') {
      finalValue = numericValue === '' ? '' : Math.max(0, Math.min(Number(numericValue), 30));
    } else {
      finalValue = numericValue;
    }

    setManualPayrollInputs(prev => ({
      ...prev,
      [staffId]: {
        ...currentInput,
        [field]: finalValue
      }
    }));
  };

  const toggleManualInput = (staffId: number) => {
    const currentInput = manualPayrollInputs[staffId] || { daysWorked: '', basicSalary: '', isManual: false };
    setManualPayrollInputs(prev => ({
      ...prev,
      [staffId]: {
        ...currentInput,
        isManual: !currentInput.isManual
      }
    }));
  };

  const handleGeneratePayroll = (staffMember: Staff) => {
    const manualInput = manualPayrollInputs[staffMember.id];
    let attendedDays: number;
    let basicSalary: number;
    let absentDays: number = 0;

    if (manualInput && manualInput.isManual && manualInput.daysWorked !== '') {
      // Use manual days worked with the formula: (Original Salary / 30) × Days Worked
      attendedDays = Number(manualInput.daysWorked);
      absentDays = 30 - attendedDays;
      const dailyRate = staffMember.salary / 30;
      basicSalary = dailyRate * attendedDays;
    } else {
      // Use attendance-based calculation
      const staffAttendance = (attendance as Attendance[]).filter(
        a => a.staffId === staffMember.id && 
        a.date && !isNaN(new Date(a.date).getTime()) &&
        new Date(a.date).getMonth() + 1 === selectedMonth &&
        new Date(a.date).getFullYear() === selectedYear
      );
      
      attendedDays = staffAttendance.filter(a => a.status === 'present').length;
      absentDays = 30 - attendedDays;
      const dailyRate = staffMember.salary / 30;
      basicSalary = dailyRate * attendedDays;
    }

    // Calculate total allowances and deductions
    const totalAllowances = 0; // All allowances are 0
    const dailyRate = staffMember.salary / 30;
    const absentDeduction = absentDays * dailyRate;
    const totalDeductions = absentDeduction; // Deduction for absent days
    const netSalary = basicSalary - totalDeductions; // Net salary = basic salary - deductions

    const payrollData: PayrollGeneration = {
      staffId: staffMember.id,
      month: selectedMonth,
      year: selectedYear,
      workingDays: 30, // Total working days per month
      attendedDays,
      overtimeHours: 0,
      basicSalary: basicSalary,
      allowances: totalAllowances, // Send as numeric value, not object
      deductions: totalDeductions, // Send as numeric value, not object
      netSalary: netSalary, // Net salary equals basic salary minus deductions
      employeeName: staffMember.name // Add employee name for PDF filename
    };
    
    // Add to locally generated payrolls for immediate download access
    setLocallyGeneratedPayrolls(prev => {
      const newSet = new Set(prev);
      newSet.add(staffMember.id);
      return newSet;
    });
    
    // Show loading state and generate payroll
    generatePayrollMutation.mutate(payrollData);
  };

  const handleBulkPayrollGeneration = () => {
    const payrollDataArray = filteredStaff.map(staffMember => {
      const manualInput = manualPayrollInputs[staffMember.id];
      let attendedDays: number;
      let basicSalary: number;
      let absentDays: number = 0;

      if (manualInput && manualInput.isManual && manualInput.daysWorked !== '') {
        // Use manual days worked
        attendedDays = Number(manualInput.daysWorked);
        absentDays = 30 - attendedDays;
        const dailyRate = staffMember.salary / 30;
        basicSalary = dailyRate * attendedDays;
      } else {
        // Use attendance-based calculation
        const staffAttendance = (attendance as Attendance[]).filter(
          a => a.staffId === staffMember.id && 
          a.date && !isNaN(new Date(a.date).getTime()) &&
          new Date(a.date).getMonth() + 1 === selectedMonth &&
          new Date(a.date).getFullYear() === selectedYear
        );
        
        attendedDays = staffAttendance.filter(a => a.status === 'present').length;
        absentDays = 30 - attendedDays;
        const dailyRate = staffMember.salary / 30;
        basicSalary = dailyRate * attendedDays;
      }

      // Calculate deductions for absent days
      const dailyRate = staffMember.salary / 30;
      const absentDeduction = absentDays * dailyRate;
      const totalDeductions = absentDeduction;
      const netSalary = basicSalary - totalDeductions;

      return {
        staffId: staffMember.id,
        month: selectedMonth,
        year: selectedYear,
        workingDays: 30,
        attendedDays,
        overtimeHours: 0,
        basicSalary: basicSalary,
        allowances: 0, // Send as numeric value, not object
        deductions: totalDeductions, // Send as numeric value, not object
        netSalary: netSalary,
        employeeName: staffMember.name // Add employee name for PDF filename
      };
    });

    // Add all staff IDs to locally generated payrolls for immediate download access
    setLocallyGeneratedPayrolls(prev => {
      const newSet = new Set(prev);
      filteredStaff.forEach(s => newSet.add(s.id));
      return newSet;
    });

    // Generate payroll for all staff members
    generateBulkPayrollMutation.mutate({
      month: selectedMonth,
      year: selectedYear,
      staffIds: filteredStaff.map(s => s.id),
      payrollData: payrollDataArray
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
  const [whatsappModal, setWhatsappModal] = useState<{ 
    open: boolean; 
    staff: Staff | null; 
    netSalary: number; 
  }>({ open: false, staff: null, netSalary: 0 });

  // WhatsApp message generator
  const getSalaryCreditedMessage = (staff: any, netSalary: number) => {
    const instituteName = localStorage.getItem("customInstituteName") || "EduLead Pro";
    return `Dear ${staff.name},\n\nYour salary of ₹${netSalary} has been credited to your account.\n\nThank you for your dedication and hard work.\n\nBest regards,\n${instituteName} Team`;
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  // Function to manually clear payroll localStorage data
  const clearPayrollLocalStorage = () => {
    const key1 = `editablePayrollData_${selectedMonth}_${selectedYear}`;
    const key2 = `manualPayrollInputs_${selectedMonth}_${selectedYear}`;
    localStorage.removeItem(key1);
    localStorage.removeItem(key2);
    setEditablePayrollData({});
    setManualPayrollInputs({});
    toast({
      title: "Payroll Data Cleared",
      description: "Local payroll data has been cleared successfully.",
    });
  };

  // Function to manually save current state to localStorage
  const savePayrollLocalStorage = () => {
    const key1 = `editablePayrollData_${selectedMonth}_${selectedYear}`;
    const key2 = `manualPayrollInputs_${selectedMonth}_${selectedYear}`;
    localStorage.setItem(key1, JSON.stringify(editablePayrollData));
    localStorage.setItem(key2, JSON.stringify(manualPayrollInputs));
    toast({
      title: "Payroll Data Saved",
      description: "Current payroll data has been saved to localStorage.",
    });
  };

  // Debounced search and filter logic
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredStaff = useMemo(() => {
    return (staff as Staff[]).filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (member.phone?.includes(searchQuery) ?? false);
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
      // Add status filter if you want (e.g., isActive)
      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [staff, searchQuery, roleFilter, departmentFilter]);

  // Pagination and sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<'name' | 'role' | 'salary' | 'joiningDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sorting and pagination logic
  const sortedStaff = useMemo(() => {
    const sorted = [...filteredStaff].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];
      if (sortKey === 'salary') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      if (sortKey === 'joiningDate') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredStaff, sortKey, sortOrder]);

  const paginatedStaff = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedStaff.slice(start, start + pageSize);
  }, [sortedStaff, page, pageSize]);

  const totalPages = Math.ceil(sortedStaff.length / pageSize);

  const handleSort = (key: 'name' | 'role' | 'salary' | 'joiningDate') => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStaffIds(paginatedStaff.map(s => s.id));
      setIsSelectAll(true);
    } else {
      setSelectedStaffIds([]);
      setIsSelectAll(false);
    }
  };

  const handleSelectStaff = (staffId: number, checked: boolean) => {
    if (checked) {
      setSelectedStaffIds(prev => [...prev, staffId]);
    } else {
      setSelectedStaffIds(prev => prev.filter(id => id !== staffId));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedStaffIds.length === 0) return;
    
    if (action === 'delete') {
      setStaffToDelete(selectedStaffIds[0]);
      setDeleteConfirmOpen(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/staff/bulk-${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffIds: selectedStaffIds })
      });
      
      if (!response.ok) throw new Error(`Failed to ${action} staff`);
      
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setSelectedStaffIds([]);
      setIsSelectAll(false);
      
      toast({
        title: `Staff ${action}d successfully`,
        description: `${selectedStaffIds.length} staff members ${action}d`
      });
    } catch (error: any) {
      toast({
        title: `Error ${action}ing staff`,
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/staff/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffIds: selectedStaffIds })
      });
      
      if (!response.ok) throw new Error('Failed to delete staff');
      
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setSelectedStaffIds([]);
      setIsSelectAll(false);
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
      
      toast({
        title: "Staff deleted successfully",
        description: `${selectedStaffIds.length} staff members deleted`
      });
    } catch (error: any) {
      toast({
        title: "Error deleting staff",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Employee ID', 'Role', 'Department', 'Salary', 'Joining Date', 'Email', 'Phone'];
    const csvContent = [
      headers.join(','),
      ...filteredStaff.map(staff => [
        staff.name,
        staff.employeeId,
        staff.role,
        staff.department,
        staff.salary,
        staff.joiningDate,
        staff.email || '',
        staff.phone || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleToggleStatus = async (staffId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Staff member ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update staff status',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateSalarySlip = (staffMember: Staff) => {
    const manualInput = manualPayrollInputs[staffMember.id];
    let attendedDays: number;
    let basicSalary: number;
    let absentDays: number = 0;

    if (manualInput && manualInput.isManual && manualInput.daysWorked !== '') {
      // Use manual days worked with the formula: (Original Salary / 30) × Days Worked
      attendedDays = Number(manualInput.daysWorked);
      absentDays = 30 - attendedDays;
      const dailyRate = staffMember.salary / 30;
      basicSalary = dailyRate * attendedDays;
    } else {
      // Use attendance-based calculation
      const staffAttendance = (attendance as Attendance[]).filter(
        a => a.staffId === staffMember.id && 
        a.date && !isNaN(new Date(a.date).getTime()) &&
        new Date(a.date).getMonth() + 1 === selectedMonth &&
        new Date(a.date).getFullYear() === selectedYear
      );
      
      attendedDays = staffAttendance.filter(a => a.status === 'present').length;
      absentDays = 30 - attendedDays;
      const dailyRate = staffMember.salary / 30;
      basicSalary = dailyRate * attendedDays;
    }

    // Calculate total allowances and deductions
    const totalAllowances = 0; // All allowances are 0
    const dailyRate = staffMember.salary / 30;
    const absentDeduction = absentDays * dailyRate;
    const totalDeductions = absentDeduction; // Deduction for absent days
    const netSalary = basicSalary - totalDeductions; // Net salary = basic salary - deductions

    const payrollData: PayrollGeneration = {
      staffId: staffMember.id,
      month: selectedMonth,
      year: selectedYear,
      workingDays: 30, // Total working days per month
      attendedDays,
      overtimeHours: 0,
      basicSalary: basicSalary,
      allowances: totalAllowances, // Send as numeric value, not object
      deductions: totalDeductions, // Send as numeric value, not object
      netSalary: netSalary, // Net salary equals basic salary minus deductions
      employeeName: staffMember.name // Add employee name for PDF filename
    };
    
    // First save the payroll data to ensure correct attendedDays is stored
    toast({
      title: "Saving Payroll Data",
      description: "Saving payroll data before generating PDF...",
    });
    
    generatePayrollMutation.mutate(payrollData, {
      onSuccess: () => {
        // After successful save, generate the PDF with the same data
        const pdfData: PayrollGeneration & { employeeName: string } = {
          ...payrollData,
          employeeName: staffMember.name
        };
        generateSalarySlipMutation.mutate(pdfData);
      }
    });
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
          {/* Test PDF Download Button */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-800">PDF Download Test</h4>
                <p className="text-sm text-yellow-600">Test PDF generation functionality</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/test-pdf', {
                      method: 'GET',
                      headers: {
                        'Accept': 'application/pdf',
                      }
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'test-document.pdf';
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    }, 100);
                    
                    toast({
                      title: "Test PDF Downloaded",
                      description: "Test PDF has been downloaded successfully.",
                    });
                  } catch (error) {
                    console.error('Test PDF download error:', error);
                    toast({
                      title: "Test PDF Download Failed",
                      description: error instanceof Error ? error.message : "Failed to download test PDF",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Test PDF Download
              </Button>
            </div>
          </div>
          
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
          {/* Quick Stats Summary */}
          <div className="flex flex-wrap gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">{displayStaff.length}</span>
              <span className="text-sm text-muted-foreground">Total Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-semibold">₹{(displayStaff.reduce((sum, s) => sum + s.salary, 0) / Math.max(displayStaff.length, 1)).toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">Avg Salary</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">{(displayStaff.reduce((sum, s) => sum + getStaffAttendanceRate(s.id), 0) / Math.max(displayStaff.length, 1)).toFixed(1)}%</span>
              <span className="text-sm text-muted-foreground">Avg Attendance</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold">{displayStaff.filter(s => getStaffAttendanceRate(s.id) >= 95).length}</span>
              <span className="text-sm text-muted-foreground">Top Performers</span>
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Recently joined staff members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayStaff
                  .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
                  .slice(0, 5)
                  .map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-blue-600">{staff.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-muted-foreground">{staff.role} • {staff.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Joined</div>
                        <div className="text-xs text-muted-foreground">
                          {staff.joiningDate && !isNaN(new Date(staff.joiningDate).getTime()) 
                            ? format(new Date(staff.joiningDate), "MMM dd, yyyy")
                            : "N/A"
                          }
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Section */}
          {canViewAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStaff.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +{displayStaff.filter(s => new Date(s.joiningDate) > new Date(Date.now() - 30*24*60*60*1000)).length} this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{(displayStaff.reduce((sum, s) => sum + s.salary, 0) / displayStaff.length).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all departments
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(displayStaff.map(s => s.department).filter(Boolean)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active departments
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(displayStaff.reduce((sum, s) => sum + getStaffAttendanceRate(s.id), 0) / displayStaff.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Section */}
          {canViewAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Department Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          displayStaff.reduce((acc, staff) => {
                            const dept = staff.department || 'Unassigned';
                            acc[dept] = (acc[dept] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(
                          displayStaff.reduce((acc, staff) => {
                            const dept = staff.department || 'Unassigned';
                            acc[dept] = (acc[dept] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getDepartmentColor(entry[0])} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          displayStaff.reduce((acc, staff) => {
                            acc[staff.role] = (acc[staff.role] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(
                          displayStaff.reduce((acc, staff) => {
                            acc[staff.role] = (acc[staff.role] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 z-10 bg-white dark:bg-slate-900 border-b">
              <div className="flex flex-col gap-1">
                <CardTitle>Staff Directory</CardTitle>
                <CardDescription>Complete staff overview</CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Search by name, ID, email..."
                  className="border rounded px-2 py-1 w-56"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="border rounded px-2 py-1">
                  <option value="all">All Departments</option>
                  {Array.from(new Set(displayStaff.map(s => s.department).filter(Boolean))).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <Button onClick={() => setIsAddStaffOpen(true)} disabled={!canManageStaff}>
                  <Plus className="mr-2 h-4 w-4" /> Add Staff
                </Button>
                <Button variant="outline" onClick={exportToCSV} disabled={!canViewAnalytics || isLoading}>
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </div>
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
              {/* Bulk actions */}
              {selectedStaffIds.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedStaffIds.length} staff selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')} disabled={!canManageStaff || isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Activate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')} disabled={!canManageStaff || isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Deactivate
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')} disabled={!isAdmin || isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete
                    </Button>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={isSelectAll} 
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer select-none">Employee {sortKey === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead onClick={() => handleSort('role')} className="cursor-pointer select-none">Role {sortKey === 'role' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead onClick={() => handleSort('salary')} className="cursor-pointer select-none">Salary {sortKey === 'salary' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead onClick={() => handleSort('joiningDate')} className="cursor-pointer select-none">Joining Date {sortKey === 'joiningDate' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStaff.map((member) => {
                    const attendanceRate = getStaffAttendanceRate(member.id);
                    return (
                      <TableRow key={member.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => { setSelectedStaff(member); setIsDrawerOpen(true); }}>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            checked={selectedStaffIds.includes(member.id)}
                            onCheckedChange={(checked) => handleSelectStaff(member.id, checked as boolean)}
                          />
                        </TableCell>
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
                        <TableCell>
                          {member.joiningDate && !isNaN(new Date(member.joiningDate).getTime()) 
                            ? format(new Date(member.joiningDate), "MMM dd, yyyy")
                            : "N/A"
                          }
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(member.id, member.isActive !== false)}
                              className={`transition-colors ${
                                member.isActive !== false 
                                  ? 'hover:bg-red-50 text-red-600 border-red-200' 
                                  : 'hover:bg-green-50 text-green-600 border-green-200'
                              }`}
                            >
                              {member.isActive !== false ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAiAnalysisOpen(true)}
                              className="hover:bg-blue-50 transition-colors"
                            >
                              <Bot className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {/* Pagination controls */}
              <div className="flex items-center justify-between mt-4">
                <div>
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2 items-center">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1 ml-2">
                    {[10, 20, 50].map(size => <option key={size} value={size}>{size} / page</option>)}
                  </select>
                </div>
              </div>
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
          {/* Staff Profile Drawer */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerContent className="max-w-lg mx-auto">
              <DrawerHeader>
                <DrawerTitle>Staff Profile</DrawerTitle>
                <DrawerDescription>View and edit staff details</DrawerDescription>
              </DrawerHeader>
              {selectedStaff && (
                <div className="space-y-4 p-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold">Name:</span>
                    <Input value={selectedStaff.name} onChange={e => setSelectedStaff({ ...selectedStaff, name: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold">Role:</span>
                    <Input value={selectedStaff.role} onChange={e => setSelectedStaff({ ...selectedStaff, role: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold">Department:</span>
                    <Input value={selectedStaff.department} onChange={e => setSelectedStaff({ ...selectedStaff, department: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold">Salary:</span>
                    <Input type="number" value={selectedStaff.salary} onChange={e => setSelectedStaff({ ...selectedStaff, salary: Number(e.target.value) })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold">Joining Date:</span>
                    <Input type="date" value={selectedStaff.joiningDate} onChange={e => setSelectedStaff({ ...selectedStaff, joiningDate: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold">Email:</span>
                    <Input value={selectedStaff.email || ''} onChange={e => setSelectedStaff({ ...selectedStaff, email: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold">Phone:</span>
                    <Input value={selectedStaff.phone || ''} onChange={e => setSelectedStaff({ ...selectedStaff, phone: e.target.value })} />
                  </div>
                </div>
              )}
              <DrawerFooter>
                <Button onClick={() => {/* TODO: Save staff changes via API */ setIsDrawerOpen(false); }}>Save</Button>
                <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete {selectedStaffIds.length} staff member(s).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Dashboard</CardTitle>
              <CardDescription>Manage salary, payment history, and payroll settings for staff</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Staff Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Staff</p>
                      <p className="text-2xl font-bold text-blue-700">{filteredStaff.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Active Staff</p>
                      <p className="text-2xl font-bold text-green-700">
                        {filteredStaff.filter(s => s.isActive !== false).length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Avg Salary</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        ₹{(filteredStaff.reduce((sum, s) => sum + s.salary, 0) / Math.max(filteredStaff.length, 1)).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Departments</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {Array.from(new Set(filteredStaff.map(s => s.department))).length}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Payroll Tabs */}
              <Tabs defaultValue="current" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="current">Current Month</TabsTrigger>
                  <TabsTrigger value="history">Payment History</TabsTrigger>
                  <TabsTrigger value="details">Salary Details</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="current" className="space-y-4">
                  {/* Debug Section - Remove this in production */}
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-800">Debug Info</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-orange-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p>Selected Month: {selectedMonth}</p>
                          <p>Selected Year: {selectedYear}</p>
                          <p>Total Staff: {filteredStaff.length}</p>
                          <p>Locally Generated: {Array.from(locallyGeneratedPayrolls).join(', ') || 'None'}</p>
                        </div>
                        <div>
                          <p>Payroll Status Counts:</p>
                          <p>• Pending: {filteredStaff.filter(s => getPayrollStatus(s.id) === 'pending').length}</p>
                          <p>• Processed: {filteredStaff.filter(s => getPayrollStatus(s.id) === 'processed').length}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-orange-700 border-orange-300"
                          onClick={() => {
                            // Add all staff to locally generated for testing
                            setLocallyGeneratedPayrolls(prev => {
                              const newSet = new Set(prev);
                              filteredStaff.forEach(s => newSet.add(s.id));
                              return newSet;
                            });
                          }}
                        >
                          Test: Enable All Download Buttons
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-orange-700 border-orange-300 ml-2"
                          onClick={clearPayrollLocalStorage}
                        >
                          Clear localStorage
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-orange-700 border-orange-300 ml-2"
                          onClick={savePayrollLocalStorage}
                        >
                          Save to localStorage
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-orange-700 border-orange-300 ml-2"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/test-payroll-save?month=${selectedMonth}&year=${selectedYear}`);
                              const data = await response.json();
                              console.log('Payroll save test result:', data);
                              toast({
                                title: "Payroll Save Test",
                                description: `Found ${data.staffWithPayroll} staff with payroll, ${data.staffWithoutPayroll} without payroll`,
                              });
                            } catch (error) {
                              console.error('Payroll save test error:', error);
                              toast({
                                title: "Test Failed",
                                description: "Failed to test payroll save",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          Test DB Save
                        </Button>
                      </div>
                      <div className="mt-2 text-xs">
                        <p>localStorage editablePayrollData: {localStorage.getItem(`editablePayrollData_${selectedMonth}_${selectedYear}`) ? 'Present' : 'Empty'}</p>
                        <p>localStorage manualPayrollInputs: {localStorage.getItem(`manualPayrollInputs_${selectedMonth}_${selectedYear}`) ? 'Present' : 'Empty'}</p>
                        <p>Current editablePayrollData keys: {Object.keys(editablePayrollData).length}</p>
                        <p>Current manualPayrollInputs keys: {Object.keys(manualPayrollInputs).length}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Month Payroll</CardTitle>
                      <CardDescription>
                        {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {filteredStaff.map((member) => {
                            const payrollDetails = calculatePayrollDetails(member);
                            const payrollStatus = getPayrollStatus(member.id);
                            const manualInput = manualPayrollInputs[member.id] || { daysWorked: '', basicSalary: '', isManual: false };
                            
                            return (
                              <div key={member.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold">{member.name}</h4>
                                    <p className="text-sm text-gray-600">{member.employeeId} • {member.role}</p>
                                  </div>
                                  <Badge className={
                                    payrollStatus === 'processed' ? 'bg-green-100 text-green-800 border-green-200' :
                                    payrollStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-red-100 text-red-800 border-red-200'
                                  }>
                                    {payrollStatus}
                                  </Badge>
                                </div>
                                
                                {/* Manual Input Toggle */}
                                <div className="mb-3 flex items-center gap-2">
                                  <Switch
                                    checked={manualInput.isManual}
                                    onCheckedChange={() => toggleManualInput(member.id)}
                                  />
                                  <Label className="text-sm">Manual Input</Label>
                                </div>
                                
                                {/* Manual Input Fields */}
                                {manualInput.isManual && (
                                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                    <div>
                                      <Label className="text-xs text-gray-600">Days Worked</Label>
                                      <Input
                                        type="number"
                                        value={manualInput.daysWorked}
                                        onChange={(e) => handleManualPayrollInputChange(member.id, 'daysWorked', e.target.value)}
                                        placeholder="0-30"
                                        min="0"
                                        max="30"
                                        className="h-8 text-sm"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Basic salary will be calculated as: (₹{member.salary.toLocaleString()} ÷ 30) × days worked
                                      </p>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Basic Salary:</span>
                                    <span className="float-right font-medium">₹{payrollDetails.basicSalary.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Allowances:</span>
                                    <span className="float-right font-medium text-blue-600">₹{payrollDetails.totalAllowances.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Deductions:</span>
                                    <span className="float-right font-medium text-red-600">₹{payrollDetails.totalDeductions.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Net Salary:</span>
                                    <span className="float-right font-bold text-green-600">₹{payrollDetails.netSalary.toLocaleString()}</span>
                                  </div>
                                </div>
                                
                                {/* Calculation Method Info */}
                                <div className="mt-2 text-xs text-gray-500">
                                  {manualInput.isManual ? (
                                    <div className="flex items-center gap-1">
                                      <Calculator className="h-3 w-3" />
                                      Manual calculation: (₹{member.salary.toLocaleString()} ÷ 30) × {manualInput.daysWorked} = ₹{payrollDetails.basicSalary.toLocaleString()}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Auto calculation: (₹{member.salary.toLocaleString()} ÷ 30) × {payrollDetails.attendedDays} = ₹{payrollDetails.basicSalary.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="mt-3 flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleGeneratePayroll(member)}
                                    disabled={generatePayrollMutation.isPending}
                                    className="flex-1"
                                  >
                                    {generatePayrollMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        <Calculator className="mr-2 h-4 w-4" />
                                        Generate Payroll
                                      </>
                                    )}
                                  </Button>
                                  {/* Only show download button if payroll is processed */}
                                  {payrollStatus === 'processed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleGenerateSalarySlip(member)}
                                      disabled={generateSalarySlipMutation.isPending}
                                    >
                                      {generateSalarySlipMutation.isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Generating PDF...
                                        </>
                                      ) : (
                                        <>
                                          <FileText className="mr-2 h-4 w-4" />
                                          Download Slip
                                        </>
                                      )}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setWhatsappModal({ open: true, staff: member, netSalary: payrollDetails.netSalary })}
                                    disabled={!member.phone}
                                  >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Send Notification
                                  </Button>
                                </div>
                                
                                {/* Payroll Status Indicator */}
                                <div className="mt-2 text-xs">
                                  {payrollStatus === 'processed' && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="h-3 w-3" />
                                      Payroll processed on {new Date().toLocaleDateString()}
                                    </div>
                                  )}
                                  {payrollStatus === 'pending' && (
                                    <div className="flex items-center gap-1 text-yellow-600">
                                      <Clock className="h-3 w-3" />
                                      Pending generation
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                            <div className="text-center">
                              <p className="text-sm text-green-600 font-medium">Total Net Payroll</p>
                              <p className="text-2xl font-bold text-green-700">
                                ₹{filteredStaff.reduce((sum, member) => {
                                  const details = calculatePayrollDetails(member);
                                  return sum + details.netSalary;
                                }, 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Bulk Manual Input Section */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">Bulk Manual Input</CardTitle>
                              <CardDescription>Set manual days worked for multiple employees at once</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Default Days Worked</Label>
                                  <Input
                                    type="number"
                                    placeholder="e.g., 26"
                                    min="0"
                                    max="30"
                                    onChange={(e) => {
                                      const days = Number(e.target.value);
                                      if (!isNaN(days)) {
                                        filteredStaff.forEach(member => {
                                          const currentInput = manualPayrollInputs[member.id] || { daysWorked: '', basicSalary: '', isManual: false };
                                          setManualPayrollInputs(prev => ({
                                            ...prev,
                                            [member.id]: {
                                              ...currentInput,
                                              daysWorked: days || ''
                                            }
                                          }));
                                        });
                                      }
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Basic salary will be calculated automatically using the formula: (Original Salary ÷ 30) × days worked
                                  </p>
                                </div>
                                <div className="flex items-end">
                                  <Button
                                    onClick={() => {
                                      filteredStaff.forEach(member => {
                                        const currentInput = manualPayrollInputs[member.id] || { daysWorked: '', basicSalary: '', isManual: false };
                                        setManualPayrollInputs(prev => ({
                                          ...prev,
                                          [member.id]: {
                                            ...currentInput,
                                            isManual: true
                                          }
                                        }));
                                      });
                                    }}
                                    className="w-full"
                                  >
                                    Enable Manual for All
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Payment Status</span>
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                {filteredStaff.filter(s => getPayrollStatus(s.id) === 'pending').length} Pending
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Processed</span>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                {filteredStaff.filter(s => getPayrollStatus(s.id) === 'processed').length} Complete
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Due Date</span>
                              <span className="font-medium">25th of this month</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={handleBulkPayrollGeneration}
                              disabled={generateBulkPayrollMutation.isPending}
                            >
                              <Calculator className="h-4 w-4 mr-2" />
                              {generateBulkPayrollMutation.isPending ? "Processing..." : "Process All"}
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                // Generate PDF for all staff members with processed payroll
                                const processedStaff = filteredStaff.filter(member => 
                                  getPayrollStatus(member.id) === 'processed'
                                );
                                processedStaff.forEach((member, index) => {
                                  setTimeout(() => handleGenerateSalarySlip(member), index * 1000);
                                });
                              }}
                              disabled={generateSalarySlipMutation.isPending || 
                                filteredStaff.filter(member => getPayrollStatus(member.id) === 'processed').length === 0}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Download All Slips
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <FileText className="h-4 w-4 mr-2" />
                              Generate Reports
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Month</TableHead>
                            <TableHead>Basic Salary</TableHead>
                            <TableHead>Allowances</TableHead>
                            <TableHead>Deductions</TableHead>
                            <TableHead>Net Salary</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(payroll as Payroll[]).map((payrollRecord) => {
                            const staffMember = (staff as Staff[]).find(s => s.id === payrollRecord.staffId);
                            if (!staffMember) return null;
                            
                            return (
                              <TableRow key={payrollRecord.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{staffMember.name}</div>
                                    <div className="text-sm text-gray-500">{staffMember.employeeId}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {new Date(payrollRecord.year, payrollRecord.month - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                </TableCell>
                                <TableCell>₹{payrollRecord.basicSalary.toLocaleString()}</TableCell>
                                <TableCell>₹{payrollRecord.allowances.toLocaleString()}</TableCell>
                                <TableCell>₹{payrollRecord.deductions.toLocaleString()}</TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  ₹{payrollRecord.netSalary.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    payrollRecord.status === 'processed' 
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : payrollRecord.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                      : 'bg-red-100 text-red-800 border-red-200'
                                  }>
                                    {payrollRecord.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {payrollRecord.status === 'processed' 
                                    ? new Date(payrollRecord.generatedAt).toLocaleDateString('en-IN')
                                    : '-'
                                  }
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {(payroll as Payroll[]).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No payroll records found</p>
                                <p className="text-sm">Generate payroll for staff members to see payment history</p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Salary Structure</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Total Basic Salary</span>
                            <span className="font-semibold">
                              ₹{filteredStaff.reduce((sum, s) => sum + s.salary, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span>HRA (0%)</span>
                            <span className="font-semibold text-blue-600">
                              ₹0
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span>Transport Allowance</span>
                            <span className="font-semibold text-green-600">
                              ₹0
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span>Medical Allowance</span>
                            <span className="font-semibold text-purple-600">
                              ₹0
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Deductions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span>PF (0%)</span>
                            <span className="font-semibold text-red-600">
                              ₹0
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span>Professional Tax</span>
                            <span className="font-semibold text-orange-600">
                              ₹0
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                            <span>ESI (0%)</span>
                            <span className="font-semibold text-yellow-600">
                              ₹0
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Other Deductions</span>
                            <span className="font-semibold text-gray-600">
                              ₹0
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payroll Settings</CardTitle>
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
                          <Label>HRA Percentage</Label>
                          <Input 
                            type="number" 
                            defaultValue="8" 
                            placeholder="Enter HRA percentage"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>PF Percentage</Label>
                          <Input 
                            type="number" 
                            defaultValue="12" 
                            placeholder="Enter PF percentage"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Transport Allowance</Label>
                          <Input 
                            type="number" 
                            defaultValue="2000" 
                            placeholder="Enter transport allowance"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Medical Allowance</Label>
                          <Input 
                            type="number" 
                            defaultValue="1500" 
                            placeholder="Enter medical allowance"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Save Settings</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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
                    <Button variant="secondary" onClick={() => setWhatsappModal({ open: false, staff: null, netSalary: 0 })}>Cancel</Button>
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