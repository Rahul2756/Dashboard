import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export const TranacLegend: React.FC = () => {
  return (
    <div className="tranac-legend-card">
      <span className="tranac-legend-title">Timeline Markers & Status Legend</span>
      <div className="tranac-legend-items-wrap">
        {/* Expected Inflow */}
        <div className="tranac-legend-item">
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563eb', border: '2px solid #93c5fd' }} />
          <span>Expected Data Inflow</span>
        </div>

        {/* Data Received */}
        <div className="tranac-legend-item">
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <CheckCircle2 size={10} strokeWidth={3} />
          </div>
          <span>Actual Data Received (On Time / Delayed)</span>
        </div>

        {/* Partially Received */}
        <div className="tranac-legend-item">
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Clock size={10} strokeWidth={3} />
          </div>
          <span>Partially Received (Pending Balance Days)</span>
        </div>

        {/* Not Yet Received */}
        <div className="tranac-legend-item">
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px dashed #ef4444', backgroundColor: '#fef2f2' }} />
          <span>Data Not Yet Received (Overdue / Pending)</span>
        </div>

        {/* Processing Deadline */}
        <div className="tranac-legend-item">
          <div style={{ width: '12px', height: '12px', backgroundColor: '#4338ca', transform: 'rotate(45deg)', borderRadius: '2px' }} />
          <span>Processing Deadline (◆)</span>
        </div>

        {/* Overdue Deadline */}
        <div className="tranac-legend-item">
          <div style={{ width: '12px', height: '12px', backgroundColor: '#dc2626', transform: 'rotate(45deg)', borderRadius: '2px' }} />
          <span>Processing Overdue (◆ Red)</span>
        </div>

        {/* Survey Period */}
        <div className="tranac-legend-item">
          <div style={{ width: '22px', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '3px', border: '1px solid #cbd5e1' }} />
          <span>Stage 1: TVC Survey Span</span>
        </div>
      </div>
    </div>
  );
};
