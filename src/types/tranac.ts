export type DataReceiptStatus = 'Data Received' | 'Partially Received' | 'Data Not yet Received';
export type ProcessingDeadlineStatus = 'Processing Overdue' | 'Processing Due Soon' | 'On Schedule' | 'Not Recorded';

export interface AdditionalSubmission {
  date: Date | null;
  formattedDate: string;
  days: string;
}

export interface DailyWorkforceRecord {
  tollPlaza: string;
  workDate: string;
  members: number;
}

export interface TollPlazaTimelineItem {
  id: string;
  srNo: number;
  project: string;
  tollPlaza: string;
  surveyPeriod: string;
  surveyStartDate: Date | null;
  surveyEndDate: Date | null;
  surveyDurationDays: number;
  totalVehicles: number;

  // Stage 2: Data Inflow
  expectedInflowDate: Date | null;
  receivedDate: Date | null;
  submissionDate: Date | null;
  submittedDaysText: string;
  additionalSubmissions: AdditionalSubmission[];
  dataReceiptStatus: DataReceiptStatus;
  inflowDelayDays: number | null; // > 0: delayed, 0: on time, < 0: early
  inflowDelayText: string;

  // Stage 3: Processing
  expectedProcessingDate: Date | null;
  actualProcessingCompletionDate: Date | null; // null -> "Not Recorded"
  processingStatus: ProcessingDeadlineStatus;
  processingDelayDays: number | null;
  dailyWorkforce?: DailyWorkforceRecord[];

  // Additional fields
  dataDays: string;
  remarks: string;
  tableType: 'TVC Survey' | 'Tentative TVC Survey';
  actionRequired: string;

  // Days scope from Sheet4 if matched
  scopeDays?: {
    totalScope: number;
    processDays: number;
    completedDays: number;
    balanceDays: number;
  };
}

export interface TranacTimelineKPIs {
  totalTollPlazas: number;
  dataReceived: number;
  partiallyReceived: number;
  dataNotReceived: number;
  delayedOrOverdue: number;
  delayedReceiptCount: number;
  overdueReceiptCount: number;
  processingOverdueCount: number;
}

// Retained for backward compatibility
export interface TranacDataRow {
  srNo: number;
  locationName: string;
  location: string;
  totalScope: number;
  processDays: number;
  completedDays: number;
  balanceDays: number;
  status: 'Completed' | 'In Process' | 'Pending' | 'No Data';
}

export interface TranacDashboardMetrics {
  totalLocations: number;
  locationsDataReceived: number;
  locationsNoData: number;
  totalDaysReceived: number;
  totalDaysPending: number;
  completedDays: number;
  processDays: number;
}
