import * as XLSX from 'xlsx';
import { DailyWorkRecord, ProjectWorkforceSummary } from '../types/workforce';
import { formatDate } from '../utils/dateUtils';

// Illustrative demo workforce data for GAEPL (as requested in prompt section 2)
const GAEPL_RECORDS: DailyWorkRecord[] = [
  {
    id: 'gaepl-rec-1',
    projectCode: 'GAEPL',
    workDate: '2026-10-01',
    displayDate: '01-Oct-2026',
    employeeCount: 15,
    workActivity: 'Pavement Surface Roughness Profiling & Laser Scanning',
    workStatus: 'Work Recorded',
    remarks: 'Chainage km 23.600 - 55.000 completed; laser calibration normal',
    isDemo: true,
    employees: [
      { employeeId: 'EMP-101', employeeName: 'Rajesh Kumar', role: 'Lead Highway Profiler' },
      { employeeId: 'EMP-102', employeeName: 'Anita Sharma', role: 'GIS & Mapping Specialist' },
      { employeeId: 'EMP-103', employeeName: 'Vikram Singh', role: 'Laser Sensor Technician' },
      { employeeId: 'EMP-104', employeeName: 'Pooja Patel', role: 'Data Processing Analyst' },
      { employeeId: 'EMP-105', employeeName: 'Suresh Nair', role: 'Field Data Quality Inspector' },
      { employeeId: 'EMP-106', employeeName: 'Amit Verma', role: 'Roughness Analysis Engineer' },
      { employeeId: 'EMP-107', employeeName: 'Deepak Joshi', role: 'Pavement Condition Surveyor' },
      { employeeId: 'EMP-108', employeeName: 'Ritu Mehra', role: 'Geometric Alignment Specialist' },
      { employeeId: 'EMP-109', employeeName: 'Manoj Tiwari', role: 'Field Safety Officer' },
      { employeeId: 'EMP-110', employeeName: 'Kavita Rao', role: 'Data Validation Analyst' },
      { employeeId: 'EMP-111', employeeName: 'Sandeep Rawat', role: 'Senior Highway Engineer' },
      { employeeId: 'EMP-112', employeeName: 'Arun Gupta', role: 'Profilometer Operator' },
      { employeeId: 'EMP-113', employeeName: 'Neha Saxena', role: 'CAD & Cross-Section Draftsman' },
      { employeeId: 'EMP-114', employeeName: 'Pankaj Yadav', role: 'GPS Base Station Tech' },
      { employeeId: 'EMP-115', employeeName: 'Sunil Dutt', role: 'Quality Assurance Associate' }
    ]
  },
  {
    id: 'gaepl-rec-2',
    projectCode: 'GAEPL',
    workDate: '2026-10-02',
    displayDate: '02-Oct-2026',
    employeeCount: 12,
    workActivity: 'Rutting Depth Assessment & Distress Identification',
    workStatus: 'Work Recorded',
    remarks: 'Chainage km 55.000 - 90.000 completed; rut depth cross-profiling',
    isDemo: true,
    employees: [
      { employeeId: 'EMP-101', employeeName: 'Rajesh Kumar', role: 'Lead Highway Profiler' },
      { employeeId: 'EMP-102', employeeName: 'Anita Sharma', role: 'GIS & Mapping Specialist' },
      { employeeId: 'EMP-103', employeeName: 'Vikram Singh', role: 'Laser Sensor Technician' },
      { employeeId: 'EMP-104', employeeName: 'Pooja Patel', role: 'Data Processing Analyst' },
      { employeeId: 'EMP-105', employeeName: 'Suresh Nair', role: 'Field Data Quality Inspector' },
      { employeeId: 'EMP-106', employeeName: 'Amit Verma', role: 'Roughness Analysis Engineer' },
      { employeeId: 'EMP-107', employeeName: 'Deepak Joshi', role: 'Pavement Condition Surveyor' },
      { employeeId: 'EMP-108', employeeName: 'Ritu Mehra', role: 'Geometric Alignment Specialist' },
      { employeeId: 'EMP-109', employeeName: 'Manoj Tiwari', role: 'Field Safety Officer' },
      { employeeId: 'EMP-110', employeeName: 'Kavita Rao', role: 'Data Validation Analyst' },
      { employeeId: 'EMP-111', employeeName: 'Sandeep Rawat', role: 'Senior Highway Engineer' },
      { employeeId: 'EMP-112', employeeName: 'Arun Gupta', role: 'Profilometer Operator' }
    ]
  },
  {
    id: 'gaepl-rec-3',
    projectCode: 'GAEPL',
    workDate: '2026-10-03',
    displayDate: '03-Oct-2026',
    employeeCount: 10,
    workActivity: 'FWD Deflection Analysis & Structural Evaluation',
    workStatus: 'Work Recorded',
    remarks: 'Chainage km 90.000 - 125.000 completed; deflection basin analyzed',
    isDemo: true,
    employees: [
      { employeeId: 'EMP-101', employeeName: 'Rajesh Kumar', role: 'Lead Highway Profiler' },
      { employeeId: 'EMP-103', employeeName: 'Vikram Singh', role: 'Laser Sensor Technician' },
      { employeeId: 'EMP-104', employeeName: 'Pooja Patel', role: 'Data Processing Analyst' },
      { employeeId: 'EMP-105', employeeName: 'Suresh Nair', role: 'Field Data Quality Inspector' },
      { employeeId: 'EMP-106', employeeName: 'Amit Verma', role: 'Roughness Analysis Engineer' },
      { employeeId: 'EMP-107', employeeName: 'Deepak Joshi', role: 'Pavement Condition Surveyor' },
      { employeeId: 'EMP-108', employeeName: 'Ritu Mehra', role: 'Geometric Alignment Specialist' },
      { employeeId: 'EMP-109', employeeName: 'Manoj Tiwari', role: 'Field Safety Officer' },
      { employeeId: 'EMP-111', employeeName: 'Sandeep Rawat', role: 'Senior Highway Engineer' },
      { employeeId: 'EMP-113', employeeName: 'Neha Saxena', role: 'CAD & Cross-Section Draftsman' }
    ]
  },
  {
    id: 'gaepl-rec-4',
    projectCode: 'GAEPL',
    workDate: '2026-10-04',
    displayDate: '04-Oct-2026',
    employeeCount: 8,
    workActivity: 'Data Validation, Cross-Section Auditing & QA Sign-off',
    workStatus: 'Work Recorded',
    remarks: 'Final stretch km 125.000 - 149.500 audit & comprehensive report QA',
    isDemo: true,
    employees: [
      { employeeId: 'EMP-101', employeeName: 'Rajesh Kumar', role: 'Lead Highway Profiler' },
      { employeeId: 'EMP-103', employeeName: 'Vikram Singh', role: 'Laser Sensor Technician' },
      { employeeId: 'EMP-106', employeeName: 'Amit Verma', role: 'Roughness Analysis Engineer' },
      { employeeId: 'EMP-107', employeeName: 'Deepak Joshi', role: 'Pavement Condition Surveyor' },
      { employeeId: 'EMP-108', employeeName: 'Ritu Mehra', role: 'Geometric Alignment Specialist' },
      { employeeId: 'EMP-109', employeeName: 'Manoj Tiwari', role: 'Field Safety Officer' },
      { employeeId: 'EMP-110', employeeName: 'Kavita Rao', role: 'Data Validation Analyst' },
      { employeeId: 'EMP-114', employeeName: 'Pankaj Yadav', role: 'GPS Base Station Tech' }
    ]
  }
];

