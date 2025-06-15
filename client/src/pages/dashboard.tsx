import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentLeadsTable from "@/components/dashboard/recent-leads-table";
import AIInsights from "@/components/dashboard/ai-insights";
import ChartsSection from "@/components/dashboard/charts-section";
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
        <StatsGrid />
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Button 
              onClick={() => setLocation("/Analytics")}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
            >
              <FileText className="h-4 w-4" />
              Generate Analytics
            </Button>
            <Button 
              onClick={() => setLocation("/ai-marketing")}
              variant="outline"
              className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-white hover:shadow-md"
            >
              <Target className="h-4 w-4" />
              AI Marketing
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

        <ChartsSection />
      </main>
    </div>
  );
}
