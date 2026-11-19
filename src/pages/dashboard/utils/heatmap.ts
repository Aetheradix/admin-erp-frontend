import type { HeatmapCell } from '@/types/dashboard';
import type { HeatmapMonthHeader } from '../types';

function createPadCell(date: string, dayOfWeek: number): HeatmapCell {
  return {
    date,
    day: 0,
    month: 0,
    year: 0,
    dayOfWeek,
    status: 'future',
    workingHours: 0,
    checkInTime: null,
    checkOutTime: null,
    tooltip: '',
    workMode: 'office',
  };
}

export function sumWorkingHours(cells: HeatmapCell[] | undefined): number {
  if (!cells) return 0;
  return cells.reduce((sum, cell) => sum + (Number(cell.workingHours) || 0), 0);
}

export function buildWeekColumns(cells: HeatmapCell[] | undefined): HeatmapCell[][] {
  if (!cells || cells.length === 0) return [];

  const weeks: HeatmapCell[][] = [];
  let currentWeek: HeatmapCell[] = [];

  const leadingPadCount = cells[0].dayOfWeek;
  for (let pad = 0; pad < leadingPadCount; pad++) {
    currentWeek.push(createPadCell(`pad-pre-${pad}`, pad));
  }

  cells.forEach((cell) => {
    currentWeek.push(cell);
    if (cell.dayOfWeek === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(createPadCell(`pad-post-${currentWeek.length}`, currentWeek.length));
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export function buildMonthHeaders(weeks: HeatmapCell[][]): HeatmapMonthHeader[] {
  if (weeks.length === 0) return [];

  const headers: HeatmapMonthHeader[] = [];
  let lastMonth = -1;

  weeks.forEach((week, colIndex) => {
    const validDay = week.find((cell) => cell.month > 0);
    if (validDay && validDay.month !== lastMonth) {
      const monthDate = new Date(validDay.year, validDay.month - 1, 1);
      headers.push({
        monthName: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        colIndex,
      });
      lastMonth = validDay.month;
    }
  });

  return headers;
}

export function isInteractiveCell(cell: HeatmapCell): boolean {
  return cell.day > 0 && cell.status !== 'future';
}