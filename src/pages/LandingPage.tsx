import React from 'react';
import { 
  UsersRound, 
  CarFront, 
  Construction, 
  ClipboardCheck, 
  ArrowRight, 
  Search,
  Bell, 
  HelpCircle,
  User,
  Home,
  LayoutDashboard,
  Route,
  Activity,
  FileCheck
} from 'lucide-react';
import './landing-page.css';

interface LandingPageProps {
  onNavigate: (sectionId: number) => void;
}

interface NavCardItem {
  id: number;
  title: string;
  description: string;
  actionText: string;
  themeClass: string;
  accentColor: string;
  icon: React.ReactNode;
  watermark: React.ReactNode;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const cards: NavCardItem[] = [
    {
      id: 1,
      title: 'Processing Team & Infrastructure',
      description: 'Monitor workforce allocation, infrastructure capacity, attendance, and system utilization.',
      actionText: 'Open Dashboard',
      themeClass: 'theme-blue',
      accentColor: '#2563EB',
      icon: <UsersRound size={26} strokeWidth={2.2} />,
      watermark: (
        <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="8" y="55" width="12" height="25" rx="3" fill="#3B82F6" />
          <rect x="28" y="42" width="12" height="38" rx="3" fill="#3B82F6" />
          <rect x="48" y="28" width="12" height="52" rx="3" fill="#3B82F6" />
          <rect x="68" y="15" width="12" height="65" rx="3" fill="#3B82F6" />
          <rect x="88" y="5" width="12" height="75" rx="3" fill="#3B82F6" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'TraNac Updates',
      description: 'Track project data inflow, processing deadlines, daily workforce, and SLA performance.',
      actionText: 'View TraNac Updates',
      themeClass: 'theme-green',
      accentColor: '#10B981',
      icon: <CarFront size={26} strokeWidth={2.2} />,
      watermark: (
        <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="15" y="8" width="55" height="74" rx="8" stroke="#10B981" strokeWidth="4" />
          <line x1="28" y1="26" x2="57" y2="26" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="28" y1="38" x2="57" y2="38" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="28" y1="50" x2="45" y2="50" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="68" cy="68" r="16" fill="#10B981" />
          <path d="M68 76 V60 M62 66 L68 60 L74 66" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Pavement Analysis Update',
      description: 'Monitor Roughness, Rutting, and Pavement Evaluation progress, completion, and delays.',
      actionText: 'View Analysis',
      themeClass: 'theme-amber',
      accentColor: '#F59E0B',
      icon: <Construction size={26} strokeWidth={2.2} />,
      watermark: (
        <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M10 70 C35 70 30 30 65 30 C95 30 90 60 115 15" stroke="#F59E0B" strokeWidth="5.5" strokeLinecap="round" strokeDasharray="1 8" />
          <path d="M10 70 C35 70 30 30 65 30 C95 30 90 60 115 15" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="38" cy="46" r="6" fill="#F59E0B" />
          <path d="M38 52 L38 60" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="86" cy="38" r="6" fill="#F59E0B" />
          <path d="M86 44 L86 52" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 4,
      title: 'HiRATE — Highway Asset Rating',
      description: 'Track signboard and highway asset ratings, HO and SPV completion, pending projects, and rating progress.',
      actionText: 'Open HiRATE',
      themeClass: 'theme-purple',
      accentColor: '#8B5CF6',
      icon: <ClipboardCheck size={26} strokeWidth={2.2} />,
      watermark: (
        <svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <ellipse cx="40" cy="22" rx="28" ry="11" stroke="#8B5CF6" strokeWidth="3.5" />
          <path d="M12 22 V42 C12 48 24 53 40 53 C56 53 68 48 68 42 V22" stroke="#8B5CF6" strokeWidth="3.5" />
          <path d="M12 42 V62 C12 68 24 73 40 73 C46 73 52 72 57 70" stroke="#8B5CF6" strokeWidth="3.5" />
          <circle cx="76" cy="66" r="14" stroke="#8B5CF6" strokeWidth="4" />
          <circle cx="76" cy="66" r="6" fill="#8B5CF6" />
          <path d="M76 48 V52 M76 80 V84 M58 66 H62 M90 66 H94 M63 53 L66 56 M86 76 L89 79 M63 79 L66 76 M86 53 L89 56" stroke="#8B5CF6" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="landing-page-root">
      {/* 1. Top Dark Navy Navigation Bar */}
      <header className="landing-nav-bar">
        <div className="landing-nav-left">
          {/* Logo Badge */}
          <div className="landing-logo-badge" title="Cube Highways Technologies">
            <img 
              src="/logo_horizontal.png" 
              alt="CUBETECH - Cube Highways Technologies Pvt. Ltd." 
              className="landing-nav-logo-img" 
            />
          </div>
          
          <div className="landing-nav-divider" aria-hidden="true" />
          
          {/* Application Identity */}
          <div className="landing-nav-identity">
            <span className="landing-nav-identity-title">Status of TAR Works</span>
          </div>
        </div>

        {/* Center / Section Links */}
        <nav className="landing-nav-links" aria-label="Portal Navigation">
          <button 
            type="button" 
            className="landing-nav-link active" 
            onClick={() => onNavigate(0)}
          >
            <Home size={15} strokeWidth={2.2} />
            <span>Home</span>
          </button>

          <button 
            type="button" 
            className="landing-nav-link" 
            onClick={() => onNavigate(1)}
          >
            <LayoutDashboard size={15} strokeWidth={2} />
            <span>Dashboard</span>
          </button>

          <button 
            type="button" 
            className="landing-nav-link" 
            onClick={() => onNavigate(2)}
          >
            <Route size={15} strokeWidth={2} />
            <span>TraNac</span>
          </button>

          <button 
            type="button" 
            className="landing-nav-link" 
            onClick={() => onNavigate(3)}
          >
            <Activity size={15} strokeWidth={2} />
            <span>Analysis</span>
          </button>

          <button 
            type="button" 
            className="landing-nav-link" 
            onClick={() => onNavigate(4)}
          >
            <FileCheck size={15} strokeWidth={2} />
            <span>HiRATE</span>
          </button>
        </nav>

        {/* Right Utility Actions */}
        <div className="landing-nav-right">
          <button 
            type="button" 
            className="landing-icon-btn" 
            aria-label="Search portal"
            title="Search"
          >
            <Search size={18} strokeWidth={2} />
          </button>

          <button 
            type="button" 
            className="landing-icon-btn" 
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} strokeWidth={2} />
            <span className="landing-badge-dot" />
          </button>

          <button 
            type="button" 
            className="landing-icon-btn" 
            aria-label="Help & Documentation"
            title="Help"
          >
            <HelpCircle size={18} strokeWidth={2} />
          </button>

          <div className="landing-user-circle" title="User Profile">
            <User size={18} strokeWidth={2.2} />
          </div>
        </div>
      </header>

      {/* 2. Full-Width Golden Hour Highway Hero Section */}
      <div className="landing-hero-viewport">
        {/* Cinematic Highway Background Photo */}
        <div className="landing-golden-highway-bg" aria-hidden="true" />

        {/* Dark Left-to-Right Gradient Overlay for Text Readability */}
        <div className="landing-hero-gradient-overlay" aria-hidden="true" />

        {/* Bottom Flowing Translucent Silver/White Wave Ribbon */}
        <svg 
          className="landing-bottom-waves" 
          viewBox="0 0 1440 380" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="waveSilver1" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.40" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="waveSilver2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="waveBorder" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path 
            d="M -40 220 Q 320 90 720 250 T 1480 280 L 1480 380 L -40 380 Z" 
            fill="url(#waveSilver2)" 
          />
          <path 
            d="M -40 160 Q 360 50 780 230 T 1480 240 L 1480 380 L -40 380 Z" 
            fill="url(#waveSilver1)" 
          />
          <path 
            d="M -40 160 Q 360 50 780 230 T 1480 240" 
            stroke="url(#waveBorder)" 
            strokeWidth="2.5" 
          />
        </svg>

        {/* Hero Content Canvas */}
        <div className="landing-main-canvas">
          {/* Top-Left Hero Title & Description Area */}
          <section className="landing-hero-header">
            {/* Left Decorative Dot Grid */}
            <div className="landing-dot-matrix" aria-hidden="true">
              {Array.from({ length: 32 }).map((_, i) => (
                <span key={i} className="dot" />
              ))}
            </div>

            <div className="landing-hero-text-block">
              <span className="landing-hero-pretitle">WELCOME TO</span>
              <h1 className="landing-hero-maintitle">
                Status of TAR <span className="landing-hero-gold-accent">Works</span>
              </h1>
              <div className="landing-hero-subtitle">
                Highway Engineering Operations &amp; Project Monitoring Portal
              </div>
              <p className="landing-hero-description">
                Monitor workforce, project updates, pavement analysis, and highway asset rating from one centralized workspace.
              </p>
              <div className="landing-hero-gold-bar" aria-hidden="true" />
            </div>
          </section>

          {/* 3. Four Large Frosted Glass Cards (2 × 2 Grid) */}
          <main className="landing-cards-section">
            <div className="landing-cards-2x2-grid">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`landing-portal-card ${card.themeClass}`}
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
                  {/* Subtle Background Watermark on Right */}
                  <div className="landing-card-watermark-bg" aria-hidden="true">
                    {card.watermark}
                  </div>

                  {/* Top: Squircle Icon Badge + Title & Description */}
                  <div className="landing-card-top-row">
                    <div className="landing-card-squircle-icon">
                      {card.icon}
                    </div>
                    <div className="landing-card-headings">
                      <h3 className="landing-card-name">{card.title}</h3>
                      <p className="landing-card-summary">{card.description}</p>
                    </div>
                  </div>

                  {/* Bottom: Action Label + Circular Arrow Button */}
                  <div className="landing-card-bottom-row">
                    <span className="landing-card-action-label">{card.actionText}</span>
                    <div className="landing-card-circle-arrow">
                      <ArrowRight size={17} strokeWidth={2.4} className="landing-arrow-svg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
