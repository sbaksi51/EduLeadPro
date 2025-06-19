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
  IndianRupee,
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
  Clock,
  Trash2,
  Search,
  Upload,
  X
} from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

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

interface PayrollDetails {
  workingDays: number;
  attendedDays: number;
  presentDays: number;
  absentDays: number;
  overtimeHours: number;
  attendanceRate: number;
  basicSalary: number;
  allowances: number;
  totalAllowances: number;
  deductions: {
    absent: number;
  };
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
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
    const key = 'editablePayrollData_' + selectedMonth + '_' + selectedYear;
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
    const key = 'manualPayrollInputs_' + selectedMonth + '_' + selectedYear;
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
  const canManageStaff = true; // Always allow staff management
  const canViewAnalytics = isAdmin || userRole === 'hr' || userRole === 'marketing_head';

  // Debug: Log the current user role
  console.log('Current user role:', userRole);
  console.log('canManageStaff:', canManageStaff);

  // Fetch data
  const { data: staff = [] } = useQuery({ queryKey: ["/api/staff"] });
  const displayStaff: Staff[] = (staff as Staff[]);
  const { data: attendance = [] } = useQuery({ queryKey: ["/api/attendance"] });
  const { data: payroll = [] } = useQuery({ queryKey: ["/api/payroll"] });

  // Save payroll state to localStorage whenever it changes
  useEffect(() => {
    const key = 'editablePayrollData_' + selectedMonth + '_' + selectedYear;
    console.log('Saving editablePayrollData to localStorage with key:', key, 'data:', editablePayrollData);
    localStorage.setItem(key, JSON.stringify(editablePayrollData));
  }, [editablePayrollData, selectedMonth, selectedYear]);

  useEffect(() => {
    const key = 'manualPayrollInputs_' + selectedMonth + '_' + selectedYear;
    console.log('Saving manualPayrollInputs to localStorage with key:', key, 'data:', manualPayrollInputs);
    localStorage.setItem(key, JSON.stringify(manualPayrollInputs));
  }, [manualPayrollInputs, selectedMonth, selectedYear]);

