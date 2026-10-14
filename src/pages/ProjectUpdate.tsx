import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, AlertCircle, Clock, CircleDashed,
  Route, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { mockProjects } from '../services/mockProjectData';
import { getReportStatus, formatDate } from '../utils/dateUtils';
import { ProjectRecord } from '../types/project';
import { CustomDropdown } from '../components/CustomDropdown';
import { DailyWorkforceSection } from '../components/project/DailyWorkforceSection';
import { getProjectWorkforce } from '../services/workforceService';

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

    // Also include Daily Workforce records for selected project
    const wfSummary = getProjectWorkforce(selectedProject.projectName);
    if (wfSummary.records.length > 0) {
      const wsWorkforce = XLSX.utils.json_to_sheet(wfSummary.records.map(r => ({
        'Project Code': r.projectCode,
        'Work Date': r.displayDate || r.workDate,
        'Employees Working': r.employeeCount,
        'Work Activity': r.workActivity || '',
        'Work Status': r.workStatus,
        'Cumulative Assignments': r.cumulativeAssignments,
        'Remarks': r.remarks || ''
      })));
      XLSX.utils.book_append_sheet(wb, wsWorkforce, "Daily Workforce");
    }

    XLSX.writeFile(wb, `Project_Updates_${selectedProject.projectName}.xlsx`);
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


  const currentProjectStats = useMemo(() => {
    let completedNames: string[] = [];
    let inProgressNames: string[] = [];
    let delayedNames: string[] = [];
    
    const stats = [
      { name: 'Roughness', obj: roughnessStatus },
      { name: 'Rutting', obj: ruttingStatus },
      { name: 'Pavement Eval', obj: pavementStatus }
    ];
    
    stats.forEach(s => {
      if (s.obj.status === 'Completed On Time' || s.obj.status === 'Delayed') {
        completedNames.push(s.name);
      } else if (s.obj.status === 'In Progress – SLA Overdue') {
        delayedNames.push(s.name);
      } else if (s.obj.status === 'In Progress – Within SLA') {
        inProgressNames.push(s.name);
      }
    });
    
    return { 
      completed: completedNames.length, 
      inProgress: inProgressNames.length, 
      delayed: delayedNames.length, 
      total: 3,
      completedNames,
      inProgressNames,
      delayedNames
    };
  }, [roughnessStatus, ruttingStatus, pavementStatus]);

  const progressPercent = Math.round((currentProjectStats.completed / currentProjectStats.total) * 100);

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
      {/* Project Wise Status Table */}
      <div className="table-section" style={{ marginBottom: '2rem' }}>
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
      


      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
        <h2 className="section-heading" style={{ margin: 0 }}>Project Detailed View</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
          <button onClick={handleExport} className="export-btn" style={{ height: '38px', padding: '0 1rem' }}>
            <Download size={16} /> Export
          </button>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>SELECT PROJECT</span>
            <div style={{ width: '250px' }}>
              <CustomDropdown 
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                options={projects.map(p => ({ value: p.id, label: p.projectName }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="summary-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header Banner */}
        <div style={{ 
          padding: '2rem 1.5rem',
          backgroundImage: 'linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.4)), url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Overall Project Details</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Route size={32} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#ffffff', letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{selectedProject.projectName}</h3>
              {selectedProject.fullProjectName && (
                <p style={{ margin: 0, fontSize: '1rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.25rem', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{selectedProject.fullProjectName}</p>
              )}
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.35rem' }}>
                Chainage: km {selectedProject.chainageStart.toFixed(3)} - {selectedProject.chainageEnd.toFixed(3)} • Length: {totalLength} km ({totalLaneLength} lane-km, {selectedProject.lanes} Lanes)
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--color-bg-primary)' }}>


        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Data Received</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{selectedProject.dataReceived ? formatDate(selectedProject.dataReceived) : 'N/A'}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Data Updated</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{selectedProject.dataUpdatedEnexco ? formatDate(selectedProject.dataUpdatedEnexco) : 'N/A'}</span>
          </div>
          <div 
            style={{ cursor: 'pointer' }} 
            onClick={() => document.getElementById('reports-grid')?.scrollIntoView({ behavior: 'smooth' })}
            title="View details"
          >
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Total Activities</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{currentProjectStats.total}</span>
          </div>
          <div 
            style={{ cursor: 'pointer' }} 
            onClick={() => document.getElementById('reports-grid')?.scrollIntoView({ behavior: 'smooth' })}
            title="View details"
          >
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>On time completed</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-primary-light)' }}>{currentProjectStats.completed}</span>
            {currentProjectStats.completedNames.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>
                {currentProjectStats.completedNames.join(', ')}
              </div>
            )}
          </div>
          <div 
            style={{ cursor: 'pointer' }} 
            onClick={() => document.getElementById('reports-grid')?.scrollIntoView({ behavior: 'smooth' })}
            title="View details"
          >
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>In Progress</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#F59E0B' }}>{currentProjectStats.inProgress}</span>
            {currentProjectStats.inProgressNames.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>
                {currentProjectStats.inProgressNames.join(', ')}
              </div>
            )}
          </div>
          <div 
            style={{ cursor: 'pointer' }} 
            onClick={() => document.getElementById('reports-grid')?.scrollIntoView({ behavior: 'smooth' })}
            title="View details"
          >
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Delayed</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-danger-text)' }}>{currentProjectStats.delayed}</span>
            {currentProjectStats.delayedNames.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>
                {currentProjectStats.delayedNames.join(', ')}
              </div>
            )}
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', width: '100%' }} />

        {/* Progress */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Analysis Progress</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{currentProjectStats.completed} / {currentProjectStats.total} Activities Completed</span>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            {currentProjectStats.completed > 0 && <div style={{ width: `${(currentProjectStats.completed / currentProjectStats.total) * 100}%`, backgroundColor: 'var(--color-primary-light)' }} />}
            {currentProjectStats.inProgress > 0 && <div style={{ width: `${(currentProjectStats.inProgress / currentProjectStats.total) * 100}%`, backgroundColor: '#F59E0B' }} />}
            {currentProjectStats.delayed > 0 && <div style={{ width: `${(currentProjectStats.delayed / currentProjectStats.total) * 100}%`, backgroundColor: 'var(--color-danger-text)' }} />}
          </div>
        </div>
      </div>
      </div>

      {/* Processing Timeline & Daily Workforce Section */}
      <DailyWorkforceSection 
        projectId={selectedProject.id}
        projectName={selectedProject.projectName}
        milestoneNodes={[
          { label: 'Survey Starting', date: selectedProject.surveyStarting },
          { label: 'Survey Ending', date: selectedProject.surveyEnding },
          { label: 'Data Received', date: selectedProject.dataReceived },
          { label: 'E-NEXCO Updated', date: selectedProject.dataUpdatedEnexco },
          { label: 'Roughness', date: selectedProject.roughnessCompleted, status: roughnessStatus },
          { label: 'Rutting', date: selectedProject.ruttingCompleted, status: ruttingStatus },
          { label: 'Pavement Eval.', date: selectedProject.pavementEvalCompleted, status: pavementStatus }
        ]}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
      />

      {/* Report Cards */}
      <div id="reports-grid" className="reports-grid">
        {renderReportCard('ROUGHNESS', SLAs.Roughness, selectedProject.roughnessCompleted, roughnessStatus)}
        {renderReportCard('RUTTING', SLAs.Rutting, selectedProject.ruttingCompleted, ruttingStatus)}
        {renderReportCard('PAVEMENT EVALUATION', SLAs.PavementEval, selectedProject.pavementEvalCompleted, pavementStatus)}
      </div>


    </div>
  );
};
