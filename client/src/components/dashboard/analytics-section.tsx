import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDashboardData } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, BookOpen, Users, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const AnalyticsSection = () => {
  const [, setLocation] = useLocation();
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/analytics"],
    queryFn: () => Promise.resolve(mockDashboardData.analytics),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enrollment Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                <span>Enrollment Trend</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Monthly enrollment trends and projections</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/analytics/enrollment")}
                className="text-primary-600 hover:text-primary-700"
              >
                View Detailed Report
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <div className="grid grid-cols-12 gap-4 h-full">
                {analyticsData?.enrollmentTrend.map((month, index) => (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className="flex flex-col items-center justify-end"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="w-full bg-primary-100 hover:bg-primary-200 transition-colors duration-200 rounded-t"
                            style={{ height: `${(month.enrollments / 100) * 100}%` }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{month.month}: {month.enrollments} enrollments</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <span>Revenue Overview</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Revenue breakdown by category</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/analytics/revenue")}
                className="text-primary-600 hover:text-primary-700"
              >
                View Detailed Report
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analyticsData?.revenueData.map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{item.category}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ${item.amount.toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        item.trend > 0
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {item.trend > 0 ? "+" : ""}{item.trend}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <span>Course Performance</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Performance metrics for each course</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/analytics/courses")}
                className="text-primary-600 hover:text-primary-700"
              >
                View Detailed Report
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData?.coursePerformance.map((course, index) => (
                <motion.div
                  key={course.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{course.name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="text-sm text-gray-500">
                        Enrollments: {course.enrollments}
                      </div>
                      <div className="text-sm text-gray-500">
                        Completion Rate: {course.completionRate}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant="outline"
                      className={`${
                        course.satisfaction >= 4
                          ? "bg-green-100 text-green-700 border-green-200"
                          : course.satisfaction >= 3
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {course.satisfaction.toFixed(1)}/5.0
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/analytics/courses/${course.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsSection; 