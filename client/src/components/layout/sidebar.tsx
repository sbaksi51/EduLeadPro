import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Users, 
  Brain, 
  Megaphone, 
  FileText, 
  Settings,
  GraduationCap
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Lead Management", href: "/leads", icon: Users },
  { name: "AI Forecasting", href: "/ai-forecasting", icon: Brain },
  { name: "AI Marketing", href: "/ai-marketing", icon: Megaphone },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 fixed h-full z-10">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">EduLead Pro</h1>
            <p className="text-sm text-gray-500">Lead Management</p>
          </div>
        </div>
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
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      

    </div>
  );
}
