import type { Dependency, DependencyType, ProjectTask, AutoShiftMode } from '@/types/project';

export interface ScheduleCalculationResult {
  tasks: ProjectTask[];
  shiftedTasks: { id: number; title: string; oldStart: string; newStart: string }[];
  conflicts: { taskId: number; message: string }[];
}

/**
 * Checks if a date falls on a weekend (Saturday = 6, Sunday = 0).
 */
export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Rolls date forward if it falls on Saturday or Sunday.
 */
export function rollToNextWorkingDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  while (isWeekend(d)) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().split('T')[0];
}

/**
 * Adds working days to a start date, skipping weekends.
 */
export function addWorkingDays(startDateStr: string, days: number): string {
  const d = new Date(startDateStr + 'T00:00:00');
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) {
      added++;
    }
  }
  return d.toISOString().split('T')[0];
}

/**
 * Difference in working days between two dates.
 */
export function getWorkingDaysDiff(startStr: string, endStr: string): number {
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  if (start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (!isWeekend(cur)) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(1, count);
}

/**
 * Cycle detection using Depth-First Search.
 * Returns the cycle path (e.g., [1, 2, 3, 1]) if a cycle exists, or null.
 */
export function detectCycle(dependencies: Dependency[], taskIds: number[]): number[] | null {
  const adj = new Map<number, number[]>();
  taskIds.forEach((id) => adj.set(id, []));

  dependencies.forEach((dep) => {
    if (adj.has(dep.predecessorId)) {
      adj.get(dep.predecessorId)?.push(dep.successorId);
    }
  });

  const visited = new Set<number>();
  const recStack = new Set<number>();
  const path: number[] = [];

  const dfs = (curr: number): boolean => {
    visited.add(curr);
    recStack.add(curr);
    path.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        if (dfs(next)) return true;
      } else if (recStack.has(next)) {
        path.push(next);
        return true;
      }
    }

    recStack.delete(curr);
    path.pop();
    return false;
  };

  for (const id of taskIds) {
    if (!visited.has(id)) {
      if (dfs(id)) return path;
    }
  }
  return null;
}

/**
 * Evaluates dependency constraint and returns the earliest allowable start date.
 */
export function calculateEarliestStart(
  predStart: string,
  predDue: string,
  depType: DependencyType,
  lagDays: number,
  succDurationDays: number
): string {
  switch (depType) {
    case 'FS':
      // Successor starts after predecessor finishes + 1 + lag
      return addWorkingDays(predDue, 1 + lagDays);
    case 'SS':
      // Successor starts after predecessor starts + lag
      return addWorkingDays(predStart, lagDays);
    case 'FF': {
      // Successor finishes after predecessor finishes + lag
      const targetFinish = addWorkingDays(predDue, lagDays);
      // Derive start from finish
      const targetDate = new Date(targetFinish + 'T00:00:00');
      targetDate.setDate(targetDate.getDate() - (succDurationDays - 1));
      return rollToNextWorkingDay(targetDate.toISOString().split('T')[0]);
    }
    case 'SF':
      return addWorkingDays(predStart, lagDays);
  }
}

/**
 * Main Scheduling Engine:
 * Topologically sorts tasks, applies auto-shift, and computes Critical Path & Float.
 */
export function runScheduler(
  tasks: ProjectTask[],
  dependencies: Dependency[],
  autoShiftMode: AutoShiftMode = 'flexible'
): ScheduleCalculationResult {
  const taskMap = new Map<number, ProjectTask>(tasks.map((t) => [t.id, { ...t }]));
  const shiftedTasks: { id: number; title: string; oldStart: string; newStart: string }[] = [];
  const conflicts: { taskId: number; message: string }[] = [];

  // Group dependencies by successor
  const predMap = new Map<number, Dependency[]>();
  dependencies.forEach((dep) => {
    if (!predMap.has(dep.successorId)) predMap.set(dep.successorId, []);
    predMap.get(dep.successorId)!.push(dep);
  });

  if (autoShiftMode !== 'off') {
    // Propagate shifts forward
    let hasChanges = true;
    let iteration = 0;
    while (hasChanges && iteration < 50) {
      hasChanges = false;
      iteration++;

      for (const [succId, deps] of predMap.entries()) {
        const succ = taskMap.get(succId);
        if (!succ || !succ.startDate || !succ.dueDate) continue;

        for (const dep of deps) {
          const pred = taskMap.get(dep.predecessorId);
          if (!pred || !pred.startDate || !pred.dueDate) continue;

          const earliestAllowed = calculateEarliestStart(
            pred.startDate,
            pred.dueDate,
            dep.depType,
            dep.lagDays,
            succ.durationDays || 1
          );

          if (autoShiftMode === 'strict' || succ.startDate < earliestAllowed) {
            if (succ.startDate !== earliestAllowed) {
              const oldStart = succ.startDate;
              succ.startDate = earliestAllowed;
              succ.dueDate = addWorkingDays(earliestAllowed, (succ.durationDays || 1) - 1);
              shiftedTasks.push({
                id: succ.id,
                title: succ.title,
                oldStart,
                newStart: succ.startDate,
              });
              hasChanges = true;
            }
          }
        }
      }
    }
  } else {
    // AutoShift is Off: Record conflicts without moving dates
    for (const [succId, deps] of predMap.entries()) {
      const succ = taskMap.get(succId);
      if (!succ || !succ.startDate) continue;

      for (const dep of deps) {
        const pred = taskMap.get(dep.predecessorId);
        if (!pred || !pred.dueDate) continue;

        const earliestAllowed = calculateEarliestStart(
          pred.startDate || pred.dueDate,
          pred.dueDate,
          dep.depType,
          dep.lagDays,
          succ.durationDays || 1
        );

        if (succ.startDate < earliestAllowed) {
          conflicts.push({
            taskId: succ.id,
            message: `Starts before predecessor "${pred.title}" allows (earliest: ${earliestAllowed})`,
          });
        }
      }
    }
  }

  // Calculate Critical Path (Float <= 0)
  const scheduledList = Array.from(taskMap.values());
  let maxProjectDate = '';
  scheduledList.forEach((t) => {
    if (t.dueDate && (!maxProjectDate || t.dueDate > maxProjectDate)) {
      maxProjectDate = t.dueDate;
    }
  });

  if (maxProjectDate) {
    scheduledList.forEach((t) => {
      if (t.dueDate) {
        const diff = getWorkingDaysDiff(t.dueDate, maxProjectDate) - 1;
        t.totalFloatDays = Math.max(0, diff);
        t.isCritical = t.totalFloatDays <= 0;
      }
    });
  }

  return {
    tasks: scheduledList,
    shiftedTasks,
    conflicts,
  };
}
