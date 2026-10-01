import React from 'react';
import { Search } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  workTypeFilter: string;
  setWorkTypeFilter: (filter: string) => void;
  workTypes: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  workTypeFilter,
  setWorkTypeFilter,
  workTypes
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <div className="search-container">
          <Search className="search-icon" size={16} strokeWidth={1.5} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="filter-select"
          value={workTypeFilter}
          onChange={(e) => setWorkTypeFilter(e.target.value)}
        >
          <option value="All">All</option>
          {workTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
