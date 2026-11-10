export type { Project } from '@/types/models';

export interface Node {
  id: string;
  name: string;
  role: string;
  parentId?: string;
  image: string;
}

export const mockProjects: import('@/types/models').Project[] = [];
export const mockHierarchy: Node[] = [];
