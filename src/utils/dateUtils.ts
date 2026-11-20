export const formatDateTimeVi = (isoStr?: string): string => {
  if (!isoStr) return 'Chưa ghi nhận';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch {
    return isoStr;
  }
};

export const formatDateVi = (dateStr?: string): string => {
  if (!dateStr) return 'Chưa ghi nhận';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

export const getIssueAgeInDays = (createdAt: string): number => {
  const created = new Date(createdAt).getTime();
  const now = new Date().getTime();
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const getIssueAgeText = (createdAt: string, status: string): string => {
  if (status === 'Đã hoàn thành') return 'Đã xong';
  const days = getIssueAgeInDays(createdAt);
  if (days === 0) return 'Hôm nay';
  if (days < 7) return `${days} ngày`;
  const weeks = Math.floor(days / 7);
  const remainDays = days % 7;
  if (remainDays === 0) return `${weeks} tuần`;
  return `${weeks} tuần ${remainDays} ngày`;
};

export const getAgeBracket = (createdAt: string): '<1w' | '1-2w' | '2-4w' | '>4w' => {
  const days = getIssueAgeInDays(createdAt);
  if (days < 7) return '<1w';
  if (days < 14) return '1-2w';
  if (days < 28) return '2-4w';
  return '>4w';
};

export const getIsoWeek = (d: Date): { year: number; week: number; weekStr: string } => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return {
    year: date.getFullYear(),
    week,
    weekStr: `${date.getFullYear()}-W${String(week).padStart(2, '0')}`
  };
};

export const isFutureDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return date.getTime() > now.getTime();
};

