import { Employee, DashboardMetrics, WorkTypeDistribution } from '../types';

export const calculateMetrics = (data: Employee[], totalSeats: number, totalSystems: number): DashboardMetrics => {
  const peoplePresent = data.filter(e => e.status === 'Present').length;
  const peopleAbsent = data.filter(e => e.status === 'Absent').length;
  const peopleOnHoliday = data.filter(e => e.status === 'Holiday').length;
  
  // Assuming 1 person present = 1 occupied seat
  const occupiedSeats = peoplePresent;
  const vacantSeats = totalSeats - occupiedSeats;

  // System Utilization Logic: Exclude Safety, Accounts, R&D Lab, Coding
  const excludedSystemRoles = ['safety', 'accounts', 'r&d lab', 'coding', 'ai'];
  const occupiedSystems = data.filter(e => 
    e.status === 'Present' && 
    e.workType && 
    !excludedSystemRoles.includes(e.workType.toLowerCase())
  ).length;
  const vacantSystems = totalSystems - occupiedSystems;

  return {
    totalSystems,
    totalSeats,
    peoplePresent,
    peopleAbsent,
    peopleOnHoliday,
    vacantSeats,
    occupiedSeats,
    occupiedSystems,
    vacantSystems
  };
};

export const getWorkTypeDistribution = (data: Employee[]): WorkTypeDistribution[] => {
  const presentData = data.filter(e => e.status === 'Present' && e.workType && e.workType !== 'Unknown');
  
  const counts = presentData.reduce((acc, curr) => {
    acc[curr.workType] = (acc[curr.workType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colors: Record<string, string> = {
    'E-NEXCO': '#0ea5e9',
    'HiRATE': '#8b5cf6',
    'TraNac': '#10b981',
    'Coding': '#a855f7',
    'AI': '#a855f7',
    'Accounts': '#f59e0b',
    'Safety Team': '#14b8a6',
    'R&D Lab': '#94a3b8'
  };

  const fallbackColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#6366f1'];

  return Object.entries(counts).map(([name, value], index) => ({
    name,
    value,
    color: colors[name] || fallbackColors[index % fallbackColors.length]
  }));
};
