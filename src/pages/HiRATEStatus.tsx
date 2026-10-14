import React, { useState, useEffect, useMemo } from 'react';
import { loadHiRateData, HiRateData, HiRateProject } from '../services/hiRateParser';
import { Search, CheckCircle2, Clock, AlertCircle, AlertTriangle, ChevronDown, ChevronUp, Mail, Users, UserCheck } from 'lucide-react';
import { HiRateProjectDetailedView } from '../components/hirate/HiRateProjectDetailedView';

const percent = (part: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

const ProgressBar = ({ label, count, total, color }: { label: string, count: number, total: number, color: string }) => {
  const p = percent(count, total);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', letterSpacing: '0.02em' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{count} / {total}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{p}%</span>
        </div>
      </div>
      <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${p}%`, backgroundColor: color, borderRadius: '3px' }}></div>
      </div>
    </div>
  );
};

export const HiRATEStatus: React.FC = () => {
  const [data, setData] = useState<HiRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'ho' | 'spvComp' | 'spvPend' | 'finalHo' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [expandedEmail, setExpandedEmail] = useState(false);
  const [expandedSpvMeeting, setExpandedSpvMeeting] = useState(false);
  
  const [tableSearch, setTableSearch] = useState('');
  const [filterOverall, setFilterOverall] = useState('All');

  const fetchData = async () => {
    try {
      setLoading(true);
      const parsed = await loadHiRateData();
      setData(parsed);
      if (parsed.months.length > 0) {
         setSelectedMonth(parsed.months[0]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentMonthProjects = useMemo(() => {
    if (!data) return [];
    return data.projects.filter(p => p.month === selectedMonth);
  }, [data, selectedMonth]);

  const oldDataFormat = useMemo(() => {
    const projects = currentMonthProjects;
    return {
      totalProjects: { count: projects.length, projects },
      hoCompleted: { count: projects.filter(p => p.hoRating === 'Completed').length, projects: projects.filter(p => p.hoRating === 'Completed') },
      spvCompleted: { count: projects.filter(p => p.spvRating === 'Completed').length, projects: projects.filter(p => p.spvRating === 'Completed') },
      spvPending: { count: projects.filter(p => p.spvRating === 'Pending').length, projects: projects.filter(p => p.spvRating === 'Pending') },
      finalHoRating: { count: projects.filter(p => p.finalHo === 'In Review').length, projects: projects.filter(p => p.finalHo === 'In Review') },
    }
  }, [currentMonthProjects]);

  const metrics = useMemo(() => {
    const total = currentMonthProjects.length;
    
    const emailComp = currentMonthProjects.filter(p => p.monthlyEmail === 'Completed').length;
    const emailPend = total - emailComp;
    const emailPendProjects = currentMonthProjects.filter(p => p.monthlyEmail !== 'Completed');
    
    const spvMeetComp = currentMonthProjects.filter(p => p.spvMeeting === 'Completed').length;
    const spvMeetPend = total - spvMeetComp;
    const spvMeetPendProjects = currentMonthProjects.filter(p => p.spvMeeting !== 'Completed');
    
    const spvComp = currentMonthProjects.filter(p => p.spvRating === 'Completed').length;
    const spvPend = currentMonthProjects.filter(p => p.spvRating === 'Pending').length;
    const finalHo = currentMonthProjects.filter(p => p.finalHo === 'In Review').length;
    
    const isRmComp = currentMonthProjects.length > 0 && currentMonthProjects.some(p => p.rmMeeting === 'Completed');

    return {
      total,
      emailComp,
      emailPend,
      emailPendProjects,
      spvMeetComp,
      spvMeetPend,
      spvMeetPendProjects,
      spvComp,
      spvPend,
      finalHo,
      isRmComp
    };
  }, [currentMonthProjects]);

  const filteredTableProjects = useMemo(() => {
    return currentMonthProjects.filter(p => {
      if (tableSearch) {
        const search = tableSearch.toLowerCase();
        if (!p.code.toLowerCase().includes(search) && !p.name.toLowerCase().includes(search)) {
          return false;
        }
      }
      if (filterOverall !== 'All') {
        const overall = (p.monthlyEmail !== 'Completed' || p.spvMeeting !== 'Completed' || p.spvRating !== 'Completed') ? 'Attention Required' : 'On Track';
        if (overall !== filterOverall) return false;
      }
      return true;
    });
  }, [currentMonthProjects, tableSearch, filterOverall]);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <p style={{ color: '#64748B' }}>Loading HiRATE data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  let activeList: HiRateProject[] = [];
  if (activeTab === 'ho') activeList = oldDataFormat.hoCompleted.projects;
  if (activeTab === 'spvComp') activeList = oldDataFormat.spvCompleted.projects;
  if (activeTab === 'spvPend') activeList = oldDataFormat.spvPending.projects;
  if (activeTab === 'finalHo') activeList = oldDataFormat.finalHoRating.projects;

  const filteredList = activeList.filter(p => 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dataMismatchEmail = (metrics.emailComp + metrics.emailPend) !== metrics.total && metrics.total > 0;
  const dataMismatchSpv = (metrics.spvMeetComp + metrics.spvMeetPend) !== metrics.total && metrics.total > 0;

  const renderDonut = () => {
    const ho = oldDataFormat.hoCompleted.count;
    const comp = oldDataFormat.spvCompleted.count;
    const pend = oldDataFormat.spvPending.count;
    const finalHo = oldDataFormat.finalHoRating.count;
    const totalDonut = ho + comp + pend + finalHo;
    if (totalDonut === 0) return null;
  
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    
    const hoPct = ho / totalDonut;
    const compPct = comp / totalDonut;
    const pendPct = pend / totalDonut;
    const finalHoPct = finalHo / totalDonut;
  
    const hoDash = hoPct * circumference;
    const compDash = compPct * circumference;
    const pendDash = pendPct * circumference;
    const finalHoDash = finalHoPct * circumference;
  
    const hoOffset = 0;
    const compOffset = -hoDash;
    const pendOffset = -(hoDash + compDash);
    const finalHoOffset = -(hoDash + compDash + pendDash);
  
    return (
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>
        <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#E5E7EB" strokeWidth="18" />
        {ho > 0 && <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#059669" strokeWidth="18" strokeDasharray={`${hoDash} ${circumference}`} strokeDashoffset={hoOffset} transform="rotate(-90 70 70)" />}
        {comp > 0 && <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#2563EB" strokeWidth="18" strokeDasharray={`${compDash} ${circumference}`} strokeDashoffset={compOffset} transform="rotate(-90 70 70)" />}
        {pend > 0 && <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#EA580C" strokeWidth="18" strokeDasharray={`${pendDash} ${circumference}`} strokeDashoffset={pendOffset} transform="rotate(-90 70 70)" />}
        {finalHo > 0 && <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#475569" strokeWidth="18" strokeDasharray={`${finalHoDash} ${circumference}`} strokeDashoffset={finalHoOffset} transform="rotate(-90 70 70)" />}
        <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="800" fill="#1F2933">{oldDataFormat.totalProjects.count}</text>
        <text x="70" y="86" textAnchor="middle" fontSize="14" fontWeight="600" fill="#667085">Total</text>
      </svg>
    );
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      
      {/* 5 Cards Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Card 1: Total Projects */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1C3D5A 0%, #29527A 100%)', 
          borderRadius: '10px', 
          padding: '1.25rem', 
          position: 'relative', 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          color: 'white',
          minHeight: '160px'
        }}>
          {/* Background road graphic simulation */}
          <div style={{ position: 'absolute', bottom: '0', right: '0', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
            <svg viewBox="0 0 300 200" style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '250px', height: '180px', opacity: 0.15 }}>
              <path d="M-20,200 C60,140 180,60 300,0" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" />
              <path d="M60,220 C120,155 200,75 300,15" fill="none" stroke="white" strokeWidth="6" strokeDasharray="24 16" strokeLinecap="round" />
              <path d="M140,220 C180,165 240,90 300,30" fill="none" stroke="white" strokeWidth="4" strokeDasharray="16 12" strokeLinecap="round" />
              <path d="M220,220 C240,175 270,105 300,45" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22L9 2h6l5 20" />
              <path d="M12 2v20" strokeDasharray="4 4" />
              <path d="M7 14h10" />
            </svg>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.2 }}>HI-RATE</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.9 }}>Highway Asset Rating Program</div>
            </div>
          </div>
          
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', margin: '1rem 0', zIndex: 1 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL PROJECTS</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{oldDataFormat.totalProjects.count}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.9 }}>Projects</span>
            </div>
          </div>
        </div>

        {/* Card 2: HO TEAM */}
        <div 
          onClick={() => { setActiveTab(activeTab === 'ho' ? null : 'ho'); setSearchTerm(''); }}
          style={{ 
            background: 'linear-gradient(180deg, #F0FDF4 0%, #E6F8ED 100%)', 
            border: '1px solid #BEE3CB',
            borderRadius: '10px', 
            padding: '1.25rem', 
            position: 'relative', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: activeTab === 'ho' ? 'translateY(-2px)' : 'none',
            outline: activeTab === 'ho' ? '2px solid #059669' : 'none',
            minHeight: '160px'
          }}
        >
          <div style={{ position: 'absolute', bottom: '0', right: '0', opacity: 0.6 }}>
            <svg viewBox="0 0 100 100" width="120" height="120">
              <path d="M0,100 C30,75 70,60 100,50 L100,100 Z" fill="#BEE3CB" opacity="0.5" />
              <path d="M15,100 C45,78 75,64 100,55" fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.9" />
              <rect x="42" y="45" width="4" height="25" fill="#86CBA0" />
              <rect x="39" y="68" width="10" height="4" fill="#86CBA0" rx="1" />
              <rect x="18" y="18" width="52" height="27" fill="#86CBA0" rx="2" />
              <rect x="21" y="21" width="46" height="21" fill="none" stroke="white" strokeWidth="1.5" rx="1" opacity="0.8" />
              <circle cx="27" cy="28" r="2" fill="white" opacity="0.9" />
              <circle cx="33" cy="28" r="2" fill="white" opacity="0.9" />
              <rect x="39" y="27" width="12" height="2" fill="white" opacity="0.9" />
              <rect x="54" y="27" width="8" height="2" fill="white" opacity="0.9" />
              <rect x="43" y="33" width="8" height="2" fill="white" opacity="0.9" />
            </svg>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
            <div style={{ background: '#059669', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={20} color="#FFFFFF" strokeWidth={3} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669' }}>HO TEAM</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#047857' }}>Rating Completed</div>
            </div>
          </div>
          
          <div style={{ flex: 1 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#059669' }}>{oldDataFormat.hoCompleted.count}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#047857' }}>Projects</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ background: '#10B981', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>Completed</span>
            </div>
          </div>
        </div>

        {/* Card 3: SPV TEAM Completed */}
        <div 
          onClick={() => { setActiveTab(activeTab === 'spvComp' ? null : 'spvComp'); setSearchTerm(''); }}
          style={{ 
            background: 'linear-gradient(180deg, #F0F6FF 0%, #E0F2FE 100%)', 
            border: '1px solid #BFDBFE',
            borderRadius: '10px', 
            padding: '1.25rem', 
            position: 'relative', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: activeTab === 'spvComp' ? 'translateY(-2px)' : 'none',
            outline: activeTab === 'spvComp' ? '2px solid #2563EB' : 'none',
            minHeight: '160px'
          }}
        >
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', opacity: 0.15 }}>
            <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
            <div style={{ background: '#1D4ED8', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1D4ED8' }}>SPV TEAM</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#1E40AF' }}>Rating Completed</div>
            </div>
          </div>
          
          <div style={{ flex: 1 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#1D4ED8' }}>{oldDataFormat.spvCompleted.count}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E40AF' }}>Projects</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ background: '#3B82F6', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>Completed</span>
            </div>
          </div>
        </div>

        {/* Card 4: SPV TEAM Pending */}
        <div 
          onClick={() => { setActiveTab(activeTab === 'spvPend' ? null : 'spvPend'); setSearchTerm(''); }}
          style={{ 
            background: 'linear-gradient(180deg, #FFF5F1 0%, #FFECE5 100%)', 
            border: '1px solid #FDBA74',
            borderRadius: '10px', 
            padding: '1.25rem', 
            position: 'relative', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: activeTab === 'spvPend' ? 'translateY(-2px)' : 'none',
            outline: activeTab === 'spvPend' ? '2px solid #EA580C' : 'none',
            minHeight: '160px'
          }}
        >
          <div style={{ position: 'absolute', bottom: '10px', right: '15px', opacity: 0.15 }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 22h14"></path>
              <path d="M5 2h14"></path>
              <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
              <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
            </svg>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
            <div style={{ background: '#EA580C', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 22h14"></path>
                <path d="M5 2h14"></path>
                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#C2410C' }}>SPV TEAM</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9A3412' }}>Rating Pending</div>
            </div>
          </div>
          
          <div style={{ flex: 1 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#C2410C' }}>{oldDataFormat.spvPending.count}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9A3412' }}>Projects</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ background: '#F97316', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>Pending</span>
            </div>
          </div>
        </div>

        {/* Card 5: Final HO Rating */}
        <div 
          onClick={() => { setActiveTab(activeTab === 'finalHo' ? null : 'finalHo'); setSearchTerm(''); }}
          style={{ 
            background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)', 
            border: '1px solid #CBD5E1',
            borderRadius: '10px', 
            padding: '1.25rem', 
            position: 'relative', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: activeTab === 'finalHo' ? 'translateY(-2px)' : 'none',
            outline: activeTab === 'finalHo' ? '2px solid #475569' : 'none',
            minHeight: '160px'
          }}
        >
          <div style={{ position: 'absolute', bottom: '10px', right: '15px', opacity: 0.15 }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
            <div style={{ background: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>FINAL HO</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569' }}>Rating Process</div>
            </div>
          </div>
          
          <div style={{ flex: 1 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: '#334155' }}>{oldDataFormat.finalHoRating.count}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Projects</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ background: '#64748B', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>In Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Status Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '180px' }}>
           <div style={{ color: '#1C3D5A' }}>
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M4 22L9 2h6l5 20" />
               <path d="M12 2v20" strokeDasharray="4 4" />
             </svg>
           </div>
           <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1C3D5A' }}>Overall Status</span>
        </div>
        
        <div style={{ flex: 1, borderLeft: '1px solid var(--color-border)', paddingLeft: '2rem' }}>
          <ul style={{ margin: 0, padding: 0, listStyleType: 'none', color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
            <li style={{ position: 'relative', paddingLeft: '1.25rem' }}>
              <span style={{ position: 'absolute', left: 0, top: '0.6rem', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
              HiRATE signboard and highway asset rating has been completed at HO level for all <strong style={{ color: '#059669', fontWeight: 700, fontSize: '1.1rem' }}>{oldDataFormat.hoCompleted.count}</strong> projects.
            </li>
            <li style={{ marginTop: '0.75rem', position: 'relative', paddingLeft: '1.25rem' }}>
              <span style={{ position: 'absolute', left: 0, top: '0.6rem', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
              SPV-level rating has been completed for <strong style={{ color: '#2563EB', fontWeight: 700, fontSize: '1.1rem' }}>{oldDataFormat.spvCompleted.count}</strong> projects, while <strong style={{ color: '#EA580C', fontWeight: 700, fontSize: '1.1rem' }}>{oldDataFormat.spvPending.count}</strong> remain pending.
            </li>
            <li style={{ marginTop: '0.75rem', position: 'relative', paddingLeft: '1.25rem' }}>
              <span style={{ position: 'absolute', left: 0, top: '0.6rem', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#475569' }}></span>
              Final HO Rating process is currently active for <strong style={{ color: '#475569', fontWeight: 700, fontSize: '1.1rem' }}>{oldDataFormat.finalHoRating.count}</strong> projects.
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', minWidth: '350px' }}>
          {renderDonut()}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', width: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#059669' }} /><span style={{ color: '#4B5563', fontWeight: 600 }}>HO Completed</span></div>
              <span style={{ fontWeight: 800, color: '#1F2933' }}>{oldDataFormat.hoCompleted.count} <span style={{ color: '#9CA3AF', fontWeight: 500 }}>(100%)</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', width: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563EB' }} /><span style={{ color: '#4B5563', fontWeight: 600 }}>SPV Completed</span></div>
              <span style={{ fontWeight: 800, color: '#1F2933' }}>{oldDataFormat.spvCompleted.count} <span style={{ color: '#9CA3AF', fontWeight: 500 }}>({Math.round(oldDataFormat.spvCompleted.count / Math.max(1, oldDataFormat.totalProjects.count) * 100)}%)</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', width: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EA580C' }} /><span style={{ color: '#4B5563', fontWeight: 600 }}>SPV Pending</span></div>
              <span style={{ fontWeight: 800, color: '#1F2933' }}>{oldDataFormat.spvPending.count} <span style={{ color: '#9CA3AF', fontWeight: 500 }}>({Math.round(oldDataFormat.spvPending.count / Math.max(1, oldDataFormat.totalProjects.count) * 100)}%)</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', width: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#475569' }} /><span style={{ color: '#4B5563', fontWeight: 600 }}>Final HO</span></div>
              <span style={{ fontWeight: 800, color: '#1F2933' }}>{oldDataFormat.finalHoRating.count} <span style={{ color: '#9CA3AF', fontWeight: 500 }}>({Math.round(oldDataFormat.finalHoRating.count / Math.max(1, oldDataFormat.totalProjects.count) * 100)}%)</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Project List */}
      {activeTab && (
        <div style={{ backgroundColor: 'var(--color-surface, #fff)', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {activeTab === 'ho' && <><CheckCircle2 size={18} color="#059669"/> HO Team Rating Completed</>}
                {activeTab === 'spvComp' && <><CheckCircle2 size={18} color="#2563EB"/> SPV Team Rating Completed</>}
                {activeTab === 'spvPend' && <><Clock size={18} color="#EA580C"/> SPV Team Rating Pending</>}
                {activeTab === 'finalHo' && <><CheckCircle2 size={18} color="#475569"/> Final HO Rating Process</>}
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748B', marginLeft: '0.5rem' }}>({activeList.length} Projects)</span>
              </h3>
              <div className="search-container" style={{ width: '100%', maxWidth: '300px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.35rem 0.75rem' }}>
                <Search size={16} className="search-icon" color="#64748B" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search projects..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }}
                />
              </div>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
             {filteredList.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#64748B' }}>No projects found matching your search.</div>
             ) : (
                filteredList.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                     <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>{(i + 1).toString().padStart(2, '0')}</div>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{p.code}</span>
                       <span style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>{p.name}</span>
                     </div>
                  </div>
                ))
             )}
           </div>
        </div>
      )}

      {/* NEW MODULES: MONTH SELECTOR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
         <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '0.02em' }}>MONTHLY ENGAGEMENT TRACKING</h3>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.25rem 0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>MONTH:</span>
            <select 
              value={selectedMonth} 
              onChange={e => { setSelectedMonth(e.target.value); setExpandedEmail(false); setExpandedSpvMeeting(false); }}
              style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', outline: 'none', cursor: 'pointer' }}
            >
              {data.months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
         </div>
       </div>

       {/* 12. MONTHLY ACTIVITIES LAYOUT */}
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Monthly Email Card */}
          <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
               <Mail size={18} color="#0F172A" />
               <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>MONTHLY EMAIL</span>
             </div>
             
             {dataMismatchEmail && <div style={{ fontSize: '0.75rem', color: '#D97706', backgroundColor: '#FEF3C7', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><AlertTriangle size={14}/> Data mismatch — please verify monthly project records.</div>}
             
             <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
               <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{metrics.emailComp}</span>
               <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>/ {metrics.total} Projects</span>
             </div>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
               <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>{percent(metrics.emailComp, metrics.total)}% Covered</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#DC2626' }}>{metrics.emailPend} Pending</span>
             </div>
             
             <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem', display: 'flex' }}>
               <div style={{ width: `${percent(metrics.emailComp, metrics.total)}%`, backgroundColor: '#059669', height: '100%' }}></div>
               <div style={{ width: `${percent(metrics.emailPend, metrics.total)}%`, backgroundColor: '#DC2626', height: '100%' }}></div>
             </div>
             
             <div style={{ flex: 1 }}></div>
             
             {metrics.emailPend > 0 && (
               <button 
                 onClick={() => setExpandedEmail(!expandedEmail)}
                 style={{ width: '100%', padding: '0.75rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', color: '#334155', fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
               >
                 {expandedEmail ? 'Hide Pending Projects' : 'View Pending Projects'} 
                 {expandedEmail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
               </button>
             )}
          </div>

          {/* Monthly SPV Meeting Card */}
          <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
               <Users size={18} color="#0F172A" />
               <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>MONTHLY SPV MEETING</span>
             </div>
             
             {dataMismatchSpv && <div style={{ fontSize: '0.75rem', color: '#D97706', backgroundColor: '#FEF3C7', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><AlertTriangle size={14}/> Data mismatch — please verify monthly project records.</div>}
             
             <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
               <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{metrics.spvMeetComp}</span>
               <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>/ {metrics.total} Projects</span>
             </div>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
               <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>{percent(metrics.spvMeetComp, metrics.total)}% Completed</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#DC2626' }}>{metrics.spvMeetPend} Pending</span>
             </div>
             
             <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem', display: 'flex' }}>
               <div style={{ width: `${percent(metrics.spvMeetComp, metrics.total)}%`, backgroundColor: '#059669', height: '100%' }}></div>
               <div style={{ width: `${percent(metrics.spvMeetPend, metrics.total)}%`, backgroundColor: '#DC2626', height: '100%' }}></div>
             </div>
             
             <div style={{ flex: 1 }}></div>
             
             {metrics.spvMeetPend > 0 && (
               <button 
                 onClick={() => setExpandedSpvMeeting(!expandedSpvMeeting)}
                 style={{ width: '100%', padding: '0.75rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', color: '#334155', fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
               >
                 {expandedSpvMeeting ? 'Hide Pending Projects' : 'View Pending Projects'} 
                 {expandedSpvMeeting ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
               </button>
             )}
          </div>

          {/* Monthly RH Meeting Card */}
          <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
               <UserCheck size={18} color="#0F172A" />
               <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>MONTHLY RH MEETING</span>
             </div>
             
             <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
               <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{metrics.isRmComp ? 1 : 0}</span>
               <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>/ 1</span>
             </div>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
               <span style={{ fontSize: '0.85rem', fontWeight: 700, color: metrics.isRmComp ? '#059669' : '#DC2626' }}>{metrics.isRmComp ? '100% Completed' : '0% Completed'}</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 700, color: metrics.isRmComp ? '#94A3B8' : '#DC2626' }}>{metrics.isRmComp ? '0 Pending' : '1 Pending'}</span>
             </div>
             
             <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem', display: 'flex' }}>
               <div style={{ width: metrics.isRmComp ? '100%' : '0%', backgroundColor: '#059669', height: '100%' }}></div>
               <div style={{ width: metrics.isRmComp ? '0%' : '100%', backgroundColor: '#DC2626', height: '100%' }}></div>
             </div>
             
             <div style={{ flex: 1 }}></div>
             
             <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{ padding: '0.5rem 1.25rem', backgroundColor: metrics.isRmComp ? '#D1FAE5' : '#FEE2E2', color: metrics.isRmComp ? '#059669' : '#DC2626', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  {metrics.isRmComp ? <><CheckCircle2 size={16}/> Completed</> : <><Clock size={16}/> Pending</>}
                </span>
             </div>
          </div>
       </div>

       {/* Expanded Email List */}
       {expandedEmail && metrics.emailPendProjects.length > 0 && (
         <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
           <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '0.02em' }}>
             MONTHLY EMAIL — PENDING PROJECTS <span style={{ fontSize: '0.75rem', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '0.25rem 0.6rem', borderRadius: '12px' }}>{metrics.emailPend} Projects Pending</span>
           </h4>
           <div style={{ overflowX: 'auto' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
               <thead>
                 <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                   <th style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: 700 }}>Project Code</th>
                   <th style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: 700 }}>Project Name</th>
                 </tr>
               </thead>
               <tbody>
                 {metrics.emailPendProjects.map(p => (
                   <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                     <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0F172A' }}>{p.code}</td>
                     <td style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 500 }}>{p.name}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       )}

       {/* Expanded SPV Meeting List */}
       {expandedSpvMeeting && metrics.spvMeetPendProjects.length > 0 && (
         <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
           <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '0.02em' }}>
             MONTHLY SPV MEETING — PENDING PROJECTS <span style={{ fontSize: '0.75rem', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '0.25rem 0.6rem', borderRadius: '12px' }}>{metrics.spvMeetPend} Projects Pending</span>
           </h4>
           <div style={{ overflowX: 'auto' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
               <thead>
                 <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                   <th style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: 700 }}>Project Code</th>
                   <th style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: 700 }}>Project Name</th>
                   <th style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: 700 }}>Meeting Status</th>
                 </tr>
               </thead>
               <tbody>
                 {metrics.spvMeetPendProjects.map(p => (
                   <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                     <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0F172A' }}>{p.code}</td>
                     <td style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 500 }}>{p.name}</td>
                     <td style={{ padding: '0.75rem 1rem' }}>
                       <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>Pending</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       )}

       {/* PROJECT DETAILED VIEW — DAILY RATING ACTIVITY */}
       <HiRateProjectDetailedView projects={currentMonthProjects} defaultProjectCode="GAEPL" />

       {/* 19. PROJECT STATUS TABLE */}
       <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '0.02em' }}>PROJECT-WISE HiRATE STATUS</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.35rem 0.75rem' }}>
                <Search size={16} color="#64748B" />
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  value={tableSearch}
                  onChange={e => setTableSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '180px', color: '#0F172A', fontWeight: 500 }}
                />
              </div>
              <select 
                 value={filterOverall} 
                 onChange={e => setFilterOverall(e.target.value)}
                 style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0.45rem 0.75rem', fontSize: '0.85rem', outline: 'none', color: '#0F172A', fontWeight: 600, cursor: 'pointer' }}
              >
                <option value="All">All Statuses</option>
                <option value="On Track">On Track</option>
                <option value="Attention Required">Attention Required</option>
              </select>
            </div>
         </div>
         <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 700 }}>Project</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 700 }}>HO Rating</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 700 }}>SPV Rating</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 700 }}>Final HO</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 700 }}>Monthly Email</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 700 }}>SPV Meeting</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 700 }}>Overall Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTableProjects.length === 0 ? (
                   <tr>
                     <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: 500 }}>No projects found matching the selected criteria.</td>
                   </tr>
                ) : (
                  filteredTableProjects.map(p => {
                    const overall = (p.monthlyEmail !== 'Completed' || p.spvMeeting !== 'Completed' || p.spvRating !== 'Completed') ? 'Attention Required' : 'On Track';
                    
                    const getBadge = (status: string) => {
                      if (status === 'Completed') return <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}><CheckCircle2 size={16}/> Completed</span>;
                      if (status === 'Pending') return <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}><Clock size={16}/> Pending</span>;
                      if (status === 'In Review') return <span style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}><AlertCircle size={16}/> In Review</span>;
                      return <span style={{ color: '#94A3B8', fontWeight: 700 }}>— Not Started</span>;
                    }
  
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.2rem' }}>{p.code}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{p.name}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>{getBadge(p.hoRating)}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{getBadge(p.spvRating)}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{getBadge(p.finalHo)}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{getBadge(p.monthlyEmail)}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{getBadge(p.spvMeeting)}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                           <span style={{ 
                             padding: '0.35rem 0.75rem', 
                             borderRadius: '20px', 
                             fontSize: '0.75rem', 
                             fontWeight: 800,
                             backgroundColor: overall === 'On Track' ? '#D1FAE5' : '#FEE2E2',
                             color: overall === 'On Track' ? '#059669' : '#DC2626',
                             display: 'inline-block'
                           }}>
                             {overall}
                           </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
         </div>
       </div>

       {/* 21. PROJECT STATUS OVERVIEW */}
       <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 1.25rem 0', letterSpacing: '0.02em' }}>PROJECT STATUS OVERVIEW</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {(() => {
                const onTrack = currentMonthProjects.filter(p => (p.monthlyEmail === 'Completed' && p.spvMeeting === 'Completed' && p.spvRating === 'Completed')).length;
                const attnReq = currentMonthProjects.length - onTrack;
                return (
                  <>
                     <ProgressBar label="ON TRACK" count={onTrack} total={metrics.total} color="#059669" />
                     <ProgressBar label="ATTENTION REQUIRED" count={attnReq} total={metrics.total} color="#DC2626" />
                  </>
                )
             })()}
          </div>
       </div>

       {/* 22. MANAGEMENT ALERT */}
       <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
         <AlertTriangle size={24} color="#D97706" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
         <div>
           <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#92400E', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>MANAGEMENT ATTENTION</h4>
           {(metrics.emailPend === 0 && metrics.spvMeetPend === 0 && metrics.finalHo === 0 && metrics.spvPend === 0) ? (
             <p style={{ margin: 0, fontSize: '0.9rem', color: '#B45309', fontWeight: 500 }}>No immediate management attention required for {selectedMonth}.</p>
           ) : (
             <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#B45309', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>
               {metrics.emailPend > 0 && <li><strong style={{ fontWeight: 800 }}>{metrics.emailPend} projects</strong> are pending for the {selectedMonth} monthly email.</li>}
               {metrics.spvMeetPend > 0 && <li><strong style={{ fontWeight: 800 }}>{metrics.spvMeetPend} projects</strong> are pending for the {selectedMonth} SPV meeting.</li>}
               {metrics.spvPend > 0 && <li><strong style={{ fontWeight: 800 }}>{metrics.spvPend} projects</strong> have SPV-level rating pending.</li>}
               {metrics.finalHo > 0 && <li>Final HO rating is currently in review for <strong style={{ fontWeight: 800 }}>{metrics.finalHo} projects</strong>.</li>}
             </ul>
           )}
         </div>
       </div>

    </div>
  );
};
