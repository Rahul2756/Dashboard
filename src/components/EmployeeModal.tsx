import React from 'react';
import { X, Calendar, Briefcase, Activity } from 'lucide-react';
import { Employee, AvailableDate } from '../types';
import { clsx } from 'clsx';

interface EmployeeModalProps {
  employeeName: string;
  allDataByDate: Record<number, Employee[]>;
  availableDates: AvailableDate[];
  onClose: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employeeName,
  allDataByDate,
  availableDates,
  onClose
}) => {
  // Extract this employee's data across all dates
  const timelineData = availableDates.map(date => {
    const dailyRecords = allDataByDate[date.colIdx] || [];
    const empRecord = dailyRecords.find(e => e.name === employeeName);
    return {
      date: date.label,
      status: empRecord ? empRecord.status : 'Unknown',
      workType: empRecord ? empRecord.workType : 'None',
      raw: empRecord ? empRecord.rawDailyValue : ''
    };
  });

  // Calculate some stats for the month
  const totalDays = timelineData.length;
  const presentDays = timelineData.filter(d => d.status === 'Present').length;
  const absentDays = timelineData.filter(d => d.status === 'Absent').length;
  const holidayDays = timelineData.filter(d => d.status === 'Holiday').length;

  const workStats = timelineData.reduce((acc, day) => {
    if (day.status === 'Present' && day.workType && day.workType !== 'Unknown' && day.workType !== 'None') {
      acc[day.workType] = (acc[day.workType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">{employeeName}</h2>
            <span className="modal-subtitle">Monthly Overview</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar for Stats */}
          <div style={{ flex: '0 0 320px', backgroundColor: '#F8FAFC', borderRight: '1px solid var(--color-border-light)', overflowY: 'auto', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <div className="modal-stat-card" style={{ padding: '0.875rem 1rem' }}>
                <div className="modal-stat-icon" style={{ backgroundColor: 'var(--color-primary-faint)', color: 'var(--color-primary)', width: '32px', height: '32px' }}>
                  <Calendar size={16} />
                </div>
                <div className="modal-stat-content">
                  <span className="modal-stat-value" style={{ fontSize: '1rem' }}>{presentDays}/{totalDays}</span>
                  <span className="modal-stat-label">Days Present</span>
                </div>
              </div>
              <div className="modal-stat-card" style={{ padding: '0.875rem 1rem' }}>
                <div className="modal-stat-icon" style={{ backgroundColor: 'var(--color-danger-subtle)', color: 'var(--color-danger-text)', width: '32px', height: '32px' }}>
                  <Activity size={16} />
                </div>
                <div className="modal-stat-content">
                  <span className="modal-stat-value" style={{ fontSize: '1rem' }}>{absentDays}</span>
                  <span className="modal-stat-label">Days Absent</span>
                </div>
              </div>
              <div className="modal-stat-card" style={{ padding: '0.875rem 1rem' }}>
                <div className="modal-stat-icon" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)', width: '32px', height: '32px' }}>
                  <Briefcase size={16} />
                </div>
                <div className="modal-stat-content">
                  <span className="modal-stat-value" style={{ fontSize: '1rem' }}>{holidayDays}</span>
                  <span className="modal-stat-label">Holidays</span>
                </div>
              </div>
            </div>

            {Object.keys(workStats).length > 0 && (
              <>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Distribution</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(workStats).map(([work, days]) => (
                    <div className="modal-stat-card" key={work} style={{ borderLeft: '3px solid #0284C7', padding: '0.875rem 1rem' }}>
                      <div className="modal-stat-icon" style={{ backgroundColor: '#E0F2FE', color: '#0284C7', width: '32px', height: '32px' }}>
                        <Briefcase size={16} />
                      </div>
                      <div className="modal-stat-content">
                        <span className="modal-stat-value" style={{ fontSize: '1rem' }}>{days} {days === 1 ? 'Day' : 'Days'}</span>
                        <span className="modal-stat-label" style={{ fontWeight: 600, color: '#334155' }}>{work}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Main Timeline Area */}
          <div className="modal-timeline-container" style={{ padding: '2rem' }}>
            <h3 className="modal-section-title">Detailed Timeline</h3>
            <div className="modal-timeline">
              {timelineData.map((day, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-date">{day.date}</div>
                  <div className="timeline-details">
                    <span className={clsx('status-pill', {
                      'status-present': day.status === 'Present',
                      'status-absent': day.status === 'Absent',
                      'status-holiday': day.status === 'Holiday',
                      'status-unknown': day.status === 'Unknown'
                    })}>
                      {day.status}
                    </span>
                    {day.workType && day.workType !== 'Unknown' && day.workType !== 'None' && (
                      <span className="timeline-work-type">{day.workType}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
