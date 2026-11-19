const pad2 = (value: number): string => String(value).padStart(2, '0');

export function buildDayKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export interface MonthLayout {
  leadingBlanks: number;
  daysInMonth: number;
}

export function getMonthLayout(year: number, month: number): MonthLayout {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { leadingBlanks: firstWeekday, daysInMonth };
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}
