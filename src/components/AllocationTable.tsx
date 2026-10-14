import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Employee } from '../types';
import * as XLSX from 'xlsx';
import { clsx } from 'clsx';

interface AllocationTableProps {
  data: Employee[];
  allFilteredData: Employee[]; // Add this to export all filtered data instead of just current page
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick?: (employeeName: string) => void;
  availableDates?: {colIdx: number, label: string}[];
  allDataByDate?: Record<number, Employee[]>;
  allData?: Employee[];
  onWorkTypeFilter?: (workType: string) => void;
  activeWorkType?: string;
}

export const AllocationTable: React.FC<AllocationTableProps> = ({
  data,
  allFilteredData,
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
  availableDates,
  allDataByDate,
  allData,
  onWorkTypeFilter,
  activeWorkType
}) => {
  const [showAllDaysModal, setShowAllDaysModal] = useState(false);

  const allWorkTypes = useMemo(() => {
    if (!allDataByDate) return [];
    const types = new Set<string>();
    Object.values(allDataByDate).forEach(dayData => {
      dayData.forEach(emp => {
        if (emp.workType) types.add(emp.workType);
      });
    });
    return Array.from(types).sort();
  }, [allDataByDate]);

  const allDaysOverviewData = useMemo(() => {
    if (!allDataByDate || !availableDates) return [];
    return availableDates.map(dateInfo => {
      const dayData = allDataByDate[dateInfo.colIdx] || [];
      const counts: Record<string, number> = {};
      allWorkTypes.forEach(wt => counts[wt] = 0);
      dayData.forEach(emp => {
        if (emp.workType && counts[emp.workType] !== undefined) {
          counts[emp.workType]++;
        }
      });
      return {
        label: dateInfo.label,
        counts
      };
    });
  }, [allDataByDate, availableDates, allWorkTypes]);
  const handleExport = () => {
    // Export the ALL filtered dataset rather than blindly exporting all records,
    // and not just the current paginated page.
    const exportData = allFilteredData.map(emp => ({
      'S. No': emp.sNo,
      'Name': emp.name,
      'Work Type': emp.workType,
      'Status': emp.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Allocation");
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `TAR_Allocation_${date}.xlsx`);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="table-section">
      <div className="table-header">
        <h3 className="table-title">People and Work Allocation</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {(availableDates && allDataByDate) && (
            <button className="btn btn-outline" onClick={() => setShowAllDaysModal(true)} style={{ color: '#1D4ED8', borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              All Days Overview
            </button>
          )}
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={14} strokeWidth={1.5} />
            Export to Excel
          </button>
        </div>
      </div>
      
      {/* Overview Section */}
      <div 
        style={{ 
           display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem 1.5rem 1.5rem 1.5rem'
        }}
      >
        {useMemo(() => {
          const counts: Record<string, number> = {};
          const sourceData = allData || allFilteredData;
          sourceData.forEach(emp => {
              if (!emp.workType) return;
              counts[emp.workType] = (counts[emp.workType] || 0) + 1;
          });
          return Object.entries(counts).sort((a, b) => b[1] - a[1]);
        }, [allData, allFilteredData]).map(([type, count]) => {
           const isActive = activeWorkType === type;
           return (
             <div 
               key={type} 
               onClick={() => {
                 if (onWorkTypeFilter) {
                   onWorkTypeFilter(isActive ? 'All' : type);
                 }
               }}
               style={{ 
                  backgroundColor: isActive ? '#EFF6FF' : '#F8FAFC', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '8px', 
                  border: `1px solid ${isActive ? '#93C5FD' : '#E2E8F0'}`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  minWidth: '150px',
                  cursor: onWorkTypeFilter ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 1px 3px rgba(37,99,235,0.1)' : 'none'
               }}
               onMouseOver={e => {
                 if (onWorkTypeFilter && !isActive) {
                   e.currentTarget.style.borderColor = '#CBD5E1';
                   e.currentTarget.style.backgroundColor = '#F1F5F9';
                 }
               }}
               onMouseOut={e => {
                 if (onWorkTypeFilter && !isActive) {
                   e.currentTarget.style.borderColor = '#E2E8F0';
                   e.currentTarget.style.backgroundColor = '#F8FAFC';
                 }
               }}
             >
                <div style={{ 
                   backgroundColor: isActive ? '#3B82F6' : 'white', 
                   width: '36px', 
                   height: '36px', 
                   borderRadius: '6px', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center', 
                   color: isActive ? 'white' : '#0F172A', 
                   fontWeight: 800,
                   fontSize: '1.1rem',
                   border: isActive ? 'none' : '1px solid #E2E8F0'
                }}>
                   {count}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isActive ? '#1D4ED8' : '#0F172A', textTransform: 'uppercase' }}>{type}</span>
                   <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isActive ? '#3B82F6' : '#64748B' }}>Allocated</span>
                </div>
             </div>
           );
        })}
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>S. No</th>
              <th>Name</th>
              <th>Work Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr 
                  key={row.id || index} 
                  onClick={() => onRowClick && onRowClick(row.name)}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  <td>{row.sNo}</td>
                  <td>{row.name}</td>
                  <td>{row.workType}</td>
                  <td>
                    <span className={clsx('status-pill', {
                      'status-present': row.status === 'Present',
                      'status-absent': row.status === 'Absent',
                      'status-holiday': row.status === 'Holiday',
                      'status-unknown': row.status === 'Unknown'
                    })}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing Page {currentPage} of {totalPages}
          </div>
          <div className="pagination-controls">
            <button 
              className="page-btn" 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {getPageNumbers().map(page => (
              <button
                key={page}
                className={clsx('page-btn', { active: currentPage === page })}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className="page-btn" 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ALL DAYS OVERVIEW MODAL */}
      {showAllDaysModal && availableDates && allDataByDate && (
        <div 
          onClick={() => setShowAllDaysModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderRadius: '12px', padding: '2rem',
              width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Work Allocation Overview (All Days)</h2>
              <button 
                onClick={() => setShowAllDaysModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="table-container" style={{ margin: 0, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th style={{ backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: 700, textAlign: 'left' }}>Date</th>
                    {allWorkTypes.map(wt => (
                      <th key={wt} style={{ backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: 700, textAlign: 'center' }}>{wt}</th>
                    ))}
                    <th style={{ backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderBottom: '2px solid #E2E8F0', color: '#0F172A', fontWeight: 800, textAlign: 'center' }}>Total Allocated</th>
                  </tr>
                </thead>
                <tbody>
                  {allDaysOverviewData.map(day => {
                    const total = Object.values(day.counts).reduce((a, b) => a + b, 0);
                    return (
                      <tr key={day.label} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0F172A' }}>{day.label}</td>
                        {allWorkTypes.map(wt => (
                          <td key={wt} style={{ padding: '0.75rem 1rem', textAlign: 'center', color: day.counts[wt] > 0 ? '#334155' : '#94A3B8', fontWeight: day.counts[wt] > 0 ? 600 : 400 }}>
                            {day.counts[wt] > 0 ? day.counts[wt] : '-'}
                          </td>
                        ))}
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 800, color: '#0F172A' }}>{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
