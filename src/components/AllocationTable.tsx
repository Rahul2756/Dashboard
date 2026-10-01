import React from 'react';
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
}

export const AllocationTable: React.FC<AllocationTableProps> = ({
  data,
  allFilteredData,
  currentPage,
  totalPages,
  onPageChange
}) => {
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
        <button className="btn btn-outline" onClick={handleExport}>
          <Download size={14} strokeWidth={1.5} />
          Export to Excel
        </button>
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
                <tr key={row.id || index}>
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
    </div>
  );
};
