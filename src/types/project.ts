export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type ProjectHealth = 'on_track' | 'at_risk' | 'off_track';
export type ProjectMethodology = 'kanban' | 'scrum' | 'timeline_first';
export type EstimationUnit = 'points' | 'hours';
export type AutoShiftMode = 'strict' | 'flexible' | 'off';

export interface ProjectMember {
  userId: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'lead' | 'manager' | 'member' | 'viewer';
}

export interface Project {
  id: number;
  key: string; // 2 to 5 letters (e.g. "CDR", "ERP")
  name: string;
  description?: string;
  departmentId?: number;
  departmentName?: string;
  clientId?: number;
  clientName?: string;
  leadUserId: number;
  leadName?: string;
  status: ProjectStatus;
  health: ProjectHealth;
  healthOverrideNote?: string;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  methodology: ProjectMethodology;
  estimationUnit: EstimationUnit;
  autoShiftMode: AutoShiftMode;
  color?: string;
  members: ProjectMember[];
  chatChannelId?: number;
  createdAt: string;
  updatedAt: string;
  // Real Project Ownership & Audit Fields
  createdById?: number;
  createdByName?: string;
  ownerUserId?: number;
  ownerName?: string;
  projectManagerId?: number;
  projectManagerName?: string;
  deptHeadId?: number;
  deptHeadName?: string;
  ownershipTransferHistory?: Array<{
    id: number;
    fromUserId?: number;
    fromUserName?: string;
    toUserId: number;
    toUserName: string;
    transferredById: number;
    transferredByName: string;
    reason: string;
    timestamp: string;
  }>;
}

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'missed';

export interface Milestone {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  targetDate: string;
  ownerUserId?: number;
  ownerName?: string;
  isFixed: boolean;
  requiresSignoff: boolean;
  signoffStatus?: 'pending' | 'approved' | 'rejected';
  status: MilestoneStatus;
  progress?: number;
  sortOrder: number;
}

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface Dependency {
  id: number;
  projectId: number;
  predecessorId: number;
  successorId: number;
  depType: DependencyType;
  lagDays: number;
}

export type SprintStatus = 'planned' | 'active' | 'completed';

export interface Sprint {
  id: number;
  projectId: number;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: SprintStatus;
  committedPoints: number;
  completedPoints: number;
}

export interface SprintTaskHistory {
  id: number;
  sprintId: number;
  taskId: number;
  enteredAt: string;
  entryReason: 'planned' | 'added_mid_sprint' | 'carried_in';
  pointsAtEntry: number;
  remainingAtEntry: number;
  exitedAt?: string;
  exitReason?: 'completed' | 'carried_out' | 'removed';
  remainingAtExit?: number;
}

export type ProjectTaskType = 'task' | 'approval' | 'bug' | 'feature';
export type ProjectTaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done' | (string & {});

export interface TaskComment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  name: string;
  url: string;
  sizeBytes?: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ProjectTask {
  id: number;
  projectId?: number | null;
  phaseId?: number | null;
  phaseName?: string;
  milestoneId?: number | null;
  parentTaskId?: number | null;
  sprintId?: number | null;
  keyNumber: number; // e.g. 1 for CDR-1
  title: string;
  description?: string;
  remark?: string;
  type: ProjectTaskType;
  status: ProjectTaskStatus;
  statusId?: number;
  priority: 'High' | 'Medium' | 'Low';
  assigneeIds: number[];
  assigneeNames?: string[];
  collaboratorIds?: number[];
  collaboratorNames?: string[];
  startDate?: string;
  dueDate?: string;
  durationDays: number;
  estimatePoints: number;
  estimateMinutes: number;
  remainingMinutes: number;
  actualMinutes?: number;
  billable: boolean;
  isCritical?: boolean;
  totalFloatDays?: number;
  subtasks?: ProjectTask[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  // 6A: Dynamic Ownership & Department Fields
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
  assignmentHistory?: import('@/types/department').TaskAssignmentHistoryItem[];
}

export type DocumentPhase =
  | 'initiation'
  | 'requirements'
  | 'planning'
  | 'design'
  | 'build'
  | 'testing'
  | 'release'
  | 'closure'
  | 'throughout';

export type DocumentStatus = 'not_started' | 'in_progress' | 'done' | 'not_needed';

export interface ProjectDocument {
  id: number;
  projectId: number;
  templateId?: number;
  name: string;
  phase: DocumentPhase;
  ownerRole: string;
  ownerUserId?: number;
  ownerName?: string;
  dueDate?: string;
  milestoneId?: number;
  status: DocumentStatus;
  notNeededReason?: string;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  externalLink?: string;
  templateFormat?: 'docx' | 'xlsx';
  updatedAt?: string;
}

export interface DocumentTemplate {
  id: number;
  name: string;
  phase: DocumentPhase;
  ownerRole: string;
  format: 'docx' | 'xlsx';
  description?: string;
  isActive: boolean;
  version: number;
}

export interface TimeEntry {
  id: number;
  userId: number;
  userName?: string;
  taskId?: number;
  taskTitle?: string;
  projectId?: number;
  projectKey?: string;
  category: string;
  entryDate: string; // YYYY-MM-DD
  minutes: number;
  note?: string;
  billable: boolean;
  source: 'timer' | 'manual' | 'grid';
  timesheetId?: number;
  createdAt: string;
}

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Timesheet {
  id: number;
  userId: number;
  userName?: string;
  periodStart: string; // Monday
  periodEnd: string; // Sunday
  status: TimesheetStatus;
  submittedAt?: string;
  decidedAt?: string;
  decidedBy?: number;
  decisionNotes?: string;
  locked: boolean;
  totalMinutes: number;
}
