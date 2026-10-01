import * as fs from 'fs';
import * as XLSX from 'xlsx';

const filePath = 'public/data/Work alltoment sheet (April to Sept 26).xlsx';
const buf = fs.readFileSync(filePath);
const workbook = XLSX.read(buf, { type: 'buffer' });

console.log('Sheet Names:', workbook.SheetNames);
for (const sheetName of workbook.SheetNames) {
  if (sheetName.toLowerCase().includes('2026')) {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('First 6 rows:');
    for (let i = 0; i < Math.min(6, data.length); i++) {
        console.log(`Row ${i}:`, data[i]);
    }
  }
}
