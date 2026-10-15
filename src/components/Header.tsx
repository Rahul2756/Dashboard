import React from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  onRefresh: () => void;
  onBackToHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, lastUpdated, onRefresh, onBackToHome }) => {
  return (
    <header className="page-header">
      <div>
        {onBackToHome && (
          <button 
            type="button" 
            className="subpage-home-btn" 
            onClick={onBackToHome}
            title="Return to Status of TAR Works Portal Home"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            <span>Portal Home</span>
          </button>
        )}
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
