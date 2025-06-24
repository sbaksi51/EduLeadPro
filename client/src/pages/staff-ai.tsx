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
import React from "react";
import StaffDetailModal from "@/components/staff/StaffDetailModal";
import { Textarea } from "@/components/ui/textarea";

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
  address?: string;
  qualifications?: string;
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
  status: string;
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

// Custom Tabs component for employee management
interface EmployeeTabsProps {
  activeTab: "overview" | "payroll";
  setActiveTab: (tab: "overview" | "payroll") => void;
}
const EmployeeTabs: React.FC<EmployeeTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-full bg-white relative">
      <div className="flex space-x-4 text-base font-medium relative border-b border-gray-200 ml-8 -mt-10">
        {(["overview", "payroll"] as const).map((tab) => (
          <button
            key={tab}
            className={`relative pb-2 pt-1 px-1 tracking-wide transition-colors duration-300
              ${activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-blue-500"}`}
            onClick={() => setActiveTab(tab)}
            style={{ outline: "none" }}
          >
            {tab === "overview" ? "Overview" : "Payroll"}
            {activeTab === tab && (
              <span
                className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-blue-600 rounded transition-all duration-300"
                style={{
                  boxShadow: "0 2px 8px 0 rgba(37, 99, 235, 0.15)",
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function StaffAI() {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [payrollGenerationOpen, setPayrollGenerationOpen] = useState(false);
  const [bulkPayrollOpen, setBulkPayrollOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useHashState("overview");
  const [activeTab, setActiveTab] = useState<"overview" | "payroll">("overview");
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
  const [showImportModal, setShowImportModal] = useState(false);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      fetchPayrollOverview();
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
      fetchPayrollOverview();
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
    // Use editablePayrollData for attendedDays and basicSalary if available
    const payrollEdit = editablePayrollData[staffMember.id] || {};
    const attendedDays = payrollEdit.attendedDays !== undefined ? payrollEdit.attendedDays : 30;
    const basicSalary = payrollEdit.basicSalary !== undefined ? payrollEdit.basicSalary : staffMember.salary;
    const totalAllowances = 0;
    const absentDays = 30 - Number(attendedDays);
    const dailyRate = Number(basicSalary) / 30;
    const absentDeduction = absentDays * dailyRate;
    const totalDeductions = absentDeduction;
    const netSalary = (Number(basicSalary) / 30) * Number(attendedDays);

    // Ensure all required fields are present and correct
    const payrollData = {
      staffId: staffMember.id,
      month: selectedMonth,
      year: selectedYear,
      basicSalary: Number(basicSalary),
      allowances: Number(totalAllowances),
      deductions: Number(totalDeductions),
      overtime: 0,
      netSalary: Number(netSalary),
      attendedDays: Number(attendedDays),
      status: 'processed',
      workingDays: 30,
      overtimeHours: 0,
      employeeName: staffMember.name,
    };

    setLocallyGeneratedPayrolls(prev => {
      const newSet = new Set(prev);
      newSet.add(staffMember.id);
      return newSet;
    });

    generatePayrollMutation.mutate(payrollData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
        fetchPayrollOverview();
      }
    });
  };

  const handleBulkPayrollGeneration = () => {
    const payrollDataArray = filteredStaff.map(staffMember => {
      const manualInput = manualPayrollInputs[staffMember.id];
      let attendedDays: number;
      let basicSalary: number;
      let absentDays: number = 0;

      if (manualInput && manualInput.isManual && manualInput.daysWorked !== '') {
        attendedDays = Number(manualInput.daysWorked);
        absentDays = 30 - attendedDays;
        const dailyRate = Number(staffMember.salary) / 30;
        basicSalary = dailyRate * attendedDays;
      } else {
        const staffAttendance = (attendance as Attendance[]).filter(
          a => a.staffId === staffMember.id && 
          a.date && !isNaN(new Date(a.date).getTime()) &&
          new Date(a.date).getMonth() + 1 === selectedMonth &&
          new Date(a.date).getFullYear() === selectedYear
        );
        attendedDays = staffAttendance.filter(a => a.status === 'present').length;
        absentDays = 30 - attendedDays;
        const dailyRate = Number(staffMember.salary) / 30;
        basicSalary = dailyRate * attendedDays;
      }

      const totalAllowances = 0;
      const dailyRate = Number(staffMember.salary) / 30;
      const absentDeduction = absentDays * dailyRate;
      const totalDeductions = absentDeduction;
      const netSalary = basicSalary - totalDeductions;

      return {
        staffId: staffMember.id,
        month: selectedMonth,
        year: selectedYear,
        basicSalary: Number(basicSalary),
        allowances: Number(totalAllowances),
        deductions: Number(totalDeductions),
        overtime: 0,
        netSalary: Number(netSalary),
        attendedDays: Number(attendedDays),
        status: 'processed',
        workingDays: 30,
        overtimeHours: 0,
        employeeName: staffMember.name,
      };
    });

    setLocallyGeneratedPayrolls(prev => {
      const newSet = new Set(prev);
      filteredStaff.forEach(s => newSet.add(s.id));
      return newSet;
    });

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
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      fetchPayrollOverview(); // Update payroll overview after adding staff
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
  const clearPayrollLocalStorage = async () => {
    const key1 = `editablePayrollData_${selectedMonth}_${selectedYear}`;
    const key2 = `manualPayrollInputs_${selectedMonth}_${selectedYear}`;
    localStorage.removeItem(key1);
    localStorage.removeItem(key2);
    setEditablePayrollData({});
    setManualPayrollInputs({});

    // If any selected employees have status 'processed', set them to 'pending' in the backend
    if (selectedPayrollStaff.length > 0) {
      await Promise.all(selectedPayrollStaff.map(async (staffId) => {
        // Find the payroll record for this staff for the current month/year
        const payrollRecord = (payroll as Payroll[]).find(
          p => p.staffId === staffId && p.month === selectedMonth && p.year === selectedYear && p.status === 'processed'
        );
        if (payrollRecord) {
          // Update the payroll status to 'pending' via API
          await fetch(`/api/payroll/${payrollRecord.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'pending' })
          });
        }
      }));
      await fetchPayrollOverview();
    }
    setSelectedPayrollStaff([]);
    toast({
      title: "Payroll Data Cleared",
      description: "Local payroll data and selected processed employees have been reset to pending.",
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
    const search = searchQuery.trim().toLowerCase();
    return displayStaff.filter((member: Staff) => {
      if (search === "") return true;
      if (/^[a-z]$/i.test(search)) {
        // Single letter: match name startsWith only
        return member.name.toLowerCase().startsWith(search);
      } else if (/^\d+$/.test(search)) {
        // Only numbers: match phone
        return member.phone && member.phone.includes(search);
      } else if (search.includes("@")) {
        // Contains @: match email
        return member.email && member.email.toLowerCase().includes(search);
      } else {
        // Default: match name startsWith
        return member.name.toLowerCase().startsWith(search);
      }
    })
    .filter((member: Staff) => {
      const normalizedRole = member.role ? member.role.toLowerCase().trim() : '';
      const normalizedRoleFilter = roleFilter.toLowerCase().trim();
      const matchesRole = normalizedRoleFilter === 'all' || normalizedRole === normalizedRoleFilter;
      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
      return matchesRole && matchesDepartment;
    });
  }, [displayStaff, searchQuery, roleFilter, departmentFilter]);

  // Pagination and sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
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

  useEffect(() => {
    // Fallback to previous page if current page becomes empty after deletion
    if (page > 1 && paginatedStaff.length === 0 && sortedStaff.length > 0) {
      setPage(page - 1);
    }
  }, [paginatedStaff, page, sortedStaff.length]);

  const handleSort = (key: 'name' | 'role' | 'salary' | 'dateOfJoining') => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
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
      employeeName: staffMember.name, // Add employee name for PDF filename
      status: 'processed' // Set status to processed so download button becomes visible
    };
    
    // First save the payroll data to ensure it exists in the database
    generatePayrollMutation.mutate(payrollData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
        fetchPayrollOverview();
      }
    });
  };

  // For dashboard counts, only count active staff
  const [payrollOverview, setPayrollOverview] = useState<any[]>([]);

  const activePendingCount = payrollOverview.filter(s => s.isActive !== false && s.payrollStatus === 'pending').length;
  const activeCompleteCount = payrollOverview.filter(s => s.isActive !== false && s.payrollStatus === 'processed').length;

  // 2. Fetch payroll overview data when month/year changes or on mount
  const fetchPayrollOverview = async () => {
    try {
      const response = await fetch(`/api/payroll/overview?month=${selectedMonth}&year=${selectedYear}`);
      const data = await response.json();
      setPayrollOverview(data);
    } catch (error) {
      setPayrollOverview([]);
    }
  };

  useEffect(() => {
    fetchPayrollOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  // Add this useEffect to refetch staff when switching to payroll tab
  useEffect(() => {
    if (activeTab === "payroll") {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    }
  }, [activeTab, queryClient]);

  // 1. Add state for selected employees
  const [selectedPayrollStaff, setSelectedPayrollStaff] = useState<number[]>([]);

  // 2. Checkbox handler
  const handlePayrollCheckboxChange = (staffId: number, checked: boolean) => {
    setSelectedPayrollStaff(prev => checked ? [...prev, staffId] : prev.filter(id => id !== staffId));
  };

  // 3. Bulk generate handler
  const handleGenerateSelectedPayroll = () => {
    const selectedStaffMembers = filteredStaff.filter(s => selectedPayrollStaff.includes(s.id));
    selectedStaffMembers.forEach(staffMember => handleGeneratePayroll(staffMember));
  };

  // 1. Download button handler for a single employee
  const handleDownloadSalarySlip = (staffMember: Staff) => {
    // Find payroll for this staff for selected month/year
    const payrollRecord = (payroll as Payroll[]).find(
      p => p.staffId === staffMember.id && p.month === selectedMonth && p.year === selectedYear
    );
    if (!payrollRecord) {
      toast({ title: 'No payroll found', description: 'Payroll not found for this employee for the selected month.' });
      return;
    }
    generateSalarySlipMutation.mutate({
      staffId: staffMember.id,
      month: selectedMonth,
      year: selectedYear,
      workingDays: 30,
      attendedDays: payrollRecord.attendedDays ?? 30,
      overtimeHours: 0,
      basicSalary: payrollRecord.basicSalary,
      allowances: payrollRecord.allowances,
      deductions: payrollRecord.deductions,
      netSalary: payrollRecord.netSalary,
      employeeName: staffMember.name,
      status: payrollRecord.status
    });
  };

  // 2. Download selected payslips for all checked employees
  const handleDownloadSelectedSalarySlips = () => {
    const selectedStaffMembers = filteredStaff.filter(s => selectedPayrollStaff.includes(s.id));
    selectedStaffMembers.forEach(staffMember => handleDownloadSalarySlip(staffMember));
  };

  return (
    <div className="space-y-10">
      <div className="bg-white" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }}>
        <div className="max-w-[120rem] mx-auto" style={{ borderBottom: 'none' }}>
          <Header 
            title="Employee Management" 
            subtitle="Manage and track all employees efficiently"
          />
        </div>
      </div>
      <div className="max-w-[120rem] mx-auto">
        <EmployeeTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "overview" && (
          <div className="space-y-6 font-sans">
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 md:p-4">
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                          <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100 text-sm font-normal">
                        {paginatedStaff.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No staff found</td>
                          </tr>
                        ) : (
                          paginatedStaff.map((member) => (
                            <tr key={member.id} className="hover:bg-blue-50/40 transition cursor-pointer group" onClick={() => { setSelectedStaff(member); setIsDrawerOpen(true); }}>
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
            {/* Staff Details Modal */}
            <StaffDetailModal
              staff={selectedStaff}
              open={!!selectedStaff}
              onOpenChange={(open) => {
                if (!open) setSelectedStaff(null);
              }}
              onStaffUpdated={async () => {
                if (selectedStaff) {
                  const response = await apiRequest("GET", `/api/staff/${selectedStaff.id}`);
                  const updatedStaff = await response.json();
                  setSelectedStaff(updatedStaff);
                }
                queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
                queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
                fetchPayrollOverview();
              }}
              fetchPayrollOverview={fetchPayrollOverview}
            />
          </div>
        )}
        {activeTab === "payroll" && (
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
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="border rounded px-2 py-1"
                          >
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {new Date(new Date().getFullYear(), i).toLocaleDateString('en-IN', { month: 'long' })}
                              </option>
                            ))}
                          </select>
                          <span>{selectedYear}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Payroll Controls */}
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                        <div className="flex gap-4 flex-1">
                          <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search staff by name or ID..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Departments</SelectItem>
                              {Array.from(new Set(filteredStaff.map(s => s.department).filter(Boolean))).map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button
                            variant="outline"
                            onClick={clearPayrollLocalStorage}
                            className="flex items-center gap-2"
                          >
                            Clear Data
                            <Trash2 size={16} />
                          </Button>
                          <Button
                            onClick={handleGenerateSelectedPayroll}
                            disabled={selectedPayrollStaff.length === 0}
                            className="flex items-center gap-2"
                          >
                            <Calculator className="mr-2 h-4 w-4" />
                            Generate Selected
                          </Button>
                          <Button
                            onClick={handleDownloadSelectedSalarySlips}
                            disabled={selectedPayrollStaff.length === 0}
                            className="flex items-center gap-2"
                          >
                            Download Selected
                          </Button>
                        </div>
                      </div>

                      {/* Payroll Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                        
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <div className="text-center">
                            <p className="text-sm text-blue-600 font-medium">Active Employees</p>
                            <p className="text-2xl font-bold text-blue-700">
                              {filteredStaff.filter(s => s.isActive !== false).length}
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                          <div className="text-center">
                            <p className="text-sm text-purple-600 font-medium">Processed Payrolls</p>
                            <p className="text-2xl font-bold text-purple-700">
                              {activeCompleteCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payroll Table */}
                      <Card className="border rounded-lg overflow-hidden">
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                  <th className="px-4 py-3"><input type="checkbox" checked={selectedPayrollStaff.length === payrollOverview.filter(s => s.isActive !== false).length && payrollOverview.filter(s => s.isActive !== false).length > 0} onChange={e => setSelectedPayrollStaff(e.target.checked ? payrollOverview.filter(s => s.isActive !== false).map(s => s.id) : [])} /></th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Worked</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-100 text-sm font-normal">
                                {payrollOverview.filter(s => s.isActive !== false).length === 0 ? (
                                  <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-400">No active staff found</td>
                                  </tr>
                                ) : (
                                  payrollOverview.filter(s => s.isActive !== false).map((member) => {
                                    const payrollStatus = member.payrollStatus;
                                    const payroll = member.payroll;
                                    return (
                                      <tr key={member.id}>
                                        <td className="px-4 py-2"><input type="checkbox" checked={selectedPayrollStaff.includes(member.id)} onChange={e => handlePayrollCheckboxChange(member.id, e.target.checked)} /></td>
                                        <td className="px-6 py-4 font-medium">{member.name}<div className="text-xs text-gray-500">{member.employeeId}</div></td>
                                        <td className="px-6 py-4">
                                          {payrollStatus !== 'processed' ? (
                                            <Input
                                              type="number"
                                              min={0}
                                              max={30}
                                              value={editablePayrollData[member.id]?.attendedDays ?? (payroll ? payroll.attendedDays : 30)}
                                              onChange={e => handlePayrollDataChange(member.id, 'attendedDays', e.target.value)}
                                              className="w-20 text-center"
                                            />
                                          ) : (
                                            payroll ? payroll.attendedDays : '-'
                                          )}
                                        </td>
                                        <td className="px-6 py-4">₹{payroll ? Number(payroll.basicSalary).toLocaleString() : Number(member.salary).toLocaleString()}</td>
                                        <td className="px-6 py-4">₹{payroll ? Number(payroll.allowances).toLocaleString() : '0'}</td>
                                        <td className="px-6 py-4">₹{payroll ? Number(payroll.deductions).toLocaleString() : '0'}</td>
                                        <td className="px-6 py-4 font-bold text-green-600">₹{payroll ? Number(payroll.netSalary).toLocaleString() : Number(member.salary).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                          <span className={
                                            payrollStatus === 'processed' ? 'bg-green-100 text-green-800 px-2 py-1 rounded' :
                                            payrollStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded' :
                                            'bg-red-100 text-red-800 px-2 py-1 rounded'
                                          }>
                                            {payrollStatus}
                                          </span>
                                        </td>
                                        <td className="px-8 py-4">
                                          {payrollStatus !== 'processed' ? (
                                            <Button size="sm" onClick={() => handleGeneratePayroll(member)}>
                                              Generate
                                            </Button>
                                          ) : (
                                            <div className="flex gap-2">
                                              <Button size="sm" onClick={e => { e.stopPropagation(); handleDownloadSalarySlip(member); }} disabled={payrollStatus !== 'processed'}>
                                                Download
                                              </Button>
                                              <Button size="sm" onClick={() => setWhatsappModal({ open: true, staff: member, netSalary: payroll ? payroll.netSalary : 0 })}>
                                                Notify
                                              </Button>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
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
        )}
      </div>
      {activeTab === "overview" && (
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
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Enter the details for the new Employee below</DialogDescription>
          </DialogHeader>
          <Form {...addStaffForm}>
            <form onSubmit={addStaffForm.handleSubmit(onAddStaffSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField control={addStaffForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input {...field} value={field.value ?? ''} required placeholder="e.g. John Doe" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={addStaffForm.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input {...field} value={field.value ?? ''} required placeholder="e.g. +91 12345 67890" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={addStaffForm.control} name="role" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl><Input {...field} value={field.value ?? ''} required placeholder="e.g. Counselor" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={addStaffForm.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value ?? ''} 
                          placeholder="Enter employee address"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={addStaffForm.control} name="salary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary (₹)</FormLabel>
                      <FormControl><Input {...field} type="number" value={field.value ?? ''} required min={0} placeholder="e.g. 50000" /></FormControl>
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
                </div>
                <div className="space-y-4">
                  <FormField control={addStaffForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input {...field} type="email" value={field.value ?? ''} required placeholder="e.g. john.doe@example.com" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={addStaffForm.control} name="dateOfJoining" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Joining</FormLabel>
                      <FormControl><Input {...field} type="date" value={field.value ?? ''} required /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={addStaffForm.control} name="department" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={addStaffForm.control} name="qualifications" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualifications</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value ?? ''} 
                          placeholder="Enter employee qualifications (e.g., B.Tech, MBA, etc.)"
                          rows={3}
                        />
                      </FormControl>
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
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={addStaffForm.formState.isSubmitting}>
                  {addStaffForm.formState.isSubmitting ? "Adding..." : "Add Staff"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* WhatsApp Modal */}
      <Dialog open={whatsappModal.open} onOpenChange={(open) => setWhatsappModal({ ...whatsappModal, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Notification</DialogTitle>
            <DialogDescription>
              Send salary credited notification to {whatsappModal.staff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Message Preview</span>
              </div>
              <div className="text-sm text-green-700 whitespace-pre-line">
                {whatsappModal.staff && getSalaryCreditedMessage(whatsappModal.staff, whatsappModal.netSalary)}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Phone: {whatsappModal.staff?.phone || 'No phone number available'}</p>
              <p>Net Salary: ₹{whatsappModal.netSalary.toLocaleString()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setWhatsappModal({ open: false, staff: null, netSalary: 0 })}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (whatsappModal.staff?.phone) {
                  const message = getSalaryCreditedMessage(whatsappModal.staff, whatsappModal.netSalary);
                  const whatsappUrl = `https://wa.me/${whatsappModal.staff.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                  setWhatsappModal({ open: false, staff: null, netSalary: 0 });
                  toast({
                    title: "WhatsApp Opened",
                    description: "WhatsApp has been opened with the salary notification message.",
                  });
                } else {
                  toast({
                    title: "No Phone Number",
                    description: "This employee doesn't have a phone number registered.",
                    variant: "destructive"
                  });
                }
              }}
              disabled={!whatsappModal.staff?.phone}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Open WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}