import React, { useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { TollPlazaTimelineItem, DailyWorkforceRecord } from '../../types/tranac';
import {
  formatDisplayDate,
  DEMO_DAILY_WORKFORCE,
  getDailyWorkforceForPlaza
} from '../../services/tranacExcelService';

interface TranacTimelineVisualProps {
  items: TollPlazaTimelineItem[];
  selectedItem: TollPlazaTimelineItem | null;
  onSelectItem: (item: TollPlazaTimelineItem) => void;
  viewMode: 'stages' | 'gantt';
  dailyWorkforceRecords?: DailyWorkforceRecord[];
}

export const TranacTimelineVisual: React.FC<TranacTimelineVisualProps> = ({
  items,
  selectedItem,
  onSelectItem,
  viewMode,
  dailyWorkforceRecords
}) => {
  // Compute overall min and max dates for Gantt mode
  const { minDate, maxDate, totalCalendarDays } = useMemo(() => {
    let minT = Infinity;
    let maxT = -Infinity;

    items.forEach((item) => {
      const dates = [
        item.surveyStartDate?.getTime(),
        item.surveyEndDate?.getTime(),
        item.expectedInflowDate?.getTime(),
        item.submissionDate?.getTime(),
        item.receivedDate?.getTime(),
        item.expectedProcessingDate?.getTime()
      ].filter((t): t is number => typeof t === 'number' && !isNaN(t));

      dates.forEach((t) => {
        if (t < minT) minT = t;
        if (t > maxT) maxT = t;
      });
    });

    if (minT === Infinity) {
      minT = new Date(Date.UTC(2026, 8, 10)).getTime();
      maxT = new Date(Date.UTC(2026, 9, 15)).getTime();
    } else {
      // Add 2 days padding before and after
      minT -= 2 * 24 * 60 * 60 * 1000;
      maxT += 4 * 24 * 60 * 60 * 1000;
    }

    const totalDays = Math.max(1, Math.round((maxT - minT) / (1000 * 60 * 60 * 24)));
    return { minDate: minT, maxDate: maxT, totalCalendarDays: totalDays };
  }, [items]);

  // Generate calendar day marks for Gantt header
  const calendarTicks = useMemo(() => {
    const ticks: { date: Date; leftPercent: number; label: string; isFirstOfMonth: boolean }[] = [];
    const stepDays = totalCalendarDays > 40 ? 4 : 2;

    for (let dayOffset = 0; dayOffset <= totalCalendarDays; dayOffset += stepDays) {
      const d = new Date(minDate + dayOffset * 24 * 60 * 60 * 1000);
      const leftPercent = (dayOffset / totalCalendarDays) * 100;
      const isFirst = d.getUTCDate() === 1;
      ticks.push({
        date: d,
        leftPercent,
        label: formatDisplayDate(d),
        isFirstOfMonth: isFirst
      });
    }
    return ticks;
  }, [minDate, totalCalendarDays]);

  const getPositionPercent = (date: Date | null): number => {
    if (!date) return 0;
    const diff = date.getTime() - minDate;
    const p = (diff / (maxDate - minDate)) * 100;
    return Math.max(0, Math.min(100, p));
  };

  return (
    <div className="tranac-timeline-section">
      {/* Visual Title Header */}
      <div className="tranac-timeline-header-bar">
        <div className="tranac-timeline-title">
          <Layers size={22} color="#0f172a" strokeWidth={2.3} />
          <span>Toll Plaza Data Inflow & Processing Timeline</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
            Interactive Highway Tracker • Click any row for details
          </span>
        </div>
      </div>

      {/* Main Timeline Scrollable Container */}
      <div className="tranac-timeline-container">
        {viewMode === 'stages' ? (
          /* ===================================================================
             SPACIOUS STAGE-BY-STAGE MILESTONE VIEW
             Generous horizontal spacing so each date and status is clearly distinct
             =================================================================== */
          <div style={{ minWidth: '1360px' }}>
            {/* Stage Columns Header */}
            <div className="tranac-timeline-stage-headers">
              <div className="tranac-stage-col-head col-plaza">
                <span>Toll Plaza & Stretch</span>
              </div>
              <div className="tranac-stage-col-head stage-1">
                <Calendar size={15} />
                <span>Stage 1: TVC Survey</span>
              </div>
              <div className="tranac-stage-col-head stage-2">
                <TrendingUp size={15} />
                <span>Stage 2: Expected Inflow & Actual Receipt</span>
              </div>
              <div className="tranac-stage-col-head stage-3">
                <Clock size={15} />
                <span>Stage 3: Processing Deadline</span>
              </div>
            </div>

            {/* Toll Plaza Rows */}
            {items.map((plaza) => {
              const isSelected = selectedItem?.id === plaza.id;
              const hasActualSubmission = plaza.submissionDate !== null || plaza.receivedDate !== null;
              const isDelayed = plaza.inflowDelayDays !== null && plaza.inflowDelayDays > 0;
              const isOverdue = plaza.processingStatus === 'Processing Overdue';

              return (
                <div
                  key={plaza.id}
                  className={`tranac-timeline-row ${isSelected ? 'selected-row' : ''}`}
                  onClick={() => onSelectItem(plaza)}
                >
                  {/* Column 1: Toll Plaza Info (Sticky Left, High Legibility) */}
                  <div className="tranac-plaza-cell">
                    <div className="tranac-plaza-title">
                      <span>{plaza.tollPlaza}</span>
                      <ChevronRight size={17} color="#94a3b8" />
                    </div>
                    <div className="tranac-project-tag">
                      <span>{plaza.project}</span>
                    </div>
                    <div className="tranac-plaza-meta">
                      <span className="tranac-traffic-badge">
                        {plaza.totalVehicles > 0 ? `${plaza.totalVehicles.toLocaleString()} vehicles` : 'Traffic N/A'}
                      </span>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                        {plaza.tableType}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Stage 1 — TVC Survey */}
                  <div className="tranac-stage1-cell">
                    <div className="tranac-survey-pill">
                      <div className="tranac-survey-dates">
                        <Calendar size={14} color="#0f172a" />
                        <span>
                          {plaza.surveyStartDate && plaza.surveyEndDate ? (
                            `${formatDisplayDate(plaza.surveyStartDate)} to ${formatDisplayDate(plaza.surveyEndDate)}`
                          ) : (
                            plaza.surveyPeriod || 'Survey Dates'
                          )}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '2px' }}>
                      <span className="tranac-survey-days-tag">
                        {plaza.surveyDurationDays > 0 ? `${plaza.surveyDurationDays} Days Duration` : plaza.dataDays || 'TVC Survey'}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
                        • Survey Completed
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Stage 2 — Data Inflow & Receipt (Spacious Connected Track) */}
                  <div className="tranac-stage2-cell">
                    <div className="tranac-inflow-track-wrapper">
                      <div className="tranac-inflow-nodes-row">
                        {/* Connecting Line between Expected and Actual */}
                        <div
                          className={`tranac-inflow-line ${
                            plaza.dataReceiptStatus === 'Data Received'
                              ? isDelayed ? 'line-amber' : 'line-green'
                              : plaza.dataReceiptStatus === 'Partially Received'
                              ? 'line-amber-dashed'
                              : 'line-red-dashed'
                          }`}
                        />

                        {/* Node 1: Expected Inflow Date */}
                        <div className="tranac-timeline-node">
                          <div className="tranac-node-marker node-expected">
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                          </div>
                          <div className="tranac-node-label-group">
                            <span className="tranac-node-date">
                              {plaza.expectedInflowDate ? formatDisplayDate(plaza.expectedInflowDate) : 'Not Specified'}
                            </span>
                            <span className="tranac-node-role">Expected Inflow</span>
                          </div>
                        </div>

                        {/* Delay Status Chip in Center of Track */}
                        <div style={{ zIndex: 3, margin: '0 0.875rem' }}>
                          {plaza.dataReceiptStatus === 'Data Received' ? (
                            <span className={`tranac-delay-chip ${isDelayed ? 'delay-delayed' : 'delay-ontime'}`}>
                              {plaza.inflowDelayText}
                            </span>
                          ) : plaza.dataReceiptStatus === 'Partially Received' ? (
                            <span className="tranac-delay-chip delay-partial">
                              Partial • {plaza.remarks || plaza.submittedDaysText || 'Balance Pending'}
                            </span>
                          ) : (
                            <span className="tranac-delay-chip delay-overdue">
                              {plaza.inflowDelayText}
                            </span>
                          )}
                        </div>

                        {/* Node 2: Actual Submission / Receipt Date & Status Badge */}
                        <div className="tranac-timeline-node" style={{ minWidth: '150px' }}>
                          {plaza.dataReceiptStatus === 'Data Received' ? (
                            <div className="tranac-node-marker node-received">
                              <CheckCircle2 size={18} strokeWidth={2.5} />
                            </div>
                          ) : plaza.dataReceiptStatus === 'Partially Received' ? (
                            <div className="tranac-node-marker node-partial">
                              <Clock size={18} strokeWidth={2.5} />
                            </div>
                          ) : (
                            <div className="tranac-node-marker node-pending">
                              <AlertCircle size={18} strokeWidth={2.5} />
                            </div>
                          )}
                          <div className="tranac-node-label-group">
                            <span className="tranac-node-date">
                              {hasActualSubmission
                                ? formatDisplayDate(plaza.submissionDate || plaza.receivedDate)
                                : 'Not Received'}
                            </span>
                            <div style={{ marginTop: '2px' }}>
                              {plaza.dataReceiptStatus === 'Data Received' ? (
                                <span className="tranac-status-badge status-received" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                  Data Received
                                </span>
                              ) : plaza.dataReceiptStatus === 'Partially Received' ? (
                                <span className="tranac-status-badge status-partial" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                  Partially Received
                                </span>
                              ) : (
                                <span className="tranac-status-badge status-not-received" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                  Not Yet Received
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multiple submissions banner if applicable */}
                      {plaza.additionalSubmissions.length > 0 && (
                        <div style={{ fontSize: '0.78125rem', fontWeight: 600, color: '#0369a1', paddingLeft: '2rem', marginTop: '2px' }}>
                          + Additional batch: {plaza.additionalSubmissions.map(s => `${s.formattedDate} (${s.days})`).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 4: Stage 3 — Processing Stage & Deadline */}
                  <div className="tranac-stage3-cell">
                    <div className="tranac-deadline-marker-row">
                      <div className={`tranac-diamond-marker ${isOverdue ? 'marker-overdue' : ''}`} />
                      <div>
                        <span className="tranac-deadline-date">
                          {plaza.expectedProcessingDate ? formatDisplayDate(plaza.expectedProcessingDate) : 'Not Specified'}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block' }}>
                          Processing Deadline
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                    </div>

                    <span className="tranac-actual-completion-label">
                      Completion: {plaza.actualProcessingCompletionDate ? formatDisplayDate(plaza.actualProcessingCompletionDate) : 'Not Recorded'}
                    </span>

                    {/* Compact Date-wise Workforce Section */}
                    {(() => {
                      const workforceList =
                        plaza.dailyWorkforce && plaza.dailyWorkforce.length > 0
                          ? plaza.dailyWorkforce
                          : getDailyWorkforceForPlaza(dailyWorkforceRecords || DEMO_DAILY_WORKFORCE, plaza.tollPlaza);

                      return (
                        <div className="tranac-daily-workforce-box">
                          <div className="tranac-daily-workforce-title">
                            DAILY WORKFORCE
                          </div>
                          {workforceList.length > 0 ? (
                            <div className="tranac-daily-workforce-list">
                              {workforceList.map((wf, idx) => (
                                <div key={idx} className="tranac-daily-workforce-row">
                                  <span className="tranac-dw-date">
                                    <span className="tranac-dw-icon" aria-hidden="true">📅</span>
                                    <span>{wf.workDate}</span>
                                  </span>
                                  <span className="tranac-dw-members">
                                    <strong>{wf.members} Members</strong>
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="tranac-dw-empty">
                              No daily records logged
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ===================================================================
             CALENDAR GANTT TIME-AXIS VIEW
             =================================================================== */
          <div style={{ minWidth: '1360px' }}>
            {/* Calendar Time Axis Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              <div style={{ padding: '0.875rem 1.35rem', fontWeight: 800, fontSize: '0.8125rem', color: '#1e293b', borderRight: '1px solid #e2e8f0', textTransform: 'uppercase' }}>
                Toll Plaza & Stretch
              </div>
              <div style={{ position: 'relative', height: '42px', overflow: 'hidden' }}>
                {calendarTicks.map((tick, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${tick.leftPercent}%`,
                      top: '0',
                      bottom: '0',
                      borderLeft: '1px solid #cbd5e1',
                      paddingLeft: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tick.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Rows */}
            {items.map((plaza) => {
              const isSelected = selectedItem?.id === plaza.id;
              const surveyStartPercent = getPositionPercent(plaza.surveyStartDate);
              const surveyEndPercent = getPositionPercent(plaza.surveyEndDate);
              const surveyWidth = Math.max(4, surveyEndPercent - surveyStartPercent);

              const expectedInflowPercent = getPositionPercent(plaza.expectedInflowDate);
              const actualSubmissionPercent = plaza.submissionDate || plaza.receivedDate
                ? getPositionPercent(plaza.submissionDate || plaza.receivedDate)
                : null;
              const deadlinePercent = getPositionPercent(plaza.expectedProcessingDate);

              return (
                <div
                  key={plaza.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '300px 1fr',
                    borderBottom: '1px solid #e2e8f0',
                    minHeight: '88px',
                    alignItems: 'center',
                    backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectItem(plaza)}
                >
                  {/* Left Column */}
                  <div className="tranac-plaza-cell" style={{ borderRight: '1px solid #e2e8f0' }}>
                    <div className="tranac-plaza-title">
                      <span>{plaza.tollPlaza}</span>
                    </div>
                    <div className="tranac-project-tag">
                      <span>{plaza.project}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                      {plaza.dataReceiptStatus} • {plaza.inflowDelayText}
                    </div>
                  </div>

                  {/* Gantt Bar Chart Cell */}
                  <div style={{ position: 'relative', height: '100%', minHeight: '88px', display: 'flex', alignItems: 'center' }}>
                    {/* Background Grid Lines */}
                    {calendarTicks.map((tick, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: `${tick.leftPercent}%`,
                          top: 0,
                          bottom: 0,
                          borderLeft: '1px dashed #f1f5f9',
                          pointerEvents: 'none'
                        }}
                      />
                    ))}

                    {/* Stage 1: Survey Span Bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${surveyStartPercent}%`,
                        width: `${surveyWidth}%`,
                        height: '28px',
                        backgroundColor: '#e2e8f0',
                        border: '1px solid #94a3b8',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        zIndex: 2,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      title={`Survey: ${plaza.surveyPeriod}`}
                    >
                      Survey ({plaza.surveyDurationDays}d)
                    </div>

                    {/* Delay connector line from Expected Inflow to Actual Submission */}
                    {actualSubmissionPercent !== null && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${Math.min(expectedInflowPercent, actualSubmissionPercent)}%`,
                          width: `${Math.max(2, Math.abs(actualSubmissionPercent - expectedInflowPercent))}%`,
                          height: '4px',
                          borderRadius: '2px',
                          backgroundColor: plaza.inflowDelayDays && plaza.inflowDelayDays > 0 ? '#f59e0b' : '#10b981',
                          top: 'calc(50% - 2px)',
                          zIndex: 3
                        }}
                      />
                    )}

                    {/* Expected Inflow Marker Dot */}
                    {plaza.expectedInflowDate && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `calc(${expectedInflowPercent}% - 8px)`,
                          top: 'calc(50% - 8px)',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#2563eb',
                          border: '2px solid #ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                          zIndex: 4
                        }}
                        title={`Expected Inflow: ${formatDisplayDate(plaza.expectedInflowDate)}`}
                      />
                    )}

                    {/* Actual Submission Marker Dot */}
                    {actualSubmissionPercent !== null && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `calc(${actualSubmissionPercent}% - 9px)`,
                          top: 'calc(50% - 9px)',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: plaza.dataReceiptStatus === 'Data Received' ? '#10b981' : '#f59e0b',
                          border: '2px solid #ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          zIndex: 5
                        }}
                        title={`Actual Submission: ${formatDisplayDate(plaza.submissionDate || plaza.receivedDate)} (${plaza.inflowDelayText})`}
                      />
                    )}

                    {/* Processing Deadline Marker Diamond */}
                    {plaza.expectedProcessingDate && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `calc(${deadlinePercent}% - 8px)`,
                          top: 'calc(50% - 8px)',
                          width: '16px',
                          height: '16px',
                          backgroundColor: plaza.processingStatus === 'Processing Overdue' ? '#dc2626' : '#4338ca',
                          transform: 'rotate(45deg)',
                          borderRadius: '2px',
                          border: '2px solid #ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          zIndex: 5
                        }}
                        title={`Deadline: ${formatDisplayDate(plaza.expectedProcessingDate)} (${plaza.processingStatus})`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
