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
  CreditCard
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Lead Management", href: "/leads", icon: Users },
  { name: "Staff Management", href: "/staff", icon: UserCheck },
  { name: "Students & Fees", href: "/students", icon: GraduationCap },
  { name: "E-Mandate", href: "/e-mandate", icon: CreditCard },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Payroll", href: "/payroll", icon: IndianRupee },
  { name: "AI Forecasting", href: "/ai-forecasting", icon: Brain },
  { name: "AI Marketing", href: "/ai-marketing", icon: Megaphone },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/landing";
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-50 to-blue-50 shadow-xl border-r border-slate-200 fixed h-full z-10">
      <div className="p-6 border-b border-slate-200">
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
        
        <div className="mt-8 pt-6 border-t border-slate-200">
          <Link href="/landing">
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer text-slate-700 hover:bg-white hover:shadow-md">
              <Home size={18} />
              <span className="font-medium">Back to Home</span>
            </div>
          </Link>
          
          <div 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer text-slate-700 hover:bg-red-50 hover:text-red-600 mt-1"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
