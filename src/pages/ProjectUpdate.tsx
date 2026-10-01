import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, AlertCircle, Clock, CheckCircle, CircleDashed,
  Route, MapPin, Activity, ListChecks, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { mockProjects } from '../services/mockProjectData';
import { getReportStatus, formatDate } from '../utils/dateUtils';
import { ProjectRecord, ReportStatus } from '../types/project';
import { CustomDropdown } from '../components/CustomDropdown';

export const ProjectUpdate: React.FC = () => {
  const [projects, setProjects] = useState<ProjectRecord[]>(mockProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0].id);

  const handleDateUpdate = (projectId: string, field: 'roughnessCompleted' | 'ruttingCompleted' | 'pavementEvalCompleted', value: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, [field]: value || undefined } : p));
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const wsData = projects.map(p => ({
      'Project Name': p.projectName,
      'Chainage Start': p.chainageStart,
      'Chainage End': p.chainageEnd,
      'Survey Starting': p.surveyStarting,
      'Survey Ending': p.surveyEnding,
      'Data Received': p.dataReceived,
      'E-NEXCO Updated': p.dataUpdatedEnexco,
      'Roughness Completed': p.roughnessCompleted || '',
      'Rutting Completed': p.ruttingCompleted || '',
      'Pavement Eval Completed': p.pavementEvalCompleted || '',
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    XLSX.writeFile(wb, "Project_Updates.xlsx");
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const totalLength = (selectedProject.chainageEnd - selectedProject.chainageStart).toFixed(3);
  const totalLaneLength = (Number(totalLength) * selectedProject.lanes).toFixed(3);

  // SLA Definitions
  const SLAs = {
    Roughness: 7,
    Rutting: 10,
    PavementEval: 15
  };

  const roughnessStatus = getReportStatus(selectedProject.dataUpdatedEnexco, selectedProject.roughnessCompleted, SLAs.Roughness);
  const ruttingStatus = getReportStatus(selectedProject.dataUpdatedEnexco, selectedProject.ruttingCompleted, SLAs.Rutting);
  const pavementStatus = getReportStatus(selectedProject.dataUpdatedEnexco, selectedProject.pavementEvalCompleted, SLAs.PavementEval);

  // Summary Metrics
  const summary = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let onTime = 0;
    let delayed = 0;
    let overdue = 0;
    let notStarted = 0;

    projects.forEach(p => {
      const stats = [
        getReportStatus(p.dataUpdatedEnexco, p.roughnessCompleted, SLAs.Roughness),
        getReportStatus(p.dataUpdatedEnexco, p.ruttingCompleted, SLAs.Rutting),
        getReportStatus(p.dataUpdatedEnexco, p.pavementEvalCompleted, SLAs.PavementEval)
      ];

      stats.forEach(s => {
        if (s.status.includes('Completed')) completed++;
        if (s.status.includes('In Progress')) inProgress++;
        if (s.status === 'Completed On Time') onTime++;
        if (s.status === 'Delayed') delayed++;
        if (s.status === 'In Progress – SLA Overdue') overdue++;
        if (s.status === 'Not Started') notStarted++;
      });
    });

    return { total: projects.length, completed, inProgress, onTime, delayed, overdue, notStarted };
  }, [projects]);

  const getStatusColor = (status: string) => {
    if (status.includes('On Time')) return 'var(--color-primary-light)';
    if (status.includes('Delayed') || status.includes('Overdue')) return 'var(--color-danger-text)';
    if (status.includes('In Progress')) return '#F59E0B'; // Amber
    return 'var(--color-text-tertiary)';
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('On Time')) return <CheckCircle2 size={16} color="var(--color-primary-light)" />;
    if (status.includes('Delayed') || status.includes('Overdue')) return <AlertCircle size={16} color="var(--color-danger-text)" />;
    if (status.includes('In Progress')) return <Clock size={16} color="#F59E0B" />;
    return <CircleDashed size={16} color="var(--color-text-tertiary)" />;
  };

  const renderReportCard = (title: string, sla: number, compDate: string | undefined, statusObj: any) => {
    return (
      <div className="report-card">
        <h4 className="report-title">{title}</h4>
        <div className="report-details-grid">
          <div className="report-detail">
            <span className="rd-label">Work Start</span>
            <span className="rd-value">{formatDate(selectedProject.dataUpdatedEnexco)}</span>
          </div>
          <div className="report-detail">
            <span className="rd-label">SLA</span>
            <span className="rd-value">{sla} Days</span>
          </div>
          <div className="report-detail">
            <span className="rd-label">Due Date</span>
            <span className="rd-value">{formatDate(statusObj.dueDate)}</span>
          </div>
          <div className="report-detail">
            <span className="rd-label">Completion Date</span>
            <input 
              type="date" 
              className="rd-date-input"
              value={compDate || ''}
              onChange={(e) => handleDateUpdate(
                selectedProject.id, 
                title === 'ROUGHNESS' ? 'roughnessCompleted' : 
                title === 'RUTTING' ? 'ruttingCompleted' : 'pavementEvalCompleted', 
                e.target.value
              )}
            />
          </div>
        </div>
        
        <div className="report-status-banner" style={{ borderLeftColor: getStatusColor(statusObj.status) }}>
          <div className="status-title-row">
            {getStatusIcon(statusObj.status)}
            <span style={{ color: getStatusColor(statusObj.status), fontWeight: 600 }}>{statusObj.status}</span>
          </div>
          {statusObj.delayDays > 0 && (
             <span className="delay-text">Delayed by {statusObj.delayDays} days</span>
          )}
        </div>

        {/* SLA Progress Bar Visual */}
        {selectedProject.dataUpdatedEnexco && (
          <div className="sla-progress-container">
            <div className="sla-labels">
              <span>START</span>
              <span>SLA DEADLINE</span>
            </div>
            <div className="sla-bar-track">
              {(() => {
                if (!statusObj.dueDate) return null;
                const start = new Date(selectedProject.dataUpdatedEnexco!).getTime();
                const due = new Date(statusObj.dueDate).getTime();
                const actual = compDate ? new Date(compDate).getTime() : new Date().getTime();
                
                const totalDuration = due - start;
                const currentDuration = actual - start;
                
                let percent = (currentDuration / totalDuration) * 100;
                let isLate = percent > 100;
                
                return (
                  <>
                    <div 
                      className="sla-bar-fill" 
                      style={{ 
                        width: `${Math.min(percent, 100)}%`, 
                        backgroundColor: compDate ? (isLate ? '#F59E0B' : 'var(--color-primary-light)') : (percent > 100 ? 'var(--color-danger-text)' : '#F59E0B')
                      }} 
                    />
                    {isLate && (
                      <div 
                        className="sla-bar-late" 
                        style={{ 
                          width: `${Math.min(percent - 100, 20)}%`, 
                          backgroundColor: 'var(--color-danger-text)' 
                        }} 
                      />
                    )}
                  </>
                );
              })()}
              <div className="sla-deadline-marker" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container update-section">
      
      {/* Dashboard Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="sc-icon"><MapPin size={20} /></div>
          <div className="sc-content">
            <span className="sc-value">{summary.total}</span>
            <span className="sc-label">Total Projects</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="sc-icon"><CheckCircle size={20} /></div>
          <div className="sc-content">
            <span className="sc-value">{summary.completed}</span>
            <span className="sc-label">Reports Completed</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="sc-icon"><Activity size={20} /></div>
          <div className="sc-content">
            <span className="sc-value">{summary.inProgress}</span>
            <span className="sc-label">In Progress</span>
          </div>
        </div>
        <div className="summary-card" style={{ borderBottom: '3px solid var(--color-primary-light)' }}>
          <div className="sc-icon"><ListChecks size={20} /></div>
          <div className="sc-content">
            <span className="sc-value">{summary.onTime}</span>
            <span className="sc-label">Completed On Time</span>
          </div>
        </div>
        <div className="summary-card" style={{ borderBottom: '3px solid var(--color-danger-text)' }}>
          <div className="sc-icon"><AlertCircle size={20} /></div>
          <div className="sc-content">
            <span className="sc-value">{summary.delayed + summary.overdue}</span>
            <span className="sc-label">Delayed / Overdue</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-heading">Project Detailed View</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '300px' }}>
            <CustomDropdown 
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              options={projects.map(p => ({ value: p.id, label: p.projectName }))}
            />
          </div>
          <button onClick={handleExport} className="export-btn">
            <Download size={18} />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Project Header */}
      <div className="project-header-card">
        <div className="ph-title-row">
          <Route size={24} color="var(--color-primary)" />
          <h3>PROJECT: {selectedProject.projectName}</h3>
        </div>
        <div className="ph-stats">
          <div className="ph-stat">
            <span className="phs-label">Chainage</span>
            <span className="phs-value">{selectedProject.chainageStart.toFixed(3)} km → {selectedProject.chainageEnd.toFixed(3)} km</span>
          </div>
          <div className="ph-stat">
            <span className="phs-label">Total Length</span>
            <span className="phs-value">{totalLength} km</span>
          </div>
          <div className="ph-stat">
            <span className="phs-label">No. of Lanes</span>
            <span className="phs-value">{selectedProject.lanes}</span>
          </div>
          <div className="ph-stat">
            <span className="phs-label">Total Lane Length</span>
            <span className="phs-value">{totalLaneLength} km</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="highway-timeline-card">
        <h4 className="timeline-title">Processing Timeline</h4>
        <div className="highway-timeline">
          {[
            { label: 'Survey Starting', date: selectedProject.surveyStarting },
            { label: 'Survey Ending', date: selectedProject.surveyEnding },
            { label: 'Data Received', date: selectedProject.dataReceived },
            { label: 'E-NEXCO Updated', date: selectedProject.dataUpdatedEnexco },
            { label: 'Roughness', date: selectedProject.roughnessCompleted, status: roughnessStatus },
            { label: 'Rutting', date: selectedProject.ruttingCompleted, status: ruttingStatus },
            { label: 'Pavement Eval.', date: selectedProject.pavementEvalCompleted, status: pavementStatus }
          ].map((node, i) => (
            <div key={i} className="timeline-node" style={{ color: node.date ? (node.status ? getStatusColor(node.status.status) : 'var(--color-primary)') : 'var(--color-text-tertiary)' }}>
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

      {/* Report Cards */}
      <div className="reports-grid">
        {renderReportCard('ROUGHNESS', SLAs.Roughness, selectedProject.roughnessCompleted, roughnessStatus)}
        {renderReportCard('RUTTING', SLAs.Rutting, selectedProject.ruttingCompleted, ruttingStatus)}
        {renderReportCard('PAVEMENT EVALUATION', SLAs.PavementEval, selectedProject.pavementEvalCompleted, pavementStatus)}
      </div>

      {/* Project Wise Status Table */}
      <div className="table-section" style={{ marginTop: '2rem' }}>
        <div className="table-header">
          <h3 className="table-title">Project-Wise Status Overview</h3>
        </div>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Chainage</th>
                <th>E-NEXCO Updated</th>
                <th>Roughness</th>
                <th>Rutting</th>
                <th>Pavement Eval</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const r1 = getReportStatus(p.dataUpdatedEnexco, p.roughnessCompleted, SLAs.Roughness);
                const r2 = getReportStatus(p.dataUpdatedEnexco, p.ruttingCompleted, SLAs.Rutting);
                const r3 = getReportStatus(p.dataUpdatedEnexco, p.pavementEvalCompleted, SLAs.PavementEval);
                
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.projectName}</td>
                    <td>{p.chainageStart.toFixed(3)} - {p.chainageEnd.toFixed(3)}</td>
                    <td>{formatDate(p.dataUpdatedEnexco)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span>{formatDate(p.roughnessCompleted)}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: getStatusColor(r1.status) }}>{r1.status}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span>{formatDate(p.ruttingCompleted)}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: getStatusColor(r2.status) }}>{r2.status}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span>{formatDate(p.pavementEvalCompleted)}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: getStatusColor(r3.status) }}>{r3.status}</span>
                      </div>
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
