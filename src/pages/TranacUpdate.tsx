import React, { useState, useEffect, useMemo } from 'react';
import { FileX, Loader2 } from 'lucide-react';
import { TollPlazaTimelineItem, TranacTimelineKPIs } from '../types/tranac';
import { loadTranacTimelineData, formatDisplayDate } from '../services/tranacExcelService';
import { TranacKPISection } from '../components/tranac/TranacKPISection';
import { TranacFilterBar } from '../components/tranac/TranacFilterBar';
import { TranacTimelineVisual } from '../components/tranac/TranacTimelineVisual';
import { TranacLegend } from '../components/tranac/TranacLegend';
import { TranacDetailsTable } from '../components/tranac/TranacDetailsTable';
import { TranacActionDrawer } from '../components/tranac/TranacActionDrawer';
import '../components/tranac/tranac.css';
import * as XLSX from 'xlsx';

interface TranacUpdateProps {
  refreshTrigger?: string;
}

export const TranacUpdate: React.FC<TranacUpdateProps> = ({ refreshTrigger }) => {
  const [items, setItems] = useState<TollPlazaTimelineItem[]>([]);
  const [kpis, setKpis] = useState<TranacTimelineKPIs | null>(null);
  const [projectOptions, setProjectOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedSurveyRange, setSelectedSurveyRange] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'stages' | 'gantt'>('stages');

  // Selected Toll Plaza for Side Panel Drawer
  const [selectedPlaza, setSelectedPlaza] = useState<TollPlazaTimelineItem | null>(null);

  // Load Data
  const fetchData = async (customBuffer?: ArrayBuffer) => {
    try {
      setLoading(true);
      const result = await loadTranacTimelineData(customBuffer);
      setItems(result.items);
      setKpis(result.kpis);
      setProjectOptions(result.projects);
      setError(null);
    } catch (err: any) {
      console.error('Error loading TraNac timeline data:', err);
      setError(err.message || 'Error loading TraNac Excel data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  // Handle User Uploading an Updated Excel File
  const handleUploadExcel = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      await fetchData(buffer);
    } catch (err: any) {
      alert(`Error reading uploaded Excel file: ${err.message}`);
    }
  };

  // Distinct Survey Range Options
  const surveyRangeOptions = useMemo(() => {
    const ranges = Array.from(new Set(items.map((i) => i.surveyPeriod))).filter(Boolean);
    return ranges.sort();
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((plaza) => {
      // 1. Search term (Plaza name, project, remarks)
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = plaza.tollPlaza.toLowerCase().includes(query);
        const matchesProject = plaza.project.toLowerCase().includes(query);
        const matchesRemarks = plaza.remarks.toLowerCase().includes(query);
        if (!matchesName && !matchesProject && !matchesRemarks) return false;
      }

      // 2. Project Stretch filter
      if (selectedProject !== 'All' && plaza.project !== selectedProject) {
        return false;
      }

      // 3. Survey Range filter
      if (selectedSurveyRange !== 'All' && plaza.surveyPeriod !== selectedSurveyRange) {
        return false;
      }

      // 4. Status filter
      if (selectedStatus !== 'All') {
        if (selectedStatus === 'Delayed') {
          const hasInflowDelay = plaza.inflowDelayDays !== null && plaza.inflowDelayDays > 0;
          const isOverdue = plaza.processingStatus === 'Processing Overdue';
          if (!hasInflowDelay && !isOverdue) return false;
        } else if (selectedStatus === 'Processing Overdue') {
          if (plaza.processingStatus !== 'Processing Overdue') return false;
        } else if (plaza.dataReceiptStatus !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchTerm, selectedProject, selectedSurveyRange, selectedStatus]);

  // Recalculate KPIs dynamically for filtered items
  const dynamicKPIs: TranacTimelineKPIs = useMemo(() => {
    if (!kpis) {
      return {
        totalTollPlazas: 0,
        dataReceived: 0,
        partiallyReceived: 0,
        dataNotReceived: 0,
        delayedOrOverdue: 0,
        delayedReceiptCount: 0,
        overdueReceiptCount: 0,
        processingOverdueCount: 0
      };
    }
    // Return base KPIs computed directly from source of truth Excel
    return kpis;
  }, [kpis]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedProject('All');
    setSelectedSurveyRange('All');
    setSelectedStatus('All');
  };

  // Export Full Filtered View to Excel
  const handleExportFullExcel = () => {
    const wsData = filteredItems.map((p) => ({
      'Sr. No.': p.srNo,
      'Project Stretch': p.project,
      'Toll Plaza': p.tollPlaza,
      'Survey Period': p.surveyPeriod,
      'Total Vehicles': p.totalVehicles || 'N/A',
      'Expected Data Inflow': formatDisplayDate(p.expectedInflowDate),
      'Expected Processing Date': formatDisplayDate(p.expectedProcessingDate),
      'Actual Submission Date': formatDisplayDate(p.submissionDate || p.receivedDate, 'Not Received'),
      'Data Status': p.dataReceiptStatus,
      'Inflow Delay': p.inflowDelayText,
      'Processing Status': p.processingStatus,
      'Remarks': p.remarks || '-',
      'Action Required': p.actionRequired
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'TRaNac_Inflow_Tracker');
    XLSX.writeFile(wb, `TRaNac_Inflow_Processing_Timeline_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '420px', gap: '1rem' }}>
        <Loader2 size={36} className="animate-spin" color="#0f172a" />
        <p style={{ color: '#64748b', fontSize: '0.9375rem', fontWeight: 500 }}>
          Parsing TraNac Toll Plaza Excel data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '420px' }}>
        <div style={{ textAlign: 'center', color: '#dc2626', maxWidth: '480px', background: '#ffffff', padding: '2rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
          <FileX size={48} style={{ margin: '0 auto 1rem', color: '#dc2626' }} />
          <h2 style={{ marginBottom: '0.75rem', color: '#0f172a' }}>Excel Parsing Error</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => fetchData()} className="tranac-btn tranac-btn-primary">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container tranac-dashboard-wrapper">
      {/* 1. Page Header Filters Bar */}
      <TranacFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        projectOptions={projectOptions}
        selectedSurveyRange={selectedSurveyRange}
        onSurveyRangeChange={setSelectedSurveyRange}
        surveyRangeOptions={surveyRangeOptions}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={handleResetFilters}
        onUploadExcel={handleUploadExcel}
        onExportExcel={handleExportFullExcel}
        filteredCount={filteredItems.length}
        totalCount={items.length}
      />

      {/* 2. Summary KPI Cards (5 compact cards) */}
      <TranacKPISection
        kpis={dynamicKPIs}
        activeStatusFilter={selectedStatus}
        onSelectFilter={setSelectedStatus}
      />

      {/* 3. Main Visual — Toll Plaza Data Inflow & Processing Timeline */}
      <TranacTimelineVisual
        items={filteredItems}
        selectedItem={selectedPlaza}
        onSelectItem={setSelectedPlaza}
        viewMode={viewMode}
      />

      {/* 4. Status Legend */}
      <TranacLegend />

      {/* 5. Toll Plaza Details Table */}
      <TranacDetailsTable
        items={filteredItems}
        selectedItem={selectedPlaza}
        onSelectItem={setSelectedPlaza}
      />

      {/* 6. Selected Toll Plaza Details / Action Panel Drawer */}
      <TranacActionDrawer
        plaza={selectedPlaza}
        onClose={() => setSelectedPlaza(null)}
      />
    </div>
  );
};
