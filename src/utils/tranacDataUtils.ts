import { TranacDataRow, TranacDashboardMetrics } from '../types/tranac';

export function calculateTranacMetrics(data: TranacDataRow[]): TranacDashboardMetrics {
  const totalLocations = data.length;
  
  let locationsDataReceived = 0;
  let locationsNoData = 0;
  let totalDaysReceived = 0;
  let totalDaysPending = 0;
  let completedDays = 0;
  let processDays = 0;

  for (const row of data) {
    if (row.totalScope > 0) {
      locationsDataReceived++;
    } else {
      locationsNoData++;
    }

    totalDaysReceived += row.totalScope;
    totalDaysPending += row.balanceDays;
    completedDays += row.completedDays;
    processDays += row.processDays;
  }

  return {
    totalLocations,
    locationsDataReceived,
    locationsNoData,
    totalDaysReceived,
    totalDaysPending,
    completedDays,
    processDays
  };
}
