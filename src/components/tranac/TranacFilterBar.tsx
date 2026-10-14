import React, { useRef } from 'react';
import { Search, RotateCcw, Upload, Download, Layers, BarChart3 } from 'lucide-react';

interface TranacFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
  projectOptions: string[];
  selectedSurveyRange: string;
  onSurveyRangeChange: (range: string) => void;
  surveyRangeOptions: string[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  viewMode: 'stages' | 'gantt';
  onViewModeChange: (mode: 'stages' | 'gantt') => void;
  onResetFilters: () => void;
  onUploadExcel: (file: File) => void;
  onExportExcel: () => void;
  filteredCount: number;
  totalCount: number;
}

export const TranacFilterBar: React.FC<TranacFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedProject,
  onProjectChange,
  projectOptions,
  selectedSurveyRange,
  onSurveyRangeChange,
  surveyRangeOptions,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  onUploadExcel,
  onExportExcel,
  filteredCount,
  totalCount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadExcel(e.target.files[0]);
    }
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedProject !== 'All' ||
    selectedSurveyRange !== 'All' ||
    selectedStatus !== 'All';

  return (
    <div className="tranac-filter-card">
      <div className="tranac-filter-row">
        {/* Left Inputs */}
        <div className="tranac-filter-inputs">
          {/* Search */}
          <div className="tranac-search-input-wrap">
            <Search size={16} className="tranac-search-icon" />
            <input
              type="text"
              placeholder="Search toll plaza, project or remarks..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="tranac-search-input"
            />
          </div>

          {/* Project Stretch Filter */}
          <select
            value={selectedProject}
            onChange={(e) => onProjectChange(e.target.value)}
            className="tranac-select-filter"
            title="Filter by Project Stretch"
          >
            <option value="All">All Highway Projects ({projectOptions.length})</option>
            {projectOptions.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>

          {/* Survey Date Range Filter */}
          <select
            value={selectedSurveyRange}
            onChange={(e) => onSurveyRangeChange(e.target.value)}
            className="tranac-select-filter"
            title="Filter by Survey Date Range"
          >
            <option value="All">All Survey Periods</option>
            {surveyRangeOptions.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="tranac-select-filter"
            title="Filter by Data Inflow Status"
          >
            <option value="All">All Statuses</option>
            <option value="Data Received">Data Received</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Data Not yet Received">Data Not yet Received</option>
            <option value="Delayed">Delayed / Overdue Inflow</option>
            <option value="Processing Overdue">Processing Deadline Overdue</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="tranac-btn tranac-btn-subtle"
              title="Clear all active filters"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>

        {/* Right Actions: View Toggle, Upload, Export */}
        <div className="tranac-subbar-right">
          {/* View Mode Toggle */}
          <div className="tranac-view-toggle">
            <button
              className={`tranac-view-toggle-btn ${viewMode === 'stages' ? 'active' : ''}`}
              onClick={() => onViewModeChange('stages')}
              title="Milestone Stage Flow View"
            >
              <Layers size={14} />
              Milestones
            </button>
            <button
              className={`tranac-view-toggle-btn ${viewMode === 'gantt' ? 'active' : ''}`}
              onClick={() => onViewModeChange('gantt')}
              title="Calendar Gantt Timeline View"
            >
              <BarChart3 size={14} />
              Gantt View
            </button>
          </div>

          {/* Hidden File Input for Excel Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
          />

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="tranac-btn tranac-btn-outline"
            title="Upload updated TraNac Excel sheet"
          >
            <Upload size={14} />
            Upload Excel
          </button>

          {/* Export Button */}
          <button
            onClick={onExportExcel}
            className="tranac-btn tranac-btn-outline"
            title="Export filtered data to Excel"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Showing count indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78125rem', color: '#64748b' }}>
        <span>
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> toll plazas
        </span>
        {hasActiveFilters && (
          <span style={{ color: '#0369a1', fontWeight: 600 }}>Filtered view active</span>
        )}
      </div>
    </div>
  );
};
