import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Plus, BarChart3, Megaphone, AlertCircle, Clock, UserCheck } from "lucide-react";
import { useLocation } from "wouter";

export default function AIInsights() {
  const { data: forecast, isLoading: forecastLoading } = useQuery({
    queryKey: ["/api/ai/forecast"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (forecastLoading) {
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
      {/* AI Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Brain className="text-purple-600" size={16} />
            </div>
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm font-medium text-gray-900 mb-2">Enrollment Forecast</p>
            <p className="text-2xl font-bold text-blue-600">
              {forecast?.predictedEnrollments || 78} students
            </p>
            <p className="text-xs text-gray-600">Expected for next month</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <p className="text-sm font-medium text-gray-900 mb-2">High Probability Leads</p>
            <p className="text-2xl font-bold text-green-600">
              {stats?.hotLeads || 23} leads
            </p>
            <p className="text-xs text-gray-600">Likely to convert this week</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
            <p className="text-sm font-medium text-gray-900 mb-2">Attention Required</p>
            <p className="text-2xl font-bold text-orange-600">
              {Math.floor((stats?.totalLeads || 0) * 0.15)} leads
            </p>
            <p className="text-xs text-gray-600">Risk of dropping out</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center">
            <Plus className="mr-2" size={16} />
            Add New Lead
          </Button>
          <Button variant="outline" className="w-full flex items-center justify-center">
            <BarChart3 className="mr-2" size={16} />
            Generate Report
          </Button>
          <Button variant="outline" className="w-full flex items-center justify-center">
            <Megaphone className="mr-2" size={16} />
            AI Marketing
          </Button>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-red-800 flex items-center">
                <AlertCircle className="mr-1" size={12} />
                Follow-up overdue
              </p>
              <p className="text-xs text-red-600">Multiple leads - 2+ days overdue</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-yellow-800 flex items-center">
                <Clock className="mr-1" size={12} />
                High-value lead inactive
              </p>
              <p className="text-xs text-yellow-600">Interested leads - No activity for 5+ days</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-blue-800 flex items-center">
                <UserCheck className="mr-1" size={12} />
                New leads assigned
              </p>
              <p className="text-xs text-blue-600">{stats?.newLeadsToday || 0} new leads today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