// Additional demo data for other projects to support smooth project switching
const NH44_RECORDS: DailyWorkRecord[] = [
  {
    id: 'nh44-rec-1',
    projectCode: 'NH-44 Hyderabad-Bangalore',
    workDate: '2026-09-25',
    displayDate: '25-Sep-2026',
    employeeCount: 14,
    workActivity: 'LiDAR Road Scanning & Georeferencing',
    workStatus: 'Work Recorded',
    remarks: 'Zone A km 10.000 - 45.000 corridor mapping',
    isDemo: true
  },
  {
    id: 'nh44-rec-2',
    projectCode: 'NH-44 Hyderabad-Bangalore',
    workDate: '2026-09-26',
    displayDate: '26-Sep-2026',
    employeeCount: 14,
    workActivity: 'Pavement Distress Digitization & AI Tagging',
    workStatus: 'Work Recorded',
    remarks: 'Zone A & B transition zone verification',
    isDemo: true
  },
  {
    id: 'nh44-rec-3',
    projectCode: 'NH-44 Hyderabad-Bangalore',
    workDate: '2026-09-27',
    displayDate: '27-Sep-2026',
    employeeCount: 11,
    workActivity: 'Bridge Deck & Flyover Roughness Verification',
    workStatus: 'Work Recorded',
    remarks: '3 elevated flyovers and 8 culvert sections assessed',
    isDemo: true
  },
  {
    id: 'nh44-rec-4',
    projectCode: 'NH-44 Hyderabad-Bangalore',
    workDate: '2026-09-28',
    displayDate: '28-Sep-2026',
    employeeCount: 11,
    workActivity: 'Skid Resistance & Texture Depth Ingestion',
    workStatus: 'Work Recorded',
    remarks: 'Zone B km 45.000 - 85.000 high-friction testing',
    isDemo: true
  },
  {
    id: 'nh44-rec-5',
    projectCode: 'NH-44 Hyderabad-Bangalore',
    workDate: '2026-09-29',
    displayDate: '29-Sep-2026',
    employeeCount: 9,
    workActivity: 'Pavement Condition Index (PCI) Computation',
    workStatus: 'Work Recorded',
    remarks: 'Zone C km 85.000 - 120.000 compilation complete',
    isDemo: true
  }
];

