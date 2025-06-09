import { ReactNode } from "react";
import Sidebar  from "./sidebar";
import Header from "./header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LeadForm } from "@/components/forms/lead-form";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <LeadForm onSuccess={() => setIsAddLeadOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
