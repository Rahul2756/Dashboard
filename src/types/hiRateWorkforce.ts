import { EmployeeAssignment } from './workforce';

export interface DailyRatingRecord {
  id: string;
  projectCode: string; // e.g. 'GAEPL', 'ADTPL'
  projectName?: string; // e.g. 'Ghaziabad Aligarh Expressway Private Limited'
  ratingDate: string; // '2026-10-01'
  displayDate?: string; // '01-Oct-2026'
  ratingStage: 'HO' | 'SPV' | 'Final HO';
  membersWorked: number;
  assetsRated: number;
  cumulativeAssetsRated?: number;
  cumulativeMembersWorked?: number;
  ratingStatus: 'Work Recorded' | 'Completed' | 'Pending Review' | 'In Progress';
  activityDetails?: string;
  remarks?: string;
  employees?: EmployeeAssignment[];
  assetIds?: string[];
  isDemo?: boolean;
}

export interface ProjectRatingSummary {
  projectCode: string;
  projectName: string;
  hoStatus: 'Completed' | 'In Progress' | 'Pending';
  spvStatus: 'Completed' | 'In Progress' | 'Pending';
  finalHoStatus: 'Completed' | 'In Review' | 'Pending' | 'Not Started';
  totalWorkingDays: number;
  totalMembersWorked: number;
  uniqueMembersCount: number;
  totalAssetsRated: number;
  totalApplicableAssets: number;
  ratingProgressPercent: number;
  firstRatingDate: string | null;
  latestRatingDate: string | null;
  records: DailyRatingRecord[];
  isSpvPending: boolean;
}

export interface ExcelRatingRow {
  'Project Code': string;
  'Project Name'?: string;
  'Rating Date': string;
  'Rating Stage': string;
  'Employee Name'?: string;
  'Employee ID'?: string;
  'Asset ID'?: string;
  'Members Worked'?: number;
  'Assets Rated'?: number;
  'Rating Status'?: string;
  'Completion Date'?: string;
  'Remarks'?: string;
}
