import React, { useState, useMemo } from 'react';
import { 
  Users, CalendarDays, Calendar, 
  Download, Eye, CheckCircle2, Clock, AlertCircle,
  Layers, HardHat, ShieldCheck, 
  Activity, Percent
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LabelList, Cell
} from 'recharts';
import { DailyRatingRecord, ProjectRatingSummary } from '../../types/hiRateWorkforce';
import { calculateHiRateSummary, exportHiRateWorkforceToExcel } from '../../services/hiRateWorkforceService';
import { HIRATE_27_PROJECTS, HiRateProject } from '../../services/hiRateParser';
import { CustomDropdown } from '../CustomDropdown';
import { EmployeeRosterModal } from '../project/EmployeeRosterModal';
import './hirate-workforce.css';

interface HiRateProjectDetailedViewProps {
  projects: HiRateProject[];
  defaultProjectCode?: string;
}

export const HiRateProjectDetailedView: React.FC<HiRateProjectDetailedViewProps> = ({
  projects,
  defaultProjectCode = 'GAEPL'
}) => {
  // 1. Project selection state (controlled by dropdown containing all 27 projects)
  const [selectedProjectCode, setSelectedProjectCode] = useState<string>(defaultProjectCode);

  // Match selected project from current loaded projects or fall back to master list
  const currentProject = useMemo(() => {
    return projects.find(p => p.code.toUpperCase() === selectedProjectCode.toUpperCase()) ||
      HIRATE_27_PROJECTS.find(p => p.code.toUpperCase() === selectedProjectCode.toUpperCase()) ||
      HIRATE_27_PROJECTS[0];
  }, [projects, selectedProjectCode]);

  // Compute dynamic HiRATE summary & records for this project
  const summary: ProjectRatingSummary = useMemo(() => {
    return calculateHiRateSummary(selectedProjectCode, currentProject.name);
  }, [selectedProjectCode, currentProject.name]);

  // Selected date state for interactive inspection across timeline, charts, and table
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Active record currently inspected
  const activeRecord = useMemo(() => {
    if (!summary.records || summary.records.length === 0) return null;
    if (selectedRecordId) {
      return summary.records.find(r => r.id === selectedRecordId) || summary.records[0];
    }
    return summary.records[0];
  }, [summary.records, selectedRecordId]);

  // Selected record for personnel roster modal
  const [modalRecord, setModalRecord] = useState<any | null>(null);

  // Export Daily Workforce to Excel
  const handleExport = () => {
    exportHiRateWorkforceToExcel(summary.projectCode, summary.records);
  };

  // Dropdown options for all 27 projects
  const dropdownOptions = useMemo(() => {
    const list = projects.length >= 27 ? projects : HIRATE_27_PROJECTS;
    return list.map(p => ({
      value: p.code,
      label: `${p.code} — ${p.name}`
    }));
  }, [projects]);

  // Stage breakdown stats
  const stageStats = useMemo(() => {
    const hoRecords = summary.records.filter(r => r.ratingStage === 'HO');
    const spvRecords = summary.records.filter(r => r.ratingStage === 'SPV');
    const finalRecords = summary.records.filter(r => r.ratingStage === 'Final HO');

    const hoAssets = hoRecords.reduce((sum, r) => sum + r.assetsRated, 0);
    const hoMembers = hoRecords.reduce((sum, r) => sum + r.membersWorked, 0);

    const spvAssets = spvRecords.reduce((sum, r) => sum + r.assetsRated, 0);
    const spvMembers = spvRecords.reduce((sum, r) => sum + r.membersWorked, 0);

    return {
      ho: {
        recordsCount: hoRecords.length,
        assets: hoAssets,
        members: hoMembers,
        dateRange: hoRecords.length > 0 ? `${hoRecords[0].displayDate} to ${hoRecords[hoRecords.length - 1].displayDate}` : 'Scheduled'
      },
      spv: {
        recordsCount: spvRecords.length,
        assets: spvAssets,
        members: spvMembers,
        dateRange: spvRecords.length > 0 ? `${spvRecords[0].displayDate} to ${spvRecords[spvRecords.length - 1].displayDate}` : 'Pending Joint Review'
      },
      final: {
        recordsCount: finalRecords.length,
        dateRange: 'Pending Final HO Scheduling'
      }
    };
  }, [summary.records]);

  return (
    <div className="hirate-detailed-section">
      {/* 1. Section Header & Dropdown */}
      <div className="hirate-section-header-row">
        <div className="hirate-section-title-wrap">
          <span className="hirate-section-tag">HIGHWAY SIGNBOARD & ASSET INSPECTION</span>
          <h2 className="hirate-section-main-heading">
            PROJECT DETAILED VIEW — DAILY RATING ACTIVITY
          </h2>
          <p className="hirate-section-subtitle">
            Project-wise daily rating activity, active personnel deployment, and HO vs. SPV rating stage progression
          </p>
        </div>

        <div className="hirate-dropdown-container">
          <button 
            onClick={handleExport}
            className="workforce-export-btn"
            title="Export daily rating records formatted to Excel schema"
            style={{ height: '38px', whiteSpace: 'nowrap' }}
          >
            <Download size={15} />
            <span>Export Rating XLS</span>
          </button>

          <div style={{ width: '320px' }}>
            <span style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#64748B', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              SELECT HIGHWAY PROJECT (27 TOTAL)
            </span>
            <CustomDropdown 
              value={selectedProjectCode}
              onChange={setSelectedProjectCode}
              options={dropdownOptions}
            />
          </div>
        </div>
      </div>

      {/* 2. Executive Hero Card */}
      <div className="hirate-project-hero-card">
        <div className="hirate-hero-banner">
          {/* Subtle road graphic */}
          <svg className="hirate-hero-road-svg" viewBox="0 0 300 200">
            <path d="M-20,200 C60,140 180,60 300,0" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" />
            <path d="M60,220 C120,155 200,75 300,15" fill="none" stroke="white" strokeWidth="6" strokeDasharray="24 16" strokeLinecap="round" />
          </svg>

          <div className="hirate-hero-top-row">
            <div className="hirate-hero-project-info">
              <div className="hirate-hero-icon-box">
                <HardHat size={28} color="#FFFFFF" />
              </div>
              <div>
                <h3 className="hirate-hero-title">{summary.projectCode}</h3>
                <p className="hirate-hero-subtitle">{summary.projectName}</p>
              </div>
            </div>

            <div className="hirate-hero-stage-badges">
              {/* HO Badge */}
              <div className="hirate-hero-stage-badge badge-completed">
                <CheckCircle2 size={14} />
                <span>HO Rating: Completed</span>
              </div>

              {/* SPV Badge */}
              <div className={`hirate-hero-stage-badge ${summary.spvStatus === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                {summary.spvStatus === 'Completed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                <span>SPV Rating: {summary.spvStatus}</span>
              </div>

              {/* Final HO Badge */}
              <div className="hirate-hero-stage-badge badge-notstarted">
                <AlertCircle size={14} />
                <span>Final HO: {summary.finalHoStatus}</span>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="hirate-hero-demo-notice">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="#38BDF8" />
              <span>
                <strong>Verified Real Data:</strong> HO & SPV project status loaded from HiRATE registry. Daily rating workforce & asset counts are illustrative demo records prepared for live Excel ingestion.
              </span>
            </div>
            <span className="hirate-demo-badge">DEMO WORKFORCE ACTIVE</span>
          </div>
        </div>

        {/* 3. Four Project Summary Cards (Requirement #4) */}
        <div className="hirate-summary-grid">
          {/* Card 1: Total Working Days */}
          <div className="hirate-kpi-card">
            <div className="hirate-kpi-top">
              <span className="hirate-kpi-label">TOTAL WORKING DAYS</span>
              <div className="hirate-kpi-icon-wrap" style={{ background: '#F1F5F9', color: '#334155' }}>
                <CalendarDays size={18} />
              </div>
            </div>
            <div className="hirate-kpi-value">
              {summary.totalWorkingDays} <span className="hirate-kpi-unit">Days</span>
            </div>
            <div className="hirate-kpi-subtext">
              {summary.firstRatingDate && summary.latestRatingDate 
                ? `${summary.firstRatingDate} to ${summary.latestRatingDate}`
                : 'No rating activity recorded'}
            </div>
          </div>

          {/* Card 2: Total Members Worked */}
          <div className="hirate-kpi-card highlight-blue">
            <div className="hirate-kpi-top">
              <span className="hirate-kpi-label">TOTAL MEMBERS WORKED</span>
              <div className="hirate-kpi-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <Users size={18} />
              </div>
            </div>
            <div className="hirate-kpi-value" style={{ color: '#1D4ED8' }}>
              {summary.totalMembersWorked} <span className="hirate-kpi-unit" style={{ color: '#2563EB' }}>Assignments</span>
            </div>
            <div className="hirate-kpi-subtext">
              <strong style={{ color: '#1E40AF' }}>{summary.uniqueMembersCount} Unique Rating Engineers</strong> assigned
            </div>
          </div>

          {/* Card 3: Total Assets Rated */}
          <div className="hirate-kpi-card highlight-green">
            <div className="hirate-kpi-top">
              <span className="hirate-kpi-label">TOTAL ASSETS RATED</span>
              <div className="hirate-kpi-icon-wrap" style={{ background: '#ECFDF5', color: '#059669' }}>
                <Activity size={18} />
              </div>
            </div>
            <div className="hirate-kpi-value" style={{ color: '#047857' }}>
              {summary.totalAssetsRated} <span className="hirate-kpi-unit" style={{ color: '#059669' }}>Signboards</span>
            </div>
            <div className="hirate-kpi-subtext">
              Actual highway signboard ratings completed
            </div>
          </div>

          {/* Card 4: Overall Rating Progress */}
          <div className="hirate-kpi-card">
            <div className="hirate-kpi-top">
              <span className="hirate-kpi-label">OVERALL RATING PROGRESS</span>
              <div className="hirate-kpi-icon-wrap" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <Percent size={18} />
              </div>
            </div>
            <div className="hirate-kpi-value" style={{ color: '#B45309' }}>
              {summary.ratingProgressPercent}% <span className="hirate-kpi-unit">({summary.totalAssetsRated}/{summary.totalApplicableAssets})</span>
            </div>
            <div className="hirate-kpi-subtext">
              {summary.totalApplicableAssets - summary.totalAssetsRated} signboards remaining for corridor
            </div>
          </div>
        </div>
      </div>

      {/* 4. Rating Stages Breakdown Cards (Requirement #8) */}
      <div className="hirate-stages-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Layers size={16} color="#2563EB" />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Rating Stages Breakdown — HO, SPV & Final HO
          </h4>
        </div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748B' }}>
          Independent stage tracking: completed SPV rating does not automatically mean Final HO is completed
        </p>

        <div className="hirate-stages-grid">
          {/* Stage 1: HO Team Rating */}
          <div className="hirate-stage-card stage-ho">
            <div>
              <div className="hirate-stage-header">
                <span className="hirate-stage-name">1. HO Team Rating</span>
                <span className="hirate-stage-status-pill completed">Completed</span>
              </div>
              <div className="hirate-stage-details-list">
                <div className="hirate-stage-detail-row">
                  <span>Rating Period:</span>
                  <strong>{stageStats.ho.dateRange}</strong>
                </div>
                <div className="hirate-stage-detail-row">
                  <span>Signboards Rated:</span>
                  <strong style={{ color: '#059669' }}>{stageStats.ho.assets} Assets</strong>
                </div>
                <div className="hirate-stage-detail-row">
                  <span>Workforce Assigned:</span>
                  <strong>{stageStats.ho.members} Assignments</strong>
                </div>
                <div className="hirate-stage-detail-row">
                  <span>Stage Status:</span>
                  <strong style={{ color: '#059669' }}>100% HO Target Achieved</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 2: SPV Team Rating */}
          <div className={`hirate-stage-card ${summary.spvStatus === 'Completed' ? 'stage-spv-comp' : 'stage-spv-pend'}`}>
            <div>
              <div className="hirate-stage-header">
                <span className="hirate-stage-name">2. SPV Team Rating</span>
                <span className={`hirate-stage-status-pill ${summary.spvStatus === 'Completed' ? 'completed' : 'pending'}`}>
                  {summary.spvStatus}
                </span>
              </div>
              <div className="hirate-stage-details-list">
                <div className="hirate-stage-detail-row">
                  <span>Rating Period:</span>
                  <strong>{stageStats.spv.dateRange}</strong>
                </div>
                <div className="hirate-stage-detail-row">
                  <span>Signboards Rated:</span>
                  <strong style={{ color: summary.spvStatus === 'Completed' ? '#2563EB' : '#D97706' }}>
                    {stageStats.spv.assets} Assets
                  </strong>
                </div>
                <div className="hirate-stage-detail-row">
                  <span>Workforce Assigned:</span>
                  <strong>{stageStats.spv.members} Assignments</strong>
                </div>
                <div className="hirate-stage-detail-row">
                  <span>Stage Status:</span>
                  <strong style={{ color: summary.spvStatus === 'Completed' ? '#2563EB' : '#D97706' }}>
                    {summary.spvStatus === 'Completed' ? 'Joint Review Signed-off' : 'Pending SPV Schedule'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 3: Final HO Rating */}
          <div className="hirate-stage-card stage-final">
            <div>
              <div className="hirate-stage-header">
                <span className="hirate-stage-name">3. Final HO Rating</span>
                <span className="hirate-stage-status-pill in-review">
                  {summary.finalHoStatus}
                </span>
              </div>
              <div className="hirate-stage-details-list">
                <div className="hirate-stage-detail-row">
                  <span>Review Phase:</span>
                  <strong>Executive Audit & Sign-off</strong>
                </div>
                <div className="hirate-stage-detail-row">
                  <span>Review Target:</span>
                  <strong>Post SPV Sign-off</strong>
                </div>
                <div className="hirate-stage-detail-row">
                  <span>Overall Status:</span>
                  <strong style={{ color: '#64748B' }}>Awaiting Final Dossier</strong>
                </div>
                <div className="hirate-stage-detail-row">
                  <span>Current State:</span>
                  <strong style={{ color: '#475569' }}>0 / 27 Completed Globally</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Daily Rating Workforce Timeline (Requirement #5) */}
      <div className="hirate-timeline-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={18} color="#1D4ED8" />
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>
              DAILY RATING WORKFORCE TIMELINE
            </h4>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Click any date point to inspect details across charts and table
          </span>
        </div>

        <div className="hirate-timeline-scroll">
          <div className="hirate-timeline-track">
            {/* Subtle horizontal connecting line */}
            <div className="hirate-connecting-line" />

            {summary.records.map((record) => {
              const isSelected = activeRecord?.id === record.id;
              const dateObj = new Date(record.ratingDate);
              const dayNum = String(dateObj.getDate()).padStart(2, '0');
              const monthShort = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecordId(record.id)}
                  className={`hirate-timeline-node ${isSelected ? 'selected' : ''}`}
                  title={`Inspect ${record.displayDate || record.ratingDate}`}
                >
                  {/* Member count pill */}
                  <div className="hirate-node-badge">
                    <Users size={12} />
                    <span>{record.membersWorked} Members</span>
                  </div>

                  {/* Bullet */}
                  <div className="hirate-node-bullet">
                    <div className="hirate-bullet-dot" />
                  </div>

                  {/* Date and assets */}
                  <div className="hirate-node-content-box">
                    <span className="hirate-node-day">{dayNum}</span>
                    <span className="hirate-node-month">{monthShort}</span>
                    <span className="hirate-node-assets-tag">
                      {record.assetsRated} Assets Rated
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6 & 7. Dual Visual Charts (Requirement #6 & #7) */}
      <div className="hirate-charts-wrapper">
        {/* Chart 1: Daily Rating Workforce */}
        <div className="hirate-chart-card">
          <div className="hirate-chart-header">
            <div>
              <h5 className="hirate-chart-title">Daily Rating Workforce</h5>
              <p className="hirate-chart-subtitle">
                Number of engineers and specialists deployed per rating date
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Workforce Headcount
            </span>
          </div>

          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={summary.records}
                margin={{ top: 20, right: 10, left: -15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="ratingDate" 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`;
                  }}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickLine={false}
                  label={{ value: 'Members', angle: -90, position: 'insideLeft', offset: 15, style: { fill: '#64748B', fontSize: 10 } }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d: DailyRatingRecord = payload[0].payload;
                      return (
                        <div className="workforce-custom-tooltip">
                          <div className="tooltip-title">{d.displayDate || d.ratingDate} • Stage: {d.ratingStage}</div>
                          <div className="tooltip-row highlight">
                            <span>Members Worked:</span>
                            <strong>{d.membersWorked} Personnel</strong>
                          </div>
                          <div className="tooltip-row">
                            <span>Assets Rated:</span>
                            <strong style={{ color: '#34D399' }}>{d.assetsRated} Signboards</strong>
                          </div>
                          <div className="tooltip-row">
                            <span>Activity:</span>
                            <span className="tooltip-activity">{d.activityDetails}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="membersWorked" 
                  radius={[6, 6, 0, 0]}
                  onClick={(d: any) => d && setSelectedRecordId(d.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <LabelList 
                    dataKey="membersWorked" 
                    position="top" 
                    fill="#1E293B" 
                    fontSize={11} 
                    fontWeight={700} 
                  />
                  {summary.records.map((entry) => (
                    <Cell 
                      key={`cell-mem-${entry.id}`} 
                      fill={activeRecord?.id === entry.id ? '#1D4ED8' : '#3B82F6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily Asset Rating Progress */}
        <div className="hirate-chart-card">
          <div className="hirate-chart-header">
            <div>
              <h5 className="hirate-chart-title">Daily Asset Rating Progress</h5>
              <p className="hirate-chart-subtitle">
                Highway signboards rated per day with cumulative progress tracking
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Signboard Rating Output
            </span>
          </div>

          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={summary.records}
                margin={{ top: 20, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="ratingDate" 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`;
                  }}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickLine={false}
                  label={{ value: 'Assets', angle: -90, position: 'insideLeft', offset: 15, style: { fill: '#64748B', fontSize: 10 } }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(5, 150, 105, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d: DailyRatingRecord = payload[0].payload;
                      return (
                        <div className="workforce-custom-tooltip">
                          <div className="tooltip-title">{d.displayDate || d.ratingDate} • Stage: {d.ratingStage}</div>
                          <div className="tooltip-row highlight">
                            <span>Daily Rated:</span>
                            <strong style={{ color: '#34D399' }}>{d.assetsRated} Assets</strong>
                          </div>
                          <div className="tooltip-row cumulative">
                            <span>Cumulative Rated:</span>
                            <strong>{d.cumulativeAssetsRated} / {summary.totalApplicableAssets}</strong>
                          </div>
                          <div className="tooltip-row">
                            <span>Corridor Progress:</span>
                            <strong>{Math.round(((d.cumulativeAssetsRated || 0) / summary.totalApplicableAssets) * 100)}%</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="assetsRated" 
                  radius={[6, 6, 0, 0]}
                  onClick={(d: any) => d && setSelectedRecordId(d.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <LabelList 
                    dataKey="assetsRated" 
                    position="top" 
                    fill="#047857" 
                    fontSize={11} 
                    fontWeight={700} 
                  />
                  {summary.records.map((entry) => (
                    <Cell 
                      key={`cell-ast-${entry.id}`} 
                      fill={activeRecord?.id === entry.id ? '#059669' : '#10B981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Selected Bar Inspection Banner */}
      {activeRecord && (
        <div className="hirate-inspector-card">
          <div className="hirate-inspector-item">
            <span className="hirate-inspector-label">SELECTED RATING DATE</span>
            <span className="hirate-inspector-val">{activeRecord.displayDate || activeRecord.ratingDate}</span>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Stage: <strong>{activeRecord.ratingStage} Rating</strong></span>
          </div>

          <div className="hirate-inspector-item">
            <span className="hirate-inspector-label">MEMBERS WORKED</span>
            <span className="hirate-inspector-val" style={{ color: '#1D4ED8' }}>
              {activeRecord.membersWorked} Personnel
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Cumulative: {activeRecord.cumulativeMembersWorked} Assignments
            </span>
          </div>

          <div className="hirate-inspector-item">
            <span className="hirate-inspector-label">ASSETS / SIGNBOARDS RATED</span>
            <span className="hirate-inspector-val" style={{ color: '#047857' }}>
              {activeRecord.assetsRated} Assets
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Cumulative: {activeRecord.cumulativeAssetsRated} of {summary.totalApplicableAssets}
            </span>
          </div>

          <div className="hirate-inspector-item" style={{ maxWidth: '300px' }}>
            <span className="hirate-inspector-label">RECORDED ACTIVITY & REMARKS</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', lineHeight: 1.3 }}>
              {activeRecord.activityDetails || 'Signboard assessment'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
              {activeRecord.remarks}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {activeRecord.employees && activeRecord.employees.length > 0 && (
              <button 
                onClick={() => setModalRecord(activeRecord)}
                className="workforce-table-action-btn"
                style={{ padding: '0.5rem 0.85rem' }}
              >
                <Eye size={15} />
                <span>View {activeRecord.employees.length} Engineers</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 8. Detailed Daily Work Table (Requirement #9) */}
      <div className="hirate-table-card">
        <div className="hirate-table-header">
          <div>
            <h4 className="hirate-table-title">Daily Rating Details Table</h4>
            <p className="hirate-table-subtitle">
              Daily inspection logs, stage progression, signboard outputs, and personnel rosters
            </p>
          </div>
          <span className="hirate-table-badge">
            {summary.records.length} Recorded Rating Days
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="hirate-data-table">
            <thead>
              <tr>
                <th>Rating Date</th>
                <th>Project Code</th>
                <th>Rating Stage</th>
                <th>Members Worked</th>
                <th>Assets Rated</th>
                <th>Cumulative Assets</th>
                <th>Rating Status</th>
                <th>Remarks</th>
                <th style={{ textAlign: 'center' }}>Personnel Roster</th>
              </tr>
            </thead>
            <tbody>
              {summary.records.map((rec) => {
                const isSelected = activeRecord?.id === rec.id;
                const hasEmployees = rec.employees && rec.employees.length > 0;

                return (
                  <tr 
                    key={rec.id}
                    className={isSelected ? 'row-selected' : ''}
                    onClick={() => setSelectedRecordId(rec.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} color="#64748B" />
                        <strong style={{ color: '#0F172A' }}>
                          {rec.displayDate || rec.ratingDate}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#1E293B' }}>{rec.projectCode}</span>
                    </td>
                    <td>
                      <span className={`hirate-stage-badge-small ${rec.ratingStage.toLowerCase()}`}>
                        {rec.ratingStage} Stage
                      </span>
                    </td>
                    <td>
                      <div className="workforce-employee-count-pill">
                        <Users size={12} color="#2563EB" />
                        <span>{rec.membersWorked} Members</span>
                      </div>
                    </td>
                    <td>
                      <div className="hirate-asset-count-pill">
                        <CheckCircle2 size={12} color="#059669" />
                        <span>{rec.assetsRated} Rated</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#334155' }}>
                        {rec.cumulativeAssetsRated} / {summary.totalApplicableAssets}
                      </span>
                    </td>
                    <td>
                      <span className="workforce-status-pill status-recorded">
                        {rec.ratingStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.785rem', color: '#64748B', maxWidth: '240px', display: 'inline-block' }}>
                        {rec.remarks || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      {hasEmployees ? (
                        <button
                          onClick={() => setModalRecord(rec)}
                          className="workforce-table-action-btn"
                          title="View assigned signboard rating personnel"
                        >
                          <Eye size={13} />
                          <span>{rec.employees!.length} Names</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          Aggregate Headcount
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

      {/* Roster Modal */}
      {modalRecord && (
        <EmployeeRosterModal 
          record={{
            id: modalRecord.id,
            projectCode: modalRecord.projectCode,
            workDate: modalRecord.ratingDate,
            displayDate: modalRecord.displayDate,
            employeeCount: modalRecord.membersWorked,
            workActivity: `${modalRecord.ratingStage} Stage: ${modalRecord.activityDetails || 'Highway Signboard Rating'} (${modalRecord.assetsRated} Assets Rated)`,
            workStatus: modalRecord.ratingStatus,
            remarks: modalRecord.remarks,
            employees: modalRecord.employees,
            isDemo: modalRecord.isDemo
          }}
          projectName={summary.projectName}
          onClose={() => setModalRecord(null)}
        />
      )}
    </div>
  );
};
