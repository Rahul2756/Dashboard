import * as XLSX from 'xlsx';
import { DailyRatingRecord, ProjectRatingSummary } from '../types/hiRateWorkforce';
import { formatDate } from '../utils/dateUtils';
import { HIRATE_27_PROJECTS } from './hiRateParser';

// Dedicated illustrative demo records for GAEPL (matches section 5 of Antigravity prompt)
const GAEPL_RATING_RECORDS: DailyRatingRecord[] = [
  {
    id: 'gaepl-rate-1',
    projectCode: 'GAEPL',
    projectName: 'Ghaziabad Aligarh Expressway Private Limited',
    ratingDate: '2026-10-01',
    displayDate: '01-Oct-2026',
    ratingStage: 'HO',
    membersWorked: 15,
    assetsRated: 120,
    ratingStatus: 'Work Recorded',
    activityDetails: 'Overhead Gantry & Cantilever Signboard Retroreflectivity Inspection',
    remarks: 'Km 23.600 - 60.000 section: 120 signboards rated with retroreflectometer; daytime and nighttime contrast recorded',
    isDemo: true,
    employees: [
      { employeeId: 'HR-101', employeeName: 'Sanjay Deshmukh', role: 'Head Office Rating Lead' },
      { employeeId: 'HR-102', employeeName: 'Priya Iyer', role: 'Senior Highway Signboard Specialist' },
      { employeeId: 'HR-103', employeeName: 'Rohan Kulkarni', role: 'Retroreflectometer Instrument Tech' },
      { employeeId: 'HR-104', employeeName: 'Kavita Menon', role: 'GIS Asset Geotagging Analyst' },
      { employeeId: 'HR-105', employeeName: 'Alok Pandey', role: 'Signboard Legibility & Size Auditor' },
      { employeeId: 'HR-106', employeeName: 'Gaurav Sethi', role: 'Field Data Recording Associate' },
      { employeeId: 'HR-107', employeeName: 'Ananya Roy', role: 'Illumination Contrast Surveyor' },
      { employeeId: 'HR-108', employeeName: 'Tariq Ahmed', role: 'Overhead Structure Inspector' },
      { employeeId: 'HR-109', employeeName: 'Vikas Chauhan', role: 'Highway Safety Sign Specialist' },
      { employeeId: 'HR-110', employeeName: 'Meenakshi Sundaram', role: 'Asset Condition Cataloguer' },
      { employeeId: 'HR-111', employeeName: 'Deepak Bhatt', role: 'Quality Assurance Engineer' },
      { employeeId: 'HR-112', employeeName: 'Sunita Pillai', role: 'Digital Signage Compliance Tech' },
      { employeeId: 'HR-113', employeeName: 'Kishore Reddy', role: 'Traffic Diversion & Safety Officer' },
      { employeeId: 'HR-114', employeeName: 'Farhan Zaidi', role: 'HiRATE Mobile Ingestion Operator' },
      { employeeId: 'HR-115', employeeName: 'Hemant Joshi', role: 'Field Assistant' }
    ]
  },
  {
    id: 'gaepl-rate-2',
    projectCode: 'GAEPL',
    projectName: 'Ghaziabad Aligarh Expressway Private Limited',
    ratingDate: '2026-10-02',
    displayDate: '02-Oct-2026',
    ratingStage: 'HO',
    membersWorked: 12,
    assetsRated: 95,
    ratingStatus: 'Work Recorded',
    activityDetails: 'Shoulder Mounted Informatory & Warning Signboards Audit',
    remarks: 'Km 60.000 - 100.000 section: 95 roadside warning & regulatory signboards evaluated against IRC:67 guidelines',
    isDemo: true,
    employees: [
      { employeeId: 'HR-101', employeeName: 'Sanjay Deshmukh', role: 'Head Office Rating Lead' },
      { employeeId: 'HR-102', employeeName: 'Priya Iyer', role: 'Senior Highway Signboard Specialist' },
      { employeeId: 'HR-103', employeeName: 'Rohan Kulkarni', role: 'Retroreflectometer Instrument Tech' },
      { employeeId: 'HR-104', employeeName: 'Kavita Menon', role: 'GIS Asset Geotagging Analyst' },
      { employeeId: 'HR-105', employeeName: 'Alok Pandey', role: 'Signboard Legibility & Size Auditor' },
      { employeeId: 'HR-106', employeeName: 'Gaurav Sethi', role: 'Field Data Recording Associate' },
      { employeeId: 'HR-107', employeeName: 'Ananya Roy', role: 'Illumination Contrast Surveyor' },
      { employeeId: 'HR-108', employeeName: 'Tariq Ahmed', role: 'Overhead Structure Inspector' },
      { employeeId: 'HR-109', employeeName: 'Vikas Chauhan', role: 'Highway Safety Sign Specialist' },
      { employeeId: 'HR-110', employeeName: 'Meenakshi Sundaram', role: 'Asset Condition Cataloguer' },
      { employeeId: 'HR-111', employeeName: 'Deepak Bhatt', role: 'Quality Assurance Engineer' },
      { employeeId: 'HR-112', employeeName: 'Sunita Pillai', role: 'Digital Signage Compliance Tech' }
    ]
  },
  {
    id: 'gaepl-rate-3',
    projectCode: 'GAEPL',
    projectName: 'Ghaziabad Aligarh Expressway Private Limited',
    ratingDate: '2026-10-03',
    displayDate: '03-Oct-2026',
    ratingStage: 'SPV',
    membersWorked: 10,
    assetsRated: 110,
    ratingStatus: 'Work Recorded',
    activityDetails: 'SPV Joint Field Verification & Night Illumination Assessment',
    remarks: 'Km 100.000 - 135.000: Joint SPV team counter-rating; cross-verified gantry retroreflectance with SPV engineers',
    isDemo: true,
    employees: [
      { employeeId: 'HR-101', employeeName: 'Sanjay Deshmukh', role: 'Head Office Rating Lead' },
      { employeeId: 'HR-103', employeeName: 'Rohan Kulkarni', role: 'Retroreflectometer Instrument Tech' },
      { employeeId: 'HR-104', employeeName: 'Kavita Menon', role: 'GIS Asset Geotagging Analyst' },
      { employeeId: 'HR-105', employeeName: 'Alok Pandey', role: 'Signboard Legibility & Size Auditor' },
      { employeeId: 'HR-107', employeeName: 'Ananya Roy', role: 'Illumination Contrast Surveyor' },
      { employeeId: 'HR-109', employeeName: 'Vikas Chauhan', role: 'Highway Safety Sign Specialist' },
      { employeeId: 'HR-110', employeeName: 'Meenakshi Sundaram', role: 'Asset Condition Cataloguer' },
      { employeeId: 'HR-111', employeeName: 'Deepak Bhatt', role: 'Quality Assurance Engineer' },
      { employeeId: 'HR-114', employeeName: 'Farhan Zaidi', role: 'HiRATE Mobile Ingestion Operator' },
      { employeeId: 'HR-116', employeeName: 'Naveen Swamy', role: 'SPV Coordinating Engineer' }
    ]
  },
  {
    id: 'gaepl-rate-4',
    projectCode: 'GAEPL',
    projectName: 'Ghaziabad Aligarh Expressway Private Limited',
    ratingDate: '2026-10-04',
    displayDate: '04-Oct-2026',
    ratingStage: 'SPV',
    membersWorked: 8,
    assetsRated: 75,
    ratingStatus: 'Work Recorded',
    activityDetails: 'Delineator, Hazard Marker & Directional Signboard QC Sign-off',
    remarks: 'Final km 135.000 - 149.500: Toll plaza directional signboards & hazard markers completed; SPV sign-off obtained',
    isDemo: true,
    employees: [
      { employeeId: 'HR-101', employeeName: 'Sanjay Deshmukh', role: 'Head Office Rating Lead' },
      { employeeId: 'HR-102', employeeName: 'Priya Iyer', role: 'Senior Highway Signboard Specialist' },
      { employeeId: 'HR-105', employeeName: 'Alok Pandey', role: 'Signboard Legibility & Size Auditor' },
      { employeeId: 'HR-107', employeeName: 'Ananya Roy', role: 'Illumination Contrast Surveyor' },
      { employeeId: 'HR-109', employeeName: 'Vikas Chauhan', role: 'Highway Safety Sign Specialist' },
      { employeeId: 'HR-111', employeeName: 'Deepak Bhatt', role: 'Quality Assurance Engineer' },
      { employeeId: 'HR-116', employeeName: 'Naveen Swamy', role: 'SPV Coordinating Engineer' },
      { employeeId: 'HR-117', employeeName: 'Karthik Varma', role: 'SPV Asset Quality Auditor' }
    ]
  }
];

