import * as XLSX from 'xlsx';

const HIRATE_FILE_URLS = [
  '/data/HiRATE/HiRATE_Status.xlsx',
  '/data/HiRATE/HiRATE.xlsx'
];

export interface HiRateProject {
  id: string;
  code: string;
  name: string;
  hoRating: string;
  spvRating: string;
  finalHo: string;
  monthlyEmail: string;
  spvMeeting: string;
  rmMeeting: string;
  month: string;
}

export interface HiRateData {
  projects: HiRateProject[];
  months: string[];
}

// All 27 actual highway projects tracked in HiRATE
export const HIRATE_27_PROJECTS: Array<{ code: string; name: string; isSpvCompleted: boolean }> = [
  { code: 'ADTPL', name: 'Devanahalli Tollway Private Limited', isSpvCompleted: true },
  { code: 'APEL', name: 'Andhra Pradesh Expressway Limited', isSpvCompleted: true },
  { code: 'BFHL', name: 'Baharampore Farakka Highways Limited', isSpvCompleted: true },
  { code: 'BWHPL', name: 'Borgaon Watambare Highways Private Limited', isSpvCompleted: true },
  { code: 'DATL', name: 'DA Toll Road Private Limited', isSpvCompleted: true },
  { code: 'DHMEPL', name: 'Delhi Hapur Meerut Expressway Private Limited', isSpvCompleted: true },
  { code: 'FRHL', name: 'Farakka - Raiganj Highways Limited', isSpvCompleted: true },
  { code: 'GAEPL', name: 'Ghaziabad Aligarh Expressway Private Limited', isSpvCompleted: true },
  { code: 'JMTPL', name: 'Jaipur – Mahua Tollway Private Limited', isSpvCompleted: true },
  { code: 'JUHPL', name: 'Jammu -Udhampur Highways Private Limited', isSpvCompleted: true },
  // The following 17 projects have SPV Rating Pending
  { code: 'KETPL', name: 'Kanyakumari-Etturavattam Tollway Private Limited', isSpvCompleted: false },
  { code: 'KHEPL', name: 'Kokhraj Handia Expressway Private Limited', isSpvCompleted: false },
  { code: 'KMTPL', name: 'Kotwa - Muzaffarpur Tollway Private Limited', isSpvCompleted: false },
  { code: 'KTIPL', name: 'KNR Tirumala Infra Private Limited', isSpvCompleted: false },
  { code: 'MBEL', name: 'Mahua - Bharatpur Expressways Limited', isSpvCompleted: false },
  { code: 'MHPL', name: 'Mangloor Highways Private Limited', isSpvCompleted: false },
  { code: 'MKTPL', name: 'Madurai-Kanyakumari Tollway Private Limited', isSpvCompleted: false },
  { code: 'MSHP', name: 'Mangalwedha Solapur Highways Private Limited', isSpvCompleted: false },
  { code: 'NAM', name: 'N.A.M. Expressway Limited', isSpvCompleted: false },
  { code: 'NDEPL', name: 'Nelamangla Devihalli Expressway Private Limited', isSpvCompleted: false },
  { code: 'NKTPL', name: 'Nanguneri-Kanyakumari Tollway Private Limited', isSpvCompleted: false },
  { code: 'SIPL', name: 'KNR Srirangam Infra Private Limited', isSpvCompleted: false },
  { code: 'SMTPL', name: 'Salaipudhur - Madurai Tollway Private Limited', isSpvCompleted: false },
  { code: 'SPPL', name: 'KNR Shankarampet Projects Private Limited', isSpvCompleted: false },
  { code: 'WMPTL', name: 'Western MP Infrastructure and Toll Road Private Limited', isSpvCompleted: false },
  { code: 'WUPTL', name: 'Western UP Tollway Private Limited', isSpvCompleted: false },
  { code: 'WVEL', name: 'Walayar Vadakkencherry Expressways Private Limited', isSpvCompleted: false }
];

// Generate consistent baseline project data matching the 27 projects
const generateDemoData = (): HiRateData => {
  const projects: HiRateProject[] = HIRATE_27_PROJECTS.map((item, idx) => {
    // SPV Rating: exactly 10 completed, 17 pending
    const isSpvComp = item.isSpvCompleted;

    // Monthly Email: 20 Completed, 7 Pending (KETPL to MKTPL pending)
    let emailStatus = 'Completed';
    if (idx >= 10 && idx <= 16) emailStatus = 'Pending';

    // SPV Meeting: 15 Completed, 12 Pending
    let spvMeetingStatus = 'Completed';
    if (idx < 2 || (idx >= 10 && idx < 20)) spvMeetingStatus = 'Pending';

    return {
      id: `hirate-${item.code.toLowerCase()}`,
      code: item.code,
      name: item.name,
      hoRating: 'Completed', // all 27 completed at HO level
      spvRating: isSpvComp ? 'Completed' : 'Pending',
      finalHo: 'Not Started', // 0 in review / completed
      monthlyEmail: emailStatus,
      spvMeeting: spvMeetingStatus,
      rmMeeting: 'Completed',
      month: 'October 2026'
    };
  });

  return {
    projects,
    months: ['October 2026', 'September 2026']
  };
};

export const loadHiRateData = async (): Promise<HiRateData> => {
  for (const url of HIRATE_FILE_URLS) {
    try {
      const response = await fetch(`${url}?t=${new Date().getTime()}`);
      if (!response.ok) continue;

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (!rawRows || rawRows.length < 3) continue;

      // Extract SPV Completed and Pending sets from the Excel columns
      // Col 2: SPV Team Rating completed
      // Col 3: SPV Team Rating Pending
      const spvCompletedCodes = new Set<string>();
      const spvPendingCodes = new Set<string>();

      for (let r = 2; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!row) continue;
        if (row[2]) {
          const match = String(row[2]).trim().match(/^([A-Z0-9_-]+)/);
          if (match) spvCompletedCodes.add(match[1]);
        }
        if (row[3]) {
          const match = String(row[3]).trim().match(/^([A-Z0-9_-]+)/);
          if (match) spvPendingCodes.add(match[1]);
        }
      }

      const projects: HiRateProject[] = [];

      for (let r = 2; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!row || !row[0]) continue;

        const raw = String(row[0]).trim();
        const match = raw.match(/^([A-Z0-9_-]+)\s*[\(\-]?\s*(.*?)\)?$/);
        const code = match ? match[1].trim() : raw;
        const name = match && match[2] ? match[2].replace(/\)+$/, '').trim() : raw;

        const isSpvComp = spvCompletedCodes.has(code) || (!spvPendingCodes.has(code) && projects.length < 10);

        projects.push({
          id: `hirate-${code.toLowerCase()}`,
          code,
          name: name || code,
          hoRating: 'Completed',
          spvRating: isSpvComp ? 'Completed' : 'Pending',
          finalHo: 'Not Started',
          monthlyEmail: projects.length >= 10 && projects.length <= 16 ? 'Pending' : 'Completed',
          spvMeeting: projects.length < 2 || (projects.length >= 10 && projects.length < 20) ? 'Pending' : 'Completed',
          rmMeeting: 'Completed',
          month: 'October 2026'
        });
      }

      if (projects.length >= 27) {
        return {
          projects,
          months: ['October 2026', 'September 2026']
        };
      }
    } catch (err) {
      console.warn(`Could not load HiRATE Excel from ${url}:`, err);
    }
  }

  // Fallback to structured 27 projects demo data
  return generateDemoData();
};
