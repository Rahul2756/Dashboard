import React from 'react';
import { Users, BarChart2, Map, ClipboardCheck, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  activeSection: number;
  setActiveSection: (index: number) => void;
}

const navItems = [
  { id: 1, label: 'Data Processing Team & Infrastructure', icon: Users },
  { id: 2, label: 'TraNac Update', icon: BarChart2 },
  { id: 3, label: 'E-NEXCO Pavement Analysis Update', icon: Map },
  { id: 4, label: 'HiRATE Status', icon: ClipboardCheck },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <aside className="sidebar">
      <div 
        className="sidebar-header" 
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveSection(0)}
        title="Go to Status of TAR Works Portal Home"
      >
        <img src="/logo_horizontal.png" alt="Cube Tech Logo" className="sidebar-logo-img" style={{ maxHeight: '42px', width: 'auto' }} />
        <h1 className="sidebar-title">Status of TAR Works</h1>
      </div>
      <button 
        type="button" 
        className="sidebar-home-link"
        onClick={() => setActiveSection(0)}
        title="Return to Landing Page"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        <span>Portal Home</span>
      </button>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={clsx('nav-item', { active: activeSection === item.id })}
              onClick={() => setActiveSection(item.id)}
            >
              <Icon className="nav-icon" size={20} strokeWidth={1.5} />
              <span>{item.id}. {item.id === 4 ? item.label : item.label.replace(/^.*?\s/, '')}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
