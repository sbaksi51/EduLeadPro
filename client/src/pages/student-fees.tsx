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
import { Header } from "@/components/ui/header";
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
  academicYear: string;
  installmentNumber: number;
  totalInstallments: number;
  status: string;
}

interface FeePayment {
  id: number;
  studentId: number;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  receiptNumber: string;
}

interface EMandate {
  id: number;
  studentId: number;
  mandateId: string;
  bankName: string;
  accountNumber: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function StudentFees() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [addMandateOpen, setAddMandateOpen] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: students = [] } = useQuery({ queryKey: ["/api/students"] });
  const { data: feeStructures = [] } = useQuery({ queryKey: ["/api/fee-structures"] });
  const { data: feePayments = [] } = useQuery({ queryKey: ["/api/fee-payments"] });
  const { data: eMandates = [] } = useQuery({ queryKey: ["/api/e-mandates"] });
  const { data: feeStats } = useQuery({ queryKey: ["/api/fee-stats"] });

  // AI Analysis mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const student = students.find((s: Student) => s.id === studentId);
      const studentFees = feeStructures.filter((f: FeeStructure) => f.studentId === studentId);
      const studentPayments = feePayments.filter((p: FeePayment) => p.studentId === studentId);
      
      const totalFees = studentFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
      const paidAmount = studentPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const overdueAmount = Math.max(0, totalFees - paidAmount);

      return await apiRequest("/api/ai/fee-optimization", {
        method: "POST",
        body: JSON.stringify({
          studentId,
          totalFees,
          paidAmount,
          overdueAmount,
          paymentHistory: studentPayments.map(p => ({
            amount: parseFloat(p.amount),
            date: p.paymentDate,
            method: p.paymentMethod
          }))
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "AI Analysis Complete",
        description: "Fee optimization recommendations generated successfully",
      });
    },
  });

  // E-Mandate creation mutation
  const createMandateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/e-mandates", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/e-mandates"] });
      setAddMandateOpen(false);
      toast({
        title: "Success",
        description: "E-Mandate created successfully",
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

  const calculateOutstanding = (studentId: number) => {
    const fees = getStudentFees(studentId);
    const payments = getStudentPayments(studentId);
    
    const totalFees = fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
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

  const handleAddMandate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    createMandateMutation.mutate({
      studentId: selectedStudent?.id,
      mandateId: `MAN${Date.now()}`,
      bankName: formData.get("bankName"),
      accountNumber: formData.get("accountNumber"),
      ifscCode: formData.get("ifscCode"),
      accountHolderName: formData.get("accountHolderName"),
      maxAmount: formData.get("maxAmount"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      frequency: formData.get("frequency"),
    });
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Student Fees & E-Mandate Management" 
        subtitle="Comprehensive fee tracking with AI-powered insights and automated payment collection"
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{feeStats?.totalPending?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feeStats?.collectionRate?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{feeStats?.totalOverdue?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active E-Mandates</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eMandates.filter((m: EMandate) => m.status === 'active').length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fee-tracking">Fee Tracking</TabsTrigger>
          <TabsTrigger value="e-mandates">E-Mandates</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Fee Overview</CardTitle>
              <CardDescription>
                Comprehensive view of all student fees and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Total Fees</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>E-Mandate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student: Student) => {
                    const outstanding = calculateOutstanding(student.id);
                    const mandate = getStudentMandate(student.id);
                    const totalFees = getStudentFees(student.id).reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
                    const totalPaid = getStudentPayments(student.id).reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>₹{totalFees.toLocaleString()}</TableCell>
                        <TableCell>₹{totalPaid.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={outstanding > 0 ? "font-semibold text-red-600" : "text-green-600"}>
                            ₹{outstanding.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {mandate ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="outline">Not Setup</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setAiAnalysisOpen(true);
                                aiAnalysisMutation.mutate(student.id);
                              }}
                            >
                              <Bot className="mr-1 h-3 w-3" />
                              AI Analysis
                            </Button>
                            {!mandate && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setAddMandateOpen(true);
                                }}
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Setup E-Mandate
                              </Button>
                            )}
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

        <TabsContent value="fee-tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure & Payments</CardTitle>
              <CardDescription>
                Detailed fee tracking with installment management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Installment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.map((fee: FeeStructure) => {
                    const student = students.find((s: Student) => s.id === fee.studentId);
                    const isOverdue = fee.status === "pending" && new Date(fee.dueDate) < new Date();
                    
                    return (
                      <TableRow key={fee.id} className={isOverdue ? "bg-red-50" : ""}>
                        <TableCell>{student?.name}</TableCell>
                        <TableCell className="capitalize">{fee.feeType}</TableCell>
                        <TableCell>₹{parseFloat(fee.amount).toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(fee.dueDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {fee.installmentNumber}/{fee.totalInstallments}
                        </TableCell>
                        <TableCell>
                          <Badge className={getFeeStatusColor(isOverdue ? "overdue" : fee.status)}>
                            {isOverdue ? "Overdue" : fee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
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

        <TabsContent value="e-mandates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">E-Mandate Management</h3>
            <Button onClick={() => setAddMandateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Setup New E-Mandate
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eMandates.map((mandate: EMandate) => {
              const student = students.find((s: Student) => s.id === mandate.studentId);
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

        <TabsContent value="ai-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI-Powered Fee Insights
              </CardTitle>
              <CardDescription>
                Get intelligent recommendations for fee optimization and collection strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Select a student from the overview tab and click "AI Analysis" to get personalized fee optimization recommendations.
                </p>
                <p className="text-sm text-muted-foreground">
                  AI analysis includes payment behavior patterns, risk assessment, and customized EMI recommendations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* E-Mandate Setup Dialog */}
      <Dialog open={addMandateOpen} onOpenChange={setAddMandateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Setup E-Mandate for {selectedStudent?.name}</DialogTitle>
            <DialogDescription>
              Configure auto-debit mandate for automated fee collection
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMandate} className="space-y-4">
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
              <Button type="submit" disabled={createMandateMutation.isPending}>
                {createMandateMutation.isPending ? "Creating..." : "Create E-Mandate"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={aiAnalysisOpen} onOpenChange={setAiAnalysisOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Fee Optimization for {selectedStudent?.name}
            </DialogTitle>
            <DialogDescription>
              AI-powered analysis and recommendations for fee optimization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {aiAnalysisMutation.isPending ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Analyzing fee data with AI...</p>
              </div>
            ) : aiAnalysisMutation.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={
                        aiAnalysisMutation.data.riskLevel === 'high' ? "bg-red-100 text-red-800" :
                        aiAnalysisMutation.data.riskLevel === 'medium' ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {aiAnalysisMutation.data.riskLevel.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recommended EMI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">₹{aiAnalysisMutation.data.emiAmount}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recommended Action</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{aiAnalysisMutation.data.recommendedAction}</p>
                    <p className="text-sm text-muted-foreground mt-1">{aiAnalysisMutation.data.paymentPlan}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Analysis Reasons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {aiAnalysisMutation.data.reasons.map((reason: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {reason}
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