import * as XLSX from 'xlsx';
import {
  TollPlazaTimelineItem,
  TranacTimelineKPIs,
  TranacDataRow,
  DataReceiptStatus,
  ProcessingDeadlineStatus,
  AdditionalSubmission,
  DailyWorkforceRecord
} from '../types/tranac';

/**
 * Format date consistently as DD-MMM-YYYY (e.g. "12-Sep-2026")
 */
export function formatDisplayDate(date: Date | null, fallback = 'Not Recorded'): string {
  if (!date || isNaN(date.getTime())) return fallback;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format short date as DD-MMM (e.g. "12-Sep")
 */
export function formatShortDate(date: Date | null, fallback = '-'): string {
  if (!date || isNaN(date.getTime())) return fallback;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = months[date.getUTCMonth()];
  return `${day}-${month}`;
}

/**
 * Robust date parser handling Excel serials and varied text formats
 */
export function parseExcelDate(val: any): Date | null {
  if (val === null || val === undefined || val === '') return null;

  if (typeof val === 'number') {
    try {
      const d = XLSX.SSF.parse_date_code(val);
      if (d && d.y && d.m && d.d) {
        return new Date(Date.UTC(d.y, d.m - 1, d.d));
      }
    } catch {
      return null;
    }
  }

  if (typeof val === 'string') {
    // Clean non-breaking spaces and whitespace
    const cleaned = val.replace(/[\u00A0\s]+/g, ' ').trim();
    if (!cleaned) return null;

    // DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      return new Date(Date.UTC(year, month, day));
    }

    // YYYY-MM-DD
    const ymdMatch = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      return new Date(Date.UTC(year, month, day));
    }

    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
    }
  }

  return null;
}

/**
 * Parse survey date range string like "12-09-2026 to 18-09-2026"
 */
export function parseSurveyPeriod(periodStr: string): { start: Date | null; end: Date | null; durationDays: number } {
  if (!periodStr) return { start: null, end: null, durationDays: 0 };
  const parts = periodStr.split(/\s+to\s+/i);
  if (parts.length === 2) {
    const start = parseExcelDate(parts[0].trim());
    const end = parseExcelDate(parts[1].trim());
    let durationDays = 0;
    if (start && end) {
      durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    }
    return { start, end, durationDays };
  }
  return { start: null, end: null, durationDays: 0 };
}

/**
 * Derive intelligent Next Action for each toll plaza
 */
function deriveActionRequired(item: {
  tollPlaza: string;
  dataReceiptStatus: DataReceiptStatus;
  inflowDelayDays: number | null;
  inflowDelayText: string;
  expectedInflowDate: Date | null;
  submissionDate: Date | null;
  receivedDate: Date | null;
  expectedProcessingDate: Date | null;
  processingStatus: ProcessingDeadlineStatus;
  surveyEndDate: Date | null;
  remarks: string;
  submittedDaysText: string;
}): string {
  const {
    dataReceiptStatus,
    inflowDelayText,
    expectedProcessingDate,
    processingStatus,
    surveyEndDate,
    remarks,
    submittedDaysText
  } = item;

  if (dataReceiptStatus === 'Data Not yet Received') {
    if (surveyEndDate) {
      return `Action Required: Follow up urgently with site survey team & SPV on pending data receipt. Survey concluded on ${formatDisplayDate(surveyEndDate)}, but data submission is ${inflowDelayText}.`;
    }
    return `Action Required: Follow up with survey team on pending data submission. Inflow is ${inflowDelayText}.`;
  }

  if (dataReceiptStatus === 'Partially Received') {
    const partialInfo = remarks || submittedDaysText || 'partial data';
    return `Action Required: Follow up for remaining balance survey data. Received ${partialInfo}. Verify pending days and coordinate with site team.`;
  }

  // Data Received
  if (processingStatus === 'Processing Overdue') {
    return `Action Required: Expedite video processing and QA validation. Processing deadline was ${formatDisplayDate(expectedProcessingDate)} and is currently overdue.`;
  }

  if (processingStatus === 'Processing Due Soon') {
    return `Action Required: Prioritize active processing queue. Deadline is approaching on ${formatDisplayDate(expectedProcessingDate)}.`;
  }

  return `Action Required: Monitor processing throughput against target completion deadline (${formatDisplayDate(expectedProcessingDate)}).`;
}

