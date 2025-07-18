import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import StatsGrid from "@/components/dashboard/stats-grid";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AIInsights from "@/components/dashboard/ai-insights";
import AddLeadModal from "@/components/leads/add-lead-modal";
import { TrendingUp, User, Info, BarChart2, Users, Award, Percent } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DonutChart from "@/components/dashboard/DonutChart";
import DivisionCardList from "@/components/dashboard/DivisionCardList";
import HighlightCard from "@/components/dashboard/HighlightCard";
import LineChart from "@/components/dashboard/LineChart";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { TrendingUp as TrendingUpIcon, User as UserIcon, Users as UsersIcon, Bell, PieChart, Calendar as CalendarIcon, BarChart2 as BarChart2Icon, CheckCircle, MinusCircle, UserCheck, Shield, MessageCircle, Zap, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import BarChart from "@/components/dashboard/BarChart";

// Mock data for all widgets
const leadFunnel = [
  { label: "Inquiry", value: 1200, color: "#6366f1" },
  { label: "Trial", value: 400, color: "#14b8a6" },
  { label: "Admission", value: 220, color: "#22c55e" },
];
const leadsBySource = [
  { label: "Google", value: 600 },
  { label: "Instagram", value: 400 },
  { label: "Walk-ins", value: 200 },
];
const leadsBySourceColors = ["#6366f1", "#14b8a6", "#f59e42"];
const leadKPIs = [
  { label: "Total Leads", value: 1450, icon: <User className="w-5 h-5 text-indigo-500" />, color: "#6366f1", trend: 12, prefix: '', suffix: '' },
  { label: "Conversion Rate", value: "18%", icon: <TrendingUp className="w-5 h-5 text-green-500" />, color: "#22c55e", trend: 2, prefix: '', suffix: '%' },
  { label: "Follow-Ups Due", value: 34, icon: <Bell className="w-5 h-5 text-orange-500" />, color: "#f59e42", trend: -3, prefix: '', suffix: '' },
];
const followUps = [
  { name: "John Doe", date: "2024-06-20" },
  { name: "Priya Singh", date: "2024-06-21" },
  { name: "Amit Patel", date: "2024-06-22" },
];
const feeBarData = [
  { name: "Week 1", Collected: 120000, Pending: 30000 },
  { name: "Week 2", Collected: 150000, Pending: 20000 },
  { name: "Week 3", Collected: 110000, Pending: 40000 },
  { name: "Week 4", Collected: 130000, Pending: 25000 },
];
const feeByMode = [
  { label: "UPI", value: 220000 },
  { label: "Cash", value: 90000 },
  { label: "Bank Transfer", value: 70000 },
];
const feeByModeColors = ["#14b8a6", "#f59e42", "#6366f1"];
const outstandingFees = 95000;
const unpaidStudents = [
  { name: "Riya Sharma", class: "10A", due: 12000, dueDate: "2024-06-25" },
  { name: "Arjun Mehta", class: "9B", due: 8000, dueDate: "2024-06-28" },
  { name: "Sneha Rao", class: "11C", due: 15000, dueDate: "2024-07-01" },
];
const staffKPIs = [
  { label: "Total Staff", value: 42, icon: <Users className="w-5 h-5 text-indigo-500" />, color: "#6366f1", trend: 1 },
  { label: "Present Today", value: 38, icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: "#22c55e", trend: 0 },
  { label: "On Leave", value: 4, icon: <MinusCircle className="w-5 h-5 text-orange-500" />, color: "#f59e42", trend: 0 },
];
const staffByRole = [
  { label: "Teaching", value: 24 },
  { label: "Admin", value: 10 },
  { label: "Support", value: 8 },
];
const staffByRoleColors = ["#6366f1", "#14b8a6", "#f59e42"];
const upcomingLeaves = [
  { name: "Amit Kumar", role: "Teacher", date: "2024-06-23" },
  { name: "Neha Gupta", role: "Admin", date: "2024-06-24" },
];
const predictedAdmissions = [
  { x: "Jul", y: 120 },
  { x: "Aug", y: 140 },
  { x: "Sep", y: 180 },
];
const aiWidget = { label: "₹2.3L Fees expected next month", value: 230000, color: "#22c55e" };
const atRiskStudents = 7;
const campaignKPIs = [
  { label: "Reach", value: 12000, icon: <PieChart className="w-5 h-5 text-indigo-500" />, color: "#6366f1", trend: 8 },
  { label: "CPL", value: "₹120", icon: <BarChart2 className="w-5 h-5 text-teal-500" />, color: "#14b8a6", trend: -2 },
  { label: "ROI", value: "3.2x", icon: <TrendingUp className="w-5 h-5 text-green-500" />, color: "#22c55e", trend: 1 },
];
const campaignBarData = [
  { name: "Google", Spend: 40000, Return: 120000 },
  { name: "Instagram", Spend: 25000, Return: 70000 },
  { name: "WhatsApp", Spend: 15000, Return: 60000 },
];
const conversionsByChannel = [
  { label: "WhatsApp", value: 80 },
  { label: "Email", value: 40 },
  { label: "Facebook", value: 30 },
];
const conversionsByChannelColors = ["#14b8a6", "#6366f1", "#f59e42"];
const aiSuggestion = "Send WhatsApp Campaign Today";

// AnimatedNumber helper
interface AnimatedNumberProps {
  value: number | string;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}
function AnimatedNumber({ value, duration = 1.2, className = "", prefix = "", suffix = "" }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = typeof value === "number" ? value : parseFloat(value as string);
    if (isNaN(end)) return;
    const step = (end - start) / (duration * 60);
    let frame = 0;
    function animate() {
      frame++;
      const next = start + step * frame;
      if ((step > 0 && next >= end) || (step < 0 && next <= end)) {
        setDisplay(end);
        return;
      }
      setDisplay(next);
      requestAnimationFrame(animate);
    }
    animate();
    // eslint-disable-next-line
  }, [value]);
  return <span className={className}>{prefix}{typeof value === "number" ? Math.round(display) : display}{suffix}</span>;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Revenue & KPIs
  const { data: stats, isLoading: loadingStats, error: errorStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => fetch("/api/dashboard/stats").then(res => res.json()),
  });

  // Attendance
  const { data: attendance, isLoading: loadingAttendance, error: errorAttendance } = useQuery({
    queryKey: ["/api/attendance/stats"],
    queryFn: () => fetch("/api/attendance/stats").then(res => res.json()),
  });

  // Staff Performance
  const { data: staffAnalytics, isLoading: loadingStaff, error: errorStaff } = useQuery({
    queryKey: ["/api/staff/analytics"],
    queryFn: () => fetch("/api/staff/analytics").then(res => res.json()),
  });

  // Fee KPIs
  const { data: feeStats, isLoading: loadingFeeStats, error: errorFeeStats } = useQuery({
    queryKey: ["/api/fee-stats"],
    queryFn: () => fetch("/api/fee-stats").then(res => res.json()),
  });

  // Attendance rate calculation
  const attendanceRate = attendance && (attendance.totalPresent + attendance.totalAbsent) > 0
    ? ((attendance.totalPresent / (attendance.totalPresent + attendance.totalAbsent)) * 100).toFixed(1)
    : null;

  // Payroll Stats
  const { data: payrollStats, isLoading: loadingPayroll, error: errorPayroll } = useQuery({
    queryKey: ["/api/payroll/stats"],
    queryFn: () => fetch("/api/payroll/stats").then(res => res.json()),
  });

  // Payroll Details
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const { data: payrollDetails, isLoading: loadingPayrollDetails, error: errorPayrollDetails } = useQuery({
    queryKey: ["/api/payroll", currentMonth, currentYear],
    queryFn: () => fetch(`/api/payroll?month=${currentMonth}&year=${currentYear}`).then(res => res.json()),
  });

  // Institution-relevant data
  const genderData = [
    { label: "Female", value: 1200 },
    { label: "Male", value: 1100 },
  ];
  const feeStatusData = [
    { label: "Paid", value: 1800 },
    { label: "Unpaid", value: 500 },
  ];
  const departmentData = [
    { label: "Science", count: 600, color: "#7C3AED" },
    { label: "Arts", count: 400, color: "#14B8A6" },
    { label: "Sports", count: 300, color: "#F59E42" },
  ];
  const enrollmentsThisMonth = 320;
  const enrollmentsTrend = [
    { x: "1", y: 10 },
    { x: "2", y: 20 },
    { x: "3", y: 15 },
    { x: "4", y: 30 },
    { x: "5", y: 25 },
  ];
  const attendanceWeekData = [
    { x: "Mon", y: 50 },
    { x: "Tue", y: 60 },
    { x: "Wed", y: 55 },
    { x: "Thu", y: 70 },
    { x: "Fri", y: 65 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8 text-gray-900 dark:text-white">
      {/* Theme Toggle Button at top right */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          tabIndex={0}
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
        </button>
      </div>
      <div className="max-w-screen-2xl mx-auto px-2 md:px-6 py-8">
        {/* Lead Management Section */}
        <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: 'spring' }}>
          <div className="mb-6">
            <h2
              className="
                font-bold text-2xl md:text-3xl
                bg-clip-text text-transparent
                bg-gradient-to-r
                from-blue-600 via-purple-500 to-pink-400
                dark:from-blue-300 dark:via-purple-300 dark:to-pink-200
                mb-4
              "
            >
              Lead Management
            </h2>
            </div>
          <hr className="mb-8 border-t-2 border-gray-100" />
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-8 items-stretch overflow-x-auto">
            <motion.div className="col-span-12 md:col-span-3 min-w-[220px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, type: "spring" }} whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}>
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <CardTitle className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <TrendingUp className="w-5 h-5 text-indigo-400" /> Lead Funnel
                </CardTitle>
                <div className="flex w-full justify-between gap-4">
                  {leadFunnel.map((step, idx) => (
                    <div key={step.label} className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: step.color + '22' }}>
                        <span className="font-bold text-lg" style={{ color: step.color }}>{step.value}</span>
            </div>
                      <span className="text-xs font-medium" style={{ color: step.color }}>{step.label}</span>
                      {idx < leadFunnel.length - 1 && <div className="w-8 h-1 bg-gray-200 rounded-full my-2" />}
            </div>
                  ))}
            </div>
                <div className="flex gap-2 mt-4">
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Inquiry</Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Trial</Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Admission</Badge>
            </div>
          </div>
            </motion.div>
            <motion.div
              className="col-span-12 md:col-span-3 min-w-[220px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-300"
              tabIndex={0}
              role="button"
              aria-label="Leads by Source card. Click for more details."
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}
            >
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <BarChart data={leadsBySource.map((d, i) => ({ ...d, color: leadsBySourceColors[i] }))} height={120} />
                <div className="flex gap-2 mt-4">
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Google</Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Instagram</Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Walk-ins</Badge>
                </div>
              </div>
            </motion.div>
            {leadKPIs.map((kpi, idx) => (
              <motion.div
                key={kpi.label}
                className="col-span-12 md:col-span-2 min-w-[180px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-300"
                tabIndex={0}
                role="button"
                aria-label={`KPI card: ${kpi.label}, value: ${kpi.value}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05, duration: 0.5, type: "spring" }}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}
              >
                <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col items-center justify-center cursor-pointer transition-colors">
                <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild tabIndex={0} aria-label={`KPI card: ${kpi.label}, value: ${kpi.value}`} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); /* call onClick handler here */ } }}>
                        <div aria-live="polite">
                          <div className="flex items-center gap-2 mb-2">
                            <motion.div
                              className="bg-gradient-to-br from-indigo-400 via-teal-300 to-green-300 rounded-full shadow-lg p-3 flex items-center justify-center"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                            >
                              {kpi.icon}
                            </motion.div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{kpi.label}</span>
                          </div>
                          <div className="text-2xl font-bold mb-1 flex items-center" style={{ color: kpi.color }}>
                            <motion.span whileHover={{ scale: 1.1, color: '#6366f1' }} className="inline-block">
                              <AnimatedNumber value={kpi.value} prefix={kpi.prefix || ''} suffix={kpi.suffix || ''} />
                            </motion.span>
                            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 ml-2">+12%</Badge>
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <TrendingUp className="w-3 h-3 mr-1" style={{ color: kpi.trend >= 0 ? '#22c55e' : '#f59e42' }} />
                            {kpi.trend >= 0 ? '+' : ''}{kpi.trend}%
                          </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span>Click for more info about {kpi.label}</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                </div>
              </motion.div>
            ))}
            <motion.div className="col-span-12 md:col-span-3 min-w-[220px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5, type: "spring" }} whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}>
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-orange-700 dark:text-orange-300">
                  <CalendarIcon className="w-5 h-5 text-orange-400" /> Upcoming Follow-Ups <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 ml-2">Upcoming</Badge>
                </div>
                <Calendar className="mb-4" />
                <div className="w-full">
                  <ul className="space-y-2">  
                    {followUps.map(fu => (
                      <li key={fu.name} className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-indigo-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{fu.name}</span>
                        <span className="ml-auto text-xs text-gray-700 dark:text-gray-300">{fu.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
            </div>
          </div>
        </motion.section>
        {/* Student Fee Management Section */}
        <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: 'spring' }}>
          <div className="mb-6">
            <h2
              className="
                font-bold text-2xl md:text-3xl
                bg-clip-text text-transparent
                bg-gradient-to-r
                from-blue-600 via-purple-500 to-pink-400
                dark:from-blue-300 dark:via-purple-300 dark:to-pink-200
                mb-4
              "
            >
              Student Fee Management
            </h2>
          </div>
          <hr className="mb-8 border-t-2 border-gray-100" />
          <div className="max-w-screen-2xl mx-auto mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-8 items-stretch overflow-x-auto">
            <motion.div className="col-span-12 md:col-span-3 min-w-[220px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, type: "spring" }} whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}>
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <CardTitle className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <BarChart2 className="w-5 h-5 text-teal-400" /> Fees Collected vs Pending
              </CardTitle>
                {/* Mocked Bar Chart */}
                <div className="w-full h-48 flex items-end gap-4">
                  {feeBarData.map((bar) => (
                    <div key={bar.name} className="flex flex-col items-center flex-1">
                      <div className="flex gap-1">
                        <div className="w-6 rounded-t bg-teal-400" style={{ height: `${bar.Collected / 2000}px` }} />
                        <div className="w-6 rounded-t bg-orange-400" style={{ height: `${bar.Pending / 2000}px` }} />
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300 mt-2">{bar.name}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Pending</Badge>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="col-span-12 md:col-span-3 min-w-[220px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-300"
              tabIndex={0}
              role="button"
              aria-label="Fee by Mode card. Click for more details."
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}
            >
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <BarChart data={feeByMode.map((d, i) => ({ ...d, color: feeByModeColors[i] }))} height={120} />
                <div className="flex gap-2 mt-4">
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">UPI</Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Cash</Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Bank Transfer</Badge>
                </div>
              </div>
            </motion.div>
            <motion.div className="col-span-12 md:col-span-3 min-w-[220px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, type: "spring" }} whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}>
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <HighlightCard title="Total Outstanding Fees" value={outstandingFees} miniGraphData={feeBarData.map(b => ({ x: b.name, y: b.Pending }))} accentColor="#f59e42" />
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mt-2">+8%</Badge>
              </div>
            </motion.div>
            <motion.div className="col-span-12 md:col-span-4 min-w-[220px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5, type: "spring" }} whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}>
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Due Amount <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 ml-2">Unpaid</Badge></TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidStudents.map(stu => (
                      <TableRow key={stu.name}>
                        <TableCell className="text-gray-900 dark:text-gray-100">{stu.name}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{stu.class}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">₹{stu.due.toLocaleString()}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{stu.dueDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
            </div>
          </div>
        </motion.section>
        {/* Staff Management Section */}
        <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: 'spring' }}>
          <div className="mb-6">
            <h2
              className="
                font-bold text-2xl md:text-3xl
                bg-clip-text text-transparent
                bg-gradient-to-r
                from-blue-600 via-purple-500 to-pink-400
                dark:from-blue-300 dark:via-purple-300 dark:to-pink-200
                mb-4
              "
            >
              Staff Management
            </h2>
          </div>
          <hr className="mb-8 border-t-2 border-gray-100" />
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-8 items-stretch overflow-x-auto">
            {/* KPI Cards */}
            {staffKPIs.map((kpi) => (
              <motion.div
                key={kpi.label}
                className="col-span-12 md:col-span-2 min-w-[180px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-300"
                tabIndex={0}
                role="button"
                aria-label={`KPI card: ${kpi.label}, value: ${kpi.value}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}
              >
                <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      className="bg-gradient-to-br from-indigo-400 via-teal-300 to-green-300 rounded-full shadow-lg p-3 flex items-center justify-center"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
                    >
                      {kpi.icon}
                    </motion.div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{kpi.label}</span>
                  </div>
                  <div className="text-2xl font-bold mb-1 flex items-center" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className="flex items-center text-xs text-gray-400">
                    <TrendingUp className="w-3 h-3 mr-1" style={{ color: kpi.trend >= 0 ? '#22c55e' : '#f59e42' }} />
                    {kpi.trend >= 0 ? '+' : ''}{kpi.trend}%
                  </div>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mt-2">+2%</Badge>
                </div>
              </motion.div>
            ))}
            {/* Attendance Heatmap (mocked) */}
            <motion.div
              className="col-span-12 md:col-span-2 min-w-[180px]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}
            >
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <CardTitle className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <CalendarIcon className="w-5 h-5 text-indigo-400" /> Attendance Heatmap
                </CardTitle>
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className={`w-6 h-6 rounded ${i % 7 === 0 ? 'bg-green-300' : i % 5 === 0 ? 'bg-orange-200' : 'bg-gray-200'}`}></div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Present</Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Leave</Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Absent</Badge>
                </div>
              </div>
            </motion.div>
            {/* Donut Chart: Staff by Role */}
            <motion.div
              className="col-span-12 md:col-span-3 min-w-[220px] flex items-center justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}
            >
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex items-center justify-center transition-colors">
                <BarChart data={staffByRole.map((d, i) => ({ ...d, color: staffByRoleColors[i] }))} height={120} />
                <div className="flex gap-2 mt-4">
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Teaching</Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Admin</Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Support</Badge>
                </div>
              </div>
            </motion.div>
            {/* List Card: Upcoming Leaves */}
            <motion.div
              className="col-span-12 md:col-span-3 min-w-[220px]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, type: 'spring' }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}
            >
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <UserCheck className="w-5 h-5 text-indigo-400" /> Upcoming Leaves <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 ml-2">Upcoming</Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingLeaves.map(staff => (
                      <TableRow key={staff.name}>
                        <TableCell className="text-gray-900 dark:text-gray-100">{staff.name}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{staff.role}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{staff.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
            </div>
          </div>
        </motion.section>
        {/* AI Forecasting Insights Section */}
        <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: 'spring' }}>
          <div className="mb-6">
            <h2
              className="
                font-bold text-2xl md:text-3xl
                bg-clip-text text-transparent
                bg-gradient-to-r
                from-blue-600 via-purple-500 to-pink-400
                dark:from-blue-300 dark:via-purple-300 dark:to-pink-200
                mb-4
              "
            >
              AI Forecasting Insights
            </h2>
          </div>
          <hr className="mb-8 border-t-2 border-gray-100" />
          <div className="max-w-screen-2xl mx-auto mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-8 items-stretch overflow-x-auto">
            <motion.div className="col-span-12 md:col-span-3 min-w-[220px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, type: 'spring' }} whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}>
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <CardTitle className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <TrendingUp className="w-5 h-5 text-green-400" /> Predicted Admissions
              </CardTitle>
                <LineChart data={predictedAdmissions} color="#6366f1" height={120} />
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mt-2">Admissions</Badge>
              </div>
            </motion.div>
            <motion.div className="col-span-12 md:col-span-3 min-w-[220px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, type: 'spring' }} whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}>
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <HighlightCard title={aiWidget.label} value={aiWidget.value} miniGraphData={predictedAdmissions} accentColor={aiWidget.color} />
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mt-2">Forecast</Badge>
              </div>
            </motion.div>
            <motion.div className="col-span-12 md:col-span-3 min-w-[220px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, type: 'spring' }} whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}>
              <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                <div className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <Zap className="w-5 h-5 text-orange-400" /> At-risk Students
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 ml-2">At Risk</Badge>
                </div>
                <div className="relative flex flex-col items-center justify-center my-4">
                  <span className="text-5xl font-extrabold text-orange-600">{atRiskStudents}</span>
                  <div className="w-32 h-4 mt-2">
                    <Progress value={atRiskStudents * 10} />
                  </div>
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300 mt-2">Likely to drop out</div>
              </div>
            </motion.div>
            </div>
                </div>
        </motion.section>
        {/* AI Marketing Performance Section */}
        <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: 'spring' }}>
          <div className="mb-6">
            <h2
              className="
                font-bold text-2xl md:text-3xl
                bg-clip-text text-transparent
                bg-gradient-to-r
                from-blue-600 via-purple-500 to-pink-400
                dark:from-blue-300 dark:via-purple-300 dark:to-pink-200
                mb-4
              "
            >
              AI Marketing Performance
            </h2>
          </div>
          <hr className="mb-8 border-t-2 border-gray-100" />
          <div className="max-w-screen-2xl mx-auto mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-8 items-stretch overflow-x-auto">
              {campaignKPIs.map((kpi, idx) => (
                <motion.div key={kpi.label} className="col-span-12 md:col-span-2 min-w-[180px]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(99,102,241,0.12)' }}>
                  <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        className="bg-gradient-to-br from-indigo-400 via-teal-300 to-green-300 rounded-full shadow-lg p-3 flex items-center justify-center"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                      >
                        {kpi.icon}
                      </motion.div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{kpi.label}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1 flex items-center" style={{ color: kpi.color }}>{kpi.value}</div>
                    <div className="flex items-center text-xs text-gray-400">
                      {kpi.trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" /> : <ArrowDownRight className="w-3 h-3 mr-1 text-orange-500" />}
                      {kpi.trend >= 0 ? '+' : ''}{kpi.trend}%
                    </div>
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mt-2">+8%</Badge>
                  </div>
                </motion.div>
              ))}
              {/* Bar Chart: Campaign Spend vs Return (mocked) */}
              <motion.div
                className="col-span-12 md:col-span-3 min-w-[220px]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}
              >
                <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full flex flex-col transition-colors">
                  <BarChart data={conversionsByChannel.map((d, i) => ({ ...d, color: conversionsByChannelColors[i] }))} height={120} />
                  <div className="flex gap-2 mt-4">
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">WhatsApp</Badge>
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Email</Badge>
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Facebook</Badge>
                  </div>
                </div>
              </motion.div>
              {/* Donut Chart: Conversions by Channel */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}
              >
              </motion.div>
              {/* AI Suggestion Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}
              >
                <div className="bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-black/30 backdrop-blur rounded-xl p-6 min-h-[220px] h-full col-span-1 md:col-span-3 min-w-[220px] p-0 flex flex-col transition-colors">
                  <CardTitle className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    <MessageCircle className="w-5 h-5 text-teal-400" /> AI Suggestion
              </CardTitle>
                  <div className="text-xl font-bold text-teal-600 mb-2">{aiSuggestion}</div>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mt-2">AI</Badge>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <span>Based on campaign performance</span>
                  </div>
                </div>
              </motion.div>
            </div>
        </div>
        </motion.section>
        </div>
      <AddLeadModal open={showAddLeadModal} onOpenChange={setShowAddLeadModal} />
    </div>
  );
}
