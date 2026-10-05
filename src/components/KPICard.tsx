import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  secondaryText?: string;
  Icon: LucideIcon;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, secondaryText, Icon }) => {
  return (
    <div className="summary-card">
      <div className="sc-header">
        <span className="sc-label">{title}</span>
        <div className="sc-icon">
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
      <div>
        <div className="sc-value">{value}</div>
        {secondaryText && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>{secondaryText}</div>}
      </div>
    </div>
  );
};
