import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Plus, BarChart3, Megaphone, AlertCircle, Clock, UserCheck, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useLocation } from "wouter";
import { mockDashboardData } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { type Alert } from "@shared/schema";

export default function AIInsights() {
  const [, setLocation] = useLocation();
  const { data: forecast, isLoading: forecastLoading } = useQuery({
    queryKey: ["/api/ai/forecast"],
    queryFn: () => Promise.resolve(mockDashboardData.aiForecast),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => Promise.resolve(mockDashboardData.stats),
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    queryFn: () => Promise.resolve(mockDashboardData.alerts),
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="text-green-600" size={16} />;
      case "decreasing":
        return <TrendingDown className="text-red-600" size={16} />;
      default:
        return <Minus className="text-gray-600" size={16} />;
    }
  };

  if (forecastLoading || alertsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2" size={20} />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       {/* Recent Alerts */}
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts?.map((alert: Alert, index: number) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className={`flex items-start space-x-3 p-3 rounded-lg border hover:shadow-md transition-all duration-200 ${
                  alert.severity === "high" ? "bg-red-50 border-red-100" :
                  alert.severity === "medium" ? "bg-yellow-50 border-yellow-100" :
                  "bg-blue-50 border-blue-100"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  alert.severity === "high" ? "bg-red-500" :
                  alert.severity === "medium" ? "bg-yellow-500" :
                  "bg-blue-500"
                }`}></div>
                <div>
                  <p className={`text-sm font-medium flex items-center ${
                    alert.severity === "high" ? "text-red-800" :
                    alert.severity === "medium" ? "text-yellow-800" :
                    "text-blue-800"
                  }`}>
                    {alert.type === "followup" ? <AlertCircle className="mr-1" size={12} /> :
                     alert.type === "inactive" ? <Clock className="mr-1" size={12} /> :
                     <UserCheck className="mr-1" size={12} />}
                    {alert.title}
                  </p>
                  <p className={`text-xs ${
                    alert.severity === "high" ? "text-red-600" :
                    alert.severity === "medium" ? "text-yellow-600" :
                    "text-blue-600"
                  }`}>
                    {alert.description}
                  </p>
                </div>
              </motion.div>
            ))}
            {(!alerts || alerts.length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                No alerts at the moment
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      {/* AI Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Brain className="text-purple-600" size={16} />
                </div>
                AI Insights
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 cursor-help">
                      {Math.round((forecast?.confidence || 0) * 100)}% Confidence
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI prediction confidence score</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div 
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all duration-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">Enrollment Forecast</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Predicted enrollments for next month</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {forecast?.predictedEnrollments || 78} students
              </p>
              <Progress value={Math.round((forecast?.confidence || 0) * 100)} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">Expected for next month</p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 hover:shadow-md transition-all duration-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">Lead Quality Trend</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Trend in lead quality based on recent interactions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(forecast?.trends?.leadQuality || "stable")}
                <p className="text-2xl font-bold text-green-600">
                  {forecast?.trends?.leadQuality === "increasing" ? "Improving" : 
                   forecast?.trends?.leadQuality === "decreasing" ? "Declining" : "Stable"}
                </p>
              </div>
              <p className="text-xs text-gray-600 mt-1">Based on recent lead interactions</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100 hover:shadow-md transition-all duration-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">Attention Required</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Leads that require immediate attention</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {Math.floor((stats?.totalLeads || 0) * 0.15)} leads
              </p>
              <Progress value={15} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">Risk of dropping out</p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

     
    </div>
  );
}
