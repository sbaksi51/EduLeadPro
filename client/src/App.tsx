import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import LeadManagement from "@/pages/lead-management";
import AIForecasting from "@/pages/ai-forecasting";
import AIMarketing from "@/pages/ai-marketing";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Landing from "@/pages/landing";
import BookDemo from "@/pages/book-demo";
import Pricing from "@/pages/pricing";
import Sidebar from "@/components/layout/sidebar";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/book-demo" component={BookDemo} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard">
        {() => (
          <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
            <Sidebar />
            <div className="flex-1 ml-64">
              <Dashboard />
            </div>
          </div>
        )}
      </Route>
      <Route path="/leads">
        {() => (
          <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
            <Sidebar />
            <div className="flex-1 ml-64">
              <LeadManagement />
            </div>
          </div>
        )}
      </Route>
      <Route path="/ai-forecasting">
        {() => (
          <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
            <Sidebar />
            <div className="flex-1 ml-64">
              <AIForecasting />
            </div>
          </div>
        )}
      </Route>
      <Route path="/ai-marketing">
        {() => (
          <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
            <Sidebar />
            <div className="flex-1 ml-64">
              <AIMarketing />
            </div>
          </div>
        )}
      </Route>
      <Route path="/reports">
        {() => (
          <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
            <Sidebar />
            <div className="flex-1 ml-64">
              <Reports />
            </div>
          </div>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
            <Sidebar />
            <div className="flex-1 ml-64">
              <Settings />
            </div>
          </div>
        )}
      </Route>
      <Route path="/" component={Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
