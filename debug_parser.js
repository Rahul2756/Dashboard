import * as fs from 'fs';
import * as XLSX from 'xlsx';

const WORK_TYPE_MAP = {
  'enexco': 'E-NEXCO',
  'e-nexco': 'E-NEXCO',
  'enexco ': 'E-NEXCO',
  'hirate': 'HiRATE',
  'traana': 'TraNac',
  'tranac': 'TraNac',
};

const KNOWN_WORK_ASSIGNMENTS = [
  'e-nexco', 'hirate', 'tranac', 'coding', 'labelling', 'typing', 'wop', 'safety'
];

export const normalizeName = (name) => {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
};

export const normalizeWorkType = (value) => {
  if (!value) return '';
  const lower = value.trim().toLowerCase();
  
  if (WORK_TYPE_MAP[lower]) {
    return WORK_TYPE_MAP[lower];
  }
  
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const normalizeStatus = (value) => {
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

const filePath = 'public/data/Work alltoment sheet (April to Sept 26).xlsx';
const buf = fs.readFileSync(filePath);
const workbook = XLSX.read(buf, { type: 'buffer' });

const getLatestMonthSheet = (sheetNames) => {
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

const latestSheetName = getLatestMonthSheet(workbook.SheetNames);
console.log("Dynamically selected sheet:", latestSheetName);
const worksheet = workbook.Sheets[latestSheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

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

const headerRow = data[headerRowIdx];
const nameColIdx = headerRow.findIndex(cell => typeof cell === 'string' && cell.trim().toUpperCase() === 'NAME');

const dateColIndices = [];
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

console.log("Date column indices:", dateColIndices);
console.log("Date column headers:", dateColIndices.map(c => headerRow[c]));

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

console.log("Selected latest date column idx:", latestPopulatedDateColIdx, "Header:", headerRow[latestPopulatedDateColIdx]);

const employees = [];
const seenIds = new Set();
for (let r = headerRowIdx + 1; r < data.length; r++) {
  const row = data[r];
  if (!row || !Array.isArray(row)) continue;

  const rawName = row[nameColIdx];
  if (!rawName || String(rawName).trim() === '') continue;

  const name = normalizeName(String(rawName));
  const idKey = name.toLowerCase();
  if (seenIds.has(idKey)) continue;
  seenIds.add(idKey);

  const rawDailyValue = row[latestPopulatedDateColIdx] ? String(row[latestPopulatedDateColIdx]).trim() : '';
  const status = normalizeStatus(rawDailyValue);
  
  employees.push({ name: rawName, status, rawDailyValue });
}

const numL = employees.filter(e => e.status === 'Absent').length;
const numP = employees.filter(e => e.status === 'Present').length;
const numUnknown = employees.filter(e => e.status === 'Unknown').length;

console.log("Absent (L):", numL);
console.log("Present (P/Work):", numP);
console.log("Unknown:", numUnknown);
console.log("Total Employees:", employees.length);