const MUMBAI_PUNE_RECORDS: DailyWorkRecord[] = [
  {
    id: 'mpe-rec-1',
    projectCode: 'Mumbai-Pune Expressway',
    workDate: '2026-08-30',
    displayDate: '30-Aug-2026',
    employeeCount: 16,
    workActivity: 'High-Speed Laser Profilometer Data Capture',
    workStatus: 'Work Recorded',
    remarks: 'Ghat section corridor km 0 - 32 calibration completed',
    isDemo: true
  },
  {
    id: 'mpe-rec-2',
    projectCode: 'Mumbai-Pune Expressway',
    workDate: '2026-08-31',
    displayDate: '31-Aug-2026',
    employeeCount: 16,
    workActivity: 'Concrete Pavement Joint Inspection & Faulting',
    workStatus: 'Work Recorded',
    remarks: 'Km 32 - 64 steep gradient inspection',
    isDemo: true
  },
  {
    id: 'mpe-rec-3',
    projectCode: 'Mumbai-Pune Expressway',
    workDate: '2026-09-01',
    displayDate: '01-Sep-2026',
    employeeCount: 13,
    workActivity: 'Tunnel Pavement Profiling & Lighting Contrast',
    workStatus: 'Work Recorded',
    remarks: 'Tunnel segments km 64 - 80 scanned with auxiliary lighting',
    isDemo: true
  },
  {
    id: 'mpe-rec-4',
    projectCode: 'Mumbai-Pune Expressway',
    workDate: '2026-09-02',
    displayDate: '02-Sep-2026',
    employeeCount: 13,
    workActivity: 'Rutting & Rut Depth 3D Cross-Profile Compilation',
    workStatus: 'Work Recorded',
    remarks: 'Km 80 - 94.500 heavy vehicular lane profiling',
    isDemo: true
  },
  {
    id: 'mpe-rec-5',
    projectCode: 'Mumbai-Pune Expressway',
    workDate: '2026-09-03',
    displayDate: '03-Sep-2026',
    employeeCount: 10,
    workActivity: 'E-NEXCO Calibration & IRI Indexing',
    workStatus: 'Work Recorded',
    remarks: 'Draft roughness indices matched against historical trends',
    isDemo: true
  },
  {
    id: 'mpe-rec-6',
    projectCode: 'Mumbai-Pune Expressway',
    workDate: '2026-09-04',
    displayDate: '04-Sep-2026',
    employeeCount: 8,
    workActivity: 'Final Report Peer Review & Safety Audit Sign-off',
    workStatus: 'Completed',
    remarks: 'Final dossier verified by chief pavement specialist',
    isDemo: true
  }
];

