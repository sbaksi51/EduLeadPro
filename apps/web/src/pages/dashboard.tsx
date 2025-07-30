import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DonutChart from "@/components/dashboard/DonutChart";
import BarChart from "@/components/dashboard/BarChart";
import AreaChart from "@/components/dashboard/AreaChart";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Users, DollarSign, UserCheck, BarChart2, PieChart, Zap } from "lucide-react";
// mockAnalyticsData and mockDashboardData removed (file deleted)
import { AreaChart as RCAreaChart, BarChart as RCBarChart, Area, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Tooltip as RechartsBarTooltip, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';
import Header from "@/components/layout/header";

// Mock data for products and team
const products = [
  { name: "iPhone 14 Pro Max", stock: 524, price: 1099 },
  { name: "Apple Watch S8", stock: 320, price: 799 },
  { name: "MacBook Pro 16", stock: 120, price: 2499 },
  { name: "iPad Air 5th Gen", stock: 210, price: 699 },
];
const team = [
  { name: "John Carter", email: "contact@sophiemoore.com", progress: 60 },
  { name: "Sophie Moore", email: "contact@sophiemoore.com", progress: 33 },
  { name: "Matt Cannon", email: "contact@sophiemoore.com", progress: 75 },
];
const websiteVisitors = {
  total: 150000,
  breakdown: [
    { label: "Organic", value: 30 },
    { label: "Social", value: 50 },
    { label: "Direct", value: 20 },
  ],
  colors: ["#a78bfa", "#38bdf8", "#f472b6"],
  transactions: 80,
};

// Types for placeholder analytics
type Analytics = {
  leadConversion: {
    totalLeads: number;
    trends: any[];
    sourcePerformance: any[];
  };
  revenueAnalytics: {
    monthlyRevenue: number;
    feeCollection: any[];
  };
  staffAnalytics: {
    totalStaff: number;
    departmentDistribution: any[];
    attendanceRate: number;
  };
  financialHealth: {
    totalExpenses: number;
    expenseCategories: any[];
  };
};

export default function Dashboard() {
  // Date range for revenue chart
  const [dateRange, setDateRange] = useState("2024");

  // Use analytics for KPIs
  // Placeholder analytics and aiInsights to prevent runtime errors
  const analytics: Analytics = {
    leadConversion: {
      totalLeads: 0,
      trends: [],
      sourcePerformance: [{ source: 'Unknown', leads: 0, conversions: 0, rate: 0 }],
    },
    revenueAnalytics: {
      monthlyRevenue: 0,
      feeCollection: [],
    },
    staffAnalytics: {
      totalStaff: 0,
      departmentDistribution: [],
      attendanceRate: 0,
    },
    financialHealth: {
      totalExpenses: 0,
      expenseCategories: [],
    },
  };
  const aiInsights = [];

  const kpis = [
    {
      title: "Lead Management",
      value: analytics?.leadConversion?.totalLeads || 0,
      change: "+12.5%",
      icon: BarChart2,
      color: "text-green-400",
    },
    {
      title: "Student Fee",
      value: `₹${(analytics?.revenueAnalytics?.monthlyRevenue || 0).toLocaleString()}`,
      change: "+8.2%",
      icon: DollarSign,
      color: "text-blue-400",
    },
    {
      title: "Staff Management",
      value: analytics?.staffAnalytics?.totalStaff || 0,
      change: "+15.3%",
      icon: Users,
      color: "text-purple-400",
    },
    {
      title: "Expenses",
      value: `₹${(analytics?.financialHealth?.totalExpenses || 0).toLocaleString()}`,
      change: "-2.1%",
      icon: PieChart,
      color: "text-orange-400",
    },
  ];

  // Revenue by customer type mock
  const revenueByCustomerType = [
    { label: "Current clients", value: 90000, color: "#a78bfa" },
    { label: "Subscribers", value: 70000, color: "#38bdf8" },
    { label: "New customers", value: 80000, color: "#f472b6" },
  ];

  // Student Fee DonutChart data
  const feeData: any[] = analytics.revenueAnalytics.feeCollection || [];
  const totalPaid = feeData.reduce((sum: number, f: any) => sum + (f.collected || 0), 0);
  const totalPending = feeData.reduce((sum: number, f: any) => sum + (f.pending || 0), 0);
  const studentFeeDonutData = [
    { label: "Paid", value: totalPaid },
    { label: "Pending", value: totalPending }
  ];
  const studentFeeColors = ["#38bdf8", "#f472b6"];

  // Marketing trends for AI Marketing card
  const marketingTrends: any[] = (analytics.leadConversion.trends || []).map((t: any) => ({
    label: String(t.month || ''),
    leads: t.leads || 0,
    conversions: t.conversions || 0
  }));

  return (
    <>
      <Header />
      <div className="min-h-screen w-full bg-black text-white px-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            const isPositive = !kpi.change.startsWith("-");
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;
            return (
              <Card key={idx} className="bg-[#62656e] text-white border-none shadow-lg">
                <CardContent className="p-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{kpi.title}</p>
                      <p className="text-2xl font-bold mt-1 text-white">{kpi.value}</p>
                      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}> <TrendIcon className="h-3 w-3" /> {kpi.change} </div>
                    </div>
                    <Icon className={`h-8 w-8 ${kpi.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Grid - EduLeadPro Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {/* Lead Management */}
          <Card className="bg-[#23243a] rounded-2xl shadow-xl p-6 flex flex-col justify-between min-h-[340px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-extrabold text-white mb-2">Lead Management</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1">
              <DonutChart
                title="Lead Sources"
                data={analytics.leadConversion.sourcePerformance.map(s => ({
                  label: s.source,
                  value: s.leads
                }))}
                colors={["#a78bfa", "#38bdf8", "#f472b6", "#f59e42", "#14b8a6"]}
              />
            </CardContent>
          </Card>

          {/* Staff Management */}
          <Card className="bg-[#23243a] rounded-2xl shadow-xl p-6 flex flex-col justify-between min-h-[340px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-extrabold text-white mb-2">Staff Management</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1 w-full">
              <div className="w-full">
                <ResponsiveContainer width="100%" height={180}>
                  <RCBarChart data={(analytics.staffAnalytics.departmentDistribution || []).map((d: any) => ({ label: d.department || '', value: d.count || 0 }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="staffBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="label" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <RechartsBarTooltip
                      contentStyle={{ background: "#18181b", borderRadius: 8, color: "#fff", border: "none" }}
                      labelStyle={{ color: "#fff" }}
                      cursor={{ fill: "#444", opacity: 0.1 }}
                    />
                    <Bar dataKey="value" fill="url(#staffBar)" radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="value" position="top" fill="#fff" fontSize={14} />
                    </Bar>
                  </RCBarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-lg text-gray-300">Attendance Rate: {analytics.staffAnalytics.attendanceRate}%</div>
            </CardContent>
          </Card>

          {/* Student Fee */}
          <Card className="bg-[#23243a] rounded-2xl shadow-xl p-6 flex flex-col justify-between min-h-[340px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-extrabold text-white mb-2">Student Fee</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1">
              <DonutChart
                title="Fee Status"
                data={studentFeeDonutData}
                colors={studentFeeColors}
              />
              <div className="mt-4 text-lg text-gray-300 text-center w-full">
                Paid: ₹{totalPaid.toLocaleString()}<br />
                Pending: ₹{totalPending.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card className="bg-[#23243a] rounded-2xl shadow-xl p-6 flex flex-col justify-between min-h-[340px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-extrabold text-white mb-2">Expenses</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1">
              <DonutChart
                title="Expense Categories"
                data={(analytics.financialHealth.expenseCategories || []).map((e: any) => ({
                  label: String(e.category || ''),
                  value: e.amount || 0
                }))}
                colors={["#a78bfa", "#38bdf8", "#f472b6", "#f59e42", "#14b8a6"]}
              />
            </CardContent>
          </Card>

          {/* AI Forecasting */}
          <Card className="bg-[#23243a] rounded-2xl shadow-xl p-6 flex flex-col justify-between min-h-[340px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-extrabold text-white mb-2">AI Forecasting</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center flex-1">
              <div className="text-3xl font-extrabold text-white mb-2">
                Predicted Enrollments: <span className="text-[#a78bfa]">0</span>
              </div>
              <div className="text-lg text-gray-300 mb-2">Confidence: 0%</div>
              <ul className="text-base text-gray-200 list-disc ml-5">
                {/* No insights available */}
              </ul>
            </CardContent>
          </Card>

          {/* AI Marketing */}
          <Card className="bg-[#23243a] rounded-2xl shadow-xl p-6 flex flex-col justify-between min-h-[340px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-extrabold text-white mb-2">AI Marketing</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1 w-full">
              <div className="w-full">
                <ResponsiveContainer width="100%" height={180}>
                  <RCAreaChart data={marketingTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <RechartsTooltip contentStyle={{ background: '#18181b', borderRadius: 8, color: '#fff', border: 'none' }} labelStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="leads" stroke="#38bdf8" fillOpacity={1} fill="url(#colorLeads)" name="Leads" />
                    <Area type="monotone" dataKey="conversions" stroke="#a855f7" fillOpacity={1} fill="url(#colorConversions)" name="Conversions" />
                  </RCAreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-lg text-gray-300">Best Channel: {(analytics.leadConversion.sourcePerformance[0] && analytics.leadConversion.sourcePerformance[0].source) || 'N/A'}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
