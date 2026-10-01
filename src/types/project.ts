export interface ProjectRecord {
  id: string;
  projectName: string;
  chainageStart: number;
  chainageEnd: number;
  lanes: number;
  surveyStarting?: string;
  surveyEnding?: string;
  dataReceived?: string;
  dataUpdatedEnexco?: string;
  
  roughnessCompleted?: string;
  ruttingCompleted?: string;
  pavementEvalCompleted?: string;
}

export type ReportType = 'Roughness' | 'Rutting' | 'Pavement Evaluation';

export interface ReportStatus {
  status: 'Completed On Time' | 'Delayed' | 'In Progress – Within SLA' | 'In Progress – SLA Overdue' | 'Not Started';
  dueDate?: string;
  delayDays?: number;
}
