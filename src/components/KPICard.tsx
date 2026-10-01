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
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon-wrapper">
          <Icon size={20} strokeWidth={1.5} />
        </div>
        <h3 className="kpi-title">{title}</h3>
      </div>
      <div>
        <div className="kpi-value">{value}</div>
        {secondaryText && <div className="kpi-secondary">{secondaryText}</div>}
      </div>
    </div>
  );
};
