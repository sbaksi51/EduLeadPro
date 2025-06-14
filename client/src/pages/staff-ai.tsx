import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/ui/header";
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
  Star
} from "lucide-react";
import { format } from "date-fns";

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

export default function StaffAI() {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: staff = [] } = useQuery({ queryKey: ["/api/staff"] });
  const { data: attendance = [] } = useQuery({ queryKey: ["/api/attendance"] });
  const { data: payroll = [] } = useQuery({ queryKey: ["/api/payroll"] });

  // AI Analysis mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async (staffId: number) => {
      const staffMember = (staff as Staff[]).find(s => s.id === staffId);
      const staffAttendance = (attendance as Attendance[]).filter(a => a.staffId === staffId);
      
      if (!staffMember) throw new Error("Staff member not found");

      return await apiRequest("/api/ai/staff-performance", {
        method: "POST",
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
    },
    onSuccess: () => {
      toast({
        title: "AI Analysis Complete",
        description: "Staff performance analysis generated successfully",
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
            <div className="text-2xl font-bold">{(staff as Staff[]).length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(staff as Staff[]).length > 0 
                ? ((staff as Staff[]).reduce((sum, s) => sum + getStaffAttendanceRate(s.id), 0) / (staff as Staff[]).length).toFixed(1)
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
              {(staff as Staff[]).filter(s => getStaffAttendanceRate(s.id) >= 90).length}
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
              {(staff as Staff[]).filter(s => getStaffAttendanceRate(s.id) < 70).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Staff Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
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
                    <TableHead>Joining Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(staff as Staff[]).map((member) => {
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
            {(staff as Staff[]).map((member) => {
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
                        {(aiAnalysisMutation.data as StaffPerformanceAnalysis).performanceScore}%
                      </div>
                      <Badge className={getPerformanceColor((aiAnalysisMutation.data as StaffPerformanceAnalysis).performanceScore)}>
                        {(aiAnalysisMutation.data as StaffPerformanceAnalysis).performanceScore >= 85 ? "Excellent" : 
                         (aiAnalysisMutation.data as StaffPerformanceAnalysis).performanceScore >= 70 ? "Good" : "Needs Improvement"}
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
                        ₹{(aiAnalysisMutation.data as StaffPerformanceAnalysis).salaryRecommendation.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(aiAnalysisMutation.data as StaffPerformanceAnalysis).salaryRecommendation > (selectedStaff?.salary || 0) 
                          ? `+₹${((aiAnalysisMutation.data as StaffPerformanceAnalysis).salaryRecommendation - (selectedStaff?.salary || 0)).toLocaleString()} increase`
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
                      <Badge className={(aiAnalysisMutation.data as StaffPerformanceAnalysis).promotionEligibility ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {(aiAnalysisMutation.data as StaffPerformanceAnalysis).promotionEligibility ? "Eligible" : "Not Eligible"}
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
                    <p className="font-medium">{(aiAnalysisMutation.data as StaffPerformanceAnalysis).attendancePattern}</p>
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
                      {(aiAnalysisMutation.data as StaffPerformanceAnalysis).trainingNeeds.map((need, index) => (
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
                      {(aiAnalysisMutation.data as StaffPerformanceAnalysis).insights.map((insight, index) => (
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