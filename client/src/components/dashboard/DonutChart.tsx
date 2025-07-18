import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DonutChartProps {
  title: string;
  data: { label: string; value: number }[];
  colors: string[];
}

const DonutChart: React.FC<DonutChartProps> = ({ title, data, colors }) => {
  return (
    <div className="flex flex-col items-center w-full h-full">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              label={({ percent, label }) => `${label}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DonutChart; 