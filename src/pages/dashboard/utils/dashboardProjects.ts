import type { Project, Task } from '@/types/models';
import { createGroupMap } from '@/shared/utils/lookup';
import { PRESET_COLORS } from '../constants';
import type { RawProjectRow } from '../types';

export function mapDashboardProjects(
  rawProjects: unknown,
  rawTasks: Task[] | undefined,
  userCount: number
): Project[] {
  if (!Array.isArray(rawProjects)) return [];

  const tasks = Array.isArray(rawTasks) ? rawTasks : [];
  const tasksByProject = createGroupMap(tasks, (task) => String(task?.project_id));

  return (rawProjects as RawProjectRow[]).map((project, index) => {
    const projectId = project?.id || project?.project_id || index + 1;
    const matchingTasks = tasksByProject.get(String(projectId)) ?? [];

    return {
      id: String(projectId),
      title: project?.title || project?.project_name || project?.name || `Project #${projectId}`,
      tasks: matchingTasks.length,
      value: project?.value || project?.project_status || project?.status || 'Active',
      color: project?.color || PRESET_COLORS[index % PRESET_COLORS.length],
      category: (
        project?.category ||
        project?.project_status ||
        project?.status ||
        'Enterprise'
      ).toUpperCase(),
      participants: project?.participants || Math.min(userCount, 6),
      startDate: project?.startDate || project?.start_date,
      endDate: project?.endDate || project?.end_date,
      status: project?.status || project?.project_status || 'Active',
      progress: project?.progress ?? 0,
    };
  });
}