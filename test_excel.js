import pkg from 'xlsx';
const { readFile, utils, SSF } = pkg;

const workbook = readFile('./src/data/tranac/TraAnac Surveys for 3 ITNL Update - Copy.xlsx');

function parseDate(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') {
    const d = SSF.parse_date_code(val);
    if (!d) return null;
    return new Date(Date.UTC(d.y, d.m - 1, d.d));
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/[\u00A0\s]+/g, ' ').trim();
    const dmyMatch = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      return new Date(Date.UTC(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1])));
    }
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function parseSurveyPeriod(period) {
  if (!period) return { start: null, end: null };
  const parts = period.split(/\s+to\s+/i);
  if (parts.length === 2) {
    return {
      start: parseDate(parts[0]),
      end: parseDate(parts[1])
    };
  }
  return { start: null, end: null };
}

function formatDate(d) {
  if (!d) return 'Not Recorded';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getUTCDate()).padStart(2, '0');
  const m = months[d.getUTCMonth()];
  const y = d.getUTCFullYear();
  return `${day} ${m} ${y}`;
}

const ws2 = workbook.Sheets['Sheet2'];
const range2 = utils.decode_range(ws2['!ref']);
const rows2 = [];
for (let r = 0; r <= range2.e.r; r++) {
  const row = [];
  for (let c = 0; c <= range2.e.c; c++) {
    const cell = ws2[utils.encode_cell({ r, c })];
    row.push(cell ? cell.v : null);
  }
  rows2.push(row);
}

// Parse Sheet4 for scope info if available
const sheet4Map = new Map();
if (workbook.Sheets['Sheet4']) {
  const ws4 = workbook.Sheets['Sheet4'];
  const data4 = utils.sheet_to_json(ws4, { defval: '' });
  for (const r of data4) {
    const name = String(r['Location Name'] || r['LocationName'] || '').trim().toLowerCase();
    if (name) {
      sheet4Map.set(name, {
        totalScope: Number(r['Total scope'] || 0),
        processDays: Number(r['Process(No of days)'] || 0),
        completedDays: Number(r['Completed (No of days)'] || 0),
        balanceDays: Number(r['Balance (No of days)'] || 0),
      });
    }
  }
}

const referenceDate = new Date(Date.UTC(2026, 9, 12)); // Oct 12, 2026

const items = [];
let currentProject = '';
let currentTableType = 'TVC Survey';

for (let r = 0; r < rows2.length; r++) {
  const row = rows2[r];
  const c1 = row[1]; // Sr.No
  const c2 = row[2]; // Project / Project Stretch
  const c3 = row[3]; // Toll Plaza

  if (typeof c1 === 'string' && c1.includes('Sr.No')) {
    if (row[4] && String(row[4]).toLowerCase().includes('tentative')) {
      currentTableType = 'Tentative TVC Survey';
    } else {
      currentTableType = 'TVC Survey';
    }
    continue;
  }

  // Handle multi-row submissions
  if ((c1 === null || c1 === undefined || c1 === '') && (c3 === null || c3 === undefined || c3 === '')) {
    const subDate = parseDate(row[11]);
    const subDays = row[12];
    if (subDate || subDays) {
      if (items.length > 0) {
        const last = items[items.length - 1];
        last.additionalSubmissions.push({
          date: subDate,
          formattedDate: formatDate(subDate),
          days: subDays ? String(subDays).trim() : ''
        });
      }
    }
    continue;
  }

  if (c3 && typeof c3 === 'string' && c3.trim().length > 0) {
    if (c2 && typeof c2 === 'string' && c2.trim().length > 0) {
      currentProject = c2.trim();
    }

    const tollPlaza = c3.trim();
    const surveyPeriod = row[4] ? String(row[4]).trim() : '';
    const { start: surveyStartDate, end: surveyEndDate } = parseSurveyPeriod(surveyPeriod);
    const totalVehicles = typeof row[5] === 'number' ? row[5] : (parseInt(String(row[5]).replace(/,/g, '')) || 0);
    const expectedInflowDate = parseDate(row[6]);
    const expectedProcessingDate = parseDate(row[7]);
    const dataDays = row[8] ? String(row[8]).trim() : '';
    const rawStatus = row[9] ? String(row[9]).trim() : '';
    const receivedDate = parseDate(row[10]);
    const submissionDate = parseDate(row[11]);
    const submittedDaysText = row[12] ? String(row[12]).trim() : '';
    const remarks = row[13] ? String(row[13]).trim() : '';

    let dataReceiptStatus = 'Data Not yet Received';
    const lowerStatus = rawStatus.toLowerCase();
    if (lowerStatus.includes('received') && !lowerStatus.includes('not') && !lowerStatus.includes('partially')) {
      dataReceiptStatus = 'Data Received';
    } else if (lowerStatus.includes('partially')) {
      dataReceiptStatus = 'Partially Received';
    } else if (lowerStatus.includes('not') || lowerStatus.includes('pending')) {
      dataReceiptStatus = 'Data Not yet Received';
    }

    // Inflow delay
    let inflowDelayDays = null;
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
        inflowDelayText = 'Received';
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
      }
    }

    // Processing Deadline status
    let processingStatus = 'Not Recorded';
    let processingDelayDays = null;

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

    const scope = sheet4Map.get(tollPlaza.toLowerCase());

    items.push({
      id: `plaza-${items.length + 1}`,
      srNo: typeof c1 === 'number' ? c1 : items.length + 1,
      project: currentProject,
      tollPlaza,
      surveyPeriod,
      surveyStartDate,
      surveyEndDate,
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
      actualProcessingCompletionDate: null, // "Not Recorded"
      processingStatus,
      processingDelayDays,
      dataDays,
      remarks,
      tableType: currentTableType,
      scopeDays: scope
    });
  }
}

console.log(`Parsed ${items.length} items successfully.`);
const kpis = {
  total: items.length,
  received: items.filter(i => i.dataReceiptStatus === 'Data Received').length,
  partial: items.filter(i => i.dataReceiptStatus === 'Partially Received').length,
  notReceived: items.filter(i => i.dataReceiptStatus === 'Data Not yet Received').length,
  delayedOrOverdue: items.filter(i => 
    (i.inflowDelayDays !== null && i.inflowDelayDays > 0) || 
    i.processingStatus === 'Processing Overdue'
  ).length
};
console.log('KPIs:', kpis);


