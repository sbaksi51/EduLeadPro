import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDashboardData } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Info, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function ChartsSection() {
  const [, setLocation] = useLocation();
  const { data: leadSources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["/api/dashboard/lead-sources"],
    queryFn: () => Promise.resolve(mockDashboardData.leadSources),
  });

  const { data: enrollmentTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["/api/dashboard/enrollment-trend"],
    queryFn: () => Promise.resolve(mockDashboardData.enrollmentTrend),
  });

  const sourceColors = [
    { bg: "from-blue-50 to-blue-100", dot: "bg-blue-500", border: "border-blue-100", hover: "hover:from-blue-100 hover:to-blue-200" },
    { bg: "from-green-50 to-green-100", dot: "bg-green-500", border: "border-green-100", hover: "hover:from-green-100 hover:to-green-200" },
    { bg: "from-purple-50 to-purple-100", dot: "bg-purple-500", border: "border-purple-100", hover: "hover:from-purple-100 hover:to-purple-200" },
    { bg: "from-orange-50 to-orange-100", dot: "bg-orange-500", border: "border-orange-100", hover: "hover:from-orange-100 hover:to-orange-200" },
  ];

  const getBarHeight = (enrollments: number, maxEnrollments: number) => {
    const minHeight = 40;
    const maxHeight = 160;
    const ratio = enrollments / maxEnrollments;
    return minHeight + (maxHeight - minHeight) * ratio;
  };

  const maxEnrollments = Math.max(...(enrollmentTrend?.map(t => t.enrollments) || [1]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Lead Source Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Lead Source Performance</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Performance metrics for different lead sources</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Last 30 days
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourcesLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {leadSources?.map((source, index) => {
                  const color = sourceColors[index] || sourceColors[0];
                  const totalLeads = leadSources.reduce((sum, s) => sum + s.totalLeads, 0);
                  const percentage = ((source.totalLeads / totalLeads) * 100).toFixed(1);
                  
                  return (
                    <motion.div 
                      key={source.source}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 bg-gradient-to-r ${color.bg} ${color.hover} rounded-lg border ${color.border} transition-all duration-200`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${color.dot} rounded-full`}></div>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {source.source.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{source.totalLeads} leads</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-600">{percentage}% of total</p>
                          <Badge variant="outline" className="bg-white text-green-600 border-green-200">
                            {source.conversionRate}% conversion
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setLocation("/reports/lead-sources")}
                >
                  View Detailed Report
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Enrollment Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Monthly Enrollment Trend</span>
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
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                Growing
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
            ) : (
              <div>
                <div className="relative h-64 bg-gradient-to-t from-blue-50 to-transparent rounded-lg flex items-end justify-between p-4">
                  {enrollmentTrend?.map((data, index) => (
                    <motion.div 
                      key={data.month}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="flex flex-col items-center group"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`w-8 bg-primary-500 rounded-t transition-all duration-300 group-hover:bg-primary-600 ${
                                index === enrollmentTrend.length - 1 ? 'opacity-60' : ''
                              }`}
                              style={{ height: `${getBarHeight(data.enrollments, maxEnrollments)}px` }}
                            ></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{data.enrollments} enrollments in {data.month}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                      <span className={`text-xs font-medium ${
                        index === enrollmentTrend.length - 1 ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {data.enrollments}{index === enrollmentTrend.length - 1 ? '*' : ''}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>*Projected enrollment</span>
                  <span className="text-green-600 font-medium">↗ Growth trend</span>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setLocation("/reports/enrollment")}
                >
                  View Detailed Report
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
