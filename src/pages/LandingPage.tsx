import React from 'react';
import { 
  Users, 
  CarFront, 
  ClipboardCheck, 
  ArrowRight, 
  Bell 
} from 'lucide-react';
import './landing-page.css';
import { 
  ProcessingIllustration, 
  ProjectUpdatesIllustration, 
  PavementAnalysisIllustration, 
  HiRateIllustration,
  RoadPerspectiveIcon
} from '../components/landing/LandingIllustrations';

interface LandingPageProps {
  onNavigate: (sectionId: number) => void;
}

interface NavCardItem {
  id: number;
  title: string;
  description: string;
  actionText: string;
  themeClass: string;
  icon: React.ReactNode;
  illustration: React.ReactNode;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const cards: NavCardItem[] = [
    {
      id: 1,
      title: 'Processing Team & Infrastructure',
      description: 'Monitor workforce allocation, infrastructure capacity, attendance, and system utilization.',
      actionText: 'Open Dashboard',
      themeClass: 'theme-green',
      icon: <Users size={24} strokeWidth={2} />,
      illustration: <ProcessingIllustration className="landing-card-illustration" />,
    },
    {
      id: 2,
      title: 'Tranac Updates',
      description: 'Track project data inflow, processing deadlines, daily workforce, and SLA performance.',
      actionText: 'View Tranac Updates',
      themeClass: 'theme-blue',
      icon: <CarFront size={24} strokeWidth={2} />,
      illustration: <ProjectUpdatesIllustration className="landing-card-illustration" />,
    },
    {
      id: 3,
      title: 'Pavement Analysis Update',
      description: 'Monitor Roughness, Rutting, and Pavement Evaluation progress, completion, and delays.',
      actionText: 'View Analysis',
      themeClass: 'theme-amber',
      icon: <RoadPerspectiveIcon size={24} color="#D97706" />,
      illustration: <PavementAnalysisIllustration className="landing-card-illustration" />,
    },
    {
      id: 4,
      title: 'HiRATE — Highway Asset Rating',
      description: 'Track signboard and highway asset ratings, HO and SPV completion, pending projects, and rating progress.',
      actionText: 'Open HiRATE',
      themeClass: 'theme-teal',
      icon: <ClipboardCheck size={24} strokeWidth={2} />,
      illustration: <HiRateIllustration className="landing-card-illustration" />,
    },
  ];

  return (
    <div className="landing-page-root">
      {/* Top Header */}
      <header className="landing-header">
        <div className="landing-header-left">
          <img 
            src="/logo_horizontal.png" 
            alt="CUBETECH - Cube Highways Technologies Pvt. Ltd." 
            className="landing-logo-img" 
          />
        </div>

        <div className="landing-header-right">
          <button 
            type="button" 
            className="landing-bell-btn" 
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={20} strokeWidth={1.8} />
            <span className="landing-bell-dot" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <h1 className="landing-hero-title">Status of TAR Works</h1>
        <h2 className="landing-hero-subtitle">Highway Engineering Operations &amp; Project Monitoring Portal</h2>
        <p className="landing-hero-desc">
          Monitor workforce, project updates, pavement analysis, and highway asset rating from one centralized workspace.
        </p>
      </section>

      {/* 4 Navigation Cards 2x2 Grid */}
      <main className="landing-cards-container">
        <div className="landing-cards-grid">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`landing-nav-card ${card.themeClass}`}
              onClick={() => onNavigate(card.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate(card.id);
                }
              }}
              aria-label={`Open ${card.title}`}
            >
              <div className="landing-card-content">
                <div className="landing-card-icon-badge">
                  {card.icon}
                </div>
                <div>
                  <h3 className="landing-card-title">{card.title}</h3>
                  <p className="landing-card-desc">{card.description}</p>
                </div>
                <div className="landing-card-action">
                  <span>{card.actionText}</span>
                  <ArrowRight size={17} strokeWidth={2.2} className="landing-card-arrow" />
                </div>
              </div>

              {/* Watermark Illustration */}
              {card.illustration}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
