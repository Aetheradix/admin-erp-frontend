export type Task = {
  id: string;
  title: string;
  assignee: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  project: string;
  dueDate: string;
};
