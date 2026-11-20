export interface ProjectPhase {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  sortOrder: number;
  ownerId?: number;
  ownerName?: string;
  startDate?: string;
  endDate?: string;
  color?: string;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PhaseTemplate {
  id: number;
  name: string;
  description?: string;
  projectType: string;
  phases: {
    name: string;
    description?: string;
    color?: string;
    durationDays?: number;
  }[];
}