// Dedicated records for DHMEPL (SPV Completed)
const DHMEPL_RATING_RECORDS: DailyRatingRecord[] = [
  {
    id: 'dhmepl-rate-1',
    projectCode: 'DHMEPL',
    projectName: 'Delhi Hapur Meerut Expressway Private Limited',
    ratingDate: '2026-09-28',
    displayDate: '28-Sep-2026',
    ratingStage: 'HO',
    membersWorked: 14,
    assetsRated: 105,
    ratingStatus: 'Work Recorded',
    activityDetails: 'Expressway Overhead Gantry & VMS Inspection',
    remarks: 'Zone 1 km 28.000 - 45.000: Variable Message Signs (VMS) & overhead gantry retroreflectance verified',
    isDemo: true
  },
  {
    id: 'dhmepl-rate-2',
    projectCode: 'DHMEPL',
    projectName: 'Delhi Hapur Meerut Expressway Private Limited',
    ratingDate: '2026-09-29',
    displayDate: '29-Sep-2026',
    ratingStage: 'HO',
    membersWorked: 14,
    assetsRated: 115,
    ratingStatus: 'Work Recorded',
    activityDetails: 'Interchange Signage & Lane Guidance Board Audit',
    remarks: 'Zone 2 km 45.000 - 59.770: Exit ramps and interchange signboards rated',
    isDemo: true
  },
  {
    id: 'dhmepl-rate-3',
    projectCode: 'DHMEPL',
    projectName: 'Delhi Hapur Meerut Expressway Private Limited',
    ratingDate: '2026-09-30',
    displayDate: '30-Sep-2026',
    ratingStage: 'SPV',
    membersWorked: 12,
    assetsRated: 90,
    ratingStatus: 'Work Recorded',
    activityDetails: 'SPV Joint Rating of Road Studs & Hazard Signboards',
    remarks: 'Ramp and flyover safety signage rated with SPV field team',
    isDemo: true
  },
  {
    id: 'dhmepl-rate-4',
    projectCode: 'DHMEPL',
    projectName: 'Delhi Hapur Meerut Expressway Private Limited',
    ratingDate: '2026-10-01',
    displayDate: '01-Oct-2026',
    ratingStage: 'SPV',
    membersWorked: 10,
    assetsRated: 80,
    ratingStatus: 'Completed',
    activityDetails: 'Final SPV Sign-off & Defect Dossier Compilation',
    remarks: 'Total 390 assets rated; SPV rating stage formally signed off',
    isDemo: true
  }
];

