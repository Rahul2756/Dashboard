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
        
        <div className="modal-stats-grid">
          <div className="modal-stat-card">
            <div className="modal-stat-icon" style={{ backgroundColor: 'var(--color-primary-faint)', color: 'var(--color-primary)' }}>
              <Calendar size={18} />
            </div>
            <div className="modal-stat-content">
              <span className="modal-stat-value">{presentDays}/{totalDays}</span>
              <span className="modal-stat-label">Days Present</span>
            </div>
          </div>
          <div className="modal-stat-card">
            <div className="modal-stat-icon" style={{ backgroundColor: 'var(--color-danger-subtle)', color: 'var(--color-danger-text)' }}>
              <Activity size={18} />
            </div>
            <div className="modal-stat-content">
              <span className="modal-stat-value">{absentDays}</span>
              <span className="modal-stat-label">Days Absent</span>
            </div>
          </div>
          <div className="modal-stat-card">
            <div className="modal-stat-icon" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}>
              <Briefcase size={18} />
            </div>
            <div className="modal-stat-content">
              <span className="modal-stat-value">{holidayDays}</span>
              <span className="modal-stat-label">Holidays</span>
            </div>
          </div>
        </div>

        <div className="modal-timeline-container">
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
  );
};
