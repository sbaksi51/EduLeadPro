import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Bot,
  Calendar,
  Building,
  User,
  Plus,
  Download,
  Eye,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useHashState } from "@/hooks/use-hash-state";

interface Student {
  id: number;
  name: string;
  studentId: string;
  class: string;
  parentName?: string;
  parentPhone?: string;
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
  studentId: number;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
}

interface EMandate {
  id: number;
  studentId: number;
  mandateId: string;
  status: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
  frequency: string;
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

// Add mock EMI data for testing
const mockEmiData: Record<number, {emiPeriod: string, paidAmount: string, emiDues: string}> = {
  1: { emiPeriod: '12', paidAmount: '15000', emiDues: '15000' }, // Fee ID 1
  2: { emiPeriod: '6', paidAmount: '10000', emiDues: '20000' },  // Fee ID 2
  3: { emiPeriod: '10', paidAmount: '40000', emiDues: '0' },    // Fee ID 3
};

// Place mock data declarations above their usage
const mockStudents = [
  { id: 1, name: 'Aarav Sharma', studentId: 'STU001', class: 'Class 10', parentName: 'Rajesh Sharma', parentPhone: '9876543210' },
  { id: 2, name: 'Priya Verma', studentId: 'STU002', class: 'Class 12', parentName: 'Sunita Verma', parentPhone: '9876543211' },
  { id: 3, name: 'Rohan Singh', studentId: 'STU003', class: 'Class 11', parentName: 'Amit Singh', parentPhone: '9876543212' },
];
const mockFeeStructures = [
  { id: 1, studentId: 1, feeType: 'Tuition', amount: '30000', dueDate: '2024-06-15', status: 'paid', installmentNumber: 1, totalInstallments: 2 },
  { id: 2, studentId: 1, feeType: 'Tuition', amount: '30000', dueDate: '2024-12-15', status: 'pending', installmentNumber: 2, totalInstallments: 2 },
  { id: 3, studentId: 2, feeType: 'Tuition', amount: '40000', dueDate: '2024-06-10', status: 'paid', installmentNumber: 1, totalInstallments: 1 },
  { id: 4, studentId: 3, feeType: 'Tuition', amount: '35000', dueDate: '2024-06-20', status: 'pending', installmentNumber: 1, totalInstallments: 2 },
  { id: 5, studentId: 3, feeType: 'Tuition', amount: '35000', dueDate: '2024-12-20', status: 'pending', installmentNumber: 2, totalInstallments: 2 },
];
const mockFeePayments = [
  { id: 1, studentId: 1, amount: '30000', paymentDate: '2024-06-01', paymentMethod: 'cash' },
  { id: 2, studentId: 2, amount: '40000', paymentDate: '2024-06-05', paymentMethod: 'card' },
];
const mockEMandates = [
  { id: 1, studentId: 1, mandateId: 'MAND001', bankName: 'HDFC Bank', accountNumber: '1234567890', maxAmount: '60000', startDate: '2024-06-01', endDate: '2025-05-31', status: 'active', ifscCode: 'HDFC0000123', accountHolderName: 'Rajesh Sharma', frequency: 'monthly' },
];

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
  const [emiEditingFee, setEmiEditingFee] = useState<{studentId: number, feeId: number} | null>(null);
  const [emiData, setEmiData] = useState<Record<number, {emiPeriod: string, paidAmount: string, emiDues: string}>>(
    Object.keys(mockEmiData).length > 0 ? mockEmiData : {}
  );

  // Fetch data
  const { data: students = [] } = useQuery<Student[]>({ queryKey: ["/api/students"] });
  const { data: feeStructures = [] } = useQuery<FeeStructure[]>({ queryKey: ["/api/fee-structures"] });
  const { data: feePayments = [] } = useQuery<FeePayment[]>({ queryKey: ["/api/fee-payments"] });
  const { data: eMandates = [] } = useQuery<EMandate[]>({ queryKey: ["/api/e-mandates"] });
  const { data: feeStats } = useQuery<FeeStats>({ queryKey: ["/api/fee-stats"] });
  const { data: classFeeStructures = [] } = useQuery<ClassFeeStructure[]>({ queryKey: ["/api/class-fee-structures"] });

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