// Dedicated records for KETPL (SPV Pending project from the 17 pending list)
const KETPL_RATING_RECORDS: DailyRatingRecord[] = [
  {
    id: 'ketpl-rate-1',
    projectCode: 'KETPL',
    projectName: 'Kanyakumari-Etturavattam Tollway Private Limited',
    ratingDate: '2026-09-20',
    displayDate: '20-Sep-2026',
    ratingStage: 'HO',
    membersWorked: 12,
    assetsRated: 95,
    ratingStatus: 'Work Recorded',
    activityDetails: 'HO Highway Signboard Daytime Inspection',
    remarks: 'Corridor section km 0.000 - 35.000: Informatory boards rated at HO level',
    isDemo: true
  },
  {
    id: 'ketpl-rate-2',
    projectCode: 'KETPL',
    projectName: 'Kanyakumari-Etturavattam Tollway Private Limited',
    ratingDate: '2026-09-21',
    displayDate: '21-Sep-2026',
    ratingStage: 'HO',
    membersWorked: 10,
    assetsRated: 85,
    ratingStatus: 'Completed',
    activityDetails: 'HO Overhead Signboards & Milepost Verification',
    remarks: 'Km 35.000 - 64.000: HO rating completed. Total 180 assets rated at HO level; awaiting SPV schedule',
    isDemo: true
  }
];

