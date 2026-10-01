export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Not entered';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const diffDays = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getReportStatus = (
  workStartDate?: string,
  actualCompletionDate?: string,
  slaDays?: number
) => {
  if (!workStartDate || !slaDays) {
    return { status: 'Not Started' };
  }

  const dueDate = addDays(workStartDate, slaDays);
  
  if (actualCompletionDate) {
    const delay = diffDays(actualCompletionDate, dueDate);
    if (delay <= 0) {
      return { status: 'Completed On Time', dueDate, delayDays: 0 };
    } else {
      return { status: 'Delayed', dueDate, delayDays: delay };
    }
  } else {
    // In progress check against today
    const today = new Date().toISOString().split('T')[0];
    const delay = diffDays(today, dueDate);
    if (delay > 0) {
      return { status: 'In Progress – SLA Overdue', dueDate, delayDays: delay };
    } else {
      return { status: 'In Progress – Within SLA', dueDate, delayDays: 0 };
    }
  }
};
