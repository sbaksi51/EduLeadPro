import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { mockDashboardData } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AnimatedAnalyticsIcon from "./AnimatedAnalyticsIcon";

export default function AnimatedInsights() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => Promise.resolve(mockDashboardData.stats),
  });

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600 bg-green-50 border-green-200";
    if (trend < 0) return "text-red-600 bg-red-50 border-red-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-3 h-3" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  const statCards = [
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      trend: stats?.leadTrend || 0,
      description: "Total number of leads in the system",
    },
    {
      title: "Active Students",
      value: stats?.activeStudents || 0,
      trend: stats?.studentTrend || 0,
      description: "Currently enrolled students",
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversionRate || 0}%`,
      trend: stats?.conversionTrend || 0,
      description: "Lead to student conversion rate",
    },
    {
      title: "Revenue",
      value: `₹${(stats?.revenue || 0).toLocaleString()}`,
      trend: stats?.revenueTrend || 0,
      description: "Total revenue this month",
    },
  ];

  return (
    <Card className="bg-blue-50 border-blue-100 border flex flex-col items-center justify-center p-8">
      <CardContent className="flex flex-col items-center justify-center w-full">
        <AnimatedAnalyticsIcon className="w-16 h-12 mb-4" />
        <div className="text-lg font-medium text-gray-700 mt-2 mb-6 text-center">
          Real-time Performance Insights
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-start border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">{stat.title}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{stat.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-semibold text-gray-900">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    stat.value
                  )}
                </span>
                {!isLoading && (
                  <Badge
                    variant="outline"
                    className={`ml-2 ${getTrendColor(stat.trend)}`}
                  >
                    <span className="flex items-center gap-1">
                      {getTrendIcon(stat.trend)}
                      {Math.abs(stat.trend)}%
                    </span>
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 