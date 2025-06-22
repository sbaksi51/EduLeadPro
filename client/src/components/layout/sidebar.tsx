import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  Brain, 
  Megaphone, 
  FileText, 
  Settings,
  GraduationCap,
  Home,
  LogOut,
  IndianRupee,
  Wallet,
  UserCheck,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Bot,
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Lead Management", href: "/leads", icon: Users },
  { name: "Employee Management", href: "/staff-ai", icon: UserCheck },
  { name: "Student, Fees & EMI", href: "/student-fees", icon: IndianRupee },
  { name: "AI Forecasting", href: "/ai-forecasting", icon: Brain },
  { name: "AI Marketing", href: "/ai-marketing", icon: Megaphone },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [customInstituteName, setCustomInstituteName] = useState(() => {
    return localStorage.getItem("customInstituteName") || "";
  });

  // Listen for changes to customInstituteName in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setCustomInstituteName(localStorage.getItem("customInstituteName") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/landing";
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-50 to-blue-50 shadow-xl border-r border-slate-200 fixed h-full z-10">
      <div className="p-6">
        <Link href="/landing">
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">EduLead Pro</h1>
              <p className="text-sm text-slate-600">AI-Powered CRM</p>
            </div>
          </div>
        </Link>
      </div>
      
      {customInstituteName && (
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <p className="text-base font-medium text-slate-800">{customInstituteName}</p>
          </div>
        </div>
      )}
      
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
              >
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-white hover:shadow-md'
                }`}>
                  <Icon size={18} />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