// In-memory workforce record database mapped by project code or project id
const PROJECT_WORKFORCE_MAP: Record<string, DailyWorkRecord[]> = {
  'GAEPL': GAEPL_RECORDS,
  'proj-1': GAEPL_RECORDS,
  'NH-44 Hyderabad-Bangalore': NH44_RECORDS,
  'proj-2': NH44_RECORDS,
  'Mumbai-Pune Expressway': MUMBAI_PUNE_RECORDS,
  'proj-3': MUMBAI_PUNE_RECORDS,
  'Delhi-Meerut Expressway': [], // 0 working days recorded
  'proj-4': []
};

/**
 * Calculates dynamic project workforce metrics
 * Strictly follows:
 * - Working Days: distinct dates with recorded activity (never assume calendar days)
 * - Total Assignments: sum of daily employee counts
 * - Unique Employees: distinct individuals (separate from assignments)
 * - Average Daily Workforce: total assignments / working days
 * - Project Work Period: first date to last date
 */
export const calculateWorkforceSummary = (
  projectCode: string,
  records: DailyWorkRecord[]
): ProjectWorkforceSummary => {
  if (!records || records.length === 0) {
    return {
      projectCode,
      workingDays: 0,
      totalAssignments: 0,
      averageDailyWorkforce: 0,
      firstWorkDate: null,
      lastWorkDate: null,
      uniqueEmployeesCount: 0,
      records: []
    };
  }

  // Sort chronologically
  const sortedRecords = [...records].sort((a, b) => new Date(a.workDate).getTime() - new Date(b.workDate).getTime());

  // Distinct working dates
  const distinctDates = new Set(sortedRecords.map(r => r.workDate));
  const workingDays = distinctDates.size;

  // Total assignments & cumulative calculation
  let runningCumulative = 0;
  const processedRecords = sortedRecords.map(rec => {
    runningCumulative += rec.employeeCount;
    return {
      ...rec,
      displayDate: rec.displayDate || formatDate(rec.workDate),
      cumulativeAssignments: runningCumulative
    };
  });

  const totalAssignments = runningCumulative;
  const averageDailyWorkforce = workingDays > 0 
    ? Math.round((totalAssignments / workingDays) * 100) / 100 
    : 0;

  const firstWorkDate = processedRecords[0]?.displayDate || formatDate(processedRecords[0]?.workDate);
  const lastWorkDate = processedRecords[processedRecords.length - 1]?.displayDate || formatDate(processedRecords[processedRecords.length - 1]?.workDate);

  // Unique employees calculation if identities exist
  const uniqueEmployeeKeys = new Set<string>();
  processedRecords.forEach(r => {
    if (r.employees && r.employees.length > 0) {
      r.employees.forEach(emp => {
        const key = emp.employeeId || emp.employeeName.toLowerCase().trim();
        uniqueEmployeeKeys.add(key);
      });
    }
  });

  return {
    projectCode,
    workingDays,
    totalAssignments,
    averageDailyWorkforce,
    firstWorkDate,
    lastWorkDate,
    uniqueEmployeesCount: uniqueEmployeeKeys.size,
    records: processedRecords
  };
};

/**
 * Retrieves daily workforce records for a given project identifier
 */
export const getProjectWorkforce = (projectIdentifier: string): ProjectWorkforceSummary => {
  const records = PROJECT_WORKFORCE_MAP[projectIdentifier] || [];
  return calculateWorkforceSummary(projectIdentifier, records);
};

/**
 * Future-ready Excel mapper & exporter
 * Matches the required Excel structure:
 * - Project Code
 * - Work Date
 * - Employee Name or Employee ID, if available
 * - Employee Count, if provided
 * - Work Activity
 * - Work Status
 * - Remarks
 */