  // Clear localStorage only when month/year actually changes (not on initial mount)
  useEffect(() => {
    if ((prevMonth !== selectedMonth || prevYear !== selectedYear) && 
        (prevMonth !== 0 && prevYear !== 0)) { // Skip initial mount
      console.log('Month/Year changed, clearing localStorage');
      const oldKey1 = 'editablePayrollData_' + prevMonth + '_' + prevYear;
      const oldKey2 = 'manualPayrollInputs_' + prevMonth + '_' + prevYear;
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
        const key = 'editablePayrollData_' + selectedMonth + '_' + selectedYear;
        localStorage.setItem(key, JSON.stringify(existingPayrollData));
      }
    }
  }, [payroll, staff, selectedMonth, selectedYear]);

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
          dateOfJoining: staffMember.dateOfJoining
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
      const key1 = 'editablePayrollData_' + selectedMonth + '_' + selectedYear;
      const key2 = 'manualPayrollInputs_' + selectedMonth + '_' + selectedYear;
      localStorage.removeItem(key1);
      localStorage.removeItem(key2);
      setEditablePayrollData({});
      setManualPayrollInputs({});
      toast({
        title: "Payroll Generated Successfully",
        description: "Payroll for " + selectedMonth + "/" + selectedYear + " has been generated and saved.",
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
      const key1 = 'editablePayrollData_' + selectedMonth + '_' + selectedYear;
      const key2 = 'manualPayrollInputs_' + selectedMonth + '_' + selectedYear;
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

        const response = await fetch('/api/payroll/generate-slip/' + payrollData.staffId + '/' + payrollData.month + '/' + payrollData.year, {
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
          throw new Error(errorText || 'Failed to generate salary slip (' + response.status + ')');
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
        a.download = 'Salary_Slip_' + cleanName + '_' + variables.month + '_' + variables.year + '.pdf';
        
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

  // Delete payroll mutation
  const deletePayrollMutation = useMutation({
    mutationFn: async (payrollId: number) => {
      const response = await fetch('/api/payroll/' + payrollId, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete payroll record");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Success",
        description: "Payroll record deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete payroll record: " + error.message,
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

  const calculatePayrollDetails = (staffMember: Staff): PayrollDetails => {
    const workingDays = 30;
    const manualInput = manualPayrollInputs[staffMember.id];
    let attendedDays: number;
    let presentDays: number;
    let absentDays: number;
    let basicSalary: number;

    if (manualInput && manualInput.isManual && manualInput.daysWorked !== '') {
      attendedDays = Number(manualInput.daysWorked);
      presentDays = attendedDays;
      absentDays = workingDays - attendedDays;
      basicSalary = staffMember.salary;
    } else {
      const staffAttendance = (attendance as Attendance[]).filter(
        a => a.staffId === staffMember.id && 
        a.date && !isNaN(new Date(a.date).getTime()) &&
        new Date(a.date).getMonth() + 1 === selectedMonth &&
        new Date(a.date).getFullYear() === selectedYear
      );
      presentDays = staffAttendance.filter(a => a.status === 'present').length;
      attendedDays = presentDays > 0 ? presentDays : workingDays;
      absentDays = workingDays - attendedDays;
      basicSalary = staffMember.salary;
    }

    // Net Salary = basic salary / 30 * attended days
    const netSalary = (basicSalary / 30) * attendedDays;
    // Deductions = Basic Salary - Net Salary
    const deductions = basicSalary - netSalary;

    return {
      workingDays,
      attendedDays,
      presentDays,
      absentDays,
      overtimeHours: 0,
      attendanceRate: (attendedDays / workingDays) * 100,
      basicSalary: Math.round(basicSalary * 100) / 100,
      allowances: 0,
      totalAllowances: 0,
      deductions: { absent: Math.round(deductions * 100) / 100 },
      totalDeductions: Math.round(deductions * 100) / 100,
      grossSalary: Math.round(basicSalary * 100) / 100,
      netSalary: Math.round(netSalary * 100) / 100
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
    const nAttendedDays = Number(attendedDays) || 30;
    const nBasicSalary = Number(basicSalary) || staffMember.salary;
    // Net Salary = basic salary / 30 * attended days
    return (nBasicSalary / 30) * nAttendedDays;
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
    const deptStaff = displayStaff.filter((s: Staff) => s.department === department);
    const deptAttendance = (attendance as Attendance[]).filter((a: Attendance) => 
      deptStaff.some((s: Staff) => s.id === a.staffId)
    );

    return {
      totalStaff: deptStaff.length,
      averageSalary: deptStaff.reduce((sum: number, s: Staff) => sum + s.salary, 0) / deptStaff.length,
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

  // Add Staff Modal logic
  const addStaffForm = useForm<InsertStaff>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      dateOfJoining: '',
      salary: '',
      address: '',
      emergencyContact: '',
      qualifications: '',
      bankAccountNumber: '',
      ifscCode: '',
      panNumber: '',
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
  const onAddStaffSubmit = (data: InsertStaff) => {
    // Find the highest employeeId in displayStaff
    const maxId = displayStaff.reduce((max, s) => {
      const match = s.employeeId && s.employeeId.match(/^EMP(\d{3,})$/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextId = maxId + 1;
    const nextEmployeeId = `EMP${nextId.toString().padStart(3, '0')}`;
    const payload = {
      ...data,
      employeeId: nextEmployeeId,
    };
    addStaffMutation.mutate(payload);
  };

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

  // Show all staff in filteredStaff
  const filteredStaff = useMemo(() => {
    return displayStaff.filter((member: Staff) => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (member.phone?.includes(searchQuery) ?? false);
      const normalizedRole = member.role ? member.role.toLowerCase().trim() : '';
      const normalizedRoleFilter = roleFilter.toLowerCase().trim();
      const matchesRole = normalizedRoleFilter === 'all' || normalizedRole === normalizedRoleFilter;
      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [displayStaff, searchQuery, roleFilter, departmentFilter]);

  // Pagination and sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [sortKey, setSortKey] = useState<'name' | 'role' | 'salary' | 'dateOfJoining'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sorting and pagination logic
  const sortedStaff = useMemo(() => {
    const sorted = [...filteredStaff].sort((a, b) => {
      // Always sort active staff above deactivated
      if ((a.isActive === false) && (b.isActive !== false)) return 1;
      if ((a.isActive !== false) && (b.isActive === false)) return -1;
      // Then apply the selected sort
      let aValue = a[sortKey];
      let bValue = b[sortKey];
      if (sortKey === 'salary') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      if (sortKey === 'dateOfJoining') {
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

  const handleSort = (key: 'name' | 'role' | 'salary' | 'dateOfJoining') => {
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
      const response = await fetch('/api/staff/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffIds: selectedStaffIds })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
        setSelectedStaffIds([]);
        setIsSelectAll(false);
        setDeleteConfirmOpen(false);
        setStaffToDelete(null);
        
        if (response.status === 207) {
          // Partial success
          toast({
            title: "Partial Success",
            description: `${result.deleted.length} staff members deleted. ${result.failed.length} could not be deleted.`,
            variant: "default"
          });
        } else {
          // Full success
          toast({
            title: "Staff deleted successfully",
            description: `${result.deleted.length} staff members deleted`
          });
        }
      } else {
        throw new Error(result.message || 'Failed to delete staff');
      }
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
        staff.dateOfJoining,
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

  const calculateDepartmentSalaries = () => {
    const deptSalaries: { [key: string]: number } = {};
    filteredStaff.forEach((member: Staff) => {
      if (member.department) {
        deptSalaries[member.department] = (deptSalaries[member.department] || 0) + member.salary;
      }
    });
    return deptSalaries;
  };

  const calculateRoleSalaries = () => {
    const roleSalaries: { [key: string]: number } = {};
    filteredStaff.forEach((member: Staff) => {
      if (member.role) {
        roleSalaries[member.role] = (roleSalaries[member.role] || 0) + member.salary;
      }
    });
    return roleSalaries;
  };

  // Add state for showing bulk manual input
  const [showBulkManualInput, setShowBulkManualInput] = useState(false);

  // Calculate average salary for filtered staff
  const avgSalary = filteredStaff.length > 0 ? Math.round(filteredStaff.reduce((sum: number, s: Staff) => sum + s.salary, 0) / filteredStaff.length) : 0;

  // Helper to map selectedStaff to InsertStaff shape for the edit form
  function mapStaffToInsertStaff(staff?: Staff): InsertStaff {
    return {
      employeeId: staff?.employeeId || '',
      name: staff?.name || '',
      email: staff?.email || '',
      phone: staff?.phone || '',
      role: staff?.role || '',
      department: staff?.department || '',
      dateOfJoining: staff?.dateOfJoining || '', // This should match the schema field name
      salary: staff?.salary ? String(staff.salary) : '',
      address: (staff as any)?.address || '',
      emergencyContact: (staff as any)?.emergencyContact || '',
      qualifications: (staff as any)?.qualifications || '',
      bankAccountNumber: (staff as any)?.bankAccountNumber || '',
      ifscCode: (staff as any)?.ifscCode || '',
      panNumber: (staff as any)?.panNumber || '',
    };
  }

  // Move editStaffForm to component level, outside conditional rendering
  const editStaffForm = useForm<InsertStaff>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: mapStaffToInsertStaff(selectedStaff || undefined),
  });

  useEffect(() => {
    if (selectedStaff) {
      editStaffForm.reset(mapStaffToInsertStaff(selectedStaff || undefined));
    }
  }, [selectedStaff]);

  const onEditStaffSubmit = async (data: InsertStaff) => {
    if (selectedStaff) {
      // Call API to update staff
      await apiRequest("PUT", `/api/staff/${selectedStaff.id}`, data);
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setIsDrawerOpen(false);
    }
  };

  // For dashboard counts, only count active staff
  const activePendingCount = filteredStaff.filter(s => s.isActive !== false && getPayrollStatus(s.id) === 'pending').length;
  const activeCompleteCount = filteredStaff.filter(s => s.isActive !== false && getPayrollStatus(s.id) === 'processed').length;

  // Add state for import CSV modal
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <div className="space-y-10">
      <Header 
        title="Staff Management" 
        subtitle="Manage and track all staffs efficiently"
      />
      <div className="max-w-[120rem] mx-auto">
        <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Staff Overview</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Creation</TabsTrigger>
          </TabsList>
          
          {/* Staff Overview Stats Cards */}
          {selectedTab === "overview" && (
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStaff.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredStaff.filter(s => s.isActive !== false).length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inactive Staff</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredStaff.filter(s => s.isActive === false).length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                  <IndianRupee className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{avgSalary.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <TabsContent value="overview" className="space-y-6 font-sans">
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 md:p-8">
              {/* Top controls: search, filters, import/export, pagination */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                <div className="flex gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search staff by name, ID, or email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {Array.from(new Set(displayStaff.map(s => s.role?.toLowerCase().trim()).filter(Boolean))).map(role => (
                        <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {Array.from(new Set(displayStaff.map(s => s.department).filter(Boolean))).map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-2"
                  >
                    Import CSV
                    <Upload size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={exportToCSV}
                    className="flex items-center gap-2"
                  >
                    Export CSV
                    <Upload size={16} />
                  </Button>
                  <Pagination className="ml-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                          aria-disabled={page === 1}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={page === i + 1}
                            onClick={e => { e.preventDefault(); setPage(i + 1); }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={e => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }}
                          aria-disabled={page === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
              {/* Import CSV Modal (placeholder) */}
              {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowImportModal(false)}>
                      <X size={20} />
                    </button>
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Download size={18}/> Import Staff CSV</h2>
                    <p className="text-sm text-gray-500 mb-4">Staff CSV import is coming soon. Please contact support if you need bulk staff onboarding.</p>
                    <Button onClick={() => setShowImportModal(false)} className="w-full mt-2">Close</Button>
                  </div>
                </div>
              )}
              {/* Table Card */}
              <Card className="border rounded-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">{/* header */}
                            <Checkbox checked={isSelectAll} onCheckedChange={handleSelectAll} />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100 text-sm font-normal">
                        {paginatedStaff.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No staff found</td>
                          </tr>
                        ) : (
                          paginatedStaff.map((member) => (
                            <tr key={member.id} className="hover:bg-blue-50/40 transition cursor-pointer group">
                              <td className="px-6 py-4">
                                <Checkbox 
                                  checked={selectedStaffIds.includes(member.id)}
                                  onCheckedChange={(checked) => handleSelectStaff(member.id, checked as boolean)}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-sm">
                                    {member.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 group-hover:text-blue-700 text-sm">{member.name}</div>
                                    <div className="text-xs text-gray-400">{member.employeeId}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{member.phone || '-'}</div>
                                <div className="text-xs text-gray-500">{member.email || 'No email'}</div>
                              </td>
                              <td className="px-6 py-4 capitalize text-sm">{member.role}</td>
                              <td className="px-6 py-4 font-semibold text-sm">₹{member.salary.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm">
                                {member.dateOfJoining && !isNaN(new Date(member.dateOfJoining).getTime())
                                  ? format(new Date(member.dateOfJoining), "MMM dd, yyyy")
                                  : "N/A"
                                }
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={e => { e.stopPropagation(); setSelectedStaff(member); setIsDrawerOpen(true); }}
                                    className="rounded-lg border-gray-200 text-sm font-medium"
                                  >
                                    View Details
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={e => { e.stopPropagation(); handleToggleStatus(member.id, member.isActive !== false); }}
                                    className={`rounded-lg border-gray-200 text-sm font-medium ${member.isActive !== false ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                  >
                                    {member.isActive !== false ? 'Deactivate' : 'Activate'}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Staff Details Drawer */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerContent className="max-w-lg w-full mx-auto">
                <DrawerHeader>
                  <DrawerTitle>Staff Details</DrawerTitle>
                  <DrawerDescription>View and edit staff information</DrawerDescription>
                </DrawerHeader>
                {selectedStaff && (
                  <div className="space-y-4 p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-lg">
                        {selectedStaff.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-gray-900">{selectedStaff.name}</div>
                        <div className="text-xs text-gray-400">{selectedStaff.employeeId}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-sm font-medium">{selectedStaff.email || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="text-sm font-medium">{selectedStaff.phone || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Role</div>
                        <div className="text-sm font-medium">{selectedStaff.role}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Department</div>
                        <div className="text-sm font-medium">{selectedStaff.department}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Joining Date</div>
                        <div className="text-sm font-medium">{selectedStaff.dateOfJoining ? format(new Date(selectedStaff.dateOfJoining), 'MMM dd, yyyy') : '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Salary</div>
                        <div className="text-sm font-medium">₹{selectedStaff.salary?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <div className={`text-sm font-medium ${selectedStaff.isActive !== false ? 'text-green-600' : 'text-red-600'}`}>{selectedStaff.isActive !== false ? 'Active' : 'Inactive'}</div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>Close</Button>
                    </div>
                  </div>
                )}
              </DrawerContent>
            </Drawer>
          </TabsContent>
          
          <TabsContent value="payroll" className="space-y-4">
            <Card>
              
              <CardContent>
                {/* Payroll Tabs */}
                <Tabs defaultValue="current" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="current">Current Month</TabsTrigger>
                    <TabsTrigger value="history">Payment History</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="current" className="space-y-4">
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
                            {filteredStaff.filter(s => s.isActive !== false).map((member) => {
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
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <p className="text-xs text-gray-500 mt-1 cursor-pointer">
                                                Manual calculations
                                              </p>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <span>Manual calculations: (Original Salary ÷ 30) × Days Worked = Basic Salary</span>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
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
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="flex items-center cursor-pointer">
                                                <Calendar className="h-3 w-3" />
                                                <span>Auto calculation</span>
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <span>(₹{member.salary.toLocaleString()} ÷ 30) × {payrollDetails.attendedDays} = ₹{payrollDetails.netSalary.toLocaleString()}</span>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
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
                                  
                                  {/* Payroll Creation Indicator */}
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
                                  ₹{filteredStaff.filter(s => s.isActive !== false).reduce((sum, member) => {
                                    const details = calculatePayrollDetails(member);
                                    return sum + details.netSalary;
                                  }, 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            {/* Add a radio button or switch to toggle bulk manual input */}
                            <div className="mb-4 flex items-center gap-2">
                              <input
                                type="radio"
                                id="enable-bulk-manual"
                                checked={showBulkManualInput}
                                onChange={() => setShowBulkManualInput(!showBulkManualInput)}
                              />
                              <label htmlFor="enable-bulk-manual" className="text-sm font-medium cursor-pointer">
                                Enable Bulk Manual Input
                              </label>
                            </div>
                            
                            {showBulkManualInput && (
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
                                        Basic salarWEEEWAEWEWEy will be calculated automatically using the formula: (Original Salary ÷ 30) × days worked
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
                            )}
                            
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span>Payment Status</span>
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  {activePendingCount} Pending
                                </Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Processed</span>
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  {activeCompleteCount} Complete
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
                        <CardDescription>Complete payroll history for all staff members</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Filter Controls */}
                        <div className="mb-4 flex gap-4 items-center">
                          <div className="flex items-center gap-2">
                            <Label>Month:</Label>
                            <select 
                              value={selectedMonth} 
                              onChange={e => setSelectedMonth(Number(e.target.value))}
                              className="border rounded px-2 py-1"
                            >
                              {Array.from({length: 12}, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {new Date(2024, i).toLocaleDateString('en-IN', { month: 'long' })}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>Year:</Label>
                            <select 
                              value={selectedYear} 
                              onChange={e => setSelectedYear(Number(e.target.value))}
                              className="border rounded px-2 py-1"
                            >
                              {Array.from({length: 5}, (_, i) => {
                                const year = new Date().getFullYear() - 2 + i;
                                return (
                                  <option key={year} value={year}>{year}</option>
                                );
                              })}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>Status:</Label>
                            <select 
                              defaultValue="all"
                              onChange={e => {
                                // Filter logic can be added here
                              }}
                              className="border rounded px-2 py-1"
                            >
                              <option value="all">All Status</option>
                              <option value="processed">Processed</option>
                              <option value="pending">Pending</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Summary Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-600">Total Records</p>
                                <p className="text-2xl font-bold text-blue-700">{(payroll as Payroll[]).length}</p>
                              </div>
                              <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-600">Processed</p>
                                <p className="text-2xl font-bold text-green-700">
                                  {(payroll as Payroll[]).filter(p => p.status === 'processed').length}
                                </p>
                              </div>
                              <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                          </div>
                          <div className="p-4 bg-yellow-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-yellow-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-700">
                                  {(payroll as Payroll[]).filter(p => p.status === 'pending').length}
                                </p>
                              </div>
                              <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-purple-600">Total Amount</p>
                                <p className="text-2xl font-bold text-purple-700">
                                  ₹{(payroll as Payroll[]).reduce((sum, p) => sum + Number(p.netSalary), 0).toLocaleString()}
                                </p>
                              </div>
                              <IndianRupee className="h-8 w-8 text-purple-600" />
                            </div>
                          </div>
                        </div>
                        
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
                              <TableHead>Actions</TableHead>
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
                                  <TableCell>₹{Number(payrollRecord.basicSalary).toLocaleString()}</TableCell>
                                  <TableCell>₹{Number(payrollRecord.allowances || 0).toLocaleString()}</TableCell>
                                  <TableCell>₹{Number(payrollRecord.deductions || 0).toLocaleString()}</TableCell>
                                  <TableCell className="font-semibold text-green-600">
                                    ₹{Number(payrollRecord.netSalary).toLocaleString()}
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
                                      ? new Date(payrollRecord.generatedAt || new Date()).toLocaleDateString('en-IN')
                                      : '-'
                                    }
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleGenerateSalarySlip(staffMember)}
                                        disabled={generateSalarySlipMutation.isPending}
                                      >
                                        <FileText className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setWhatsappModal({ 
                                          open: true, 
                                          staff: staffMember, 
                                          netSalary: Number(payrollRecord.netSalary) 
                                        })}
                                        disabled={!staffMember.phone}
                                      >
                                        <MessageSquare className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          if (confirm('Are you sure you want to delete this payroll record? This action cannot be undone.')) {
                                            deletePayrollMutation.mutate(payrollRecord.id);
                                          }
                                        }}
                                        disabled={deletePayrollMutation.isPending}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            {(payroll as Payroll[]).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
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
                  
                  <TabsContent value="settings" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Payroll Settings</CardTitle>
                          <CardDescription>Configure payroll calculation parameters</CardDescription>
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
                              <Label>Working Days per Month</Label>
                              <Input 
                                type="number" 
                                defaultValue="30" 
                                placeholder="Enter working days"
                                min="1"
                                max="31"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Daily Rate Calculation</Label>
                              <Select defaultValue="30">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select calculation method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30">Salary ÷ 30 days</SelectItem>
                                  <SelectItem value="26">Salary ÷ 26 days</SelectItem>
                                  <SelectItem value="22">Salary ÷ 22 days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Allowance Settings</CardTitle>
                          <CardDescription>Configure salary allowances and benefits</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>HRA Percentage</Label>
                              <Input 
                                type="number" 
                                defaultValue="0" 
                                placeholder="Enter HRA percentage"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>PF Percentage</Label>
                              <Input 
                                type="number" 
                                defaultValue="0" 
                                placeholder="Enter PF percentage"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Transport Allowance</Label>
                              <Input 
                                type="number" 
                                defaultValue="0" 
                                placeholder="Enter transport allowance"
                                min="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Medical Allowance</Label>
                              <Input 
                                type="number" 
                                defaultValue="0" 
                                placeholder="Enter medical allowance"
                                min="0"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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
        {/* Floating Add Staff Button only for overview tab */}
        {selectedTab === "overview" && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              size="lg"
              className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              onClick={() => setIsAddStaffOpen(true)}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
      {/* Add Staff Modal */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Add Staff</DialogTitle>
            <DialogDescription>Enter new staff details below</DialogDescription>
          </DialogHeader>
          <Form {...addStaffForm}>
            <form onSubmit={addStaffForm.handleSubmit(onAddStaffSubmit)} className="space-y-4">
              <FormField control={addStaffForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} required /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={addStaffForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input {...field} type="email" value={field.value ?? ''} required /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={addStaffForm.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} required /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-4">
                <FormField control={addStaffForm.control} name="role" render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Role</FormLabel>
                    <FormControl><Input {...field} value={field.value ?? ''} required /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={addStaffForm.control} name="department" render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Department</FormLabel>
                    <FormControl><Input {...field} value={field.value ?? ''} required /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={addStaffForm.control} name="dateOfJoining" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Joining</FormLabel>
                  <FormControl><Input {...field} type="date" value={field.value ?? ''} required /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={addStaffForm.control} name="salary" render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary (₹)</FormLabel>
                  <FormControl><Input {...field} type="number" value={field.value ?? ''} required min={0} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={addStaffForm.control} name="bankAccountNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Number</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} placeholder="Enter bank account number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={addStaffForm.control} name="ifscCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} placeholder="Enter IFSC code" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={addStaffForm.control} name="panNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Number</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ''} placeholder="Enter PAN number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {/* Optional fields can be added here if needed */}
              <DialogFooter>
                <Button type="submit" disabled={addStaffForm.formState.isSubmitting}>Add Staff</Button>
                <Button type="button" variant="secondary" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}