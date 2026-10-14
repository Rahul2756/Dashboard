import React, { useState, useMemo } from 'react';
import { 
  Users, CalendarDays, TrendingUp, Calendar, 
  Download, Eye, CheckCircle2, HardHat, 
  Info, Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LabelList, Cell 
} from 'recharts';
import { DailyWorkRecord, ProjectWorkforceSummary } from '../../types/workforce';
import { getProjectWorkforce, exportDailyWorkforceToExcel } from '../../services/workforceService';
import { EmployeeRosterModal } from './EmployeeRosterModal';
import './workforce.css';

interface DailyWorkforceSectionProps {
  projectId: string;
  projectName: string;
  // Milestone node properties from parent to retain the full Processing Timeline
  milestoneNodes: Array<{
    label: string;
    date?: string;
    status?: { status: string; delayDays?: number };
  }>;
  formatDate: (date?: string) => string;
  getStatusColor: (status: string) => string;
}

export const DailyWorkforceSection: React.FC<DailyWorkforceSectionProps> = ({
  projectId,
  projectName,
  milestoneNodes,
  formatDate,
  getStatusColor
}) => {
  // Fetch dynamic workforce summary for this selected project
  const summary: ProjectWorkforceSummary = useMemo(() => {
    // Try matching by projectId (e.g. 'proj-1') or by projectName (e.g. 'GAEPL')
    return getProjectWorkforce(projectName) || getProjectWorkforce(projectId);
  }, [projectId, projectName]);

  // Selected date state for interactive inspection across timeline, chart, and table
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Selected record for employee roster modal
  const [modalRecord, setModalRecord] = useState<DailyWorkRecord | null>(null);

  // Currently active/highlighted record (default to first record if available)
  const activeRecord = useMemo(() => {
    if (!summary.records || summary.records.length === 0) return null;
    if (selectedRecordId) {
      return summary.records.find(r => r.id === selectedRecordId) || summary.records[0];
    }
    return summary.records[0];
  }, [summary.records, selectedRecordId]);

  // Handle Export to Excel
  const handleExportWorkforce = () => {
    exportDailyWorkforceToExcel(projectName, summary.records);
  };

  // Recharts custom bar click
  const handleBarClick = (data: any) => {
    if (data && data.id) {
      setSelectedRecordId(data.id);
    }
  };

  return (
    <div className="highway-timeline-card workforce-enhanced-card">
      {/* 1. Header Section */}
      <div className="workforce-section-header">
        <div className="workforce-header-left">
          <div className="workforce-badge-icon">
            <HardHat size={20} color="#1D4ED8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h4 className="timeline-title" style={{ margin: 0 }}>
                Processing Timeline & Daily Workforce
              </h4>
              <span className="workforce-project-tag">
                {projectName}
              </span>
            </div>
            <p className="workforce-header-subtitle">
              Date-wise site workforce deployment, milestone synchronization & daily assignments
            </p>
          </div>
        </div>

        <div className="workforce-header-actions">
          <button 
            onClick={handleExportWorkforce}
            className="workforce-export-btn"
            title="Export daily workforce records formatted to Excel schema"
            disabled={summary.records.length === 0}
          >
            <Download size={15} />
            <span>Export Workforce XLS</span>
          </button>
        </div>
      </div>

      {/* Demo Data Notice Banner */}
      {summary.records.some(r => r.isDemo) && (
        <div className="workforce-demo-notice-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={16} color="#0284C7" />
            <span style={{ fontSize: '0.8rem', color: '#0369A1', fontWeight: 500 }}>
              <strong>Notice:</strong> Displaying illustrative demo records for {projectName}. Values reflect sample daily deployments and are prepared for live Excel sheet ingestion.
            </span>
          </div>
          <span className="workforce-demo-tag">DEMO VALUES ONLY</span>
        </div>
      )}

      {/* 2. Four Compact Summary Cards (Requirement #3) */}
      <div className="workforce-summary-cards-grid">
        {/* Card 1: Working Days */}
        <div className="workforce-kpi-card">
          <div className="workforce-kpi-header">
            <span className="workforce-kpi-label">WORKING DAYS</span>
            <div className="workforce-kpi-icon-wrap" style={{ backgroundColor: '#F1F5F9', color: '#334155' }}>
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="workforce-kpi-value">
            {summary.workingDays} <span className="workforce-kpi-unit">Days</span>
          </div>
          <div className="workforce-kpi-footer">
            Distinct dates with recorded work
          </div>
        </div>

        {/* Card 2: Total Employee Assignments */}
        <div className="workforce-kpi-card active-metric">
          <div className="workforce-kpi-header">
            <span className="workforce-kpi-label">TOTAL EMPLOYEE ASSIGNMENTS</span>
            <div className="workforce-kpi-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="workforce-kpi-value" style={{ color: '#1D4ED8' }}>
            {summary.totalAssignments} <span className="workforce-kpi-unit" style={{ color: '#2563EB' }}>Assignments</span>
          </div>
          <div className="workforce-kpi-footer">
            {summary.uniqueEmployeesCount > 0 ? (
              <span style={{ color: '#1E40AF', fontWeight: 600 }}>
                {summary.uniqueEmployeesCount} Unique Personnel Assigned
              </span>
            ) : (
              <span>Sum of daily employee counts</span>
            )}
          </div>
        </div>

        {/* Card 3: Average Daily Workforce */}
        <div className="workforce-kpi-card">
          <div className="workforce-kpi-header">
            <span className="workforce-kpi-label">AVERAGE DAILY WORKFORCE</span>
            <div className="workforce-kpi-icon-wrap" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="workforce-kpi-value">
            {summary.averageDailyWorkforce.toFixed(2)} <span className="workforce-kpi-unit">Members</span>
          </div>
          <div className="workforce-kpi-footer">
            Average headcount per working day
          </div>
        </div>

        {/* Card 4: Project Work Period */}
        <div className="workforce-kpi-card">
          <div className="workforce-kpi-header">
            <span className="workforce-kpi-label">PROJECT WORK PERIOD</span>
            <div className="workforce-kpi-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div className="workforce-kpi-value" style={{ fontSize: '1.05rem', lineHeight: '1.4' }}>
            {summary.firstWorkDate && summary.lastWorkDate ? (
              `${summary.firstWorkDate} to ${summary.lastWorkDate}`
            ) : (
              <span style={{ color: '#94A3B8' }}>No recorded work dates</span>
            )}
          </div>
          <div className="workforce-kpi-footer">
            First recorded to last recorded work date
          </div>
        </div>
      </div>

      {/* 3. Milestone Highway Road Timeline (Preserves existing highway theme) */}
      <div className="workforce-milestones-wrapper">
        <div className="workforce-subsection-label">
          <Layers size={14} color="#64748B" />
          <span>PROJECT STAGE & MILESTONE TIMELINE</span>
        </div>
        <div className="highway-timeline">
          {milestoneNodes.map((node, i) => (
            <div 
              key={i} 
              className="timeline-node" 
              style={{ 
                color: node.date 
                  ? (node.status ? getStatusColor(node.status.status) : 'var(--color-primary)') 
                  : 'var(--color-text-tertiary)' 
              }}
            >
              <div className="tn-marker" />
              <div className="tn-content-signboard">
                <span className="tn-label" style={{ color: 'var(--color-text-primary)' }}>{node.label}</span>
                <span className="tn-date">{formatDate(node.date)}</span>
                {node.status && node.status.status !== 'Not Started' && (
                  <span className="tn-status" style={{ color: getStatusColor(node.status.status) }}>
                    {node.status.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {summary.records.length > 0 ? (
        <>
          {/* 4. Horizontal Daily Workforce Timeline (Requirement #4) */}
          <div className="workforce-timeline-container">
            <div className="workforce-subsection-label">
              <CalendarDays size={14} color="#2563EB" />
              <span>DAILY WORKFORCE TIMELINE — DATE-WISE DEPLOYMENT</span>
              <span className="workforce-hint-text">Click any date to inspect details</span>
            </div>

            <div className="workforce-horizontal-scroll">
              <div className="workforce-timeline-track">
                {/* Connecting subtle horizontal line */}
                <div className="workforce-connecting-line" />

                {summary.records.map((record) => {
                  const isSelected = activeRecord?.id === record.id;
                  // Format '01 OCT' style
                  const dateObj = new Date(record.workDate);
                  const dayNum = String(dateObj.getDate()).padStart(2, '0');
                  const monthShort = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();

                  return (
                    <div
                      key={record.id}
                      onClick={() => setSelectedRecordId(record.id)}
                      className={`workforce-timeline-node ${isSelected ? 'selected' : ''}`}
                      title={`Click to view details for ${record.displayDate || record.workDate}`}
                    >
                      {/* Member count pill (prominent) */}
                      <div className="workforce-node-count-badge">
                        <Users size={12} />
                        <span>{record.employeeCount} Members</span>
                      </div>

                      {/* Timeline dot marker */}
                      <div className="workforce-node-bullet">
                        <div className="workforce-bullet-inner" />
                      </div>

                      {/* Date label */}
                      <div className="workforce-node-date-box">
                        <span className="workforce-date-day">{dayNum}</span>
                        <span className="workforce-date-month">{monthShort}</span>
                        <span className="workforce-date-year">{dateObj.getFullYear()}</span>
                      </div>

                      {/* Status indicator */}
                      <div className="workforce-node-status-chip">
                        <span className="status-dot-green" />
                        <span>{record.workStatus}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Daily Workforce Bar Chart & Selected Inspector (Requirement #5) */}
          <div className="workforce-chart-section">
            <div className="workforce-chart-header">
              <div>
                <h5 className="workforce-chart-title">
                  Daily Workforce — {projectName}
                </h5>
                <p className="workforce-chart-subtitle">
                  Work date vs. active employee headcount with cumulative assignment tracking
                </p>
              </div>

              {activeRecord && (
                <div className="workforce-chart-active-tag">
                  <span className="indicator-pulse" />
                  <span>Selected Date: <strong>{activeRecord.displayDate || activeRecord.workDate}</strong></span>
                </div>
              )}
            </div>

            <div className="workforce-chart-with-inspector">
              {/* Main Bar Chart */}
              <div className="workforce-chart-container">
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart 
                    data={summary.records} 
                    margin={{ top: 25, right: 20, left: -10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="workDate" 
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`;
                      }}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1' }}
                      label={{ 
                        value: 'Number of Employees', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: 15,
                        style: { fill: '#64748B', fontSize: 11, fontWeight: 500 }
                      }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data: DailyWorkRecord = payload[0].payload;
                          return (
                            <div className="workforce-custom-tooltip">
                              <div className="tooltip-title">{data.displayDate || data.workDate}</div>
                              <div className="tooltip-row highlight">
                                <span>Employees Working:</span>
                                <strong>{data.employeeCount} Members</strong>
                              </div>
                              {data.workActivity && (
                                <div className="tooltip-row">
                                  <span>Activity:</span>
                                  <span className="tooltip-activity">{data.workActivity}</span>
                                </div>
                              )}
                              <div className="tooltip-row">
                                <span>Work Status:</span>
                                <span className="tooltip-status">{data.workStatus}</span>
                              </div>
                              <div className="tooltip-row cumulative">
                                <span>Cumulative Assignments:</span>
                                <strong>{data.cumulativeAssignments} Total</strong>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="employeeCount" 
                      radius={[6, 6, 0, 0]}
                      onClick={handleBarClick}
                      style={{ cursor: 'pointer' }}
                    >
                      <LabelList 
                        dataKey="employeeCount" 
                        position="top" 
                        fill="#1E293B" 
                        fontSize={12} 
                        fontWeight={700}
                        formatter={(val: number) => `${val}`}
                      />
                      {summary.records.map((entry) => (
                        <Cell 
                          key={`cell-${entry.id}`} 
                          fill={activeRecord?.id === entry.id ? '#1D4ED8' : '#3B82F6'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Requirement #5: Selected Bar Inspector Panel */}
              {activeRecord && (
                <div className="workforce-inspector-card">
                  <div className="workforce-inspector-header">
                    <span className="inspector-badge">INSPECTOR</span>
                    <span className="inspector-date">{activeRecord.displayDate || activeRecord.workDate}</span>
                  </div>

                  <div className="inspector-metric-block">
                    <span className="inspector-label">EMPLOYEES WORKING</span>
                    <div className="inspector-headcount">
                      <Users size={20} color="#2563EB" />
                      <span className="inspector-count">{activeRecord.employeeCount}</span>
                      <span className="inspector-sub">Members on site</span>
                    </div>
                  </div>

                  <div className="inspector-detail-row">
                    <span className="inspector-label">WORK STATUS</span>
                    <span className="workforce-status-pill status-recorded">
                      {activeRecord.workStatus}
                    </span>
                  </div>

                  <div className="inspector-detail-row">
                    <span className="inspector-label">CUMULATIVE ASSIGNMENTS</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <TrendingUp size={16} color="#059669" />
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                        {activeRecord.cumulativeAssignments} Assignments
                      </span>
                    </div>
                  </div>

                  {activeRecord.workActivity && (
                    <div className="inspector-detail-row">
                      <span className="inspector-label">RECORDED WORK ACTIVITY</span>
                      <p className="inspector-activity-text">
                        {activeRecord.workActivity}
                      </p>
                    </div>
                  )}

                  {activeRecord.remarks && (
                    <div className="inspector-detail-row">
                      <span className="inspector-label">REMARKS</span>
                      <p className="inspector-remarks-text">
                        {activeRecord.remarks}
                      </p>
                    </div>
                  )}

                  {activeRecord.employees && activeRecord.employees.length > 0 && (
                    <button 
                      onClick={() => setModalRecord(activeRecord)}
                      className="workforce-view-roster-btn"
                    >
                      <Eye size={15} />
                      <span>View {activeRecord.employees.length} Assigned Employees</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 6. Detailed Daily Work Table (Requirement #6) */}
          <div className="workforce-table-wrapper">
            <div className="workforce-table-header">
              <div>
                <h5 className="workforce-table-title">
                  Detailed Daily Work Records
                </h5>
                <span className="workforce-table-subtitle">
                  Audited daily logs supporting working day and employee assignment totals
                </span>
              </div>
              <span className="workforce-records-count-badge">
                {summary.records.length} Working Days Logged
              </span>
            </div>

            <div className="workforce-table-container">
              <table className="workforce-data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employees Working</th>
                    <th>Work Activity</th>
                    <th>Work Status</th>
                    <th>Cumulative</th>
                    <th>Remarks</th>
                    <th style={{ textAlign: 'center' }}>Personnel Roster</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.records.map((rec) => {
                    const isRowSelected = activeRecord?.id === rec.id;
                    const hasNames = rec.employees && rec.employees.length > 0;

                    return (
                      <tr 
                        key={rec.id}
                        className={isRowSelected ? 'row-selected' : ''}
                        onClick={() => setSelectedRecordId(rec.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={14} color="#64748B" />
                            <strong style={{ color: '#0F172A' }}>
                              {rec.displayDate || rec.workDate}
                            </strong>
                          </div>
                        </td>
                        <td>
                          <div className="workforce-employee-count-pill">
                            <Users size={13} color="#2563EB" />
                            <span>{rec.employeeCount} Members</span>
                          </div>
                        </td>
                        <td>
                          <span className="workforce-activity-cell">
                            {rec.workActivity || 'Pavement & Road Surface Assessment'}
                          </span>
                        </td>
                        <td>
                          <span className="workforce-status-pill status-recorded">
                            <CheckCircle2 size={12} color="#059669" />
                            {rec.workStatus}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                            {rec.cumulativeAssignments}
                          </span>
                        </td>
                        <td>
                          <span className="workforce-remarks-cell">
                            {rec.remarks || '—'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          {hasNames ? (
                            <button
                              onClick={() => setModalRecord(rec)}
                              className="workforce-table-action-btn"
                              title="Inspect employee names assigned on this date"
                            >
                              <Eye size={13} />
                              <span>{rec.employees!.length} Names</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                              Aggregate Only
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Empty State for projects with 0 working days (e.g. Delhi-Meerut) */
        <div className="workforce-empty-state">
          <div className="empty-state-icon-box">
            <CalendarDays size={36} color="#94A3B8" />
          </div>
          <h5 className="empty-state-title">
            No Daily Workforce Records Yet for {projectName}
          </h5>
          <p className="empty-state-desc">
            This project has not logged daily field work records or employee deployments yet. Once survey operations begin and site logs are uploaded, daily workforce metrics and timelines will render here automatically.
          </p>
        </div>
      )}

      {/* Roster Modal */}
      {modalRecord && (
        <EmployeeRosterModal
          record={modalRecord}
          projectName={projectName}
          onClose={() => setModalRecord(null)}
        />
      )}
    </div>
  );
};