// Pre-compiled project workforce map
const PROJECT_RATING_MAP: Record<string, DailyRatingRecord[]> = {
  'GAEPL': GAEPL_RATING_RECORDS,
  'DHMEPL': DHMEPL_RATING_RECORDS,
  'KETPL': KETPL_RATING_RECORDS
};

/**
 * Generates realistic fallback daily rating records for any of the 27 projects
 * based on whether SPV rating is completed (10 projects) or pending (17 projects).
 */
const generateFallbackRecordsForProject = (
  code: string,
  name: string,
  isSpvCompleted: boolean
): DailyRatingRecord[] => {
  if (isSpvCompleted) {
    return [
      {
        id: `${code.toLowerCase()}-rate-1`,
        projectCode: code,
        projectName: name,
        ratingDate: '2026-09-26',
        displayDate: '26-Sep-2026',
        ratingStage: 'HO',
        membersWorked: 14,
        assetsRated: 110,
        ratingStatus: 'Work Recorded',
        activityDetails: 'Overhead Gantry & Warning Signboard Survey',
        remarks: 'HO baseline evaluation completed',
        isDemo: true
      },
      {
        id: `${code.toLowerCase()}-rate-2`,
        projectCode: code,
        projectName: name,
        ratingDate: '2026-09-27',
        displayDate: '27-Sep-2026',
        ratingStage: 'HO',
        membersWorked: 13,
        assetsRated: 100,
        ratingStatus: 'Work Recorded',
        activityDetails: 'Regulatory Signboards & Reflectivity Testing',
        remarks: 'All major highway boards catalogued',
        isDemo: true
      },
      {
        id: `${code.toLowerCase()}-rate-3`,
        projectCode: code,
        projectName: name,
        ratingDate: '2026-09-28',
        displayDate: '28-Sep-2026',
        ratingStage: 'SPV',
        membersWorked: 11,
        assetsRated: 95,
        ratingStatus: 'Work Recorded',
        activityDetails: 'SPV Team Joint On-Site Inspection',
        remarks: 'SPV engineers verified asset conditions',
        isDemo: true
      },
      {
        id: `${code.toLowerCase()}-rate-4`,
        projectCode: code,
        projectName: name,
        ratingDate: '2026-09-29',
        displayDate: '29-Sep-2026',
        ratingStage: 'SPV',
        membersWorked: 9,
        assetsRated: 85,
        ratingStatus: 'Completed',
        activityDetails: 'SPV Review Sign-off & Asset Rating Audit',
        remarks: 'SPV rating completed successfully; awaiting Final HO review',
        isDemo: true
      }
    ];
  } else {
    // SPV Pending project (only HO completed, SPV pending)
    return [
      {
        id: `${code.toLowerCase()}-rate-1`,
        projectCode: code,
        projectName: name,
        ratingDate: '2026-09-18',
        displayDate: '18-Sep-2026',
        ratingStage: 'HO',
        membersWorked: 13,
        assetsRated: 105,
        ratingStatus: 'Work Recorded',
        activityDetails: 'HO Overhead Signboards & Highway Signs Profiling',
        remarks: 'HO preliminary rating logged',
        isDemo: true
      },
      {
        id: `${code.toLowerCase()}-rate-2`,
        projectCode: code,
        projectName: name,
        ratingDate: '2026-09-19',
        displayDate: '19-Sep-2026',
        ratingStage: 'HO',
        membersWorked: 11,
        assetsRated: 95,
        ratingStatus: 'Completed',
        activityDetails: 'HO Signboard Legibility & Condition Audit',
        remarks: 'HO rating completed (200 assets rated); SPV field schedule pending',
        isDemo: true
      }
    ];
  }
};

