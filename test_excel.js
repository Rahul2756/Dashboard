import pkg from 'xlsx';
const { readFile, utils } = pkg;

const workbook = readFile('./public/data/Work alltoment sheet (April to Sept 26).xlsx');
console.log("Sheet names:");
console.log(workbook.SheetNames);

for (let sheetName of workbook.SheetNames.slice(0, 5)) {
    console.log(`\nHeaders for ${sheetName}:`);
    const sheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(sheet, { header: 1 });
    if (data && data.length > 0) {
        for (let i = 0; i < Math.min(10, data.length); i++) {
             console.log(`Row ${i}:`, data[i]);
        }
    }
}
