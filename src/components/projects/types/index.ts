export interface Project {
  id: string;
  name: string;
  status: 'in-progress' | 'completed' | 'pending' | 'draft';
  progress: number;
  team: string;
  lead: string;
  deadline: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  members: number;
}
