import React, { useState, useEffect } from 'react';
import { Download, FileX, Route, Database, Calendar, Clock } from 'lucide-react';
import { TranacDataRow, TranacDashboardMetrics } from '../types/tranac';
import { loadTranacData } from '../services/tranacExcelService';
import { calculateTranacMetrics } from '../utils/tranacDataUtils';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LabelList, Label
} from 'recharts';

interface TranacUpdateProps {
  refreshTrigger?: string;
}

const STATUS_COLORS = {
  'Completed': '#10b981', // dark green
  'In Process': '#84cc16', // light green
  'Pending': '#f59e0b', // amber
  'No Data': '#9ca3af' // grey
};

const CustomKPICard = ({ title, titleSecondary, value, secondaryText, Icon, iconBgColor, iconColor }: any) => (
  <div style={{
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  }}>
    <div style={{
      backgroundColor: iconBgColor,
      color: iconColor,
      width: '64px',
      height: '64px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={32} strokeWidth={2.5} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', lineHeight: 1.2 }}>{title}</span>
        {titleSecondary && <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-tertiary)', lineHeight: 1.2 }}>{titleSecondary}</span>}
      </div>
      <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1, marginTop: '0.5rem' }}>{value}</div>
      {secondaryText && <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{secondaryText}</span>}
    </div>
  </div>
);

