import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import AnimatedInsights from "@/components/dashboard/animated-insights";
import RecentLeadsTable from "@/components/dashboard/recent-leads-table";
import AIInsights from "@/components/dashboard/ai-insights";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Target } from "lucide-react";
import{
  ChevronUp,
  ChevronDown,
  GraduationCap,
  Users,
} from "lucide-react";

export default function Dashboard() {
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard Overview" 
        subtitle="Monitor your lead performance and enrollment forecasts"
      />
      
      <main className="p-6">
        <AnimatedInsights />
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Button 
              variant="default"
              onClick={() => setLocation("/analytics")}
              className="flex items-center gap-2 !bg-blue-100 !text-blue-800 !hover:bg-blue-200"
            >
              <FileText className="h-4 w-4" />
              Generate Analytics
            </Button>
            <Button 
              variant="default"
              onClick={() => setLocation("/ai-marketing")}
              className="flex items-center gap-2 !bg-blue-100 !text-blue-800 !hover:bg-blue-200"
            >
              <Target className="h-4 w-4" />
              AI Marketing
            </Button>
            <Button 
              variant="default"
              onClick={() => setLocation("/leads/add")}
              className="flex items-center gap-2 !bg-blue-100 !text-blue-800 !hover:bg-blue-200"
            >
              <Plus className="h-4 w-4" />
              Add New Lead
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentLeadsTable />
          </div>
          <div>
            <AIInsights />
          </div>
        </div>
      </main>
    </div>
  );
}
