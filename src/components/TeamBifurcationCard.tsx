import React from 'react';
import { Users } from 'lucide-react';

interface TeamBifurcationCardProps {
  totalTeam: number;
}

export const TeamBifurcationCard: React.FC<TeamBifurcationCardProps> = ({ totalTeam }) => {
  // Fixed bifurcation as requested
  const safetyCount = 3;
  const codingCount = 5;
  const accountsCount = 2;
  const rdCount = 2; // R&D Lab fixed count
  const remainingCount = Math.max(0, totalTeam - safetyCount - codingCount - accountsCount - rdCount);

  return (
    <div className="bifurcation-card">
      <div className="bifurcation-header">
        <div className="bifurcation-icon">
          <Users size={28} strokeWidth={1.5} />
        </div>
        <div className="bifurcation-title-container">
          <div className="bifurcation-title">Total Data Processing Team</div>
          <div className="bifurcation-total">{totalTeam} Nos.</div>
        </div>
      </div>
      
      <div className="bifurcation-rows">
        <div className="bifurcation-row row-safety">
          <span className="row-label">Safety Team</span>
          <span className="row-value">{safetyCount} Nos.</span>
        </div>
        
        <div className="bifurcation-row row-accounts">
          <span className="row-label">Accounts</span>
          <span className="row-value">{accountsCount} Nos.</span>
        </div>
        
        <div className="bifurcation-row row-ai">
          <span className="row-label">AI</span>
          <span className="row-value">{codingCount} Nos.</span>
        </div>
        
        <div className="bifurcation-row row-rd">
          <span className="row-label">R&D Lab</span>
          <span className="row-value">{rdCount} Nos.</span>
        </div>
        
        <div className="bifurcation-row row-main">
          <span className="row-label">E-NEXCO / HIRATE / TraNac</span>
          <span className="row-value">{remainingCount} Nos.</span>
        </div>
      </div>
    </div>
  );
};
