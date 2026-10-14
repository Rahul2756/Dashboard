import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TollPlazaTimelineItem } from '../../types/tranac';
import { formatDisplayDate } from '../../services/tranacExcelService';
import * as XLSX from 'xlsx';

interface TranacDetailsTableProps {
  items: TollPlazaTimelineItem[];
  selectedItem: TollPlazaTimelineItem | null;
  onSelectItem: (item: TollPlazaTimelineItem) => void;
}

type SortField =
  | 'srNo'
  | 'tollPlaza'
  | 'project'
  | 'surveyPeriod'
  | 'totalVehicles'
  | 'expectedInflowDate'
  | 'submissionDate'
  | 'dataReceiptStatus'
  | 'inflowDelayDays'
  | 'expectedProcessingDate'
  | 'processingStatus';

export const TranacDetailsTable: React.FC<TranacDetailsTableProps> = ({
  items,
  selectedItem,
  onSelectItem
}) => {
  const [sortField, setSortField] = useState<SortField>('srNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter items by table search
  const filteredItems = useMemo(() => {
    if (!tableSearch.trim()) return items;
    const query = tableSearch.toLowerCase();
    return items.filter(
      (p) =>
        p.tollPlaza.toLowerCase().includes(query) ||
        p.project.toLowerCase().includes(query) ||
        p.dataReceiptStatus.toLowerCase().includes(query) ||
        p.processingStatus.toLowerCase().includes(query) ||
        p.remarks.toLowerCase().includes(query)
    );
  }, [items, tableSearch]);

  // Sort filtered items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (
        sortField === 'expectedInflowDate' ||
        sortField === 'expectedProcessingDate' ||
        sortField === 'submissionDate'
      ) {
        valA = valA ? valA.getTime() : 0;
        valB = valB ? valB.getTime() : 0;
      } else if (sortField === 'inflowDelayDays') {
        valA = valA !== null ? valA : -999;
        valB = valB !== null ? valB : -999;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    if (pageSize >= 100) return sortedItems;
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  // Reset page when filter or page size changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, pageSize]);

  const handleExport = () => {
    const wsData = sortedItems.map((p) => ({
      'Sr. No.': p.srNo,
      'Project Stretch': p.project,
      'Toll Plaza': p.tollPlaza,
      'Survey Period': p.surveyPeriod,
      'Total Vehicles': p.totalVehicles || 'N/A',
      'Expected Data Inflow': formatDisplayDate(p.expectedInflowDate),
      'Actual Submission Date': formatDisplayDate(p.submissionDate || p.receivedDate, 'Not Received'),
      'Data Receipt Status': p.dataReceiptStatus,
      'Inflow Delay': p.inflowDelayText,
      'Expected Processing Deadline': formatDisplayDate(p.expectedProcessingDate),
      'Processing Status': p.processingStatus,
      'Actual Completion Date': 'Not Recorded',
      'Remarks': p.remarks || '-'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'TRaNac_Details');
    XLSX.writeFile(wb, `TRaNac_Toll_Plaza_Details_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} color="#94a3b8" style={{ marginLeft: '4px' }} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={13} color="#0f172a" style={{ marginLeft: '4px' }} />
    ) : (
      <ArrowDown size={13} color="#0f172a" style={{ marginLeft: '4px' }} />
    );
  };

  const startEntry = sortedItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, sortedItems.length);

  return (
    <div className="tranac-table-card">
      {/* Table Header Bar */}
      <div className="tranac-table-header-bar">
        <div>
          <h3 className="tranac-table-title">Toll Plaza Monitoring & Inflow Details</h3>
          <p style={{ fontSize: '0.84375rem', fontWeight: 500, color: '#64748b', marginTop: '3px' }}>
            Source of truth Excel table • Separate Data Receipt & Processing Status • Sortable
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Table quick search */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search in table..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 10px 0 32px',
                fontSize: '0.84375rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                outline: 'none'
              }}
            />
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="tranac-btn tranac-btn-primary"
            title="Export full table records to Excel (.xlsx)"
          >
            <Download size={15} />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Table Scrollable Container */}
      <div className="tranac-table-scroll-container">
        <table className="tranac-data-table">
          <thead>
            <tr>
              <th
                className="sortable"
                onClick={() => handleSort('srNo')}
                style={{ width: '65px', textAlign: 'center' }}
              >
                Sr. No. {renderSortIcon('srNo')}
              </th>
              <th className="sortable" onClick={() => handleSort('tollPlaza')} style={{ minWidth: '190px' }}>
                Toll Plaza & Stretch {renderSortIcon('tollPlaza')}
              </th>
              <th className="sortable" onClick={() => handleSort('surveyPeriod')} style={{ minWidth: '200px' }}>
                Survey Period {renderSortIcon('surveyPeriod')}
              </th>
              <th
                className="sortable"
                onClick={() => handleSort('totalVehicles')}
                style={{ textAlign: 'right', minWidth: '130px' }}
              >
                Total Vehicles {renderSortIcon('totalVehicles')}
              </th>
              <th className="sortable" onClick={() => handleSort('expectedInflowDate')} style={{ minWidth: '150px' }}>
                Expected Inflow {renderSortIcon('expectedInflowDate')}
              </th>
              <th className="sortable" onClick={() => handleSort('submissionDate')} style={{ minWidth: '160px' }}>
                Actual Submission {renderSortIcon('submissionDate')}
              </th>
              <th className="sortable" onClick={() => handleSort('dataReceiptStatus')} style={{ minWidth: '160px' }}>
                Data Status {renderSortIcon('dataReceiptStatus')}
              </th>
              <th className="sortable" onClick={() => handleSort('inflowDelayDays')} style={{ minWidth: '140px' }}>
                Inflow Delay {renderSortIcon('inflowDelayDays')}
              </th>
              <th className="sortable" onClick={() => handleSort('expectedProcessingDate')} style={{ minWidth: '165px' }}>
                Processing Deadline {renderSortIcon('expectedProcessingDate')}
              </th>
              <th className="sortable" onClick={() => handleSort('processingStatus')} style={{ minWidth: '170px' }}>
                Processing Status {renderSortIcon('processingStatus')}
              </th>
              <th style={{ minWidth: '160px' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No toll plazas matched your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedItems.map((plaza) => {
                const isSelected = selectedItem?.id === plaza.id;
                const hasSubmission = plaza.submissionDate !== null || plaza.receivedDate !== null;
                const isDelayed = plaza.inflowDelayDays !== null && plaza.inflowDelayDays > 0;

                return (
                  <tr
                    key={plaza.id}
                    className={isSelected ? 'selected-row' : ''}
                    onClick={() => onSelectItem(plaza)}
                  >
                    {/* 1. Sr. No. */}
                    <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '0.875rem' }}>
                      {plaza.srNo}
                    </td>

                    {/* 2. Toll Plaza & Stretch */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }}>
                          {plaza.tollPlaza}
                        </span>
                        <span style={{ fontSize: '0.78125rem', color: '#475569', fontWeight: 600 }}>
                          {plaza.project}
                        </span>
                      </div>
                    </td>

                    {/* 3. Survey Period */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84375rem' }}>
                          {plaza.surveyPeriod}
                        </span>
                        {plaza.surveyDurationDays > 0 && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                            {plaza.surveyDurationDays} Days Duration
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Total Vehicles */}
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                      {plaza.totalVehicles > 0 ? plaza.totalVehicles.toLocaleString() : 'N/A'}
                    </td>

                    {/* 5. Expected Inflow Date */}
                    <td>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
                        {formatDisplayDate(plaza.expectedInflowDate)}
                      </span>
                    </td>

                    {/* 6. Actual Submission Date */}
                    <td>
                      {hasSubmission ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
                            {formatDisplayDate(plaza.submissionDate || plaza.receivedDate)}
                          </span>
                          {plaza.submittedDaysText && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                              ({plaza.submittedDaysText})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 600 }}>
                          Not Received
                        </span>
                      )}
                    </td>

                    {/* 7. Data Receipt Status (Distinct) */}
                    <td>
                      {plaza.dataReceiptStatus === 'Data Received' ? (
                        <span className="tranac-status-badge status-received">
                          <CheckCircle2 size={13} strokeWidth={2.6} />
                          Data Received
                        </span>
                      ) : plaza.dataReceiptStatus === 'Partially Received' ? (
                        <span className="tranac-status-badge status-partial">
                          <Clock size={13} strokeWidth={2.6} />
                          Partially Received
                        </span>
                      ) : (
                        <span className="tranac-status-badge status-not-received">
                          <AlertCircle size={13} strokeWidth={2.6} />
                          Not Yet Received
                        </span>
                      )}
                    </td>

                    {/* 8. Inflow Delay */}
                    <td>
                      {plaza.dataReceiptStatus === 'Data Received' ? (
                        <span className={`tranac-delay-chip ${isDelayed ? 'delay-delayed' : 'delay-ontime'}`}>
                          {plaza.inflowDelayText}
                        </span>
                      ) : plaza.dataReceiptStatus === 'Partially Received' ? (
                        <span className="tranac-delay-chip delay-partial">
                          {plaza.inflowDelayText}
                        </span>
                      ) : (
                        <span className="tranac-delay-chip delay-overdue">
                          {plaza.inflowDelayText}
                        </span>
                      )}
                    </td>

                    {/* 9. Expected Processing Deadline */}
                    <td>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
                        {formatDisplayDate(plaza.expectedProcessingDate)}
                      </span>
                    </td>

                    {/* 10. Processing Status (Distinct from Receipt) */}
                    <td>
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
                    </td>

                    {/* 11. Remarks */}
                    <td style={{ color: plaza.remarks ? '#0f172a' : '#94a3b8', fontWeight: plaza.remarks ? 600 : 400 }}>
                      {plaza.remarks || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Status Footer */}
      <div className="tranac-pagination-bar">
        <div style={{ fontSize: '0.84375rem', fontWeight: 600, color: '#475569' }}>
          Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of{' '}
          <strong>{sortedItems.length}</strong> toll plazas
        </div>

        <div className="tranac-pagination-controls">
          {/* Rows per page selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginRight: '1rem', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{
                height: '32px',
                padding: '0 6px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={100}>All</option>
            </select>
          </div>

          {/* Page numbers */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="tranac-page-btn"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`tranac-page-btn ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="tranac-page-btn"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
