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
