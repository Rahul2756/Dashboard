import * as XLSX from 'xlsx';
import { TranacDataRow } from '../types/tranac';

export async function loadTranacData(): Promise<TranacDataRow[]> {
  // Use Vite import.meta.glob to dynamically find the file
  const modules = import.meta.glob('../data/tranac/*.{xlsx,xls}', { eager: true, query: '?url', import: 'default' });
  
  const files = Object.keys(modules);
  if (files.length === 0) {
    throw new Error('TraNac Excel file not found.');
  }

  // Use the first file found in alphabetical order
  files.sort();
  const fileUrl = modules[files[0]] as string;

  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch TraNac Excel file.');
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Explicitly require Sheet4
  const sheetName = 'Sheet4';
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error('Sheet4 was not found in the TraNac Excel file.');
  }

  const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  if (!rawData || rawData.length === 0) {
    throw new Error('No usable TraNac data found in Sheet4.');
  }

  const normalizedData: TranacDataRow[] = [];

  for (const row of rawData as any[]) {
    const getVal = (possibleNames: string[]) => {
      const key = Object.keys(row).find(k => 
        possibleNames.some(name => k.toLowerCase().replace(/\\s+/g, '') === name.toLowerCase().replace(/\\s+/g, ''))
      );
      return key ? row[key] : '';
    };

    const rawLocationName = getVal(['Location Name', 'LocationName']);
    if (!rawLocationName || String(rawLocationName).trim() === '') continue;

    const srNo = parseInt(getVal(['Sr.No', 'Sr. No.', 'Sr No', 'SrNo'])) || normalizedData.length + 1;
    const locationName = String(rawLocationName).trim();
    const location = String(getVal(['Location'])).trim();
    
    const cleanNum = (val: any) => {
      if (val === '' || val === null || val === undefined) return 0;
      const num = Number(String(val).replace(/,/g, ''));
      return isNaN(num) ? 0 : num;
    };

    const totalScope = cleanNum(getVal(['Total scope', 'TotalScope']));
    const processDays = cleanNum(getVal(['Process(No of days)', 'Process (No of days)', 'Process']));
    const completedDays = cleanNum(getVal(['Completed (No of days)', 'Completed(No of days)', 'Completed']));
    const balanceDays = cleanNum(getVal(['Balance (No of days)', 'Balance(No of days)', 'Balance']));

    let status: TranacDataRow['status'] = 'Pending';
    if (totalScope === 0) {
      status = 'No Data';
    } else if (balanceDays === 0) {
      status = 'Completed';
    } else if (processDays > 0 || completedDays > 0) {
      status = 'In Process';
    }

    if (totalScope > 0 && (completedDays + processDays + balanceDays !== totalScope)) {
      console.warn(`Data reconciliation warning for location ${locationName}: Completed (${completedDays}) + Process (${processDays}) + Balance (${balanceDays}) != Total Scope (${totalScope}).`);
    }

    normalizedData.push({
      srNo,
      locationName,
      location,
      totalScope,
      processDays,
      completedDays,
      balanceDays,
      status
    });
  }

  if (normalizedData.length === 0) {
    throw new Error('No usable TraNac data found in Sheet4.');
  }

  return normalizedData;
}