/**
 * Load and parse the TraNac Excel file for Timeline, Stages, and Status Tracking
 */
export async function loadTranacTimelineData(fileBuffer?: ArrayBuffer): Promise<{
  items: TollPlazaTimelineItem[];
  kpis: TranacTimelineKPIs;
  projects: string[];
  rawSheet4Rows: TranacDataRow[];
}> {
  let workbook: XLSX.WorkBook;

  if (fileBuffer) {
    workbook = XLSX.read(fileBuffer, { type: 'array' });
  } else {
    // Dynamically locate the default file via Vite
    const modules: Record<string, string> = (import.meta as any).glob('../data/tranac/*.{xlsx,xls}', { eager: true, query: '?url', import: 'default' });
    const files = Object.keys(modules);
    if (files.length === 0) {
      throw new Error('TraNac Excel file not found in src/data/tranac.');
    }
    files.sort();
    const fileUrl = modules[files[0]] as string;
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch TraNac Excel file.');
    }
    const arrayBuffer = await response.arrayBuffer();
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
  }

  // Primary source of truth is Sheet2 for timeline
  const ws2 = workbook.Sheets['Sheet2'];
  if (!ws2) {
    throw new Error('Sheet2 was not found in the TraNac Excel file.');
  }

  // Also parse Sheet4 for scope info if available
  const sheet4Map = new Map<string, { totalScope: number; processDays: number; completedDays: number; balanceDays: number }>();
  const rawSheet4Rows: TranacDataRow[] = [];

  if (workbook.Sheets['Sheet4']) {
    try {
      const rawData4 = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet4'], { defval: '' });
      for (const row of rawData4 as any[]) {
        const getVal = (possibleNames: string[]) => {
          const key = Object.keys(row).find(k => 
            possibleNames.some(name => k.toLowerCase().replace(/\s+/g, '') === name.toLowerCase().replace(/\s+/g, ''))
          );
          return key ? row[key] : '';
        };

        const rawLocationName = getVal(['Location Name', 'LocationName']);
        if (!rawLocationName || String(rawLocationName).trim() === '') continue;

        const locationName = String(rawLocationName).trim();
        const totalScope = Number(getVal(['Total scope', 'TotalScope'])) || 0;
        const processDays = Number(getVal(['Process(No of days)', 'Process (No of days)', 'Process'])) || 0;
        const completedDays = Number(getVal(['Completed (No of days)', 'Completed(No of days)', 'Completed'])) || 0;
        const balanceDays = Number(getVal(['Balance (No of days)', 'Balance(No of days)', 'Balance'])) || 0;

        sheet4Map.set(locationName.toLowerCase(), {
          totalScope,
          processDays,
          completedDays,
          balanceDays
        });

        let status: TranacDataRow['status'] = 'Pending';
        if (totalScope === 0) status = 'No Data';
        else if (balanceDays === 0) status = 'Completed';
        else if (processDays > 0 || completedDays > 0) status = 'In Process';

        rawSheet4Rows.push({
          srNo: rawSheet4Rows.length + 1,
          locationName,
          location: String(getVal(['Location'])).trim(),
          totalScope,
          processDays,
          completedDays,
          balanceDays,
          status
        });
      }
    } catch (e) {
      console.warn('Error reading Sheet4 scope data:', e);
    }
  }

  // Parse Sheet2 with cell-coordinate precision
  const range2 = XLSX.utils.decode_range(ws2['!ref'] || 'A1:Z50');
  const rows2: any[][] = [];

  for (let r = 0; r <= range2.e.r; r++) {
    const row: any[] = [];
    for (let c = 0; c <= range2.e.c; c++) {
      const cell = ws2[XLSX.utils.encode_cell({ r, c })];
      row.push(cell ? cell.v : null);
    }
    rows2.push(row);
  }

  const items: TollPlazaTimelineItem[] = [];
  let currentProject = '';
  let currentTableType: 'TVC Survey' | 'Tentative TVC Survey' = 'TVC Survey';

  // Use current system time as reference date for overdue calculations
  const referenceDate = new Date();

  for (let r = 0; r < rows2.length; r++) {
    const row = rows2[r];
    const c1 = row[1]; // Sr.No (col B)
    const c2 = row[2]; // Project / Project Stretch (col C)
    const c3 = row[3]; // Toll Plaza (col D)

    // Check header row
    if (typeof c1 === 'string' && c1.includes('Sr.No')) {
      if (row[4] && String(row[4]).toLowerCase().includes('tentative')) {
        currentTableType = 'Tentative TVC Survey';
      } else {
        currentTableType = 'TVC Survey';
      }
      continue;
    }

    // Handle continuation row for multiple submissions (e.g. Lakhasar, Rashidpura second row)
    if ((c1 === null || c1 === undefined || c1 === '') && (c3 === null || c3 === undefined || c3 === '')) {
      const subDate = parseExcelDate(row[11]);
      const subDays = row[12];
      if (subDate || subDays) {
        if (items.length > 0) {
          const lastItem = items[items.length - 1];
          const subItem: AdditionalSubmission = {
            date: subDate,
            formattedDate: formatDisplayDate(subDate),
            days: subDays ? String(subDays).trim() : ''
          };
          lastItem.additionalSubmissions.push(subItem);
        }
      }
      continue;
    }

    // Valid Toll Plaza row
    if (c3 && typeof c3 === 'string' && c3.trim().length > 0) {
      // Forward-fill project stretch across merged cells
      if (c2 && typeof c2 === 'string' && c2.trim().length > 0) {
        currentProject = c2.trim();
      }

      const tollPlaza = c3.trim();
      const rawSurveyPeriod = row[4] ? String(row[4]).trim() : '';
      const { start: surveyStartDate, end: surveyEndDate, durationDays: surveyDurationDays } = parseSurveyPeriod(rawSurveyPeriod);
      const surveyPeriod = (surveyStartDate && surveyEndDate)
        ? `${formatDisplayDate(surveyStartDate)} to ${formatDisplayDate(surveyEndDate)}`
        : rawSurveyPeriod;

      const rawVehicles = row[5];
      let totalVehicles = 0;
      if (typeof rawVehicles === 'number') {
        totalVehicles = rawVehicles;
      } else if (rawVehicles) {
        totalVehicles = parseInt(String(rawVehicles).replace(/,/g, ''), 10) || 0;
      }

      const expectedInflowDate = parseExcelDate(row[6]);
      const expectedProcessingDate = parseExcelDate(row[7]);
      const dataDays = row[8] ? String(row[8]).trim() : '';
      const rawStatus = row[9] ? String(row[9]).trim() : '';
      const receivedDate = parseExcelDate(row[10]);
      const submissionDate = parseExcelDate(row[11]);
      const submittedDaysText = row[12] ? String(row[12]).trim() : '';
      const remarks = row[13] ? String(row[13]).trim() : '';

      // Standardize Data Receipt Status
      let dataReceiptStatus: DataReceiptStatus = 'Data Not yet Received';
      const lowerStatus = rawStatus.toLowerCase();
      if (lowerStatus.includes('received') && !lowerStatus.includes('not') && !lowerStatus.includes('partially')) {
        dataReceiptStatus = 'Data Received';
      } else if (lowerStatus.includes('partially')) {
        dataReceiptStatus = 'Partially Received';
      } else if (lowerStatus.includes('not') || lowerStatus.includes('pending') || !rawStatus) {
        dataReceiptStatus = 'Data Not yet Received';
      }

      // Calculate Inflow Delay
      let inflowDelayDays: number | null = null;
      let inflowDelayText = '-';

      const effectiveActualDate = submissionDate || receivedDate;

      if (dataReceiptStatus === 'Data Received' || dataReceiptStatus === 'Partially Received') {
        if (effectiveActualDate && expectedInflowDate) {
          inflowDelayDays = Math.round((effectiveActualDate.getTime() - expectedInflowDate.getTime()) / (1000 * 60 * 60 * 24));
          if (inflowDelayDays > 0) {
            inflowDelayText = `+${inflowDelayDays}d delay`;
          } else if (inflowDelayDays === 0) {
            inflowDelayText = 'On schedule';
          } else {
            inflowDelayText = `${Math.abs(inflowDelayDays)}d early`;
          }
        } else {
          inflowDelayText = dataReceiptStatus === 'Data Received' ? 'Received' : 'Partial';
        }
      } else {
        // Data Not yet Received
        if (expectedInflowDate) {
          if (referenceDate.getTime() > expectedInflowDate.getTime()) {
            inflowDelayDays = Math.round((referenceDate.getTime() - expectedInflowDate.getTime()) / (1000 * 60 * 60 * 24));
            inflowDelayText = `Overdue by ${inflowDelayDays}d`;
          } else {
            const daysLeft = Math.round((expectedInflowDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
            inflowDelayText = `Expected in ${daysLeft}d`;
          }
        } else {
          inflowDelayText = 'Pending';
        }
      }

      // Processing Deadline Status
      let processingStatus: ProcessingDeadlineStatus = 'Not Recorded';
      let processingDelayDays: number | null = null;

      if (expectedProcessingDate) {
        if (referenceDate.getTime() > expectedProcessingDate.getTime()) {
          processingStatus = 'Processing Overdue';
          processingDelayDays = Math.round((referenceDate.getTime() - expectedProcessingDate.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          const daysToDeadline = Math.round((expectedProcessingDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysToDeadline <= 3) {
            processingStatus = 'Processing Due Soon';
          } else {
            processingStatus = 'On Schedule';
          }
        }
      }

      // Match scope days from Sheet4
      const scopeDays = sheet4Map.get(tollPlaza.toLowerCase());

      const itemData = {
        tollPlaza,
        dataReceiptStatus,
        inflowDelayDays,
        inflowDelayText,
        expectedInflowDate,
        submissionDate,
        receivedDate,
        expectedProcessingDate,
        processingStatus,
        surveyEndDate,
        remarks,
        submittedDaysText
      };

      const actionRequired = deriveActionRequired(itemData);

      items.push({
        id: `plaza-${items.length + 1}-${tollPlaza.replace(/\s+/g, '-').toLowerCase()}`,
        srNo: typeof c1 === 'number' ? c1 : items.length + 1,
        project: currentProject || 'Highway Stretch',
        tollPlaza,
        surveyPeriod,
        surveyStartDate,
        surveyEndDate,
        surveyDurationDays,
        totalVehicles,
        expectedInflowDate,
        receivedDate,
        submissionDate,
        submittedDaysText,
        additionalSubmissions: [],
        dataReceiptStatus,
        inflowDelayDays,
        inflowDelayText,
        expectedProcessingDate,
        actualProcessingCompletionDate: null, // Always "Not Recorded" per specs
        processingStatus,
        processingDelayDays,
        dailyWorkforce: getDailyWorkforceForPlaza(DEMO_DAILY_WORKFORCE, tollPlaza),
        dataDays,
        remarks,
        tableType: currentTableType,
        actionRequired,
        scopeDays
      });
    }
  }

  if (items.length === 0) {
    throw new Error('No usable Toll Plaza records found in Sheet2.');
  }

  // Extract distinct projects
  const projects = Array.from(new Set(items.map(i => i.project))).filter(Boolean);

  // Compute 5 Key Performance Indicators
  const dataReceived = items.filter(i => i.dataReceiptStatus === 'Data Received').length;
  const partiallyReceived = items.filter(i => i.dataReceiptStatus === 'Partially Received').length;
  const dataNotReceived = items.filter(i => i.dataReceiptStatus === 'Data Not yet Received').length;

  const delayedReceiptCount = items.filter(i => 
    (i.dataReceiptStatus === 'Data Received' || i.dataReceiptStatus === 'Partially Received') &&
    i.inflowDelayDays !== null && i.inflowDelayDays > 0
  ).length;

  const overdueReceiptCount = items.filter(i => 
    i.dataReceiptStatus === 'Data Not yet Received' &&
    i.inflowDelayDays !== null && i.inflowDelayDays > 0
  ).length;

  const processingOverdueCount = items.filter(i => i.processingStatus === 'Processing Overdue').length;

  // Total delayed or overdue items
  const delayedOrOverdue = items.filter(i => 
    (i.inflowDelayDays !== null && i.inflowDelayDays > 0) || 
    i.processingStatus === 'Processing Overdue'
  ).length;

  const kpis: TranacTimelineKPIs = {
    totalTollPlazas: items.length,
    dataReceived,
    partiallyReceived,
    dataNotReceived,
    delayedOrOverdue,
    delayedReceiptCount,
    overdueReceiptCount,
    processingOverdueCount
  };

  return { items, kpis, projects, rawSheet4Rows };
}

/**
 * Demo Daily Workforce records.
 * Later, this will be connected to the appropriate Excel sheet.
 * Each record supports: Toll Plaza, Work Date, Number of Members.
 */
export const DEMO_DAILY_WORKFORCE: DailyWorkforceRecord[] = [
  // Udairamsar Toll Plaza (Bikaner-Sikar)
  { tollPlaza: 'Udairamsar Toll Plaza', workDate: '01-Oct-2026', members: 15 },
  { tollPlaza: 'Udairamsar Toll Plaza', workDate: '02-Oct-2026', members: 12 },
  { tollPlaza: 'Udairamsar Toll Plaza', workDate: '03-Oct-2026', members: 10 },
  { tollPlaza: 'Udairamsar Toll Plaza', workDate: '04-Oct-2026', members: 8 },

  // Lakhasar Toll Plaza (Bikaner-Sikar)
  { tollPlaza: 'Lakhasar Toll Plaza', workDate: '01-Oct-2026', members: 14 },
  { tollPlaza: 'Lakhasar Toll Plaza', workDate: '02-Oct-2026', members: 14 },
  { tollPlaza: 'Lakhasar Toll Plaza', workDate: '03-Oct-2026', members: 11 },

  // Tidiayasar Toll Plaza (Bikaner-Sikar)
  { tollPlaza: 'Tidiayasar Toll Plaza', workDate: '01-Oct-2026', members: 12 },
  { tollPlaza: 'Tidiayasar Toll Plaza', workDate: '02-Oct-2026', members: 10 },
  { tollPlaza: 'Tidiayasar Toll Plaza', workDate: '03-Oct-2026', members: 8 },
  { tollPlaza: 'Tidiayasar Toll Plaza', workDate: '04-Oct-2026', members: 6 },

  // Rashidpura Toll Plaza (Bikaner-Sikar)
  { tollPlaza: 'Rashidpura Toll Plaza', workDate: '01-Oct-2026', members: 9 },
  { tollPlaza: 'Rashidpura Toll Plaza', workDate: '02-Oct-2026', members: 9 },
  { tollPlaza: 'Rashidpura Toll Plaza', workDate: '03-Oct-2026', members: 7 },

  // Thiryakhetal Toll Plaza (Moradabad-Bareilly)
  { tollPlaza: 'Thiryakhetal Toll Plaza', workDate: '01-Oct-2026', members: 16 },
  { tollPlaza: 'Thiryakhetal Toll Plaza', workDate: '02-Oct-2026', members: 14 },

  // Niyamatpur Ekrotiya Toll Plaza (Moradabad-Bareilly)
  { tollPlaza: 'Niyamatpur Ekrotiya Toll Plaza', workDate: '01-Oct-2026', members: 18 },
  { tollPlaza: 'Niyamatpur Ekrotiya Toll Plaza', workDate: '02-Oct-2026', members: 15 },

  // Sawaleshwar Toll Plaza (Pune-Solapur)
  { tollPlaza: 'Sawaleshwar Toll Plaza', workDate: '02-Oct-2026', members: 13 },
  { tollPlaza: 'Sawaleshwar Toll Plaza', workDate: '03-Oct-2026', members: 11 },

  // Varwade Toll Plaza (Pune-Solapur)
  { tollPlaza: 'Varwade Toll Plaza', workDate: '02-Oct-2026', members: 10 },
  { tollPlaza: 'Varwade Toll Plaza', workDate: '03-Oct-2026', members: 8 }
];

/**
 * Filter workforce records strictly for a specific toll plaza.
 * Displays only dates with available records.
 */
export function getDailyWorkforceForPlaza(
  records: DailyWorkforceRecord[],
  tollPlazaName: string
): DailyWorkforceRecord[] {
  if (!tollPlazaName) return [];
  const query = tollPlazaName.trim().toLowerCase();
  return records.filter((r) => {
    const item = r.tollPlaza.trim().toLowerCase();
    return item === query || query.includes(item) || item.includes(query);
  });
}

/**
 * Legacy loader preserved for backwards compatibility with any other callers
 */
export async function loadTranacData(): Promise<TranacDataRow[]> {
  const result = await loadTranacTimelineData();
  return result.rawSheet4Rows;
}
