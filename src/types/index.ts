export interface Employee {
  id: string;
  sNo: number;
  name: string;
  workType: string;
  status: 'Present' | 'Absent' | 'Holiday' | 'Unknown';
  rawDailyValue?: string;
}

export interface AvailableDate {
  colIdx: number;
  label: string;
  rawValue: number | string;
}

export interface ExcelParseResult {
  employees: Employee[];
  totalNamesInExcel: number;
  availableDates: AvailableDate[];
  allDataByDate: Record<number, Employee[]>;
  latestDateColIdx: number;
}

export interface DashboardMetrics {
  totalSystems: number;
  totalSeats: number;
  peoplePresent: number;
  peopleAbsent: number;
  peopleOnHoliday: number;
  vacantSeats: number;
  occupiedSeats: number;
  occupiedSystems: number;
  vacantSystems: number;
}

export interface WorkTypeDistribution {
  name: string;
  value: number;
  color: string;
}