export const TranacUpdate: React.FC<TranacUpdateProps> = ({ refreshTrigger }) => {
  const [data, setData] = useState<TranacDataRow[]>([]);
  const [metrics, setMetrics] = useState<TranacDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await loadTranacData();
        setData(result);
        setMetrics(calculateTranacMetrics(result));
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error loading TraNac data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  const handleExport = () => {
    const wsData = data.map(row => ({
      'Sr. No.': row.srNo,
      'Location Name': row.locationName,
      'Total Days': row.totalScope,
      'In Process': row.processDays,
      'Completed': row.completedDays,
      'Balance': row.balanceDays,
      'Status': row.status
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "TraNac_Status");
    XLSX.writeFile(wb, "TraNac_Dashboard_Export.xlsx");
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading TraNac data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-danger)' }}>
          <FileX size={48} style={{ margin: '0 auto 1rem', color: 'var(--color-danger)' }} />
          <h2 style={{ marginBottom: '1rem' }}>Data Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  // Pie chart data for Data Status by Location
  const dataReceivedStatus = [
    { name: 'Data Received', value: metrics.locationsDataReceived, color: '#10b981' },
    { name: 'No Data', value: metrics.locationsNoData, color: '#9ca3af' }
  ];

  // Pie chart data for Processing Status
  const processingStatus = [
    { name: 'Completed', value: metrics.completedDays, color: STATUS_COLORS['Completed'] },
    { name: 'In Process', value: metrics.processDays, color: STATUS_COLORS['In Process'] },
    { name: 'Pending', value: metrics.totalDaysPending, color: STATUS_COLORS['Pending'] }
  ];

  // Calculate completion status counts
  let completedLocations = 0;
  let inProcessLocations = 0;
  let noDataLocations = 0;
  
  data.forEach(d => {
    if (d.status === 'Completed') completedLocations++;
    else if (d.status === 'No Data') noDataLocations++;
    else inProcessLocations++; // Pending + In Process
  });

  const completionStatusData = [
    { name: '100%\\nCompleted', nameDisplay: '100% Completed', value: completedLocations, fill: '#10b981' },
    { name: 'In Process', nameDisplay: 'In Process', value: inProcessLocations, fill: '#84cc16' },
    { name: 'No Data\\nReceived', nameDisplay: 'No Data Received', value: noDataLocations, fill: '#9ca3af' }
  ];

  const renderCustomLegend = (props: any, total: number) => {
    const { payload } = props;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {payload.map((entry: any, index: number) => {
          const val = entry.payload.value;
          const percent = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block', marginRight: '0.5rem', marginTop: '4px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{entry.value}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{val} ({percent}%)</span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };
  
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const lines = payload.value.split('\\n');
    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line: string, index: number) => (
          <text key={index} x={0} y={index * 16} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
            {line}
          </text>
        ))}
      </g>
    );
  };

  const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    let fill = '#fff';
    if (name === 'No Data' || name === 'Pending') fill = '#1F2933';

    return (
      <text x={x} y={y} fill={fill} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
        {value}
      </text>
    );
  };

  const getStatusPillColor = (status: string) => {
    switch (status) {
      case 'Completed': return { bg: '#d1fae5', text: '#065f46' }; // emerald-100/800
      case 'In Process': return { bg: '#ecfccb', text: '#3f6212' }; // lime-100/800
      case 'Pending': return { bg: '#fef3c7', text: '#92400e' }; // amber-100/800
      case 'No Data': default: return { bg: '#f3f4f6', text: '#374151' }; // gray-100/800
    }
  };

  return (
    <div className="page-container">
      {/* Top KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <CustomKPICard 
          title="Total Locations" 
          titleSecondary="(Toll Plazas)"
          value={metrics.totalLocations} 
          Icon={Route} 
          iconBgColor="#ecfccb" 
          iconColor="#166534" 
        />
        <CustomKPICard 
          title="Locations with Data" 
          titleSecondary="Received"
          value={metrics.locationsDataReceived} 
          secondaryText={`${Math.round((metrics.locationsDataReceived / Math.max(1, metrics.totalLocations)) * 100)}% of total locations`} 
          Icon={Database} 
          iconBgColor="#ecfccb" 
          iconColor="#166534" 
        />
        <CustomKPICard 
          title="Total Days of Data" 
          titleSecondary="Received"
          value={metrics.totalDaysReceived} 
          secondaryText={`Across ${metrics.locationsDataReceived} locations`} 
          Icon={Calendar} 
          iconBgColor="#ecfccb" 
          iconColor="#166534" 
        />
        <CustomKPICard 
          title="Total Days Pending" 
          value={metrics.totalDaysPending} 
          secondaryText="Remaining for completion" 
          Icon={Clock} 
          iconBgColor="#fef3c7" 
          iconColor="#92400e" 
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '2rem' }}>
        
        {/* Data Status by Location Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title" style={{ marginBottom: '0.25rem' }}>Data Status by Location</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Distribution of locations based on data status</p>
          <div className="chart-container" style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataReceivedStatus}
                  cx="40%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                  label={renderCustomizedPieLabel}
                >
                  {dataReceivedStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }: any) => {
                      const { cx, cy } = viewBox;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                          <tspan x={cx} dy="-0.2em" fontSize="24" fontWeight="bold" fill="var(--color-text-primary)">{metrics.totalLocations}</tspan>
                          <tspan x={cx} dy="1.5em" fontSize="12" fill="var(--color-text-secondary)">Locations</tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
                <RechartsTooltip formatter={(value, name) => [`${value} Locations`, name]} />
                <Legend content={(props) => renderCustomLegend(props, metrics.totalLocations)} layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Processing Status Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title" style={{ marginBottom: '0.25rem' }}>Processing Status (Days)</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Breakup of {metrics.totalDaysReceived} days of received data</p>
          <div className="chart-container" style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processingStatus.filter(d => d.value > 0)}
                  cx="40%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                  label={renderCustomizedPieLabel}
                >
                  {processingStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }: any) => {
                      const { cx, cy } = viewBox;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                          <tspan x={cx} dy="-0.2em" fontSize="24" fontWeight="bold" fill="var(--color-text-primary)">{metrics.totalDaysReceived}</tspan>
                          <tspan x={cx} dy="1.5em" fontSize="12" fill="var(--color-text-secondary)">Days</tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
                <RechartsTooltip formatter={(value, name) => [`${value} Days`, name]} />
                <Legend content={(props) => renderCustomLegend(props, metrics.totalDaysReceived)} layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location-wise Completion Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title" style={{ marginBottom: '0.25rem' }}>Location-wise Completion</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Number of locations by completion status</p>
          <div className="chart-container" style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionStatusData} margin={{ top: 30, right: 20, left: -20, bottom: 20 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={<CustomXAxisTick />} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(value: any, name: any, props: any) => [value, props.payload.nameDisplay]} labelFormatter={() => ''} cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {
                    completionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))
                  }
                  <LabelList dataKey="value" position="top" fill="var(--color-text-primary)" fontSize={14} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Location Table */}
      <div className="table-section">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="table-title">Location-wise TraNac Data Status</h3>
          <button onClick={handleExport} className="export-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            <Download size={18} />
            Export to Excel
          </button>
        </div>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '1rem' }}>Sr. No.</th>
                <th style={{ padding: '1rem' }}>Location Name</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Total Days</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>In Process<br/><span style={{ fontSize: '0.75rem', fontWeight: 400 }}>(No. of days)</span></th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Completed<br/><span style={{ fontSize: '0.75rem', fontWeight: 400 }}>(No. of days)</span></th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Balance<br/><span style={{ fontSize: '0.75rem', fontWeight: 400 }}>(No. of days)</span></th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const statusColors = getStatusPillColor(row.status);
                return (
                  <tr key={row.srNo} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{row.srNo}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{row.locationName}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{row.totalScope}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: row.processDays > 0 ? '#3f6212' : 'inherit' }}>{row.processDays}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: row.completedDays > 0 ? '#065f46' : 'inherit' }}>{row.completedDays}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: row.balanceDays > 0 ? '#92400e' : 'inherit' }}>{row.balanceDays}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        backgroundColor: statusColors.bg, 
                        color: statusColors.text, 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                      }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
