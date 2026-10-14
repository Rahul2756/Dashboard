export interface EmployeeAssignment {
  employeeId?: string;
  employeeName: string;
  role?: string;
  shift?: string;
}

export interface DailyWorkRecord {
  id: string;
  projectCode: string; // e.g. 'GAEPL', 'NH-44 Hyderabad-Bangalore'
  workDate: string; // '2026-10-01'
  displayDate?: string; // '01-Oct-2026'
  employeeCount: number;
  workActivity?: string;
  workStatus: 'Work Recorded' | 'Completed' | 'In Progress' | 'Under Review';
  remarks?: string;
  employees?: EmployeeAssignment[];
  cumulativeAssignments?: number;
  isDemo?: boolean;
}

export interface ProjectWorkforceSummary {
  projectCode: string;
  workingDays: number;
  totalAssignments: number;
  averageDailyWorkforce: number;
  firstWorkDate: string | null;
  lastWorkDate: string | null;
  uniqueEmployeesCount: number;
  records: DailyWorkRecord[];
}

export interface ExcelWorkforceRow {
  'Project Code': string;
  'Work Date': string;
  'Employee Name'?: string;
  'Employee ID'?: string;
  'Employee Count'?: number;
  'Work Activity'?: string;
  'Work Status'?: string;
  'Remarks'?: string;
}