  const getStudentFees = (studentId: number) => {
    return feeStructures.filter((f: FeeStructure) => f.studentId === studentId);
  };

  const getStudentPayments = (studentId: number) => {
    return feePayments.filter((p: FeePayment) => p.studentId === studentId);
  };

  const getStudentMandate = (studentId: number) => {
    return eMandates.find((m: EMandate) => m.studentId === studentId);
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
    const data: Partial<ClassFeeStructure> & { studentIds?: number[] } = {
      className: formData.get("className")?.toString() || "",
      feeType: formData.get("feeType")?.toString() || "",
      amount: formData.get("amount")?.toString() || "",
      frequency: formData.get("frequency")?.toString() || "",
      dueDate: formData.get("dueDate")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      studentIds: selectedStudentIds,
    };
    addClassFeeMutation.mutate(data);
  };

  // Use API data if available, otherwise fallback to mock data
  const displayStudents = students.length > 0 ? students : mockStudents;
  const displayFeeStructures = feeStructures.length > 0 ? feeStructures : mockFeeStructures;
  const displayFeePayments = feePayments.length > 0 ? feePayments : mockFeePayments;
  const displayEMandates = eMandates.length > 0 ? eMandates : mockEMandates;

  const filteredStudents = displayStudents.filter((s: Student) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.parentPhone || "").includes(studentSearch)
  );

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div className="space-y-10">
      <Header title="Student Fees & EMI Management" subtitle="Manage student fees, payments, and EMI schedules" />
      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="mandates">E-Mandates</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{feeStats?.totalPending?.toLocaleString() || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Total pending fees across all students</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{feeStats?.totalOverdue?.toLocaleString() || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">Fees past due date</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active E-Mandates</CardTitle>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayEMandates.filter((m: EMandate) => m.status === 'active').length}</div>
                  <p className="text-xs text-gray-500 mt-1">Active payment mandates</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <Card className="p-0">
            <CardHeader className="pb-4">
              <CardTitle>Fee Collection Overview</CardTitle>
              <CardDescription>Summary of fee collection and outstanding dues</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="py-4 px-6">Class</TableHead>
                    <TableHead className="py-4 px-6">Total Fees</TableHead>
                    <TableHead className="py-4 px-6">Collected</TableHead>
                    <TableHead className="py-4 px-6">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* ...rows... */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="students" className="space-y-4">
          <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardTitle>Student Fee Overview</CardTitle>
                  <CardDescription>
                    Comprehensive view of all student fees and payment status
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative w-96">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search students by name, ID, or phone..."
                      className="pl-10 pr-4 h-12 text-base border rounded-xl shadow-sm w-96 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => setSetClassFeeOpen(true)} 
                    variant="secondary"
                    className="hover:bg-primary-50 transition-colors"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Set Class Fee
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student: Student) => {
                    const mandate = displayEMandates.find((m: EMandate) => m.studentId === student.id);
                    return (
                      <TableRow 
                        key={student.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-medium">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.studentId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.parentName}</TableCell>
                        <TableCell>{student.parentPhone}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={mandate ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800"}
                          >
                            {mandate ? "E-Mandate Active" : "No E-Mandate"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {!mandate && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setAddMandateOpen(true);
                                }}
                                className="hover:bg-primary-50 transition-colors"
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Setup E-Mandate
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEmiModalOpen(true);
                              }}
                              className="hover:bg-primary-50 transition-colors"
                            >
                              <CreditCard className="mr-1 h-3 w-3" />
                              Set EMI
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
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="relative w-96">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </span>
              <input
                type="text"
                placeholder="Search students by name, ID, or phone..."
                className="pl-10 pr-4 h-12 text-base border rounded-xl shadow-sm w-96 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
              />
            </div>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>EMI</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayFeeStructures.map((fee: FeeStructure) => {
                  const student = displayStudents.find((s: Student) => s.id === fee.studentId);
                  const isOverdue = fee.status === "pending" && new Date(fee.dueDate) < new Date();
                  
                  return (
                    <TableRow key={fee.id} className={isOverdue ? "bg-red-50" : ""}>
                      <TableCell>{student?.name}</TableCell>
                      <TableCell>{student?.class}</TableCell>
                      <TableCell>{fee.feeType}</TableCell>
                      <TableCell>₹{parseFloat(fee.amount).toLocaleString()}</TableCell>
                      <TableCell>{format(new Date(fee.dueDate), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <Badge className={getFeeStatusColor(isOverdue ? "overdue" : fee.status)}>
                          {isOverdue ? "Overdue" : fee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {emiData[fee.id]?.emiPeriod ? (
                          <div>
                            <div>EMI: {emiData[fee.id].emiPeriod} mo</div>
                            <div>Paid: ₹{emiData[fee.id].paidAmount}</div>
                            <div>Dues: ₹{emiData[fee.id].emiDues}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFee(fee);
                            setViewDetailsOpen(true);
                          }}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="mandates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">E-Mandate Management</h3>
            <Button onClick={() => setAddMandateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Setup New E-Mandate
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayEMandates.map((mandate: EMandate) => {
              const student = displayStudents.find((s: Student) => s.id === mandate.studentId);
              const isExpiringSoon = new Date(mandate.endDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              
              return (
                <Card key={mandate.id} className={isExpiringSoon ? "border-orange-200" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{student?.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {mandate.mandateId}
                        </CardDescription>
                      </div>
                      <Badge className={mandate.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {mandate.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3" />
                        {mandate.bankName}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3" />
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
                </Card>
              );
            })}
          </div>
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
                            <Badge>{payment.paymentMethod}</Badge>
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
          <form onSubmit={handleAddClassFee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input name="bankName" placeholder="e.g., HDFC Bank" required />
              </div>
              <div>
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input name="ifscCode" placeholder="e.g., HDFC0000123" required />
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
              <Select name="frequency" defaultValue="monthly">
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
              <Button type="submit" disabled={addClassFeeMutation.isPending}>
                {addClassFeeMutation.isPending ? "Creating..." : "Create E-Mandate"}
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
          <form onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            const data: Partial<ClassFeeStructure> = {
              className: formData.get("className")?.toString() || "",
              feeType: formData.get("feeType")?.toString() || "",
              amount: formData.get("amount")?.toString() || "",
              frequency: formData.get("frequency")?.toString() || "",
              dueDate: formData.get("dueDate")?.toString() || "",
              description: formData.get("description")?.toString() || "",
            };
            // TODO: Call mutation to save class fee and trigger auto-assign logic
            setSetClassFeeOpen(false);
          }} className="space-y-4">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set EMI Details</DialogTitle>
            <DialogDescription>
              Configure EMI schedule for fee payment
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget as HTMLFormElement);
            const data = {
              studentId: emiEditingFee?.studentId,
              feeId: emiEditingFee?.feeId,
              emiPeriod: formData.get("emiPeriod"),
              emiAmount: formData.get("emiAmount"),
              startDate: formData.get("startDate"),
              frequency: formData.get("frequency"),
            };
            
            // Update EMI data
            setEmiData(prev => ({
              ...prev,
              [data.feeId as number]: {
                emiPeriod: data.emiPeriod as string,
                paidAmount: "0",
                emiDues: data.emiAmount as string
              }
            }));
            
            setEmiModalOpen(false);
            toast({
              title: "Success",
              description: "EMI details updated successfully",
            });
          }} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="emiPeriod">EMI Period (months)</Label>
                <Input 
                  id="emiPeriod" 
                  name="emiPeriod" 
                  type="number" 
                  min="1" 
                  max="36" 
                  required 
                  placeholder="Enter number of months"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="emiAmount">EMI Amount (₹)</Label>
                <Input 
                  id="emiAmount" 
                  name="emiAmount" 
                  type="number" 
                  required 
                  placeholder="Enter EMI amount"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="date" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="frequency">Payment Frequency</Label>
                <Select name="frequency" required defaultValue="monthly">
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
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEmiModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Set EMI</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}