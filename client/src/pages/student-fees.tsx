import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { 
  CreditCard,
  TrendingUp,
  AlertCircle, 
  Bot,
  Calendar,
  Building,
  User,
  Plus,
  Download,
  Eye,
  Settings,
  Search,
  Phone,
  Mail,
  Calculator,
  Clock,
  Percent,
  IndianRupee,
  CheckCircle,
  Info,
  Trash2 
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useHashState } from "@/hooks/use-hash-state";
import { type LeadWithCounselor } from "@shared/schema";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Student {
  id: number;
  name: string;
  studentId: string;
  class: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
}

interface FeeStructure {
  id: number;
  studentId: number;
  feeType: string;
  amount: string;
  dueDate: string;
  status: string;
  installmentNumber: number;
  totalInstallments: number;
}

interface FeePayment {
  id: number;
  leadId: number;
  amount: string;
  discount: string;
  paymentDate: string;
  paymentMode: string;
  receiptNumber?: string;
  installmentNumber?: number;
  transactionId?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EMandate {
  id: number;
  leadId: number;
  mandateId: string;
  status: string;
  bankName: string;
  bankAccount: string;
  ifscCode: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
  frequency?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FeeStats {
  totalPending: number;
  collectionRate: number;
  totalOverdue: number;
}

interface ClassFeeStructure {
  id: number;
  className: string;
  feeType: string;
  amount: string;
  frequency: string;
  dueDate: string;
  description?: string;
}

interface MasterFee {
  id: number;
  className: string;
  feeType: string;
  amount: string;
  frequency: string;
  dueDate: string;
  description?: string;
  isActive: boolean;
}

interface CombinedStudent {
  id: number;
  name: string;
  studentId: string;
  class: string;
  parentName?: string | null;
  parentPhone?: string | null;
  type: 'student' | 'enrolled_lead';
  source: string;
  email?: string | null;
  phone?: string | null;
  stream?: string | null;
  status?: string;
  counselor?: any;
  createdAt?: Date;
  lastContactedAt?: Date | null;
}

interface GlobalClassFee {
  id: number;
  className: string;
  feeType: string;
  amount: string;
  frequency: string;
  academicYear: string;
  description?: string;
  isActive: boolean;
}

interface EmiPlan {
  id: number;
  studentId: number;
  planType: string;
  totalAmount: string;
  emiPeriod: number;
  emiAmount: string;
  downPayment: string;
  discount: string;
  interestRate: string;
  startDate: string;
  frequency: string;
  processingFee: string;
  lateFee: string;
  receiptNumber?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function StudentFees() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [addMandateOpen, setAddMandateOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useHashState("overview");
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeStructure | null>(null);
  const [addClassFeeOpen, setAddClassFeeOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [setClassFeeOpen, setSetClassFeeOpen] = useState(false);
  const [editingClassFee, setEditingClassFee] = useState<ClassFeeStructure | null>(null);
  const [emiModalOpen, setEmiModalOpen] = useState(false);
  const [emiEditingFee, setEmiEditingFee] = useState<FeeStructure | null>(null);
  const [emiData, setEmiData] = useState<Record<number, {emiPeriod: string, paidAmount: string, emiDues: string}>>({});
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [mandateFrequency, setMandateFrequency] = useState("monthly");
  const [globalFeeModalOpen, setGlobalFeeModalOpen] = useState(false);
  const [editingGlobalFee, setEditingGlobalFee] = useState<GlobalClassFee | null>(null);
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [viewTotalFeesModalOpen, setViewTotalFeesModalOpen] = useState(false);
  const [selectedClassForTotal, setSelectedClassForTotal] = useState<string>("");
  
  // Payment management state
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);
  const [paymentViewDetailsOpen, setPaymentViewDetailsOpen] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentDateFilter, setPaymentDateFilter] = useState("all");
  const [paymentModeFilter, setPaymentModeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const [paymentsPerPage, setPaymentsPerPage] = useState(10);
  const [paymentStats, setPaymentStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    totalFailed: 0,
    monthlyCollection: 0,
    collectionRate: 0
  });
  
  // EMI Payment Modal state
  const [emiPaymentModalOpen, setEmiPaymentModalOpen] = useState(false);
  const [selectedEmiPlan, setSelectedEmiPlan] = useState<EmiPlan | null>(null);
  const [emiPaymentFormData, setEmiPaymentFormData] = useState({
    installmentNumber: 1,
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: '',
    receiptNumber: '',
    transactionId: '',
    status: 'completed'
  });

  // EMI Payment Progress state
  const [emiPaymentProgress, setEmiPaymentProgress] = useState<any>(null);
  const [pendingEmis, setPendingEmis] = useState<any[]>([]);

  // Query for EMI payment progress
  const { data: emiProgressData, refetch: refetchEmiProgress } = useQuery({
    queryKey: ["/api/emi-plans", selectedEmiPlan?.id, "payment-progress"],
    queryFn: async () => {
      if (!selectedEmiPlan) return null;
      const response = await fetch(`/api/emi-plans/${selectedEmiPlan.id}/payment-progress`);
      if (!response.ok) throw new Error('Failed to fetch EMI progress');
      return response.json();
    },
    enabled: !!selectedEmiPlan,
  });

  // Query for pending EMIs
  const { data: pendingEmisData, refetch: refetchPendingEmis } = useQuery({
    queryKey: ["/api/emi-plans", selectedEmiPlan?.id, "pending-emis"],
    queryFn: async () => {
      if (!selectedEmiPlan) return [];
      const response = await fetch(`/api/emi-plans/${selectedEmiPlan.id}/pending-emis`);
      if (!response.ok) throw new Error('Failed to fetch pending EMIs');
      return response.json();
    },
    enabled: !!selectedEmiPlan,
  });

  // Payment form state
  const [paymentFormData, setPaymentFormData] = useState({
    studentSelect: "",
    amount: "",
    discount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: "",
    receiptNumber: "",
    installmentNumber: "",
    transactionId: "",
    status: "completed"
  });

  // EMI Modal state
  const [paymentType, setPaymentType] = useState<'emi' | 'full'>('emi');
  const [selectedStudentForEMI, setSelectedStudentForEMI] = useState<CombinedStudent | null>(null);
  const [emiFormData, setEmiFormData] = useState({
    totalAmount: '',
    emiPeriod: '12',
    emiAmount: '',
    downPayment: '0',
    interestRate: '0',
    startDate: new Date().toISOString().split('T')[0],
    frequency: 'monthly',
    processingFee: '0',
    lateFee: '0',
    receiptNumber: '',
    discount: ''
  });

  // Fetch data
  const { data: students = [] } = useQuery<Student[]>({ queryKey: ["/api/students"] });
  const { data: feeStructures = [] } = useQuery<FeeStructure[]>({ queryKey: ["/api/fee-structures"] });
  const { data: feePayments = [] } = useQuery<FeePayment[]>({ queryKey: ["/api/fee-payments"] });
  const { data: eMandates = [], refetch: refetchEMandates } = useQuery<EMandate[]>({ queryKey: ["/api/e-mandates"] });
  const { data: feeStats } = useQuery<FeeStats>({ queryKey: ["/api/fee-stats"] });
  const { data: classFeeStructures = [] } = useQuery<ClassFeeStructure[]>({ queryKey: ["/api/class-fee-structures"] });
  const { data: globalClassFees = [], refetch: refetchGlobalFees } = useQuery<GlobalClassFee[]>({ queryKey: ["/api/global-class-fees"] });
  const { data: emiPlans = [], refetch: refetchEmiPlans } = useQuery<EmiPlan[]>({ queryKey: ["/api/emi-plans"] });
  
  // Fetch enrolled leads
  const { data: enrolledLeads = [], refetch: refetchLeads } = useQuery<LeadWithCounselor[]>({ 
    queryKey: ["/api/leads", "enrolled"],
    queryFn: async () => {
      const response = await fetch("/api/leads?status=enrolled");
      return response.json();
    },
  });

  // Add class fee structure mutation
  const addClassFeeMutation = useMutation({
    mutationFn: async (data: Partial<ClassFeeStructure> & { studentIds?: number[] }) => {
      const response = await fetch("/api/class-fee-structures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to add class fee structure");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-fee-structures"] });
      setAddClassFeeOpen(false);
      toast({
        title: "Success",
        description: "Class fee structure added successfully",
      });
    },
  });

  // Global class fee mutation
  const globalClassFeeMutation = useMutation({
    mutationFn: async (data: Partial<GlobalClassFee>) => {
      const url = editingGlobalFee ? `/api/global-class-fees/${editingGlobalFee.id}` : "/api/global-class-fees";
      const method = editingGlobalFee ? "PUT" : "POST";
      
      console.log("Sending global class fee data:", data);
      console.log("URL:", url);
      console.log("Method:", method);
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Failed to save global class fee: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("API success response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/global-class-fees"] });
      setGlobalFeeModalOpen(false);
      setEditingGlobalFee(null);
      toast({
        title: "Success",
        description: `Global class fee ${editingGlobalFee ? "updated" : "created"} successfully`,
      });
    },
    onError: (error) => {
      console.error("Global class fee mutation error:", error);
      toast({
        title: "Error",
        description: `Failed to save global class fee: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add E-Mandate mutation
  const addEMandateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Sending E-Mandate data to API:", data);
      const response = await fetch("/api/e-mandates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log("API response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Failed to create E-Mandate: ${errorText}`);
      }
      const result = await response.json();
      console.log("API success response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/e-mandates"] });
      setAddMandateOpen(false);
      setSelectedStudent(null);
      toast({
        title: "Success",
        description: "E-Mandate created successfully",
      });
    },
    onError: (error) => {
      console.error("E-Mandate creation error:", error);
      toast({
        title: "Error",
        description: `Failed to create E-Mandate: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Sending payment data to API:", data);
      const response = await fetch("/api/fee-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log("API response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Failed to record payment: ${errorText}`);
      }
      const result = await response.json();
      console.log("API success response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fee-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fee-stats"] });
      setAddPaymentOpen(false);
      setEmiPaymentModalOpen(false);
      resetPaymentForm();
      resetEmiPaymentForm();
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    },
    onError: (error) => {
      console.error("Payment recording error:", error);
      toast({
        title: "Error",
        description: `Failed to record payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add EMI plan mutation
  const addEmiPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Sending EMI plan data to API:", data);
      const response = await fetch("/api/emi-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log("API response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Failed to create EMI plan: ${errorText}`);
      }
      const result = await response.json();
      console.log("API success response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emi-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fee-payments"] });
      setEmiModalOpen(false);
      resetEmiForm();
      toast({
        title: "Success",
        description: "EMI plan created successfully",
      });
    },
    onError: (error) => {
      console.error("EMI plan creation error:", error);
      toast({
        title: "Error",
        description: `Failed to create EMI plan: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getStudentFees = (studentId: number) => {
    return feeStructures.filter((f: FeeStructure) => f.studentId === studentId);
  };

  const getStudentPayments = (studentId: number) => {
    return feePayments.filter((p: FeePayment) => p.leadId === studentId);
  };

  const getStudentMandate = (studentId: number) => {
    return eMandates.find((m: EMandate) => m.leadId === studentId);
  };

  const calculateTotalFees = (fees: FeeStructure[]) => {
    return fees.reduce((sum: number, fee: FeeStructure) => sum + parseFloat(fee.amount), 0);
  };

  const calculatePaidAmount = (payments: FeePayment[]) => {
    return payments.reduce((sum: number, payment: FeePayment) => sum + parseFloat(payment.amount), 0);
  };

  const calculateOutstanding = (studentId: number) => {
    const fees = getStudentFees(studentId);
    const payments = getStudentPayments(studentId);
    
    const totalFees = calculateTotalFees(fees);
    const totalPaid = calculatePaidAmount(payments);
    
    return Math.max(0, totalFees - totalPaid);
  };

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddClassFee = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const classFeeData: Partial<ClassFeeStructure> & { studentIds?: number[] } = {
      className: formData.get("className")?.toString() || "",
      feeType: formData.get("feeType")?.toString() || "",
      amount: formData.get("amount")?.toString() || "",
      frequency: formData.get("frequency")?.toString() || "",
      dueDate: formData.get("dueDate")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      studentIds: selectedStudentIds,
    };
    addClassFeeMutation.mutate(classFeeData);
  };

  const handleGlobalClassFee = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const globalFeeData: Partial<GlobalClassFee> = {
      className: formData.get("className")?.toString() || "",
      feeType: formData.get("feeType")?.toString() || "",
      amount: formData.get("amount")?.toString() || "",
      frequency: formData.get("frequency")?.toString() || "",
      academicYear: formData.get("academicYear")?.toString() || academicYear,
      description: formData.get("description")?.toString() || "",
      isActive: formData.get("isActive") === "true",
    };
    globalClassFeeMutation.mutate(globalFeeData);
  };

  const handleAddEMandate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      leadId: selectedStudent?.id,
      mandateId: `MAND${Date.now()}`,
      bankName: formData.get("bankName"),
      accountNumber: formData.get("accountNumber"),
      ifscCode: formData.get("ifscCode"),
      accountHolderName: formData.get("accountHolderName"),
      maxAmount: formData.get("maxAmount"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      frequency: mandateFrequency,
      status: "active",
    };
    
    console.log("Creating E-Mandate with data:", data);
    console.log("Selected student:", selectedStudent);
    
    addEMandateMutation.mutate(data);
  };

  // Use API data directly
  const displayStudents = students;
  const displayFeeStructures = feeStructures;
  const displayFeePayments = feePayments;
  const displayEMandates = eMandates;

  // Combine students and enrolled leads for display
  const allStudents: CombinedStudent[] = [
    ...displayStudents.map(student => ({
      ...student,
      type: 'student' as const,
      source: 'student_record',
      email: (student as any).email,
      phone: (student as any).phone,
      stream: (student as any).stream,
      status: (student as any).status,
      counselor: (student as any).counselor,
      createdAt: (student as any).createdAt,
      lastContactedAt: (student as any).lastContactedAt
    })),
    ...enrolledLeads.map(lead => ({
      id: lead.id,
      name: lead.name,
      studentId: `L${lead.id}`,
      class: lead.class,
      parentName: lead.parentName,
      parentPhone: lead.parentPhone,
      type: 'enrolled_lead' as const,
      source: lead.source,
      counselor: lead.counselor,
      email: lead.email,
      phone: lead.phone,
      stream: lead.stream,
      status: lead.status,
      createdAt: lead.createdAt,
      lastContactedAt: lead.lastContactedAt
    }))
  ];

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enrolled": return "bg-green-100 text-green-800";
      case "interested": return "bg-yellow-100 text-yellow-800";
      case "contacted": return "bg-purple-100 text-purple-800";
      case "new": return "bg-blue-100 text-blue-800";
      case "dropped": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Reset currentPage when filters/search/page size change
  useEffect(() => { 
    setCurrentPage(1); 
  }, [classFilter, statusFilter, studentSearch, studentsPerPage]);

  const handleDeleteMandate = async (mandateId: number) => {
    await fetch(`/api/e-mandates/${mandateId}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ["/api/e-mandates"] });
    queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
  };

  // Utility functions for global class fees
  const calculateClassTotalFees = (className: string, academicYear: string) => {
    const classFees = globalClassFees.filter(fee => 
      fee.className === className && 
      fee.academicYear === academicYear &&
      fee.isActive
    );
    return classFees.reduce((total, fee) => total + parseFloat(fee.amount), 0);
  };

  const getClassFeeBreakdown = (className: string, academicYear: string) => {
    return globalClassFees.filter(fee => 
      fee.className === className && 
      fee.academicYear === academicYear &&
      fee.isActive
    );
  };

  const handleViewTotalFees = (className: string) => {
    setSelectedClassForTotal(className);
    setViewTotalFeesModalOpen(true);
  };

  const applyGlobalFeesToStudent = (studentId: number, className: string, academicYear: string) => {
    const classFees = getClassFeeBreakdown(className, academicYear);
    // This would typically create individual fee structures for the student
    // based on the global class fees
    return classFees.map(fee => ({
      studentId,
      feeType: fee.feeType,
      amount: fee.amount,
      frequency: fee.frequency,
      academicYear: fee.academicYear,
      status: "pending"
    }));
  };

  // Calculate payment statistics
  useEffect(() => {
    const calculatePaymentStats = () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const totalCollected = displayFeePayments
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const totalPending = displayFeePayments
        .filter(p => p.status === "pending")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const totalFailed = displayFeePayments
        .filter(p => p.status === "failed")
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const monthlyCollection = displayFeePayments
        .filter(p => {
          const paymentDate = new Date(p.paymentDate);
          return p.status === "completed" && 
                 paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const totalExpected = allStudents.reduce((sum, student) => {
        const classFees = globalClassFees.filter(fee => 
          fee.className === student.class && 
          fee.academicYear === academicYear && 
          fee.isActive
        );
        return sum + classFees.reduce((classSum, fee) => classSum + parseFloat(fee.amount), 0);
      }, 0);
      
      const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
      
      setPaymentStats({
        totalCollected,
        totalPending,
        totalFailed,
        monthlyCollection,
        collectionRate
      });
    };
    
    calculatePaymentStats();
  }, [displayFeePayments, allStudents, globalClassFees, academicYear]);

  // Filter payments
  const filteredPayments = displayFeePayments.filter((payment) => {
    const student = allStudents.find(s => s.id === payment.leadId);
    if (!student) return false;
    
    const matchesSearch = student.name.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                         payment.receiptNumber?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                         payment.transactionId?.toLowerCase().includes(paymentSearch.toLowerCase());
    
    const matchesDate = paymentDateFilter === "all" || (() => {
      const paymentDate = new Date(payment.paymentDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      switch (paymentDateFilter) {
        case "today": return paymentDate >= today;
        case "yesterday": return paymentDate >= yesterday && paymentDate < today;
        case "this-week": return paymentDate >= thisWeek;
        case "this-month": return paymentDate >= thisMonth;
        default: return true;
      }
    })();
    
    const matchesMode = paymentModeFilter === "all" || payment.paymentMode === paymentModeFilter;
    const matchesStatus = paymentStatusFilter === "all" || payment.status === paymentStatusFilter;
    
    return matchesSearch && matchesDate && matchesMode && matchesStatus;
  });

  const totalPaymentPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (paymentCurrentPage - 1) * paymentsPerPage, 
    paymentCurrentPage * paymentsPerPage
  );

  // Reset payment page when filters change
  useEffect(() => {
    setPaymentCurrentPage(1);
  }, [paymentSearch, paymentDateFilter, paymentModeFilter, paymentStatusFilter, paymentsPerPage]);

  const handleAddPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate required fields
    if (!paymentFormData.studentSelect || !paymentFormData.amount || !paymentFormData.paymentDate || !paymentFormData.paymentMode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const data = {
      leadId: parseInt(paymentFormData.studentSelect),
      amount: paymentFormData.amount,
      discount: paymentFormData.discount || "0",
      paymentDate: paymentFormData.paymentDate,
      paymentMode: paymentFormData.paymentMode,
      receiptNumber: paymentFormData.receiptNumber || undefined,
      installmentNumber: paymentFormData.installmentNumber ? parseInt(paymentFormData.installmentNumber) : undefined,
      transactionId: paymentFormData.transactionId || undefined,
      status: paymentFormData.status
    };
    
    console.log("Recording payment with data:", data);
    console.log("Selected student:", selectedStudent);
    
    addPaymentMutation.mutate(data);
  };

  const resetPaymentForm = () => {
    setPaymentFormData({
      studentSelect: "",
      amount: "",
      discount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: "",
      receiptNumber: "",
      installmentNumber: "",
      transactionId: "",
      status: "completed"
    });
    setSelectedStudent(null);
  };

  const resetEmiForm = () => {
    setEmiFormData({
      totalAmount: '',
      emiPeriod: '12',
      emiAmount: '',
      downPayment: '0',
      interestRate: '0',
      startDate: new Date().toISOString().split('T')[0],
      frequency: 'monthly',
      processingFee: '0',
      lateFee: '0',
      receiptNumber: '',
      discount: ''
    });
    setPaymentType('emi');
    setSelectedStudentForEMI(null);
  };

  const handleEmiPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!selectedEmiPlan) {
      toast({
        title: "Error",
        description: "No EMI plan selected",
        variant: "destructive",
      });
      return;
    }
    
    const data = {
      leadId: selectedEmiPlan.studentId,
      amount: emiPaymentFormData.amount,
      discount: "0",
      paymentDate: emiPaymentFormData.paymentDate,
      paymentMode: emiPaymentFormData.paymentMode,
      receiptNumber: emiPaymentFormData.receiptNumber || undefined,
      installmentNumber: parseInt(emiPaymentFormData.installmentNumber.toString()),
      transactionId: emiPaymentFormData.transactionId || undefined,
      status: emiPaymentFormData.status
    };
    
    console.log("Recording EMI payment with data:", data);
    
    addPaymentMutation.mutate(data, {
      onSuccess: () => {
        refetchEmiProgress();
        refetchPendingEmis();
        refetchEmiPlans();
        toast({
          title: "Success",
          description: "EMI payment recorded and UI updated.",
        });
        // Auto-advance or close modal as before
        if (pendingEmis.length > 1) {
          setEmiPaymentFormData(prev => ({
            ...prev,
            installmentNumber: pendingEmis[1].installmentNumber,
            amount: pendingEmis[1].amount
          }));
        } else {
          setEmiPaymentModalOpen(false);
          resetEmiPaymentForm();
        }
      }
    });
  };

  const resetEmiPaymentForm = () => {
    setEmiPaymentFormData({
      installmentNumber: 1,
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: '',
      receiptNumber: '',
      transactionId: '',
      status: 'completed'
    });
    setSelectedEmiPlan(null);
  };

  // Update EMI payment form when EMI plan is selected
  useEffect(() => {
    if (selectedEmiPlan) {
      // Set default values
      setEmiPaymentFormData(prev => ({
        ...prev,
        amount: selectedEmiPlan.emiAmount,
        installmentNumber: 1
      }));
      
      // If we have pending EMIs data, set the next installment
      if (pendingEmis.length > 0) {
        setEmiPaymentFormData(prev => ({
          ...prev,
          installmentNumber: pendingEmis[0].installmentNumber,
          amount: pendingEmis[0].amount
        }));
      }
    }
  }, [selectedEmiPlan, pendingEmis]);

  // Add this useEffect after emiFormData and selectedStudentForEMI are defined
  useEffect(() => {
    if (selectedStudentForEMI) {
      // Calculate total amount for the selected student
      const className = selectedStudentForEMI.class;
      const total = globalClassFees
        .filter(fee => fee.className === className && fee.academicYear === academicYear && fee.isActive)
        .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
      setEmiFormData(prev => ({
        ...prev,
        totalAmount: total ? total.toString() : '',
        emiAmount: prev.emiPeriod && total
          ? ((total - (parseFloat(prev.downPayment) || 0)) / parseInt(prev.emiPeriod)).toFixed(2)
          : ''
      }));
    } else {
      setEmiFormData(prev => ({ ...prev, totalAmount: '', emiAmount: '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentForEMI, globalClassFees, academicYear]);

  // Update state when data changes
  useEffect(() => {
    if (emiProgressData) {
      setEmiPaymentProgress(emiProgressData);
    }
  }, [emiProgressData]);

  useEffect(() => {
    if (pendingEmisData) {
      setPendingEmis(pendingEmisData);
    }
  }, [pendingEmisData]);

  // When the modal opens, always refetch EMI progress and pending EMIs
  useEffect(() => {
    if (emiPaymentModalOpen && selectedEmiPlan) {
      refetchEmiProgress();
      refetchPendingEmis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emiPaymentModalOpen, selectedEmiPlan]);

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      const response = await fetch(`/api/fee-payments/${paymentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fee-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fee-stats"] });
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add state for student details tab
  const [studentDetailsTab, setStudentDetailsTab] = useState<'Overview' | 'Payments' | 'Mandates' | 'EMI'>('Overview');

  // Calculate filtered and paginated students for sidebar using allStudents
  const filteredStudents = allStudents.filter(student => {
    const matchesClass = classFilter === 'all' || student.class === classFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'E-Mandate Active'
      ? displayEMandates.some(m => m.leadId === student.id)
      : statusFilter === 'No E-Mandate'
        ? !displayEMandates.some(m => m.leadId === student.id)
        : (student as any).status === statusFilter);
    const search = studentSearch.trim().toLowerCase();
    const matchesSearch =
      search === '' ||
      student.name.toLowerCase().includes(search) ||
      (student.studentId && student.studentId.toLowerCase().includes(search)) ||
      (student.parentPhone && student.parentPhone.includes(search)) ||
      ((student as any).email && (student as any).email.toLowerCase().includes(search));
    return matchesClass && matchesStatus && matchesSearch;
  });
  const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage);

  // Add this helper function after feeStructures/globalClassFees are defined:
  function getStudentFeesWithGlobal(student: Student) {
    const explicitFees = feeStructures.filter(f => f.studentId === student.id);
    const globalFees = globalClassFees.filter(
      fee => fee.className === student.class && fee.academicYear === academicYear && fee.isActive
    );
    const explicitFeeTypes = new Set(explicitFees.map(f => f.feeType));
    const virtualGlobalFees = globalFees
      .filter(fee => !explicitFeeTypes.has(fee.feeType))
      .map(fee => ({
        ...fee,
        studentId: student.id,
        status: "pending",
        isGlobal: true,
        dueDate: '',
        installmentNumber: 1,
        totalInstallments: 1,
      }));
    return [...explicitFees, ...virtualGlobalFees] as FeeStructure[];
  }
  
  return (
    <div className="space-y-10">
      <Header className="py-4" />
      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="mandates">E-Mandates</TabsTrigger>
          <TabsTrigger value="global-fees">Global Fees</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-8">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allStudents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {enrolledLeads.length} enrolled leads
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fee Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{(() => {
                    const totalRevenue = allStudents.reduce((sum, student) => {
                      const classFees = globalClassFees.filter(fee => 
                        fee.className === student.class && 
                        fee.academicYear === academicYear && 
                        fee.isActive
                      );
                      return sum + classFees.reduce((classSum, fee) => classSum + parseFloat(fee.amount), 0);
                    }, 0);
                    return totalRevenue.toLocaleString();
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on global fee structure
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">E-Mandates Active</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayEMandates.length}</div>
                <p className="text-xs text-muted-foreground">
                  {((displayEMandates.length / allStudents.length) * 100).toFixed(1)}% coverage
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Array.from(new Set(allStudents.map(s => s.class))).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  With fee structures
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Class-wise Fee Collection Overview */}
          <Card className="p-0">
            <CardHeader className="pb-4">
              <CardTitle>Class-wise Fee Collection Overview</CardTitle>
              <CardDescription>Summary of fee collection and outstanding dues by class</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="py-4 px-6">Class</TableHead>
                    <TableHead className="py-4 px-6">Students</TableHead>
                    <TableHead className="py-4 px-6">Total Amount</TableHead>
                    <TableHead className="py-4 px-6">E-Mandates</TableHead>
                    <TableHead className="py-4 px-6">Avg. Fee/Student</TableHead>
                    <TableHead className="py-4 px-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(new Set(allStudents.map(s => s.class))).map(className => {
                    const classStudents = allStudents.filter(s => s.class === className);
                    const classFees = globalClassFees.filter(fee => 
                      fee.className === className && 
                      fee.academicYear === academicYear && 
                      fee.isActive
                    );
                    const totalClassFees = classFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
                    const totalRevenue = totalClassFees * classStudents.length;
                    const classMandates = displayEMandates.filter(m => 
                      classStudents.some(s => s.id === m.leadId)
                    );
                    const avgFeePerStudent = classStudents.length > 0 ? totalClassFees : 0;
                    
                    return (
                      <TableRow key={className} className="hover:bg-gray-50">
                        <TableCell className="py-4 px-6 font-medium">{className}</TableCell>
                        <TableCell className="py-4 px-6">{classStudents.length}</TableCell>
                        <TableCell className="py-4 px-6">₹{totalRevenue.toLocaleString()}</TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span>{classMandates.length}</span>
                            <Badge variant="outline" className="text-xs">
                              {((classMandates.length / classStudents.length) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">₹{avgFeePerStudent.toLocaleString()}</TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge 
                            className={
                              classFees.length > 0 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {classFees.length > 0 ? "Active" : "No Fees Set"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Fee Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Type Breakdown</CardTitle>
              <CardDescription>Distribution of fees by type across all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const feeTypes = globalClassFees
                    .filter(fee => fee.academicYear === academicYear && fee.isActive)
                    .reduce((acc, fee) => {
                      if (!acc[fee.feeType]) {
                        acc[fee.feeType] = { total: 0, classes: new Set() };
                      }
                      acc[fee.feeType].total += parseFloat(fee.amount);
                      acc[fee.feeType].classes.add(fee.className);
                      return acc;
                    }, {} as Record<string, { total: number; classes: Set<string> }>);

                  return Object.entries(feeTypes).map(([feeType, data]) => (
                    <div key={feeType} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">{feeType.replace('_', ' ')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {data.classes.size} classes
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{data.total.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          per class
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Academic Year Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Year Summary ({academicYear})</CardTitle>
              <CardDescription>Overall fee management statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {globalClassFees.filter(fee => fee.academicYear === academicYear && fee.isActive).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Fee Structures</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Array.from(new Set(globalClassFees
                      .filter(fee => fee.academicYear === academicYear && fee.isActive)
                      .map(fee => fee.className)
                    )).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Classes with Fees</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{(() => {
                      const totalFees = globalClassFees
                        .filter(fee => fee.academicYear === academicYear && fee.isActive)
                        .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
                      return totalFees.toLocaleString();
                    })()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Fee Structure</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Analytics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Mode Distribution</CardTitle>
                <CardDescription>Breakdown of payments by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const modeStats = displayFeePayments.reduce((acc, payment) => {
                      if (!acc[payment.paymentMode]) {
                        acc[payment.paymentMode] = { count: 0, amount: 0 };
                      }
                      acc[payment.paymentMode].count++;
                      acc[payment.paymentMode].amount += parseFloat(payment.amount);
                      return acc;
                    }, {} as Record<string, { count: number; amount: number }>);

                    return Object.entries(modeStats).map(([mode, stats]) => (
                      <div key={mode} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium capitalize">{mode.replace('_', ' ')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {stats.count} payments
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{stats.amount.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {((stats.amount / paymentStats.totalCollected) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Payment Trends</CardTitle>
                <CardDescription>Payment collection over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const now = new Date();
                    const months = [];
                    for (let i = 5; i >= 0; i--) {
                      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
                      months.push(month);
                    }

                    return months.map(month => {
                      const monthPayments = displayFeePayments.filter(payment => {
                        const paymentDate = new Date(payment.paymentDate);
                        return paymentDate.getMonth() === month.getMonth() && 
                               paymentDate.getFullYear() === month.getFullYear() &&
                               payment.status === "completed";
                      });
                      
                      const totalAmount = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                      
                      return (
                        <div key={month.toISOString()} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{format(month, "MMM yyyy")}</h4>
                            <p className="text-sm text-muted-foreground">
                              {monthPayments.length} payments
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">₹{totalAmount.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              {paymentStats.totalCollected > 0 ? ((totalAmount / paymentStats.totalCollected) * 100).toFixed(1) : 0}%
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="students" className="space-y-4">
          {/* --- Begin Refactored Students Tab --- */}
          <div className="flex gap-6 px-2 pb-8">
            {/* Sidebar: Student List */}
            <aside className="w-[320px] bg-[#F9FAFB] rounded-2xl border border-[#E0E0E0] shadow h-fit">
              <div className="px-6 pt-6 pb-2 text-base font-semibold text-[#1C1C1E]">
                {allStudents.length} students
              </div>
              <div className="flex gap-2 px-6 pb-2">
                <input
                  type="text"
                  placeholder="Search by name, ID, phone, or email..."
                  className="pl-3 pr-2 py-2 w-full rounded-lg border border-[#E0E0E0] bg-white text-[#1C1C1E] placeholder-[#BFBFBF] focus:outline-none focus:border-[#2F54EB] text-base shadow"
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 px-6 pb-4">
                <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="border rounded px-2 py-1">
                  <option value="all">All Classes</option>
                  {Array.from(new Set(displayStudents.map(s => s.class))).map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1">
                  <option value="all">All Statuses</option>
                  <option value="E-Mandate Active">E-Mandate Active</option>
                  <option value="No E-Mandate">No E-Mandate</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="interested">Interested</option>
                  <option value="contacted">Contacted</option>
                  <option value="new">New</option>
                </select>
              </div>
              {/* Paginated Student List */}
              <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-[#E0E0E0]">
                  {paginatedStudents.map((student) => (
                    <li
                      key={student.id}
                      className={`flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-[#FAFAFA] transition rounded-xl ${selectedStudent?.id === student.id ? 'bg-white shadow' : ''}`}
                      onClick={() => setSelectedStudent(student as Student)}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#F0F2F5] text-[#2F54EB] font-bold text-sm border-2 border-[#D9D9D9]">
                          {student.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#1C1C1E] truncate">{student.name}</div>
                        <div className="text-xs text-[#8C8C8C] truncate">{student.class || 'No Class'}</div>
                        <div className="text-xs text-[#BFBFBF]">{student.email || 'No email'}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Pagination Controls */}
              <div className="flex items-center gap-2 px-6 py-2">
                <button
                  className="px-2 py-1 rounded border text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  &lt; Prev
                </button>
                {[...Array(totalStudentPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`px-2 py-1 rounded border text-sm ${currentPage === i + 1 ? 'bg-[#2F54EB] text-white' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-2 py-1 rounded border text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(totalStudentPages, p + 1))}
                  disabled={currentPage === totalStudentPages}
                >
                  Next &gt;
                </button>
              </div>
            </aside>
            {/* Details Panel */}
            <main className="flex-1">
              {selectedStudent ? (
                <div className="bg-white rounded-2xl shadow border border-[#E0E0E0] p-8 min-h-[600px]">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full flex items-center justify-center bg-[#F0F2F5] text-[#2F54EB] font-bold text-2xl border-2 border-[#D9D9D9]">
                        {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold text-[#1C1C1E]">{selectedStudent.name}</span>
                        <span className="text-sm text-[#4D4F5C] font-medium">{selectedStudent.class}</span>
                      </div>
                    </div>
                  </div>
                  {/* Tabs for student details */}
                  <div className="border-b border-[#E0E0E0] mb-4">
                    <div className="flex gap-8">
                      {['Overview', 'Payments', 'Mandates', 'EMI'].map(tab => (
                        <button
                          key={tab}
                          className={`pb-3 px-3 py-1.5 text-sm font-medium transition-colors duration-200 relative rounded-md ${studentDetailsTab === tab ? 'text-[#2F54EB] bg-[#F0F5FF]' : 'text-[#8C8C8C] hover:text-[#2F54EB]'} mx-1`}
                          onClick={() => setStudentDetailsTab(tab as 'Overview' | 'Payments' | 'Mandates' | 'EMI')}
                          style={{ minWidth: 90 }}
                        >
                          {tab}
                          {studentDetailsTab === tab && (
                            <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#2F54EB] rounded" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Tab Content */}
                  <div>
                    {studentDetailsTab === 'Overview' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Information Card */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div><span className="font-semibold">Full Name:</span> {selectedStudent.name}</div>
                              <div><span className="font-semibold">Phone:</span> {selectedStudent.parentPhone || '-'}</div>
                              <div><span className="font-semibold">Email:</span> {(selectedStudent as any).email || '-'}</div>
                              <div><span className="font-semibold">Class:</span> {selectedStudent.class}</div>
                              <div><span className="font-semibold">Parent:</span> {selectedStudent.parentName || '-'}</div>
                              <div><span className="font-semibold">Address:</span> {(selectedStudent as any).address || '-'}</div>
                            </div>
                          </CardContent>
                        </Card>
                        {/* Fee Information Card */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Fee Information</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div><span className="font-semibold">Total Fees:</span> ₹{calculateTotalFees(getStudentFeesWithGlobal(selectedStudent)).toLocaleString()}</div>
                              <div><span className="font-semibold">Paid Amount:</span> ₹{calculatePaidAmount(getStudentPayments(selectedStudent.id)).toLocaleString()}</div>
                              <div><span className="font-semibold">Outstanding:</span> ₹{calculateOutstanding(selectedStudent.id).toLocaleString()}</div>
                              <div><span className="font-semibold">Mandates:</span> {(() => {
                                const mandates = getStudentMandate(selectedStudent.id);
                                if (!mandates) return 'None';
                                if (Array.isArray(mandates)) return mandates.length;
                                return 1;
                              })()}</div>
                              <div><span className="font-semibold">EMI Plans:</span> {emiPlans.filter(p => p.studentId === selectedStudent.id).length}</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    {studentDetailsTab === 'Payments' && (
                      <div>
                        {/* Payments content: list, add, delete payments for selectedStudent */}
                        <div className="mb-4 flex justify-between items-center">
                          <div className="font-semibold">Payments</div>
                          <Button onClick={() => setAddPaymentOpen(true)}>Add Payment</Button>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Mode</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getStudentPayments(selectedStudent.id).map(payment => (
                              <TableRow key={payment.id}>
                                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                <TableCell>₹{payment.amount}</TableCell>
                                <TableCell>{payment.paymentMode}</TableCell>
                                <TableCell>{payment.status}</TableCell>
                                <TableCell>
                                  <Button variant="destructive" size="sm" onClick={() => deletePaymentMutation.mutate(payment.id)}>Delete</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {addPaymentOpen && (
                          <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
                            <DialogContent>
                              <DialogHeader>Add Payment</DialogHeader>
                              <form onSubmit={handleAddPayment} className="space-y-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="amount">Amount</Label>
                                  <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    required
                                    value={paymentFormData.amount}
                                    onChange={e => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="paymentDate">Payment Date</Label>
                                  <Input
                                    id="paymentDate"
                                    name="paymentDate"
                                    type="date"
                                    required
                                    value={paymentFormData.paymentDate}
                                    onChange={e => setPaymentFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="paymentMode">Payment Mode</Label>
                                  <Input
                                    id="paymentMode"
                                    name="paymentMode"
                                    required
                                    value={paymentFormData.paymentMode}
                                    onChange={e => setPaymentFormData(prev => ({ ...prev, paymentMode: e.target.value }))}
                                  />
                                </div>
                                {/* Add more fields as needed */}
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={() => setAddPaymentOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit">Add Payment</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                    {studentDetailsTab === 'Mandates' && (
                      <div>
                        {/* Mandates content: list, add, delete mandates for selectedStudent */}
                        <div className="mb-4 flex justify-between items-center">
                          <div className="font-semibold">E-Mandates</div>
                          <Button onClick={() => setAddMandateOpen(true)}>Add Mandate</Button>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mandate ID</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Bank</TableHead>
                              <TableHead>Max Amount</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              const mandates = getStudentMandate(selectedStudent.id);
                              if (!mandates) return [];
                              if (Array.isArray(mandates)) return mandates;
                              return [mandates];
                            })().map((mandate: EMandate) => (
                              <TableRow key={mandate.id}>
                                <TableCell>{mandate.mandateId}</TableCell>
                                <TableCell>{mandate.status}</TableCell>
                                <TableCell>{mandate.bankName}</TableCell>
                                <TableCell>₹{mandate.maxAmount}</TableCell>
                                <TableCell>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteMandate(mandate.id)}>Delete</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {addMandateOpen && (
                          <Dialog open={addMandateOpen} onOpenChange={setAddMandateOpen}>
                            <DialogContent>
                              <DialogHeader>Setup E-Mandate for {selectedStudent?.name}</DialogHeader>
                              <form onSubmit={handleAddEMandate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="bankName">Bank Name</Label>
                                    <Input name="bankName" required />
                                  </div>
                                  <div>
                                    <Label htmlFor="ifscCode">IFSC Code</Label>
                                    <Input name="ifscCode" required maxLength={11} />
                                  </div>
                                </div>
                                {/* Add more fields as needed */}
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={() => setAddMandateOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit">Add Mandate</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                    {studentDetailsTab === 'EMI' && (
                      <div>
                        {/* EMI content: list, add, edit EMI plans for selectedStudent */}
                        {/* Example: List EMI plans for selectedStudent */}
                        <div className="mb-4 flex justify-between items-center">
                          <div className="font-semibold">EMI Plans</div>
                          <Button onClick={() => setEmiModalOpen(true)}>Add EMI Plan</Button>
                        </div>
                        {/* ...existing EMI plan table/modal logic for selectedStudent... */}
                        {emiModalOpen && (
                          <Dialog open={emiModalOpen} onOpenChange={setEmiModalOpen}>
                            <DialogContent>
                              <DialogHeader>Add EMI Plan</DialogHeader>
                              <form onSubmit={e => { e.preventDefault(); addEmiPlanMutation.mutate(emiFormData); }} className="space-y-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="totalAmount">Total Amount</Label>
                                  <Input
                                    id="totalAmount"
                                    name="totalAmount"
                                    type="number"
                                    required
                                    value={emiFormData.totalAmount}
                                    onChange={e => setEmiFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                                  />
                                </div>
                                {/* Add more fields as needed */}
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={() => setEmiModalOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit">Add EMI Plan</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Select a student to view details</div>
              )}
            </main>
          </div>
          {/* --- End Refactored Students Tab --- */}
        </TabsContent>
        <TabsContent value="payments" className="space-y-6">
          {/* Payment Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{paymentStats.totalCollected.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {paymentStats.collectionRate.toFixed(1)}% collection rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Collection</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{paymentStats.monthlyCollection.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  ₹{paymentStats.totalPending.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {displayFeePayments.filter(p => p.status === "pending").length} payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹{paymentStats.totalFailed.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {displayFeePayments.filter(p => p.status === "failed").length} payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active EMI Plans</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {emiPlans.filter(p => p.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {emiPlans.filter(p => p.planType === "emi" && p.status === "active").length} EMI plans
                </p>
              </CardContent>
            </Card>
          </div>

          {/* EMI Plans Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardTitle>EMI Plans Management</CardTitle>
                  <CardDescription>
                    Track and manage EMI plans for students
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Plan Type</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>EMI Details</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emiPlans.map((plan) => {
                    const student = allStudents.find(s => s.id === plan.studentId);
                    return (
                      <TableRow key={plan.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-medium text-sm">
                                {student?.name.split(' ').map(n => n[0]).join('') || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student?.name || 'Unknown Student'}</p>
                              <p className="text-sm text-gray-500">{student?.studentId || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{student?.class || 'N/A'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              plan.planType === 'emi' 
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-green-100 text-green-800 border-green-200"
                            }
                          >
                            {plan.planType === 'emi' ? 'EMI Plan' : 'Full Payment'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            ₹{parseFloat(plan.totalAmount).toLocaleString()}
                          </div>
                          {parseFloat(plan.discount) > 0 && (
                            <div className="text-sm text-green-600">
                              -₹{parseFloat(plan.discount).toLocaleString()} discount
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {plan.planType === 'emi' ? (
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="text-gray-500">EMI Amount:</span> ₹{parseFloat(plan.emiAmount).toLocaleString()}
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Period:</span> {plan.emiPeriod} months
                              </div>
                              {parseFloat(plan.downPayment) > 0 && (
                                <div className="text-sm">
                                  <span className="text-gray-500">Down Payment:</span> ₹{parseFloat(plan.downPayment).toLocaleString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Full payment</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-900">
                            {format(new Date(plan.startDate), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              plan.status === "active" 
                                ? "bg-green-100 text-green-800"
                                : plan.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEmiPlan(plan);
                                setEmiPaymentModalOpen(true);
                              }}
                            >
                              <CreditCard className="mr-1 h-3 w-3" />
                              Record Payment
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete the EMI plan for ${student?.name}? This action cannot be undone.`)) {
                                  try {
                                    const response = await fetch(`/api/emi-plans/${plan.id}`, {
                                      method: "DELETE",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                    });
                                    if (!response.ok) throw new Error("Failed to delete EMI plan");
                                    await refetchEmiPlans();
                                    await queryClient.invalidateQueries({ queryKey: ["/api/fee-payments"] });
                                    await queryClient.invalidateQueries({ queryKey: ["/api/fee-stats"] });
                                    toast({
                                      title: "Success",
                                      description: "EMI plan deleted successfully",
                                    });
                                  } catch (error: any) {
                                    toast({
                                      title: "Error",
                                      description: `Failed to delete EMI plan: ${error.message}`,
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                            >
                              <Settings className="mr-1 h-3 w-3" />
                              Delete Plan
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {emiPlans.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No EMI plans configured</p>
                  <p className="text-sm">Configure EMI plans for students to see them here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mandates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">E-Mandate Management</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayEMandates.map((mandate: EMandate) => {
              const lead = enrolledLeads.find(l => l.id === mandate.leadId);
              const isExpiringSoon = new Date(mandate.endDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              
              return (
                <Card key={mandate.id} className={isExpiringSoon ? "border-orange-200" : ""}>
                  <CardHeader className="pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm">{lead?.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {mandate.mandateId}
                        </CardDescription>
                      </div>
                      <Badge className={mandate.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {mandate.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3" />
                        {mandate.bankName}
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-3 w-3" />
                        Max: ₹{parseFloat(mandate.maxAmount).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Valid till: {format(new Date(mandate.endDate), "MMM dd, yyyy")}
                      </div>
                      {isExpiringSoon && (
                        <div className="text-orange-600 font-medium">
                          ⚠️ Expiring Soon
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="destructive" onClick={() => handleDeleteMandate(mandate.id)}>
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="global-fees" className="space-y-4">
          <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardTitle>Global Class Fee Management</CardTitle>
                  <CardDescription>
                    Set and manage fee structures for different classes that can be used for calculations and automatically assigned to students
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setEditingGlobalFee(null);
                    setGlobalFeeModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Global Fee
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <select 
                    value={academicYear} 
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="2024-25">2024-25</option>
                    <option value="2025-26">2025-26</option>
                    <option value="2026-27">2026-27</option>
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAcademicYear("2024-25")}
                  >
                    Reset Filter
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {globalClassFees
                      .filter(fee => fee.academicYear === academicYear)
                      .map((fee) => (
                        <TableRow key={fee.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{fee.className}</TableCell>
                          <TableCell className="capitalize">{fee.feeType}</TableCell>
                          <TableCell>₹{parseFloat(fee.amount).toLocaleString()}</TableCell>
                          <TableCell className="capitalize">{fee.frequency}</TableCell>
                          <TableCell>{fee.academicYear}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={fee.isActive ? "default" : "secondary"}
                              className={fee.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                            >
                              {fee.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingGlobalFee(fee);
                                  setGlobalFeeModalOpen(true);
                                }}
                              >
                                <Settings className="mr-1 h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewTotalFees(fee.className)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View Total
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                
                {globalClassFees.filter(fee => fee.academicYear === academicYear).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <IndianRupee className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No global fees configured for {academicYear}</p>
                    <p className="text-sm">Click "Add Global Fee" to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Fee Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fee Details</DialogTitle>
            <DialogDescription>
              Detailed information about the fee structure and payment history
            </DialogDescription>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Fee Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Fee Type</dt>
                        <dd className="font-medium">{selectedFee.feeType}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Amount</dt>
                        <dd className="font-medium">₹{parseFloat(selectedFee.amount).toLocaleString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Due Date</dt>
                        <dd className="font-medium">{format(new Date(selectedFee.dueDate), "MMM dd, yyyy")}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Installment</dt>
                        <dd className="font-medium">{selectedFee.installmentNumber}/{selectedFee.totalInstallments}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getStudentPayments(selectedFee.studentId)
                        .filter(p => p.paymentDate <= selectedFee.dueDate)
                        .map((payment: FeePayment) => (
                          <div key={payment.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div>
                              <div className="font-medium">₹{parseFloat(payment.amount).toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                              </div>
                            </div>
                              <Badge>{payment.paymentMode}</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Class Fee Dialog */}
      <Dialog open={addClassFeeOpen} onOpenChange={setAddClassFeeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Class Fee Structure</DialogTitle>
            <DialogDescription>
              Assign a new fee structure to the selected students
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddClassFee} className="space-y-4">
            <div className="grid gap-4">
              <div className="text-sm text-muted-foreground">
                Assigning to {selectedStudentIds.length} students
              </div>
              <div className="grid gap-2">
                <Label htmlFor="className">Class</Label>
                <Input id="className" name="className" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="feeType">Fee Type</Label>
                <Input id="feeType" name="feeType" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select name="frequency" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" name="description" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddClassFeeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Fee Structure</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* E-Mandate Setup Dialog */}
      <Dialog open={addMandateOpen} onOpenChange={setAddMandateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Setup E-Mandate for {selectedStudent?.name}</DialogTitle>
            <DialogDescription>
              Configure auto-debit mandate for automated fee collection
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEMandate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input name="bankName" placeholder="e.g., HDFC Bank" required />
              </div>
              <div>
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input name="ifscCode" placeholder="e.g., HDFC0000123" required maxLength={11} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input name="accountNumber" placeholder="Account Number" required />
              </div>
              <div>
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input name="accountHolderName" placeholder="Full Name" required />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxAmount">Max Amount</Label>
                <Input name="maxAmount" type="number" placeholder="50000" required />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input name="startDate" type="date" required />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input name="endDate" type="date" required />
              </div>
            </div>
            
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={mandateFrequency} onValueChange={setMandateFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setAddMandateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addEMandateMutation.isPending}>
                {addEMandateMutation.isPending ? "Creating..." : "Create E-Mandate"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Class Fee Modal */}
      <Dialog open={setClassFeeOpen} onOpenChange={setSetClassFeeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Class Fee</DialogTitle>
            <DialogDescription>
              Define or update the global fee for a class. All students in this class will be assigned this fee automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGlobalClassFee} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="className">Class</Label>
                <Select name="className" required defaultValue={editingClassFee?.className || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class 1">Class 1</SelectItem>
                    <SelectItem value="Class 2">Class 2</SelectItem>
                    <SelectItem value="Class 3">Class 3</SelectItem>
                    <SelectItem value="Class 4">Class 4</SelectItem>
                    <SelectItem value="Class 5">Class 5</SelectItem>
                    <SelectItem value="Class 6">Class 6</SelectItem>
                    <SelectItem value="Class 7">Class 7</SelectItem>
                    <SelectItem value="Class 8">Class 8</SelectItem>
                    <SelectItem value="Class 9">Class 9</SelectItem>
                    <SelectItem value="Class 10">Class 10</SelectItem>
                    <SelectItem value="Class 11">Class 11</SelectItem>
                    <SelectItem value="Class 12">Class 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="feeType">Fee Type</Label>
                <Input id="feeType" name="feeType" required defaultValue={editingClassFee?.feeType || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" required defaultValue={editingClassFee?.amount || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select name="frequency" required defaultValue={editingClassFee?.frequency || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" required defaultValue={editingClassFee?.dueDate || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" name="description" defaultValue={editingClassFee?.description || ""} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSetClassFeeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Fee</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EMI Modal */}
      <Dialog open={emiModalOpen} onOpenChange={setEmiModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Payment Configuration for {selectedStudentForEMI?.name}
            </DialogTitle>
            <DialogDescription>
              Configure payment plan and EMI details for {selectedStudentForEMI?.studentId} ({selectedStudentForEMI?.class})
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={e => { e.preventDefault(); addEmiPlanMutation.mutate(emiFormData); }} className="space-y-6">
            
            {/* Payment Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Payment Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentType === 'emi' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentType('emi')}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentType"
                      value="emi"
                      checked={paymentType === 'emi'}
                      onChange={() => setPaymentType('emi')}
                      className="text-primary"
                    />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        EMI Payment
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pay in installments over time
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentType === 'full' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentType('full')}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentType"
                      value="full"
                      checked={paymentType === 'full'}
                      onChange={() => setPaymentType('full')}
                      className="text-primary"
                    />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        Full Payment
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pay the entire amount at once
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Payment Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                <Input 
                  id="totalAmount" 
                  name="totalAmount" 
                  type="number" 
                  required 
                  placeholder="Enter total fee amount"
                  min="0"
                  step="0.01"
                  value={emiFormData.totalAmount}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="grid gap-2">
                    <Label htmlFor="discount">Discount (₹)</Label>
                    <Input 
                      id="discount" 
                      name="discount" 
                      type="number" 
                      placeholder="0"
                      min="0"
                      step="0.01"
                      value={emiFormData.discount || ''}
                      onChange={(e) => {
                        const discount = e.target.value;
                        setEmiFormData(prev => ({
                          ...prev,
                          discount,
                          emiAmount: prev.totalAmount && prev.emiPeriod
                            ? ((parseFloat(prev.totalAmount) - (parseFloat(prev.downPayment) || 0) - (parseFloat(discount) || 0)) / parseInt(prev.emiPeriod)).toFixed(2)
                            : ''
                        }));
                      }}
                    />
                  </div>
              

            </div>

            {/* EMI Specific Options */}
            {paymentType === 'emi' && (
              <>
                <div className="grid grid-cols-3 gap-4">

                  <div className="grid gap-2">
                    <Label htmlFor="downPayment">Down Payment (₹)</Label>
                    <Input 
                      id="downPayment" 
                      name="downPayment" 
                      type="number" 
                      placeholder="0"
                      min="0"
                      step="0.01"
                      value={emiFormData.downPayment}
                      onChange={(e) => {
                        const downPayment = e.target.value;
                        setEmiFormData(prev => ({
                          ...prev,
                          downPayment,
                          emiAmount: prev.totalAmount && prev.emiPeriod
                            ? ((parseFloat(prev.totalAmount) - (parseFloat(downPayment) || 0) - (parseFloat(prev.discount) || 0)) / parseInt(prev.emiPeriod)).toFixed(2)
                            : ''
                        }));
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="emiPeriod">Number of EMIs</Label>
                    <Select 
                      value={emiFormData.emiPeriod} 
                      onValueChange={(value) => {
                        setEmiFormData(prev => ({ 
                          ...prev, 
                          emiPeriod: value,
                          emiAmount: emiFormData.totalAmount && value
                            ? ((parseFloat(emiFormData.totalAmount) - (parseFloat(emiFormData.downPayment) || 0) - (parseFloat(emiFormData.discount) || 0)) / parseInt(value)).toFixed(2)
                            : ''
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                <Label htmlFor="startDate">Transaction Date</Label>
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="date" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                  value={emiFormData.startDate}
                  onChange={(e) => setEmiFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
                  
                  
                  
                  
                </div>
              </>
            )}

            {/* Receipt/Transaction Field - moved here above Payment Summary */}
            <div className="grid gap-2 mt-4">
              <Label htmlFor="receiptNumber">Receipt/Transaction ID (Optional)</Label>
              <Input
                id="receiptNumber"
                name="receiptNumber"
                type="text"
                placeholder="Enter receipt or transaction number"
                value={emiFormData.receiptNumber || ''}
                onChange={e => setEmiFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
              />
            </div>

            {/* Payment Summary */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-medium">₹{emiFormData.totalAmount || '0'}</span>
                  </div>
                  
                  {paymentType === 'emi' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Down Payment:</span>
                        <span className="font-medium">₹{emiFormData.downPayment || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="font-medium">₹{emiFormData.discount || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-2 rounded bg-primary/10 border border-primary/20 my-2">
                        <span className="text-muted-foreground text-base font-medium">EMI Amount:</span>
                        <span className="font-bold text-2xl text-primary">
                          ₹{(() => {
                            const total = parseFloat(emiFormData.totalAmount) || 0;
                            const down = parseFloat(emiFormData.downPayment) || 0;
                            const discount = parseFloat(emiFormData.discount) || 0;
                            const months = parseInt(emiFormData.emiPeriod) || 0;
                            if (months > 0 && total - down - discount > 0) {
                              return ((total - down - discount) / months).toFixed(2);
                            }
                            return '0';
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number of EMIs:</span>
                        <span className="font-medium">{emiFormData.emiPeriod || '0'}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between font-semibold">
                        <span>Total Payable EMI:</span>
                        <span className="text-primary">
                          ₹{(() => {
                            const total = parseFloat(emiFormData.totalAmount) || 0;
                            const down = parseFloat(emiFormData.downPayment) || 0;
                            const discount = parseFloat(emiFormData.discount) || 0;
                            const months = parseInt(emiFormData.emiPeriod) || 0;
                            if (months > 0 && total - down - discount > 0) {
                              return (total - down - discount).toFixed(2);
                            }
                            return '0.00';
                          })()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setEmiModalOpen(false);
                  setSelectedStudentForEMI(null);
                  setPaymentType('emi');
                  setEmiFormData({
                    totalAmount: '',
                    emiPeriod: '12',
                    emiAmount: '',
                    downPayment: '0',
                    interestRate: '0',
                    startDate: new Date().toISOString().split('T')[0],
                    frequency: 'monthly',
                    processingFee: '0',
                    lateFee: '0',
                    receiptNumber: '',
                    discount: ''
                  });
                }}
              >
                Cancel
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        type="submit"
                        disabled={selectedEmiPlan?.status === 'completed' || addPaymentMutation.isPending}
                        className={selectedEmiPlan?.status === 'completed' ? 'cursor-not-allowed opacity-60' : ''}
                      >
                        {addPaymentMutation.isPending ? "Recording..." : "Record EMI Payment"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {selectedEmiPlan?.status === 'completed' && (
                    <TooltipContent side="top">
                      All EMIs are paid
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Global Class Fee Modal */}
      <Dialog open={globalFeeModalOpen} onOpenChange={setGlobalFeeModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGlobalFee ? "Edit Global Class Fee" : "Add Global Class Fee"}
            </DialogTitle>
            <DialogDescription>
              {editingGlobalFee 
                ? "Update the global fee structure for this class"
                : "Set a global fee structure that can be used for calculations and automatically assigned to students"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGlobalClassFee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="className">Class</Label>
                <Select name="className" required defaultValue={editingGlobalFee?.className || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class 1">Class 1</SelectItem>
                    <SelectItem value="Class 2">Class 2</SelectItem>
                    <SelectItem value="Class 3">Class 3</SelectItem>
                    <SelectItem value="Class 4">Class 4</SelectItem>
                    <SelectItem value="Class 5">Class 5</SelectItem>
                    <SelectItem value="Class 6">Class 6</SelectItem>
                    <SelectItem value="Class 7">Class 7</SelectItem>
                    <SelectItem value="Class 8">Class 8</SelectItem>
                    <SelectItem value="Class 9">Class 9</SelectItem>
                    <SelectItem value="Class 10">Class 10</SelectItem>
                    <SelectItem value="Class 11">Class 11</SelectItem>
                    <SelectItem value="Class 12">Class 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="feeType">Fee Type</Label>
                <Select name="feeType" required defaultValue={editingGlobalFee?.feeType || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition Fee</SelectItem>
                    <SelectItem value="admission">Admission Fee</SelectItem>
                    <SelectItem value="library">Library Fee</SelectItem>
                    <SelectItem value="laboratory">Laboratory Fee</SelectItem>
                    <SelectItem value="sports">Sports Fee</SelectItem>
                    <SelectItem value="transport">Transport Fee</SelectItem>
                    <SelectItem value="examination">Examination Fee</SelectItem>
                    <SelectItem value="development">Development Fee</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  required 
                  placeholder="Enter amount"
                  defaultValue={editingGlobalFee?.amount || ""}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select name="frequency" required defaultValue={editingGlobalFee?.frequency || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="one-time">One Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select name="academicYear" required defaultValue={editingGlobalFee?.academicYear || academicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                    <SelectItem value="2025-26">2025-26</SelectItem>
                    <SelectItem value="2026-27">2026-27</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="isActive">Status</Label>
                <Select name="isActive" required defaultValue={editingGlobalFee?.isActive?.toString() || "true"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="Enter description"
                defaultValue={editingGlobalFee?.description || ""}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setGlobalFeeModalOpen(false);
                setEditingGlobalFee(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={globalClassFeeMutation.isPending}>
                {globalClassFeeMutation.isPending 
                  ? (editingGlobalFee ? "Updating..." : "Creating...") 
                  : (editingGlobalFee ? "Update Fee" : "Create Fee")
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Total Amount Modal */}
      <Dialog open={viewTotalFeesModalOpen} onOpenChange={setViewTotalFeesModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Total Amount for {selectedClassForTotal}</DialogTitle>
            <DialogDescription>
              Detailed breakdown of all active fees for {selectedClassForTotal} ({academicYear})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getClassFeeBreakdown(selectedClassForTotal, academicYear).map(fee => (
                  <TableRow key={fee.id}>
                    <TableCell>{fee.feeType}</TableCell>
                    <TableCell>₹{parseFloat(fee.amount).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{fee.frequency}</TableCell>
                    <TableCell>{fee.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="text-right font-bold text-lg">
              Total: ₹{calculateClassTotalFees(selectedClassForTotal, academicYear).toLocaleString()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Fee Payment</DialogTitle>
            <DialogDescription>
              Record a new fee payment for a student
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentSelect">Student</Label>
                <Select 
                  value={paymentFormData.studentSelect} 
                  onValueChange={(value) => {
                    setPaymentFormData(prev => ({ ...prev, studentSelect: value }));
                    const student = allStudents.find(s => s.id === parseInt(value));
                    setSelectedStudent(student as Student);
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {allStudents.map(student => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name} - {student.studentId} ({student.class})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  required 
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">Discount (₹)</Label>
                <Input 
                  id="discount" 
                  name="discount" 
                  type="number" 
                  placeholder="Enter discount"
                  min="0"
                  step="0.01"
                  value={paymentFormData.discount}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, discount: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input 
                  id="paymentDate" 
                  name="paymentDate" 
                  type="date" 
                  required 
                  value={paymentFormData.paymentDate}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select 
                  value={paymentFormData.paymentMode} 
                  onValueChange={(value) => setPaymentFormData(prev => ({ ...prev, paymentMode: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="emi">EMI</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input 
                  id="receiptNumber" 
                  name="receiptNumber" 
                  placeholder="Enter receipt number"
                  value={paymentFormData.receiptNumber}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="installmentNumber">Installment Number (Optional)</Label>
                <Input 
                  id="installmentNumber" 
                  name="installmentNumber" 
                  type="number" 
                  placeholder="Enter installment number"
                  min="1"
                  value={paymentFormData.installmentNumber}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, installmentNumber: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                <Input 
                  id="transactionId" 
                  name="transactionId" 
                  placeholder="Enter transaction ID"
                  value={paymentFormData.transactionId}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={paymentFormData.status} 
                  onValueChange={(value) => setPaymentFormData(prev => ({ ...prev, status: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setAddPaymentOpen(false);
                resetPaymentForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={addPaymentMutation.isPending}>
                {addPaymentMutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={paymentViewDetailsOpen} onOpenChange={setPaymentViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Detailed information about the payment
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Amount</dt>
                        <dd className="font-medium">₹{parseFloat(selectedPayment.amount).toLocaleString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Payment Date</dt>
                        <dd className="font-medium">{format(new Date(selectedPayment.paymentDate), "MMM dd, yyyy")}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Payment Mode</dt>
                        <dd className="font-medium capitalize">{selectedPayment.paymentMode.replace('_', ' ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Status</dt>
                        <dd className="font-medium capitalize">{selectedPayment.status}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Student Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      {(() => {
                        const student = allStudents.find(s => s.id === selectedPayment.leadId);
                        return (
                          <>
                            <div className="flex justify-between">
                              <dt className="text-sm text-muted-foreground">Name</dt>
                              <dd className="font-medium">{student?.name || 'Unknown'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-muted-foreground">Student ID</dt>
                              <dd className="font-medium">{student?.studentId || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-muted-foreground">Class</dt>
                              <dd className="font-medium">{student?.class || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-muted-foreground">Parent</dt>
                              <dd className="font-medium">{student?.parentName || 'N/A'}</dd>
                            </div>
                          </>
                        );
                      })()}
                    </dl>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Transaction Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {selectedPayment.receiptNumber && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Receipt Number</dt>
                        <dd className="font-medium">{selectedPayment.receiptNumber}</dd>
                      </div>
                    )}
                    {selectedPayment.transactionId && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Transaction ID</dt>
                        <dd className="font-medium">{selectedPayment.transactionId}</dd>
                      </div>
                    )}
                    {selectedPayment.installmentNumber && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Installment Number</dt>
                        <dd className="font-medium">{selectedPayment.installmentNumber}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Created At</dt>
                      <dd className="font-medium">
                        {selectedPayment.createdAt ? format(new Date(selectedPayment.createdAt), "MMM dd, yyyy HH:mm") : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EMI Payment Modal */}
      <Dialog open={emiPaymentModalOpen} onOpenChange={setEmiPaymentModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Record EMI Payment
            </DialogTitle>
            <DialogDescription>
              Record payment for EMI plan: {selectedEmiPlan?.planType === 'emi' ? 'EMI Plan' : 'Full Payment'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmiPlan && (
            <div className="space-y-6">
              {/* EMI Plan Summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">EMI Plan Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Student:</span>
                      <div className="font-medium">
                        {allStudents.find(s => s.id === selectedEmiPlan.studentId)?.name || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Amount:</span>
                      <div className="font-medium">₹{parseFloat(selectedEmiPlan.totalAmount).toLocaleString()}</div>
                    </div>
                    {selectedEmiPlan.planType === 'emi' && (
                      <>
                        <div>
                          <span className="text-muted-foreground">EMI Amount:</span>
                          <div className="font-medium">₹{parseFloat(selectedEmiPlan.emiAmount).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">EMI Period:</span>
                          <div className="font-medium">{selectedEmiPlan.emiPeriod} months</div>
                        </div>
                        {parseFloat(selectedEmiPlan.downPayment) > 0 && (
                          <div>
                            <span className="text-muted-foreground">Down Payment:</span>
                            <div className="font-medium">₹{parseFloat(selectedEmiPlan.downPayment).toLocaleString()}</div>
                          </div>
                        )}
                        {parseFloat(selectedEmiPlan.discount) > 0 && (
                          <div>
                            <span className="text-muted-foreground">Discount:</span>
                            <div className="font-medium">₹{parseFloat(selectedEmiPlan.discount).toLocaleString()}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
                {/* Alert message below summary */}
                {selectedEmiPlan?.status === 'completed' ? (
                  <Alert variant="default" className="mb-2 px-3 py-2 border border-green-600 bg-green-50 flex items-center gap-2">
                    <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />
                    <div>
                      <AlertTitle className="text-green-800 text-sm font-semibold">All EMIs are paid. This plan is completed.</AlertTitle>
                    </div>
                  </Alert>
                ) : (
                  <Alert variant="default" className="mb-2 px-3 py-2 border border-blue-600 bg-blue-50 flex items-center gap-2">
                    <Info className="text-blue-600 w-5 h-5 flex-shrink-0" />
                    <div>
                      <AlertTitle className="text-blue-800 text-sm font-semibold">Please continue paying your EMIs as per the schedule.</AlertTitle>
                    </div>
                  </Alert>
                )}
              </Card>

              {/* Payment Progress */}
              {emiPaymentProgress && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Payment Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="font-medium">{emiPaymentProgress.completionPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${emiPaymentProgress.completionPercentage}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Paid:</span>
                          <div className="font-medium">₹{emiPaymentProgress.totalPaid.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Remaining:</span>
                          <div className="font-medium">₹{emiPaymentProgress.remainingAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Installments:</span>
                          <div className="font-medium">{emiPaymentProgress.paidInstallments}/{emiPaymentProgress.totalInstallments}</div>
                        </div>
                      </div>
                      {emiPaymentProgress.nextInstallment && (
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <div className="text-sm font-medium text-blue-800">
                            Next EMI: #{emiPaymentProgress.nextInstallment} - ₹{parseFloat(selectedEmiPlan.emiAmount).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Horizontal EMI Stepper */}
              <div className="mb-6 px-6">
                <Carousel orientation="horizontal" opts={{ align: "start" }}>
                  <CarouselContent>
                    {Array.from({ length: selectedEmiPlan.emiPeriod }).map((_, idx) => {
                      const emiNum = idx + 1;
                      const payment = emiPaymentProgress?.payments?.find((p: any) => p.installmentNumber === emiNum);
                      const isPaid = !!payment;
                      const isNext = !isPaid && emiNum === (emiPaymentProgress?.nextInstallment || 1);
                      return (
                        <CarouselItem key={emiNum} className="basis-1/4 px-2">
                          <div className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200
                            ${isPaid ? 'border-green-500 bg-green-50' : isNext ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white opacity-60'}
                          `}>
                            <div className="flex items-center gap-2 mb-2">
                              {isPaid ? (
                                <CheckCircle className="text-green-600 w-5 h-5" />
                              ) : isNext ? (
                                <Clock className="text-blue-600 w-4 h-5 animate-pulse" />
                              ) : (
                                <Clock className="text-gray-400 w-5 h-5" />
                              )}
                              <span className="font-semibold">EMI {emiNum}</span>
                            </div>
                            <div className="text-sm font-medium">₹{parseFloat(selectedEmiPlan.emiAmount).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              Due: {emiPaymentProgress?.payments?.[idx]?.paymentDate
                                ? format(new Date(emiPaymentProgress.payments[idx].paymentDate), "dd MMM yyyy")
                                : format(new Date(selectedEmiPlan.startDate), "dd MMM yyyy")}
                            </div>
                            {isPaid && (
                              <div className="mt-2 text-xs text-green-700">Paid</div>
                            )}
                            {isNext && !isPaid && (
                              <div className="mt-2 text-xs text-blue-700 font-semibold">Next to Pay</div>
                            )}
                            {!isPaid && !isNext && (
                              <div className="mt-2 text-xs text-gray-400">Upcoming</div>
                            )}
                          </div>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                </Carousel>
              </div>

              {/* Payment Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Record Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmiPayment} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="emiInstallmentNumber">Installment Number</Label>
                        <Input 
                          id="emiInstallmentNumber" 
                          name="installmentNumber" 
                          type="number" 
                          required 
                          min="1"
                          max={selectedEmiPlan.planType === 'emi' ? selectedEmiPlan.emiPeriod : 1}
                          value={emiPaymentFormData.installmentNumber}
                          onChange={(e) => setEmiPaymentFormData(prev => ({ 
                            ...prev, 
                            installmentNumber: parseInt(e.target.value) || 1 
                          }))}
                        />
                        {pendingEmis.length > 0 && (
                          <div className="text-sm text-blue-600">
                            Suggested: EMI #{pendingEmis[0]?.installmentNumber}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="emiAmount">Amount (₹)</Label>
                        <Input 
                          id="emiAmount" 
                          name="amount" 
                          type="number" 
                          required 
                          placeholder="Enter amount"
                          min="0"
                          step="0.01"
                          value={emiPaymentFormData.amount}
                          onChange={(e) => setEmiPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="emiPaymentDate">Payment Date</Label>
                        <Input 
                          id="emiPaymentDate" 
                          name="paymentDate" 
                          type="date" 
                          required 
                          value={emiPaymentFormData.paymentDate}
                          onChange={(e) => setEmiPaymentFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="emiPaymentMode">Payment Mode</Label>
                        <Select 
                          value={emiPaymentFormData.paymentMode} 
                          onValueChange={(value) => setEmiPaymentFormData(prev => ({ ...prev, paymentMode: value }))}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="emi">EMI</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="emiReceiptNumber">Receipt Number</Label>
                        <Input 
                          id="emiReceiptNumber" 
                          name="receiptNumber" 
                          placeholder="Enter receipt number"
                          value={emiPaymentFormData.receiptNumber}
                          onChange={(e) => setEmiPaymentFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="emiTransactionId">Transaction ID</Label>
                        <Input 
                          id="emiTransactionId" 
                          name="transactionId" 
                          placeholder="Enter transaction ID"
                          value={emiPaymentFormData.transactionId}
                          onChange={(e) => setEmiPaymentFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="emiStatus">Status</Label>
                      <Select 
                        value={emiPaymentFormData.status} 
                        onValueChange={(value) => setEmiPaymentFormData(prev => ({ ...prev, status: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setEmiPaymentModalOpen(false);
                        resetEmiPaymentForm();
                      }}>
                        Cancel
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                type="submit"
                                disabled={selectedEmiPlan?.status === 'completed' || addPaymentMutation.isPending}
                                className={selectedEmiPlan?.status === 'completed' ? 'cursor-not-allowed opacity-60' : ''}
                              >
                                {addPaymentMutation.isPending ? "Recording..." : "Record EMI Payment"}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {selectedEmiPlan?.status === 'completed' && (
                            <TooltipContent side="top">
                              All EMIs are paid
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}