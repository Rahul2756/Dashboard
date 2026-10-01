import React from 'react';
import { Clock } from 'lucide-react';

interface UnderProgressProps {
  title: string;
}

export const UnderProgress: React.FC<UnderProgressProps> = ({ title }) => {
  return (
    <div className="page-container">
      <div className="under-progress">
        <Clock className="under-progress-icon" />
        <h2>{title}</h2>
        <p>Under Progress</p>
        <p style={{ marginTop: '0.5rem', color: 'var(--color-text-tertiary)' }}>
          This section will be updated soon.
        </p>
      </div>
    </div>
  );
};
