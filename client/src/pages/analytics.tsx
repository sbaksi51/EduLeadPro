import { useState } from "react";
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
  Filter
} from "lucide-react";
import Header from "@/components/layout/header";
import { format, subDays, subMonths } from "date-fns";

interface AnalyticsData {
  leadConversion: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    trends: Array<{ month: string; leads: number; conversions: number }>;
  };
  revenueAnalytics: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    feeCollection: Array<{ month: string; collected: number; pending: number }>;
  };
  studentAnalytics: {
    totalStudents: number;
    activeStudents: number;
    newAdmissions: number;
    classDistribution: Array<{ class: string; count: number }>;
    streamDistribution: Array<{ stream: string; count: number }>;
  };
  staffAnalytics: {
    totalStaff: number;
    activeStaff: number;
    attendanceRate: number;
    departmentDistribution: Array<{ department: string; count: number }>;
  };
  financialHealth: {
    totalExpenses: number;
    profitMargin: number;
    expenseCategories: Array<{ category: string; amount: number; percentage: number }>;
    cashFlow: Array<{ month: string; income: number; expenses: number }>;
  };
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("overview");

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics", timeRange],
  });

  const getKPICards = () => {
    if (!analytics) return [];

    return [
      {
        title: "Lead Conversion Rate",
        value: `${analytics.leadConversion?.conversionRate || 0}%`,
        change: "+12.5%",
        trend: "up",
        icon: Target,
        color: "text-green-600"
      },
      {
        title: "Monthly Revenue",
        value: `₹${(analytics.revenueAnalytics?.monthlyRevenue || 0).toLocaleString()}`,
        change: "+8.2%", 
        trend: "up",
        icon: IndianRupee,
        color: "text-blue-600"
      },
      {
        title: "Active Students",
        value: analytics.studentAnalytics?.activeStudents || 0,
        change: "+15.3%",
        trend: "up", 
        icon: GraduationCap,
        color: "text-purple-600"
      },
      {
        title: "Staff Attendance",
        value: `${analytics.staffAnalytics?.attendanceRate || 0}%`,
        change: "-2.1%",
        trend: "down",
        icon: Users,
        color: "text-orange-600"
      },
      {
        title: "Profit Margin",
        value: `${analytics.financialHealth?.profitMargin || 0}%`,
        change: "+5.7%",
        trend: "up",
        icon: TrendingUp,
        color: "text-green-600"
      },
      {
        title: "Fee Collection Rate", 
        value: "94.5%",
        change: "+3.2%",
        trend: "up",
        icon: BarChart3,
        color: "text-blue-600"
      }
    ];
  };

  const renderChart = (data: any[], type: "bar" | "line" | "pie") => {
    // Simple chart representation using CSS
    const maxValue = Math.max(...data.map(d => d.value || d.count || d.amount || 0));
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium">{item.label || item.month || item.class || item.category}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${((item.value || item.count || item.amount || 0) / maxValue) * 100}%` 
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {item.value || item.count || item.amount || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const kpiCards = getKPICards();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header title="Analytics Dashboard" subtitle="Comprehensive insights and performance metrics" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title="Analytics Dashboard" 
        subtitle="Comprehensive insights and performance metrics"
      />

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48">
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
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend === "up";
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
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
          );
        })}
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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

        <TabsContent value="leads" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lead Source Performance</CardTitle>
                <CardDescription>Conversion rates by lead source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: "Google Ads", leads: 150, conversions: 45, rate: 30 },
                    { source: "Facebook", leads: 120, conversions: 24, rate: 20 },
                    { source: "Referrals", leads: 80, conversions: 32, rate: 40 },
                    { source: "Website", leads: 90, conversions: 18, rate: 20 },
                    { source: "Walk-ins", leads: 60, conversions: 30, rate: 50 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.source}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.conversions}/{item.leads} conversions
                        </div>
                      </div>
                      <Badge variant={item.rate >= 30 ? "default" : "secondary"}>
                        {item.rate}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Counselor Performance</CardTitle>
                <CardDescription>Lead conversion by counselor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Priya Sharma", leads: 85, conversions: 34, rate: 40 },
                    { name: "Rajesh Singh", leads: 92, conversions: 28, rate: 30 },
                    { name: "Anita Patel", leads: 78, conversions: 31, rate: 40 },
                    { name: "Vikram Kumar", leads: 65, conversions: 16, rate: 25 }
                  ].map((counselor, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{counselor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {counselor.conversions}/{counselor.leads} conversions
                        </div>
                      </div>
                      <Badge variant={counselor.rate >= 35 ? "default" : "secondary"}>
                        {counselor.rate}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.month}</span>
                        <span>₹{(item.collected + item.pending).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(item.collected / (item.collected + item.pending)) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Collected: ₹{item.collected.toLocaleString()}</span>
                        <span>Pending: ₹{item.pending.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>New admissions over time</CardDescription>
              </CardHeader>
              <CardContent>
                {renderChart([
                  { label: "Jan", value: 45 },
                  { label: "Feb", value: 52 },
                  { label: "Mar", value: 38 },
                  { label: "Apr", value: 65 },
                  { label: "May", value: 58 },
                  { label: "Jun", value: 72 }
                ], "line")}
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

        <TabsContent value="staff" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
                <CardTitle>Attendance Trends</CardTitle>
                <CardDescription>Monthly staff attendance rates</CardDescription>
              </CardHeader>
              <CardContent>
                {renderChart([
                  { label: "Jan", value: 94 },
                  { label: "Feb", value: 92 },
                  { label: "Mar", value: 96 },
                  { label: "Apr", value: 88 },
                  { label: "May", value: 93 },
                  { label: "Jun", value: 95 }
                ], "line")}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>Automated analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">Positive Trends</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                  Lead conversion rate increased by 12.5% this month
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                  Revenue growth of 8.2% compared to last month
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                  Student enrollment up 15.3% year-over-year
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-600">Areas for Improvement</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-600 mt-0.5" />
                  Staff attendance declined by 2.1% - review attendance policies
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                  Website leads have lowest conversion rate - optimize landing pages
                </li>
                <li className="flex items-start gap-2">
                  <IndianRupee className="h-4 w-4 text-orange-600 mt-0.5" />
                  Fee collection pending for ₹2.3L - implement automated reminders
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}