export const exportDailyWorkforceToExcel = (
  projectName: string,
  records: DailyWorkRecord[]
) => {
  const wb = XLSX.utils.book_new();

  // 1. Daily Aggregates Sheet
  const dailySummaryData = records.map(r => ({
    'Project Code': r.projectCode,
    'Work Date': r.displayDate || r.workDate,
    'ISO Work Date': r.workDate,
    'Employees Working': r.employeeCount,
    'Work Activity': r.workActivity || 'Field Survey & Pavement Profiling',
    'Work Status': r.workStatus,
    'Cumulative Assignments': r.cumulativeAssignments || r.employeeCount,
    'Remarks': r.remarks || 'Work recorded per site log'
  }));

  const wsDaily = XLSX.utils.json_to_sheet(dailySummaryData);
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Workforce Summary');

  // 2. Individual Employee Assignments Sheet (if roster data exists)
  const rosterData: any[] = [];
  records.forEach(r => {
    if (r.employees && r.employees.length > 0) {
      r.employees.forEach(emp => {
        rosterData.push({
          'Project Code': r.projectCode,
          'Work Date': r.displayDate || r.workDate,
          'Employee ID': emp.employeeId || 'N/A',
          'Employee Name': emp.employeeName,
          'Designation / Role': emp.role || 'Highway Project Team Member',
          'Work Activity': r.workActivity || '',
          'Work Status': r.workStatus,
          'Remarks': r.remarks || ''
        });
      });
    } else {
      rosterData.push({
        'Project Code': r.projectCode,
        'Work Date': r.displayDate || r.workDate,
        'Employee ID': 'Aggregate',
        'Employee Name': `${r.employeeCount} Members Assigned`,
        'Designation / Role': 'Site Field Workforce',
        'Work Activity': r.workActivity || '',
        'Work Status': r.workStatus,
        'Remarks': r.remarks || ''
      });
    }
  });

  const wsRoster = XLSX.utils.json_to_sheet(rosterData);
  XLSX.utils.book_append_sheet(wb, wsRoster, 'Employee Assignments Roster');

  const sanitizedName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Daily_Workforce_${sanitizedName}.xlsx`);
};

/**
 * Excel Parser for future uploaded workforce sheets
 * Parses sheets with columns matching the specified schema
 */
export const parseWorkforceFromWorksheet = (worksheet: XLSX.WorkSheet): DailyWorkRecord[] => {
  const rows = XLSX.utils.sheet_to_json<any>(worksheet);
  if (!rows || rows.length === 0) return [];

  const groupedByDate: Record<string, DailyWorkRecord> = {};

  rows.forEach((row, idx) => {
    const projectCode = row['Project Code'] || row['ProjectCode'] || row['Project'] || 'PROJECT';
    const rawDate = row['Work Date'] || row['WorkDate'] || row['Date'];
    if (!rawDate) return;

    const dateKey = String(rawDate).trim();
    const employeeCount = Number(row['Employees Working'] || row['Employee Count'] || row['Employees'] || 1);
    const workActivity = row['Work Activity'] || row['Activity'] || 'Field Inspection';
    const workStatus = row['Work Status'] || row['Status'] || 'Work Recorded';
    const remarks = row['Remarks'] || row['Remark'] || '';

    const empName = row['Employee Name'] || row['Name'];
    const empId = row['Employee ID'] || row['EmployeeId'] || row['ID'];
    const role = row['Designation'] || row['Role'];

    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = {
        id: `imported-rec-${idx}`,
        projectCode,
        workDate: dateKey,
        displayDate: dateKey,
        employeeCount: employeeCount || 1,
        workActivity,
        workStatus: (workStatus as any) || 'Work Recorded',
        remarks,
        employees: []
      };
    } else {
      if (!row['Employee Count']) {
        groupedByDate[dateKey].employeeCount += 1;
      }
    }

    if (empName && groupedByDate[dateKey].employees) {
      groupedByDate[dateKey].employees!.push({
        employeeId: empId,
        employeeName: empName,
        role: role || 'Field Member'
      });
    }
  });

  return Object.values(groupedByDate);
};
