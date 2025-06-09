import { useQuery } from "@tanstack/react-query";
import { Users, Flame, CheckCircle, IndianRupee, TrendingUp } from "lucide-react";

export default function StatsGrid() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      change: "+12% from last month",
      changeType: "positive",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Hot Leads",
      value: stats?.hotLeads || 0,
      change: "Requires follow-up",
      changeType: "warning",
      icon: Flame,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      title: "Conversions",
      value: stats?.conversions || 0,
      change: `${stats?.totalLeads > 0 ? Math.round((stats.conversions / stats.totalLeads) * 100) : 0}% conversion rate`,
      changeType: "positive",
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Revenue",
      value: `₹${((stats?.conversions || 0) * 80000 / 1000).toFixed(1)}L`,
      change: "+15% from last month",
      changeType: "positive",
      icon: IndianRupee,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-sm mt-1 flex items-center ${
                  stat.changeType === "positive" ? "text-green-600" : 
                  stat.changeType === "warning" ? "text-orange-600" : "text-gray-600"
                }`}>
                  {stat.changeType === "positive" && <TrendingUp size={12} className="mr-1" />}
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={stat.iconColor} size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
