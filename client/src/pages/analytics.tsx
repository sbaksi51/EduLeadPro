import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  GraduationCap, 
  IndianRupee, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Info,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import Header from "@/components/layout/header";
import { format, subDays, subMonths } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { mockAnalyticsData } from "@/lib/mockData";

interface AnalyticsData {
  leadConversion: {
    conversionRate: number;
    sourcePerformance: Array<{
      source: string;
      leads: number;
      conversions: number;
      rate: number;
    }>;
    trends: Array<{
      month: string;
      leads: number;
      conversions: number;
    }>;
  };
  revenueAnalytics: {
    monthlyRevenue: number;
    feeCollection: Array<{
      month: string;
      collected: number;
      pending: number;
    }>;
  };
  studentAnalytics: {
    activeStudents: number;
    classDistribution: Array<{
      class: string;
      count: number;
    }>;
    streamDistribution: Array<{
      stream: string;
      count: number;
    }>;
    attendanceTrend: Array<{
      month: string;
      rate: number;
    }>;
  };
  staffAnalytics: {
    attendanceRate: number;
    departmentDistribution: Array<{
      department: string;
      count: number;
    }>;
    performanceMetrics: Array<{
      month: string;
      attendance: number;
      performance: number;
    }>;
  };
  financialHealth: {
    profitMargin: number;
    cashFlow: Array<{
      month: string;
      income: number;
      expenses: number;
    }>;
    expenseCategories: Array<{
      category: string;
      amount: number;
    }>;
  };
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState(() => {
    return window.location.hash.slice(1) || "overview";
  });

  const handleTabChange = (value: string) => {
    setSelectedMetric(value);
    window.location.hash = value;
  };

