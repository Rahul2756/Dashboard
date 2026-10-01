import React, { useState, useEffect, useMemo } from 'react';
import { Monitor, Armchair, Users, UserMinus } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { WorkTypeChart } from '../components/WorkTypeChart';
import { SystemUtilizationChart } from '../components/SystemUtilizationChart';
import { FilterBar } from '../components/FilterBar';
import { AllocationTable } from '../components/AllocationTable';
import { calculateMetrics, getWorkTypeDistribution } from '../utils/calculations';
import { loadExcelData } from '../services/excelParser';
import { Employee } from '../types';
import { CONFIG } from '../config';
import { TeamBifurcationCard } from '../components/TeamBifurcationCard';
import { CustomDropdown } from '../components/CustomDropdown';

export const DataProcessing: React.FC = () => {
  const [data, setData] = useState<Employee[]>([]);
  const [totalNames, setTotalNames] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date State
  const [availableDates, setAvailableDates] = useState<{colIdx: number, label: string}[]>([]);
  const [allDataByDate, setAllDataByDate] = useState<Record<number, Employee[]>>({});
  const [selectedDateCol, setSelectedDateCol] = useState<number | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const parsedResult = await loadExcelData();
        setAvailableDates(parsedResult.availableDates || []);
        setAllDataByDate(parsedResult.allDataByDate || {});
        setSelectedDateCol(parsedResult.latestDateColIdx);
        setData(parsedResult.employees);
        setTotalNames(parsedResult.totalNamesInExcel);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Unable to load the Excel data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle date change
  useEffect(() => {
    if (selectedDateCol !== null && allDataByDate[selectedDateCol]) {
      setData(allDataByDate[selectedDateCol]);
      setCurrentPage(1); // Reset page on date change
    }
  }, [selectedDateCol, allDataByDate]);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWorkType = workTypeFilter === 'All' || emp.workType === workTypeFilter;
      return matchesSearch && matchesWorkType;
    });
  }, [data, searchTerm, workTypeFilter]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, workTypeFilter]);

  // Paginated Data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Metrics based on overall data (not just filtered)
  const metrics = useMemo(() => calculateMetrics(data, CONFIG.totalSeats, CONFIG.totalSystems), [data]);
  const workTypeData = useMemo(() => getWorkTypeDistribution(data), [data]);
  const workTypes = useMemo(() => {
    const types = new Set(data.map(d => d.workType).filter(t => t));
    return Array.from(types).sort();
  }, [data]);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading latest Excel data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-danger)' }}>
          <h2 style={{ marginBottom: '1rem' }}>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {availableDates.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Date:</span>
            <CustomDropdown 
              value={selectedDateCol || ''} 
              onChange={(value) => setSelectedDateCol(Number(value))}
              options={availableDates.map(d => ({ value: d.colIdx, label: d.label }))}
            />
          </div>
        </div>
      )}

      <div className="kpi-grid">
        <KPICard 
          title="Total Systems" 
          value={metrics.totalSystems} 
          Icon={Monitor} 
        />
        <KPICard 
          title="Total seating capacity" 
          value={metrics.totalSeats} 
          Icon={Armchair} 
        />
        <KPICard 
          title="People Present" 
          value={metrics.peoplePresent} 
          secondaryText={`${Math.round((metrics.peoplePresent / Math.max(1, totalNames)) * 100)}% occupancy`}
          Icon={Users} 
        />
        <KPICard 
          title="People Absent" 
          value={metrics.peopleAbsent} 
          secondaryText={`${Math.round((metrics.peopleAbsent / Math.max(1, totalNames)) * 100)}% absenteeism`}
          Icon={UserMinus} 
        />
      </div>

      <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <TeamBifurcationCard totalTeam={totalNames} />
        <WorkTypeChart data={workTypeData} total={metrics.peoplePresent} />
        <SystemUtilizationChart 
          occupied={metrics.occupiedSystems} 
          vacant={metrics.vacantSystems} 
          total={metrics.totalSystems} 
        />
      </div>

      <FilterBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        workTypeFilter={workTypeFilter}
        setWorkTypeFilter={setWorkTypeFilter}
        workTypes={workTypes}
      />

      {/* We pass filteredData for Excel export so it exports everything that matches the filter, not just the current page */}
      <AllocationTable 
        data={paginatedData}
        allFilteredData={filteredData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
