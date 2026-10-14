import React, { useEffect } from 'react';
import {
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Copy,
  Check,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { TollPlazaTimelineItem } from '../../types/tranac';
import { formatDisplayDate } from '../../services/tranacExcelService';

interface TranacActionDrawerProps {
  plaza: TollPlazaTimelineItem | null;
  onClose: () => void;
}

export const TranacActionDrawer: React.FC<TranacActionDrawerProps> = ({ plaza, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!plaza) return null;

  const isOverdue = plaza.processingStatus === 'Processing Overdue' || (plaza.dataReceiptStatus === 'Data Not yet Received' && plaza.inflowDelayDays && plaza.inflowDelayDays > 0);
  const isPartial = plaza.dataReceiptStatus === 'Partially Received';

  const handleCopyAction = () => {
    navigator.clipboard.writeText(`${plaza.tollPlaza} (${plaza.project}): ${plaza.actionRequired}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tranac-drawer-backdrop" onClick={onClose}>
      <div className="tranac-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tranac-drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <span className="tranac-traffic-badge">{plaza.tableType}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Sr. No. {plaza.srNo}</span>
            </div>
            <h2 className="tranac-drawer-title">{plaza.tollPlaza}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '4px', color: '#64748b', fontSize: '0.8125rem' }}>
              <MapPin size={14} />
              <span>{plaza.project}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="tranac-drawer-close-btn"
            title="Close panel (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="tranac-drawer-content">
          {/* Highlighted Dynamic Action Callout Banner */}
          <div
            className={`tranac-action-callout ${
              isOverdue ? 'action-urgent' : isPartial ? 'action-warning' : 'action-info'
            }`}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {isOverdue ? (
                <AlertTriangle size={20} />
              ) : isPartial ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                Next Operational Action
              </div>
              <p className="tranac-action-callout-text">{plaza.actionRequired}</p>
            </div>
            <button
              onClick={handleCopyAction}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                opacity: 0.8,
                padding: '4px'
              }}
              title="Copy action to clipboard"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          {/* Survey Stage Details */}
          <div className="tranac-detail-group">
            <span className="tranac-detail-group-title">
              <Calendar size={14} color="#0284c7" />
              Stage 1: TVC Survey Monitoring
            </span>
            <div className="tranac-detail-grid">
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Survey Period</span>
                <span className="tranac-detail-value">{plaza.surveyPeriod}</span>
              </div>
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Total Traffic / Vehicles</span>
                <span className="tranac-detail-value">
                  {plaza.totalVehicles > 0 ? `${plaza.totalVehicles.toLocaleString()} vehicles` : 'Not Specified'}
                </span>
              </div>
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Survey Start Date</span>
                <span className="tranac-detail-value">{formatDisplayDate(plaza.surveyStartDate)}</span>
              </div>
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Survey End Date</span>
                <span className="tranac-detail-value">{formatDisplayDate(plaza.surveyEndDate)}</span>
              </div>
            </div>
          </div>

          {/* Data Inflow Stage Details */}
          <div className="tranac-detail-group">
            <span className="tranac-detail-group-title">
              <TrendingUp size={14} color="#059669" />
              Stage 2: Data Inflow & Receipt Tracking
            </span>
            <div className="tranac-detail-grid">
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Expected Data Inflow</span>
                <span className="tranac-detail-value">{formatDisplayDate(plaza.expectedInflowDate)}</span>
              </div>
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Actual Submission Date</span>
                <span className="tranac-detail-value">
                  {formatDisplayDate(plaza.submissionDate || plaza.receivedDate, 'Not yet received')}
                </span>
              </div>
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Data Receipt Status</span>
                <span className="tranac-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {plaza.dataReceiptStatus === 'Data Received' ? (
                    <span className="tranac-status-badge status-received">Data Received</span>
                  ) : plaza.dataReceiptStatus === 'Partially Received' ? (
                    <span className="tranac-status-badge status-partial">Partially Received</span>
                  ) : (
                    <span className="tranac-status-badge status-not-received">Not Received</span>
                  )}
                </span>
              </div>
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Inflow Delay Status</span>
                <span className="tranac-detail-value">{plaza.inflowDelayText}</span>
              </div>
            </div>

            {/* Additional Submissions if multi-row in Excel */}
            {plaza.additionalSubmissions.length > 0 && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0' }}>
                <span className="tranac-detail-label" style={{ display: 'block', marginBottom: '4px' }}>
                  Logged Submission Batches
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {plaza.submissionDate && (
                    <div style={{ fontSize: '0.8125rem', color: '#1e293b' }}>
                      • Batch 1: {formatDisplayDate(plaza.submissionDate)} ({plaza.submittedDaysText || 'Days'})
                    </div>
                  )}
                  {plaza.additionalSubmissions.map((batch, idx) => (
                    <div key={idx} style={{ fontSize: '0.8125rem', color: '#0369a1' }}>
                      • Batch {idx + 2}: {batch.formattedDate} ({batch.days})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Processing Stage Details */}
          <div className="tranac-detail-group">
            <span className="tranac-detail-group-title">
              <Clock size={14} color="#6366f1" />
              Stage 3: Data Processing & Deadlines
            </span>
            <div className="tranac-detail-grid">
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Processing Deadline</span>
                <span className="tranac-detail-value">{formatDisplayDate(plaza.expectedProcessingDate)}</span>
              </div>
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Deadline Status</span>
                <span className="tranac-detail-value">
                  <span
                    className={`tranac-processing-status-pill ${
                      plaza.processingStatus === 'Processing Overdue'
                        ? 'status-overdue'
                        : plaza.processingStatus === 'Processing Due Soon'
                        ? 'status-due-soon'
                        : plaza.processingStatus === 'On Schedule'
                        ? 'status-on-schedule'
                        : 'status-not-recorded'
                    }`}
                  >
                    {plaza.processingStatus}
                  </span>
                </span>
              </div>
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Processing Completion Date</span>
                <span className="tranac-detail-value" style={{ color: '#64748b' }}>
                  Not Recorded
                </span>
              </div>
              <div className="tranac-detail-item">
                <span className="tranac-detail-label">Survey Days Data</span>
                <span className="tranac-detail-value">{plaza.dataDays || plaza.surveyDurationDays + ' days' || '-'}</span>
              </div>
            </div>

            {/* Scope Days from Sheet4 if matched */}
            {plaza.scopeDays && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0' }}>
                <span className="tranac-detail-label" style={{ display: 'block', marginBottom: '6px' }}>
                  Days Scope Breakdown (Sheet4 Cross-Reference)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
                  <div style={{ background: '#ffffff', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Total</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{plaza.scopeDays.totalScope}d</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#047857' }}>Completed</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#047857' }}>{plaza.scopeDays.completedDays}d</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#0284c7' }}>In Process</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0284c7' }}>{plaza.scopeDays.processDays}d</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#b45309' }}>Balance</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#b45309' }}>{plaza.scopeDays.balanceDays}d</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Remarks Section */}
          <div className="tranac-detail-group">
            <span className="tranac-detail-group-title">Remarks & Site Notes</span>
            <div style={{ fontSize: '0.84375rem', color: plaza.remarks ? '#0f172a' : '#64748b', fontStyle: plaza.remarks ? 'normal' : 'italic' }}>
              {plaza.remarks ? plaza.remarks : 'No additional remarks recorded in Excel.'}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={handleCopyAction} className="tranac-btn tranac-btn-outline">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Summary'}
          </button>
          <button onClick={onClose} className="tranac-btn tranac-btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
