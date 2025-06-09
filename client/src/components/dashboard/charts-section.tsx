import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChartsSection() {
  const { data: leadSources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["/api/dashboard/lead-sources"],
  });

  const { data: enrollmentTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["/api/dashboard/enrollment-trend"],
  });

  const sourceColors = [
    { bg: "from-blue-50 to-blue-100", dot: "bg-blue-500" },
    { bg: "from-green-50 to-green-100", dot: "bg-green-500" },
    { bg: "from-purple-50 to-purple-100", dot: "bg-purple-500" },
    { bg: "from-orange-50 to-orange-100", dot: "bg-orange-500" },
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
      <Card>
        <CardHeader>
          <CardTitle>Lead Source Performance</CardTitle>
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
              {leadSources?.slice(0, 4).map((source, index) => {
                const color = sourceColors[index] || sourceColors[0];
                return (
                  <div key={source.source} className={`flex items-center justify-between p-4 bg-gradient-to-r ${color.bg} rounded-lg`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${color.dot} rounded-full`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {source.source.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{source.totalLeads} leads</p>
                      <p className="text-xs text-gray-600">
                        {((source.totalLeads / (leadSources?.reduce((sum, s) => sum + s.totalLeads, 0) || 1)) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Enrollment Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Enrollment Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
          ) : (
            <div>
              <div className="relative h-64 bg-gradient-to-t from-blue-50 to-transparent rounded-lg flex items-end justify-between p-4">
                {enrollmentTrend?.map((data, index) => (
                  <div key={data.month} className="flex flex-col items-center">
                    <div 
                      className={`w-8 bg-primary-500 rounded-t ${index === enrollmentTrend.length - 1 ? 'opacity-60' : ''}`}
                      style={{ height: `${getBarHeight(data.enrollments, maxEnrollments)}px` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                    <span className={`text-xs font-medium ${index === enrollmentTrend.length - 1 ? 'text-gray-500' : 'text-gray-900'}`}>
                      {data.enrollments}{index === enrollmentTrend.length - 1 ? '*' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>*Projected enrollment</span>
                <span className="text-green-600 font-medium">↗ Growth trend</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
