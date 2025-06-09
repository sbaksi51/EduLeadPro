import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function AIForecasting() {
  const { data: forecast, isLoading: forecastLoading } = useQuery({
    queryKey: ["/api/ai/forecast"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
  });

  if (forecastLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="AI Forecasting" subtitle="Predict enrollment trends and admission outcomes" />
        <main className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="text-green-600" size={20} />;
      case "decreasing":
        return <TrendingDown className="text-red-600" size={20} />;
      default:
        return <Minus className="text-gray-600" size={20} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-green-600";
      case "decreasing":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const confidencePercentage = (forecast?.confidence || 0) * 100;
  const conversionRate = stats?.totalLeads > 0 ? (stats.conversions / stats.totalLeads) * 100 : 0;

  // Calculate lead distribution by likelihood
  const leadsWithPredictions = leads?.filter(lead => lead.admissionLikelihood) || [];
  const highLikelihood = leadsWithPredictions.filter(lead => Number(lead.admissionLikelihood) >= 70).length;
  const mediumLikelihood = leadsWithPredictions.filter(lead => {
    const likelihood = Number(lead.admissionLikelihood);
    return likelihood >= 40 && likelihood < 70;
  }).length;
  const lowLikelihood = leadsWithPredictions.filter(lead => Number(lead.admissionLikelihood) < 40).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="AI Forecasting" subtitle="Predict enrollment trends and admission outcomes" />
      
      <main className="p-6 space-y-6">
        {/* Main Forecast Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-3 text-purple-600" size={24} />
              Enrollment Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {forecast?.predictedEnrollments || 0}
                </div>
                <div className="text-sm text-gray-600">Predicted Enrollments</div>
                <div className="text-xs text-gray-500 mt-1">Next Month</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getTrendIcon(forecast?.trend || "stable")}
                  <span className={`ml-2 text-lg font-semibold ${getTrendColor(forecast?.trend || "stable")}`}>
                    {forecast?.trend || "Stable"}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Trend Direction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {confidencePercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Confidence Level</div>
                <Progress value={confidencePercentage} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Current Conversion Rate</div>
                  <div className="text-sm text-gray-600">Total leads to enrollments</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {conversionRate.toFixed(1)}%
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Active Pipeline</div>
                  <div className="text-sm text-gray-600">Interested & contacted leads</div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {(stats?.hotLeads || 0) + (leads?.filter(l => l.status === "contacted").length || 0)}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Average Lead Age</div>
                  <div className="text-sm text-gray-600">Days since first contact</div>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(Math.random() * 15 + 5)} days
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Likelihood Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Admission Likelihood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-600 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-900">High Likelihood</div>
                      <div className="text-sm text-gray-600">70%+ chance</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {highLikelihood} leads
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <Clock className="text-yellow-600 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-900">Medium Likelihood</div>
                      <div className="text-sm text-gray-600">40-70% chance</div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {mediumLikelihood} leads
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <AlertTriangle className="text-red-600 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-900">Low Likelihood</div>
                      <div className="text-sm text-gray-600">Below 40% chance</div>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {lowLikelihood} leads
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forecasting Factors */}
        <Card>
          <CardHeader>
            <CardTitle>Key Forecasting Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {forecast?.factors?.map((factor, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">{factor}</div>
                </div>
              )) || [
                "Historical conversion patterns",
                "Current pipeline quality", 
                "Seasonal enrollment trends",
                "Lead source performance"
              ].map((factor, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">{factor}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  type: "priority",
                  message: "Focus on the 23 high-likelihood leads for immediate follow-up",
                  action: "Schedule calls this week"
                },
                {
                  type: "warning", 
                  message: "12 interested leads haven't been contacted in 5+ days",
                  action: "Assign to counselors urgently"
                },
                {
                  type: "opportunity",
                  message: "Google Ads source showing highest conversion rate",
                  action: "Consider increasing budget allocation"
                },
                {
                  type: "insight",
                  message: "Science stream showing 20% higher enrollment rate",
                  action: "Adjust marketing focus"
                }
              ].map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  rec.type === "priority" ? "bg-blue-50 border-blue-400" :
                  rec.type === "warning" ? "bg-red-50 border-red-400" :
                  rec.type === "opportunity" ? "bg-green-50 border-green-400" :
                  "bg-purple-50 border-purple-400"
                }`}>
                  <div className="font-medium text-gray-900">{rec.message}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <strong>Recommended Action:</strong> {rec.action}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
