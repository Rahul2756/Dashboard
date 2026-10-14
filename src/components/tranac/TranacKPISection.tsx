import React from 'react';
import { Route, CheckCircle2, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { TranacTimelineKPIs } from '../../types/tranac';

interface TranacKPISectionProps {
  kpis: TranacTimelineKPIs;
  activeStatusFilter: string;
  onSelectFilter: (status: string) => void;
}

export const TranacKPISection: React.FC<TranacKPISectionProps> = ({
  kpis,
  activeStatusFilter,
  onSelectFilter
}) => {
  return (
    <div className="tranac-kpi-grid">
      {/* 1. Total Toll Plazas */}
      <div
        className={`tranac-kpi-card kpi-total ${activeStatusFilter === 'All' ? 'active-filter' : ''}`}
        onClick={() => onSelectFilter('All')}
        title="Click to view all Toll Plazas"
      >
        <div className="tranac-kpi-header">
          <span className="tranac-kpi-title">Total Toll Plazas</span>
          <div className="tranac-kpi-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Route size={18} strokeWidth={2} />
          </div>
        </div>
        <div>
          <div className="tranac-kpi-value-row">
            <span className="tranac-kpi-value">{kpis.totalTollPlazas}</span>
          </div>
          <p className="tranac-kpi-subtext">Across all active highway survey stretches</p>
        </div>
      </div>

      {/* 2. Data Received */}
      <div
        className={`tranac-kpi-card kpi-received ${activeStatusFilter === 'Data Received' ? 'active-filter' : ''}`}
        onClick={() => onSelectFilter(activeStatusFilter === 'Data Received' ? 'All' : 'Data Received')}
        title="Click to filter plazas with Data Received"
      >
        <div className="tranac-kpi-header">
          <span className="tranac-kpi-title">Data Received</span>
          <div className="tranac-kpi-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={18} strokeWidth={2} />
          </div>
        </div>
        <div>
          <div className="tranac-kpi-value-row">
            <span className="tranac-kpi-value" style={{ color: '#047857' }}>{kpis.dataReceived}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669' }}>
              ({Math.round((kpis.dataReceived / Math.max(1, kpis.totalTollPlazas)) * 100)}%)
            </span>
          </div>
          <p className="tranac-kpi-subtext">Actual submissions received & logged</p>
        </div>
      </div>

      {/* 3. Partially Received */}
      <div
        className={`tranac-kpi-card kpi-partial ${activeStatusFilter === 'Partially Received' ? 'active-filter' : ''}`}
        onClick={() => onSelectFilter(activeStatusFilter === 'Partially Received' ? 'All' : 'Partially Received')}
        title="Click to filter plazas with Partial Data"
      >
        <div className="tranac-kpi-header">
          <span className="tranac-kpi-title">Partially Received</span>
          <div className="tranac-kpi-icon-wrap" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
            <Clock size={18} strokeWidth={2} />
          </div>
        </div>
        <div>
          <div className="tranac-kpi-value-row">
            <span className="tranac-kpi-value" style={{ color: '#b45309' }}>{kpis.partiallyReceived}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#d97706' }}>
              ({Math.round((kpis.partiallyReceived / Math.max(1, kpis.totalTollPlazas)) * 100)}%)
            </span>
          </div>
          <p className="tranac-kpi-subtext">Inflow pending full survey days</p>
        </div>
      </div>

      {/* 4. Data Not Yet Received */}
      <div
        className={`tranac-kpi-card kpi-not-received ${activeStatusFilter === 'Data Not yet Received' ? 'active-filter' : ''}`}
        onClick={() => onSelectFilter(activeStatusFilter === 'Data Not yet Received' ? 'All' : 'Data Not yet Received')}
        title="Click to filter plazas with Data Not Yet Received"
      >
        <div className="tranac-kpi-header">
          <span className="tranac-kpi-title">Data Not Yet Received</span>
          <div className="tranac-kpi-icon-wrap" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
            <AlertCircle size={18} strokeWidth={2} />
          </div>
        </div>
        <div>
          <div className="tranac-kpi-value-row">
            <span className="tranac-kpi-value" style={{ color: '#334155' }}>{kpis.dataNotReceived}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
              ({Math.round((kpis.dataNotReceived / Math.max(1, kpis.totalTollPlazas)) * 100)}%)
            </span>
          </div>
          <p className="tranac-kpi-subtext">No video or data inflow received yet</p>
        </div>
      </div>

      {/* 5. Delayed / Overdue */}
      <div
        className={`tranac-kpi-card kpi-overdue ${activeStatusFilter === 'Delayed' ? 'active-filter' : ''}`}
        onClick={() => onSelectFilter(activeStatusFilter === 'Delayed' ? 'All' : 'Delayed')}
        title="Click to filter plazas with Inflow Delay or Overdue Deadlines"
      >
        <div className="tranac-kpi-header">
          <span className="tranac-kpi-title">Delayed / Overdue</span>
          <div className="tranac-kpi-icon-wrap" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <AlertTriangle size={18} strokeWidth={2} />
          </div>
        </div>
        <div>
          <div className="tranac-kpi-value-row">
            <span className="tranac-kpi-value" style={{ color: '#b91c1c' }}>{kpis.delayedOrOverdue}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#dc2626' }}>
              Attention
            </span>
          </div>
          <p className="tranac-kpi-subtext">
            {kpis.overdueReceiptCount} overdue receipt, {kpis.delayedReceiptCount} delayed inflow
          </p>
        </div>
      </div>
    </div>
  );
};
