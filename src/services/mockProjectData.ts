import { ProjectRecord } from '../types/project';

export const mockProjects: ProjectRecord[] = [
  {
    id: 'proj-1',
    projectName: 'GAEPL',
    chainageStart: 23.600,
    chainageEnd: 149.500,
    lanes: 6,
    surveyStarting: '2026-09-01',
    surveyEnding: '2026-09-15',
    dataReceived: '2026-09-18',
    dataUpdatedEnexco: '2026-09-23',
    roughnessCompleted: '2026-09-29',
    ruttingCompleted: '2026-10-02',
    // pavementEvalCompleted is undefined to show In Progress
  },
  {
    id: 'proj-2',
    projectName: 'NH-44 Hyderabad-Bangalore',
    chainageStart: 10.000,
    chainageEnd: 120.000,
    lanes: 4,
    surveyStarting: '2026-09-10',
    surveyEnding: '2026-09-20',
    dataReceived: '2026-09-22',
    dataUpdatedEnexco: '2026-09-25',
    // Currently no completions, all should be In Progress or Delayed depending on today's date
  },
  {
    id: 'proj-3',
    projectName: 'Mumbai-Pune Expressway',
    chainageStart: 0.000,
    chainageEnd: 94.500,
    lanes: 6,
    surveyStarting: '2026-08-15',
    surveyEnding: '2026-08-25',
    dataReceived: '2026-08-28',
    dataUpdatedEnexco: '2026-08-30',
    roughnessCompleted: '2026-09-05', // On time (30th + 7 = Sep 6)
    ruttingCompleted: '2026-09-12', // Delayed (30th + 10 = Sep 9)
    pavementEvalCompleted: '2026-09-15' // Delayed (30th + 15 = Sep 14)
  },
  {
    id: 'proj-4',
    projectName: 'Delhi-Meerut Expressway',
    chainageStart: 0.000,
    chainageEnd: 96.000,
    lanes: 14,
    // Not started yet
  }
];