/**
 * Calculates comprehensive project rating summary and workforce metrics
 */
export const calculateHiRateSummary = (
  projectCode: string,
  projectName?: string,
  customRecords?: DailyRatingRecord[]
): ProjectRatingSummary => {
  // Find project config from the 27 tracked projects
  const projMeta = HIRATE_27_PROJECTS.find(p => p.code.toUpperCase() === projectCode.toUpperCase()) || {
    code: projectCode,
    name: projectName || projectCode,
    isSpvCompleted: false
  };

  const records = customRecords && customRecords.length > 0 
    ? customRecords 
    : (PROJECT_RATING_MAP[projectCode.toUpperCase()] || generateFallbackRecordsForProject(projMeta.code, projMeta.name, projMeta.isSpvCompleted));

  // Sort chronologically
  const sorted = [...records].sort((a, b) => new Date(a.ratingDate).getTime() - new Date(b.ratingDate).getTime());

  // Distinct working days
  const distinctDates = new Set(sorted.map(r => r.ratingDate));
  const totalWorkingDays = distinctDates.size;

  // Cumulative computations
  let runningMembers = 0;
  let runningAssets = 0;
  const processedRecords = sorted.map(rec => {
    runningMembers += rec.membersWorked;
    runningAssets += rec.assetsRated;
    return {
      ...rec,
      displayDate: rec.displayDate || formatDate(rec.ratingDate),
      cumulativeMembersWorked: runningMembers,
      cumulativeAssetsRated: runningAssets
    };
  });

  const totalMembersWorked = runningMembers;
  const totalAssetsRated = runningAssets;

  // Applicable total assets estimation
  // (e.g. for GAEPL: 480 assets, for DHMEPL: 450, for others ~250-480)
  let totalApplicableAssets = 480;
  if (projectCode.toUpperCase() === 'DHMEPL') totalApplicableAssets = 450;
  else if (projMeta.isSpvCompleted) totalApplicableAssets = Math.max(totalAssetsRated + 50, 420);
  else totalApplicableAssets = Math.max(totalAssetsRated + 180, 380);

  const ratingProgressPercent = Math.min(100, Math.round((totalAssetsRated / totalApplicableAssets) * 100));

  // Dates
  const firstRatingDate = processedRecords[0]?.displayDate || null;
  const latestRatingDate = processedRecords[processedRecords.length - 1]?.displayDate || null;

  // Unique personnel calculation
  const uniquePersonnelKeys = new Set<string>();
  processedRecords.forEach(r => {
    if (r.employees && r.employees.length > 0) {
      r.employees.forEach(emp => {
        uniquePersonnelKeys.add(emp.employeeId || emp.employeeName.toLowerCase());
      });
    }
  });

  // Unique fallback if identities weren't listed per record
  const uniqueMembersCount = uniquePersonnelKeys.size > 0 
    ? uniquePersonnelKeys.size 
    : Math.round(totalMembersWorked * 0.42);

  // Statuses
  const hoStatus: 'Completed' | 'In Progress' | 'Pending' = 'Completed';
  const spvStatus: 'Completed' | 'In Progress' | 'Pending' = projMeta.isSpvCompleted ? 'Completed' : 'Pending';
  const finalHoStatus: 'Completed' | 'In Review' | 'Pending' | 'Not Started' = 'Not Started';

  return {
    projectCode: projMeta.code,
    projectName: projMeta.name,
    hoStatus,
    spvStatus,
    finalHoStatus,
    totalWorkingDays,
    totalMembersWorked,
    uniqueMembersCount,
    totalAssetsRated,
    totalApplicableAssets,
    ratingProgressPercent,
    firstRatingDate,
    latestRatingDate,
    records: processedRecords,
    isSpvPending: !projMeta.isSpvCompleted
  };
};

