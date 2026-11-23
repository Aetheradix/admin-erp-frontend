export interface DepartmentMember {
  userId: number;
  userName: string;
  email: string;
  designation: string;
  departmentId: number;
  departmentName: string;
  teamId?: number;
  teamName?: string;
  reportingManagerId?: number;
  reportingManagerName?: string;
  isTeamLeader: boolean;
  isDepartmentHead: boolean;
  employmentStatus: 'Active' | 'Inactive' | 'On Leave';
  joinedAt: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  headUserId?: number;
  headUserName?: string;
  parentDeptId?: number;
  parentDeptName?: string;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
  leadUserId?: number;
  leadUserName?: string;
  memberCount: number;
  isActive: boolean;
}

export interface EmployeeReporting {
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  teamId?: number;
  teamName?: string;
  reportingManagerId?: number;
  reportingManagerName?: string;
  departmentHeadId?: number;
  departmentHeadName?: string;
  designation: string;
  employmentStatus: 'Active' | 'Inactive' | 'On Leave';
}

export interface AssignmentPermissionRule {
  id: number;
  roleKey: string; // 'SuperAdmin' | 'Admin' | 'HrAdmin' | 'FinanceAdmin' | 'Employee' | 'Inventory operator'
  roleLabel: string;
  canAssignScope: 'any' | 'own_dept' | 'own_team' | 'project_members' | 'self_only' | 'none';
  crossDeptAllowed: boolean;
  requiresOverride: boolean;
  notes?: string;
}

export interface TaskOwnershipRecord {
  createdById?: number;
  createdByName?: string;
  assignedById?: number;
  assignedByName?: string;
  assignedToId?: number;
  assignedToName?: string;
  reportingManagerId?: number;
  reportingManagerName?: string;
  deptHeadId?: number;
  deptHeadName?: string;
  projectManagerId?: number;
  projectManagerName?: string;
  reviewedById?: number;
  reviewedByName?: string;
  approvedById?: number;
  approvedByName?: string;
  departmentId?: number;
  departmentName?: string;
}

export interface TaskAssignmentHistoryItem {
  id: number;
  taskId: number;
  fromUserId?: number;
  fromUserName?: string;
  toUserId: number;
  toUserName: string;
  reassignedById: number;
  reassignedByName: string;
  reason?: string;
  timestamp: string;
}

export interface EmployeeWorkload {
  userId: number;
  userName: string;
  designation: string;
  departmentId: number;
  departmentName: string;
  openTasks: number;
  overdueTasks: number;
  completedThisWeek: number;
  activeProjects: number;
  nextDeadline?: string;
  workloadScore: number; // 0-100
  workloadLabel: 'Light' | 'Moderate' | 'Heavy' | 'Overloaded';
}

export interface SmartAssignmentRecommendation {
  userId: number;
  userName: string;
  reason: string;
  workload: EmployeeWorkload;
  score: number;
}