  // Use mock data instead of API call
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange],
    queryFn: () => Promise.resolve(mockAnalyticsData),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Memoize KPI cards to prevent unnecessary recalculations
  const kpiCards = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        title: "Lead Conversion Rate",
        value: `${analytics.leadConversion?.conversionRate || 0}%`,
        change: "+12.5%",
        trend: "up",
        icon: Target,
        color: "text-green-600",
        tooltip: "Percentage of leads converted to admissions"
      },
      {
        title: "Monthly Revenue",
        value: `₹${(analytics.revenueAnalytics?.monthlyRevenue || 0).toLocaleString()}`,
        change: "+8.2%", 
        trend: "up",
        icon: IndianRupee,
        color: "text-blue-600",
        tooltip: "Total revenue generated this month"
      },
      {
        title: "Active Students",
        value: analytics.studentAnalytics?.activeStudents || 0,
        change: "+15.3%",
        trend: "up", 
        icon: GraduationCap,
        color: "text-purple-600",
        tooltip: "Currently enrolled students"
      },
      {
        title: "Staff Attendance",
        value: `${analytics.staffAnalytics?.attendanceRate || 0}%`,
        change: "-2.1%",
        trend: "down",
        icon: Users,
        color: "text-orange-600",
        tooltip: "Staff attendance rate this month"
      },
      {
        title: "Profit Margin",
        value: `${analytics.financialHealth?.profitMargin || 0}%`,
        change: "+5.7%",
        trend: "up",
        icon: TrendingUp,
        color: "text-green-600",
        tooltip: "Current profit margin"
      },
      {
        title: "Fee Collection Rate", 
        value: "94.5%",
        change: "+3.2%",
        trend: "up",
        icon: BarChart3,
        color: "text-blue-600",
        tooltip: "Percentage of fees collected on time"
      }
    ];
  }, [analytics]);

  const renderChart = (data: any[], type: "bar" | "line" | "pie") => {
    const maxValue = Math.max(...data.map(d => d.value || d.count || d.amount || 0));
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.label || item.month || item.class || item.category}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click for detailed view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-slate-100 rounded-full h-2">
                <motion.div 
                  className="bg-blue-600 h-2 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${((item.value || item.count || item.amount || 0) / maxValue) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
              <span className="text-sm text-slate-600 w-16 text-right">
                {item.value || item.count || item.amount || 0}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Helper to get tab-specific insights
  const getTabInsights = () => {
    // Map tab keys to aiInsights keys
    const tabKeyMap: Record<string, keyof typeof mockAnalyticsData.aiInsights> = {
      overview: "overview",
      leads: "leads",
      revenue: "revenue",
      students: "students",
      staff: "staff"
    };
    return mockAnalyticsData.aiInsights[tabKeyMap[selectedMetric] || "overview"] || { positiveTrends: [], areasForImprovement: [] };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header title="Analytics Dashboard" subtitle="Comprehensive insights and performance metrics" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Header 
        title="Analytics Dashboard" 
        subtitle="Comprehensive insights and performance metrics"
      />

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMetric} onValueChange={handleTabChange}>
            <SelectTrigger className="w-48 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="leads">Lead Analytics</SelectItem>
              <SelectItem value="revenue">Revenue Analytics</SelectItem>
              <SelectItem value="students">Student Analytics</SelectItem>
              <SelectItem value="staff">Staff Analytics</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 px-6">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="h-11 px-6">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-6 mb-2">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend === "up";
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                              {kpi.title}
                              <Info className="w-3 h-3" />
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{kpi.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                      <div className={`flex items-center gap-1 text-sm ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendIcon className="h-3 w-3" />
                        {kpi.change}
                      </div>
                    </div>
                    <Icon className={`h-8 w-8 ${kpi.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedMetric} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly comparison of income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.financialHealth?.cashFlow && renderChart(
                  analytics.financialHealth.cashFlow.map(item => ({
                    label: item.month,
                    value: item.income - item.expenses
                  })),
                  "bar"
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Distribution by Class</CardTitle>
                <CardDescription>Current enrollment across different classes</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.studentAnalytics?.classDistribution && renderChart(
                  analytics.studentAnalytics.classDistribution.map(item => ({
                    label: item.class,
                    count: item.count
                  })),
                  "pie"
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Trends</CardTitle>
                <CardDescription>Monthly lead generation and conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.leadConversion?.trends && renderChart(
                  analytics.leadConversion.trends.map(item => ({
                    label: item.month,
                    value: Math.round((item.conversions / item.leads) * 100)
                  })),
                  "line"
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Distribution of expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.financialHealth?.expenseCategories && renderChart(
                  analytics.financialHealth.expenseCategories,
                  "pie"
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lead Source Performance</CardTitle>
                  <CardDescription>Conversion rates by lead source</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">Last 30 days</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.leadConversion?.sourcePerformance?.map((item, index) => {
                    const colors = [
                      { bg: "bg-blue-50", dot: "bg-blue-500" },
                      { bg: "bg-green-50", dot: "bg-green-500" },
                      { bg: "bg-purple-50", dot: "bg-purple-500" },
                      { bg: "bg-orange-50", dot: "bg-orange-500" }
                    ];
                    const color = colors[index % colors.length];
                    const total = analytics.leadConversion.sourcePerformance.reduce((sum, s) => sum + s.leads, 0);
                    const percent = total > 0 ? ((item.leads / total) * 100).toFixed(1) : "0.0";
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between rounded-xl p-4 ${color.bg}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${color.dot}`}></span>
                          <span className="font-medium text-base">{item.source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-lg text-gray-900">{item.leads} leads</span>
                          <span className="text-xs text-gray-500">{percent}% of total</span>
                        </div>
                        <span className="ml-4">
                          <Badge className="bg-white text-green-700 border border-green-200 px-3 py-1 text-xs font-semibold">
                            {item.rate}% conversion
                          </Badge>
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center mt-4">
                  <Button variant="link" className="text-blue-600 font-medium">
                    View Detailed Report
                    <svg className="ml-1 w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Trends</CardTitle>
                <CardDescription>Monthly lead generation and conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.leadConversion?.trends && renderChart(
                  analytics.leadConversion.trends.map(item => ({
                    label: item.month,
                    value: Math.round((item.conversions / item.leads) * 100)
                  })),
                  "line"
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue growth</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.revenueAnalytics?.feeCollection && renderChart(
                  analytics.revenueAnalytics.feeCollection.map(item => ({
                    label: item.month,
                    value: item.collected
                  })),
                  "line"
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fee Collection Status</CardTitle>
                <CardDescription>Collected vs pending fees by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.revenueAnalytics?.feeCollection?.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span>{item.month}</span>
                        <span>₹{(item.collected + item.pending).toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(item.collected / (item.collected + item.pending)) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Collected: ₹{item.collected.toLocaleString()}</span>
                        <span>Pending: ₹{item.pending.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>New admissions over time</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.studentAnalytics?.attendanceTrend && renderChart(
                  analytics.studentAnalytics.attendanceTrend.map(item => ({
                    label: item.month,
                    value: item.rate
                  })),
                  "line"
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stream Distribution</CardTitle>
                <CardDescription>Students by academic stream</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.studentAnalytics?.streamDistribution && renderChart(
                  analytics.studentAnalytics.streamDistribution,
                  "pie"
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Staff count by department</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.staffAnalytics?.departmentDistribution && renderChart(
                  analytics.staffAnalytics.departmentDistribution,
                  "bar"
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Staff performance and attendance trends</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.staffAnalytics?.performanceMetrics && renderChart(
                  analytics.staffAnalytics.performanceMetrics.map(item => ({
                    label: item.month,
                    value: (item.attendance + item.performance) / 2
                  })),
                  "line"
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI-Powered Insights Section (tab-specific) */}
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <h2 className="text-xl font-bold mb-1">AI-Powered Insights</h2>
        <p className="text-slate-500 mb-4">Automated analysis and recommendations</p>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Positive Trends */}
          <div>
            <h3 className="font-semibold text-green-600 mb-2">Positive Trends</h3>
            <ul className="space-y-2 text-sm">
              {getTabInsights().positiveTrends.length === 0 && (
                <li className="text-slate-400">No positive trends detected for this period.</li>
              )}
              {getTabInsights().positiveTrends.map((trend, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  {trend}
                </li>
              ))}
            </ul>
          </div>
          {/* Areas for Improvement */}
          <div>
            <h3 className="font-semibold text-orange-600 mb-2">Areas for Improvement</h3>
            <ul className="space-y-2 text-sm">
              {getTabInsights().areasForImprovement.length === 0 && (
                <li className="text-slate-400">No major issues detected for this period.</li>
              )}
              {getTabInsights().areasForImprovement.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}