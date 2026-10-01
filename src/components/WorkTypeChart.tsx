import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WorkTypeDistribution } from '../types';

interface WorkTypeChartProps {
  data: WorkTypeDistribution[];
  total: number;
}

export const WorkTypeChart: React.FC<WorkTypeChartProps> = ({ data, total }) => {
  // Custom label for the center of the donut
  const CustomCenterLabel = ({ viewBox }: any) => {
    const { cx, cy } = viewBox;
    return (
      <g>
        <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="central" fontSize="24" fontWeight="bold" fill="var(--color-text-primary)">
          {total}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="var(--color-text-secondary)">
          People
        </text>
      </g>
    );
  };

  return (
    <div className="chart-card">
      <h3 className="card-title">People by Work Type</h3>
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
              <CustomCenterLabel />
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} People`, 'Count']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => (
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, marginRight: '10px' }}>
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
