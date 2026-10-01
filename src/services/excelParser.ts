import * as XLSX from 'xlsx';
import { Employee, ExcelParseResult } from '../types';

const FILE_URL = '/data/Work alltoment sheet (April to Sept 26).xlsx';

const WORK_TYPE_MAP: Record<string, string> = {
  'enexco': 'E-NEXCO',
  'e-nexco': 'E-NEXCO',
  'enexco ': 'E-NEXCO',
  'hirate': 'HiRATE',
  'traana': 'TraNac',
  'tranac': 'TraNac',
  'r&d lab': 'R&D Lab',
};

const KNOWN_WORK_ASSIGNMENTS = [
  'e-nexco', 'hirate', 'tranac', 'coding', 'ai', 'labelling', 'typing', 'wop', 'safety', 'accounts', 'r&d lab'
];

const EXCLUDED_NAMES = [
  'g kistaiah',
  'katravath mohan rathod',
  'mohammed yaqoob khan',
  'mudavath ramesh'
];

export const normalizeName = (name: string): string => {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
};

export const normalizeWorkType = (value: string): string => {
  if (!value) return '';
  const lower = value.trim().toLowerCase();
  
  if (WORK_TYPE_MAP[lower]) {
    return WORK_TYPE_MAP[lower];
  }
  
  // Standardize capitalization for words not in the map (e.g. "safety" -> "Safety")
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const normalizeStatus = (value: string): string => {
  if (!value) return 'Unknown';
  
  const lower = value.trim().toLowerCase();
  
  if (lower === 'p') return 'Present';
  if (lower === 'l') return 'Absent';
  if (lower === 'h') return 'Holiday';
  
  const normalizedWork = normalizeWorkType(lower);
  if (KNOWN_WORK_ASSIGNMENTS.includes(normalizedWork.toLowerCase()) || KNOWN_WORK_ASSIGNMENTS.includes(lower)) {
    return 'Present';
  }
  
  return 'Unknown';
};

export const getLatestMonthSheet = (sheetNames: string[]): string | null => {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  let latestSheet = null;
  let latestDate = 0;

  for (const name of sheetNames) {
    const lowerName = name.toLowerCase();
    const parts = lowerName.split('-');
    if (parts.length >= 2) {
      const monthStr = parts[0].substring(0, 3);
      const yearStr = parts[1];
      
      const monthIdx = months.indexOf(monthStr);
      if (monthIdx !== -1 && !isNaN(parseInt(yearStr))) {
        const dateVal = parseInt(yearStr) * 100 + monthIdx;
        if (dateVal > latestDate) {
          latestDate = dateVal;
          latestSheet = name;
        }
      }
    }
  }
  
  return latestSheet;
};

export const parseMonthlySheet = (worksheet: XLSX.WorkSheet): ExcelParseResult => {
  const data = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
  const emptyResult: ExcelParseResult = { employees: [], totalNamesInExcel: 0, availableDates: [], allDataByDate: {}, latestDateColIdx: -1 };
  if (!data || data.length === 0) return emptyResult;

  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    if (row && Array.isArray(row)) {
      const hasName = row.some(cell => typeof cell === 'string' && cell.trim().toUpperCase() === 'NAME');
      if (hasName) {
        headerRowIdx = i;
        break;
      }
    }
  }

  if (headerRowIdx === -1) {
    console.error("Could not find header row with 'NAME'");
    return emptyResult;
  }

  const headerRow = data[headerRowIdx];
  const nameColIdx = headerRow.findIndex(cell => typeof cell === 'string' && cell.trim().toUpperCase() === 'NAME');
  
  const dateColIndices: number[] = [];
  const stopWords = ['leave', 'paid leave', 'holiday', 'present', 'total', 'payment', 'travel pay'];
  
  for (let c = nameColIdx + 1; c < headerRow.length; c++) {
    const cell = headerRow[c];
    if (cell === undefined || cell === null) continue;
    
    if (typeof cell === 'string' && stopWords.includes(cell.trim().toLowerCase())) {
      break;
    }
    
    if (typeof cell === 'number') {
      dateColIndices.push(c);
    }
  }

  let latestPopulatedDateColIdx = -1;
  for (let i = dateColIndices.length - 1; i >= 0; i--) {
    const colIdx = dateColIndices[i];
    let hasData = false;
    for (let r = headerRowIdx + 1; r < data.length; r++) {
      const row = data[r];
      if (row && row[nameColIdx] && String(row[nameColIdx]).trim() !== '') {
        const val = row[colIdx];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          hasData = true;
          break;
        }
      }
    }
    if (hasData) {
      latestPopulatedDateColIdx = colIdx;
      break;
    }
  }

  if (latestPopulatedDateColIdx === -1) {
    console.error("No populated dates found");
    return emptyResult;
  }

  const availableDates = dateColIndices.map(colIdx => {
    let label = String(headerRow[colIdx]);
    const rawVal = headerRow[colIdx];
    if (typeof rawVal === 'number') {
      try {
        label = XLSX.SSF.format('d-mmm-yy', rawVal);
      } catch (e) {
        // Fallback
      }
    }
    return { colIdx, label, rawValue: rawVal };
  });

  const allDataByDate: Record<number, Employee[]> = {};
  dateColIndices.forEach(col => {
    allDataByDate[col] = [];
  });

  const seenIds = new Set<string>();
  let totalNamesInExcel = 0;

  for (let r = headerRowIdx + 1; r < data.length; r++) {
    const row = data[r];
    if (!row || !Array.isArray(row)) continue;

    const rawName = row[nameColIdx];
    if (!rawName || String(rawName).trim() === '') continue;

    const name = normalizeName(String(rawName));
    
    // Completely ignore excluded names
    if (EXCLUDED_NAMES.includes(name.toLowerCase())) {
      continue;
    }

    const rawSNo = row[nameColIdx - 1];
    const sNo = rawSNo !== undefined && !isNaN(Number(rawSNo)) ? parseInt(String(rawSNo), 10) : totalNamesInExcel + 1;
    
    // Check duplicates based on name
    const idKey = name.toLowerCase();
    if (seenIds.has(idKey)) {
      continue;
    }
    seenIds.add(idKey);
    totalNamesInExcel++;

    // For each date, create an employee record if they are not blank on that date
    dateColIndices.forEach(colIdx => {
      const rawDailyValue = row[colIdx] ? String(row[colIdx]).trim() : '';
      if (!rawDailyValue) {
        return;
      }
      
      const status = normalizeStatus(rawDailyValue);
      
      let workType = 'Unknown';
      const lowerRaw = rawDailyValue.toLowerCase();
      
      if (KNOWN_WORK_ASSIGNMENTS.includes(lowerRaw) || WORK_TYPE_MAP[lowerRaw]) {
        workType = normalizeWorkType(rawDailyValue);
      }

      allDataByDate[colIdx].push({
        id: `${idKey}-${colIdx}`,
        sNo: isNaN(sNo) ? 999 : sNo,
        name,
        workType,
        status: status as any,
        rawDailyValue
      });
    });
  }

  const employees = allDataByDate[latestPopulatedDateColIdx] || [];

  return { employees, totalNamesInExcel, availableDates, allDataByDate, latestDateColIdx: latestPopulatedDateColIdx };
};

export const loadExcelData = async (): Promise<ExcelParseResult> => {
  try {
    const response = await fetch(FILE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const latestSheetName = getLatestMonthSheet(workbook.SheetNames);
    
    if (!latestSheetName) {
      throw new Error("Unable to identify the employee data structure. No valid monthly sheet found.");
    }
    
    const worksheet = workbook.Sheets[latestSheetName];
    const result = parseMonthlySheet(worksheet);

    if (result.employees.length === 0) {
      throw new Error("Excel file contains no usable employee data.");
    }
    
    return result;
  } catch (error) {
    console.error("Error loading Excel data:", error);
    throw error;
  }
};
