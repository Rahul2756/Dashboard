import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

interface SystemUtilizationChartProps {
  occupied: number;
  vacant: number;
  total: number;
  breakdown: { name: string; value: number; color: string }[];
}

export const SystemUtilizationChart: React.FC<SystemUtilizationChartProps> = ({ occupied, vacant, total, breakdown }) => {
  const data = [
    ...breakdown,
    { name: 'Vacant', value: vacant, color: '#e5e7eb' }
  ];

  const CustomCenterLabel = ({ viewBox }: any) => {
    const { cx, cy } = viewBox;
    return (
      <g>
        <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="central" fontSize="24" fontWeight="bold" fill="var(--color-text-primary)">
          {total}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="var(--color-text-secondary)">
          Systems
        </text>
      </g>
    );
  };

  return (
    <div className="chart-card">
      <h3 className="card-title">System Utilization</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label content={CustomCenterLabel} position="center" />
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} Systems`, 'Count']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
            />
            <Legend 
              verticalAlign="bottom" 
              iconType="circle"
              wrapperStyle={{ paddingTop: '15px' }}
              formatter={(value, entry: any) => (
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, marginRight: '5px' }}>
                  {value} — {entry.payload.value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
