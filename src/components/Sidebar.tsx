import React from 'react';
import { Users, BarChart2, Map, ClipboardCheck, FileText, GraduationCap } from 'lucide-react';
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
  { id: 5, label: 'NTRO Report', icon: FileText },
  { id: 6, label: 'Training Programme L0 Syllabus', icon: GraduationCap },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="Cube Tech Logo" className="sidebar-logo-img" />
        <h1 className="sidebar-title">Status of TAR Works</h1>
      </div>
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
              <span>{item.id}. {item.label.replace(/^.*?\s/, '')}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
