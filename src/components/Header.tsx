import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, lastUpdated, onRefresh }) => {
  return (
    <header className="page-header">
      <div>
        <h2 className="page-title">{title}</h2>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      <div className="header-actions">
        <span className="last-updated">Last updated: {lastUpdated}</span>
        <button className="btn btn-primary" onClick={onRefresh}>
          <RefreshCw size={14} strokeWidth={1.5} />
          Refresh
        </button>
      </div>
    </header>
  );
};