/**
 * Excel Exporter for HiRATE Daily Rating Workforce
 * Produces structured Excel matching Section 11 specifications:
 * - Project Code
 * - Project Name
 * - Rating Date
 * - Rating Stage
 * - Employee Name or Employee ID
 * - Asset ID or Signboard ID
 * - Rating Status
 * - Completion Date
 * - Remarks
 */
export const exportHiRateWorkforceToExcel = (
  projectCode: string,
  records: DailyRatingRecord[]
) => {
  const wb = XLSX.utils.book_new();

  // 1. Daily Summary Sheet
  const dailyData = records.map(r => ({
    'Project Code': r.projectCode,
    'Project Name': r.projectName || r.projectCode,
    'Rating Date': r.displayDate || r.ratingDate,
    'Rating Stage': r.ratingStage,
    'Members Worked': r.membersWorked,
    'Assets Rated': r.assetsRated,
    'Cumulative Assets': r.cumulativeAssetsRated,
    'Cumulative Members': r.cumulativeMembersWorked,
    'Rating Status': r.ratingStatus,
    'Work Activity': r.activityDetails || 'Signboard & Highway Asset Rating',
    'Remarks': r.remarks || 'Audited field rating record'
  }));

  const wsDaily = XLSX.utils.json_to_sheet(dailyData);
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Rating Summary');

  // 2. Personnel & Asset Mapping Sheet (when available)
  const rosterData: any[] = [];
  records.forEach(r => {
    if (r.employees && r.employees.length > 0) {
      r.employees.forEach((emp, i) => {
        rosterData.push({
          'Project Code': r.projectCode,
          'Project Name': r.projectName || r.projectCode,
          'Rating Date': r.displayDate || r.ratingDate,
          'Rating Stage': r.ratingStage,
          'Employee ID': emp.employeeId || `HR-${100 + i}`,
          'Employee Name': emp.employeeName,
          'Designation': emp.role || 'HiRATE Inspection Engineer',
          'Asset ID or Signboard ID': `SB-${r.projectCode}-${1000 + (r.cumulativeAssetsRated || 0) - r.assetsRated + i}`,
          'Rating Status': r.ratingStatus,
          'Completion Date': r.displayDate || r.ratingDate,
          'Remarks': r.remarks || ''
        });
      });
    } else {
      rosterData.push({
        'Project Code': r.projectCode,
        'Project Name': r.projectName || r.projectCode,
        'Rating Date': r.displayDate || r.ratingDate,
        'Rating Stage': r.ratingStage,
        'Employee ID': 'Aggregate',
        'Employee Name': `${r.membersWorked} Rating Members`,
        'Designation': 'HiRATE Field Team',
        'Asset ID or Signboard ID': `${r.assetsRated} Signboards Evaluated`,
        'Rating Status': r.ratingStatus,
        'Completion Date': r.displayDate || r.ratingDate,
        'Remarks': r.remarks || ''
      });
    }
  });

  const wsRoster = XLSX.utils.json_to_sheet(rosterData);
  XLSX.utils.book_append_sheet(wb, wsRoster, 'Roster & Asset Rating Details');

  const cleanName = projectCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `HiRATE_Workforce_Rating_${cleanName}.xlsx`);
};
