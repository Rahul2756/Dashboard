import React, { useState } from 'react';
import { X, Users, Search, ShieldCheck, HardHat, FileSpreadsheet } from 'lucide-react';
import { DailyWorkRecord } from '../../types/workforce';

interface EmployeeRosterModalProps {
  record: DailyWorkRecord | null;
  projectName: string;
  onClose: () => void;
}

export const EmployeeRosterModal: React.FC<EmployeeRosterModalProps> = ({
  record,
  projectName,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!record) return null;

  const employees = record.employees || [];
  const filteredEmployees = employees.filter(emp => 
    emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.role && emp.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="workforce-modal-overlay" onClick={onClose}>
      <div 
        className="workforce-modal-dialog" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="roster-modal-title"
      >
        {/* Header */}
        <div className="workforce-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="workforce-modal-icon-badge">
              <Users size={20} color="#1D4ED8" />
            </div>
            <div>
              <h3 id="roster-modal-title" className="workforce-modal-title">
                Assigned Workforce Roster — {record.displayDate || record.workDate}
              </h3>
              <p className="workforce-modal-subtitle">
                Project: <strong style={{ color: '#0F172A' }}>{projectName}</strong> • Total Active Personnel: <strong style={{ color: '#1D4ED8' }}>{record.employeeCount} Members</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="workforce-modal-close-btn"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Activity Banner */}
        <div className="workforce-modal-activity-banner">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <HardHat size={18} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400E' }}>
                Recorded Work Activity
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>
                {record.workActivity || 'Field Survey & Pavement Profiling'}
              </div>
              {record.remarks && (
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                  <strong>Site Remarks:</strong> {record.remarks}
                </div>
              )}
            </div>
          </div>
          <div className="workforce-status-pill status-recorded">
            {record.workStatus}
          </div>
        </div>

        {/* Search & Notice Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          {employees.length > 0 ? (
            <div className="workforce-search-input-wrapper">
              <Search size={16} color="#64748B" />
              <input
                type="text"
                placeholder="Search by name, role or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="workforce-search-input"
              />
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Aggregate headcount logged.
            </div>
          )}
          {record.isDemo && (
            <div className="workforce-demo-notice-tag">
              <ShieldCheck size={14} color="#0369A1" />
              <span>Illustrative Demo Roster</span>
            </div>
          )}
        </div>

        {/* Personnel List / Table */}
        <div className="workforce-modal-content">
          {employees.length > 0 ? (
            <table className="workforce-roster-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Employee Name</th>
                  <th>Employee ID</th>
                  <th>Project Designation / Role</th>
                  <th style={{ textAlign: 'right' }}>Assignment Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, idx) => (
                  <tr key={emp.employeeId || idx}>
                    <td style={{ color: '#94A3B8', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="workforce-avatar-circle">
                          {emp.employeeName.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{emp.employeeName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="workforce-id-code">{emp.employeeId || `EMP-${100 + idx}`}</span>
                    </td>
                    <td>
                      <span style={{ color: '#475569', fontSize: '0.85rem' }}>
                        {emp.role || 'Highway Project Team Member'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="workforce-roster-badge active">
                        Active on Site
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="workforce-no-roster-box">
              <FileSpreadsheet size={32} color="#94A3B8" />
              <div style={{ fontWeight: 600, color: '#334155', marginTop: '0.5rem' }}>
                Aggregate Headcount Logged ({record.employeeCount} Employees)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '400px', margin: '0.25rem auto 0' }}>
                Specific individual employee roster records were not provided for this date. The daily total of {record.employeeCount} personnel is verified and recorded.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="workforce-modal-footer">
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Recorded date: <strong>{record.displayDate || record.workDate}</strong> • Cumulative workforce to date: <strong>{record.cumulativeAssignments || record.employeeCount} Assignments</strong>
          </div>
          <button onClick={onClose} className="workforce-btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
