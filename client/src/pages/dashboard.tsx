import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentLeadsTable from "@/components/dashboard/recent-leads-table";
import AIInsights from "@/components/dashboard/ai-insights";
import ChartsSection from "@/components/dashboard/charts-section";
import AddLeadModal from "@/components/leads/add-lead-modal";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Target } from "lucide-react";

export default function Dashboard() {
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Dashboard Overview" 
        subtitle="Monitor your lead performance and enrollment forecasts"
      />
      
      <main className="p-6">
        <StatsGrid />
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Button 
              onClick={() => setLocation("/reports")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
            <Button 
              onClick={() => setLocation("/marketing")}
              variant="outline"
              className="flex items-center gap-2"
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

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary-500 hover:bg-primary-600"
          onClick={() => setShowAddLeadModal(true)}
        >
          <Plus size={24} />
        </Button>
      </div>

      <AddLeadModal 
        open={showAddLeadModal}
        onOpenChange={setShowAddLeadModal}
      />
    </div>
  );
}
