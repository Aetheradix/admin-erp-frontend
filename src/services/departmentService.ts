import type {
  Department,
  DepartmentMember,
  Team,
  EmployeeReporting,
  AssignmentPermissionRule,
  EmployeeWorkload,
  SmartAssignmentRecommendation,
  TaskAssignmentHistoryItem,
} from '@/types/department';

const STORAGE_KEYS = {
  DEPARTMENTS: 'aether_departments_v1',
  MEMBERS: 'aether_department_members_v1',
  TEAMS: 'aether_teams_v1',
  ASSIGNMENT_RULES: 'aether_assignment_rules_v1',
  ASSIGNMENT_HISTORY: 'aether_task_assignment_history_v1',
};

const SEED_DEPARTMENTS: Department[] = [
  {
    id: 1,
    name: 'Engineering',
    description: 'Software development, architecture, infrastructure & quality assurance.',
    headUserId: 101,
    headUserName: 'Alex Mercer',
    memberCount: 6,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-11-01',
  },
  {
    id: 2,
    name: 'Product & Design',
    description: 'Product strategy, UX/UI design, and user research.',
    headUserId: 102,
    headUserName: 'Elena Rostova',
    memberCount: 4,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-11-01',
  },
  {
    id: 3,
    name: 'Marketing',
    description: 'Growth marketing, branding, events, and content strategy.',
    headUserId: 103,
    headUserName: 'Marcus Vance',
    memberCount: 4,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-11-01',
  },
  {
    id: 4,
    name: 'Finance & Operations',
    description: 'Financial planning, accounting, compliance, and facilities.',
    headUserId: 104,
    headUserName: 'Sarah Jenkins',
    memberCount: 3,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-11-01',
  },
  {
    id: 5,
    name: 'Human Resources',
    description: 'People operations, recruitment, culture, and employee welfare.',
    headUserId: 105,
    headUserName: 'Priya Sharma',
    memberCount: 3,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-11-01',
  },
];

const SEED_TEAMS: Team[] = [
  { id: 1, name: 'Frontend Guild', departmentId: 1, departmentName: 'Engineering', leadUserId: 106, leadUserName: 'Liam Chen', memberCount: 3, isActive: true },
  { id: 2, name: 'Core Backend', departmentId: 1, departmentName: 'Engineering', leadUserId: 107, leadUserName: 'Sofia Patel', memberCount: 3, isActive: true },
  { id: 3, name: 'Product Growth', departmentId: 2, departmentName: 'Product & Design', leadUserId: 108, leadUserName: 'Lucas Scott', memberCount: 2, isActive: true },
  { id: 4, name: 'Brand & Digital', departmentId: 3, departmentName: 'Marketing', leadUserId: 109, leadUserName: 'Zoe Kravitz', memberCount: 2, isActive: true },
];

const SEED_MEMBERS: DepartmentMember[] = [
  // Engineering
  { userId: 101, userName: 'Alex Mercer', email: 'alex@aether.io', designation: 'VP of Engineering', departmentId: 1, departmentName: 'Engineering', isTeamLeader: false, isDepartmentHead: true, employmentStatus: 'Active', joinedAt: '2025-01-15' },
  { userId: 106, userName: 'Liam Chen', email: 'liam@aether.io', designation: 'Staff Frontend Engineer / Team Lead', departmentId: 1, departmentName: 'Engineering', teamId: 1, teamName: 'Frontend Guild', reportingManagerId: 101, reportingManagerName: 'Alex Mercer', isTeamLeader: true, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-03-01' },
  { userId: 110, userName: 'Maya Lin', email: 'maya@aether.io', designation: 'Senior Frontend Developer', departmentId: 1, departmentName: 'Engineering', teamId: 1, teamName: 'Frontend Guild', reportingManagerId: 106, reportingManagerName: 'Liam Chen', isTeamLeader: false, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-06-10' },
  { userId: 107, userName: 'Sofia Patel', email: 'sofia@aether.io', designation: 'Lead Systems Architect', departmentId: 1, departmentName: 'Engineering', teamId: 2, teamName: 'Core Backend', reportingManagerId: 101, reportingManagerName: 'Alex Mercer', isTeamLeader: true, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-02-15' },
  { userId: 111, userName: 'David Kim', email: 'david@aether.io', designation: 'Backend Engineer', departmentId: 1, departmentName: 'Engineering', teamId: 2, teamName: 'Core Backend', reportingManagerId: 107, reportingManagerName: 'Sofia Patel', isTeamLeader: false, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-07-20' },
  { userId: 112, userName: 'Nadia Thorne', email: 'nadia@aether.io', designation: 'QA Automation Lead', departmentId: 1, departmentName: 'Engineering', reportingManagerId: 101, reportingManagerName: 'Alex Mercer', isTeamLeader: false, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-04-12' },

  // Product & Design
  { userId: 102, userName: 'Elena Rostova', email: 'elena@aether.io', designation: 'Head of Product', departmentId: 2, departmentName: 'Product & Design', isTeamLeader: false, isDepartmentHead: true, employmentStatus: 'Active', joinedAt: '2025-01-20' },
  { userId: 108, userName: 'Lucas Scott', email: 'lucas@aether.io', designation: 'Senior Product Manager', departmentId: 2, departmentName: 'Product & Design', teamId: 3, teamName: 'Product Growth', reportingManagerId: 102, reportingManagerName: 'Elena Rostova', isTeamLeader: true, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-05-01' },
  { userId: 113, userName: 'Chloe Dubois', email: 'chloe@aether.io', designation: 'Principal UI/UX Designer', departmentId: 2, departmentName: 'Product & Design', reportingManagerId: 102, reportingManagerName: 'Elena Rostova', isTeamLeader: false, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-03-15' },
  { userId: 114, userName: 'Tariq Al-Mansoor', email: 'tariq@aether.io', designation: 'UX Researcher', departmentId: 2, departmentName: 'Product & Design', reportingManagerId: 102, reportingManagerName: 'Elena Rostova', isTeamLeader: false, isDepartmentHead: false, employmentStatus: 'On Leave', joinedAt: '2025-08-01' },

  // Marketing
  { userId: 103, userName: 'Marcus Vance', email: 'marcus@aether.io', designation: 'Chief Marketing Officer', departmentId: 3, departmentName: 'Marketing', isTeamLeader: false, isDepartmentHead: true, employmentStatus: 'Active', joinedAt: '2025-01-10' },
  { userId: 109, userName: 'Zoe Kravitz', email: 'zoe@aether.io', designation: 'Digital Marketing Lead', departmentId: 3, departmentName: 'Marketing', teamId: 4, teamName: 'Brand & Digital', reportingManagerId: 103, reportingManagerName: 'Marcus Vance', isTeamLeader: true, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-04-18' },
  { userId: 115, userName: 'Rohan Mehra', email: 'rohan@aether.io', designation: 'Content Strategist', departmentId: 3, departmentName: 'Marketing', reportingManagerId: 109, reportingManagerName: 'Zoe Kravitz', isTeamLeader: false, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-09-01' },

  // Finance
  { userId: 104, userName: 'Sarah Jenkins', email: 'sarah@aether.io', designation: 'Director of Finance', departmentId: 4, departmentName: 'Finance & Operations', isTeamLeader: false, isDepartmentHead: true, employmentStatus: 'Active', joinedAt: '2025-01-05' },
  { userId: 116, userName: 'Vikram Joshi', email: 'vikram@aether.io', designation: 'Senior Financial Analyst', departmentId: 4, departmentName: 'Finance & Operations', reportingManagerId: 104, reportingManagerName: 'Sarah Jenkins', isTeamLeader: false, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-05-15' },

  // HR
  { userId: 105, userName: 'Priya Sharma', email: 'priya@aether.io', designation: 'Head of People & Culture', departmentId: 5, departmentName: 'Human Resources', isTeamLeader: false, isDepartmentHead: true, employmentStatus: 'Active', joinedAt: '2025-02-01' },
  { userId: 117, userName: 'Ananya Roy', email: 'ananya@aether.io', designation: 'Talent Acquisition Specialist', departmentId: 5, departmentName: 'Human Resources', reportingManagerId: 105, reportingManagerName: 'Priya Sharma', isTeamLeader: false, isDepartmentHead: false, employmentStatus: 'Active', joinedAt: '2025-06-25' },
];

const SEED_ASSIGNMENT_RULES: AssignmentPermissionRule[] = [
  { id: 1, roleKey: 'SuperAdmin', roleLabel: 'Super Administrator', canAssignScope: 'any', crossDeptAllowed: true, requiresOverride: false, notes: 'Full access to assign tasks anywhere across the company.' },
  { id: 2, roleKey: 'Admin', roleLabel: 'Administrator', canAssignScope: 'any', crossDeptAllowed: true, requiresOverride: false, notes: 'Can assign to all departments and teams.' },
  { id: 3, roleKey: 'HrAdmin', roleLabel: 'HR Administrator', canAssignScope: 'own_dept', crossDeptAllowed: false, requiresOverride: true, notes: 'Primarily assigns within HR or cross-dept with supervisor override.' },
  { id: 4, roleKey: 'FinanceAdmin', roleLabel: 'Finance Administrator', canAssignScope: 'own_dept', crossDeptAllowed: false, requiresOverride: true, notes: 'Assigns within Finance & Operations.' },
  { id: 5, roleKey: 'Employee', roleLabel: 'Regular Employee / Team Member', canAssignScope: 'project_members', crossDeptAllowed: false, requiresOverride: true, notes: 'Can only delegate tasks to coworkers in the same project or team.' },
  { id: 6, roleKey: 'Inventory operator', roleLabel: 'Inventory Operator', canAssignScope: 'self_only', crossDeptAllowed: false, requiresOverride: true, notes: 'Restricted assignment scope.' },
];

class DepartmentService {
  constructor() {
    this.initSeedData();
  }

  private getStorage<T>(key: string, defaultVal: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // fallback
    }
  }

  public initSeedData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
      this.setStorage(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
      this.setStorage(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
      this.setStorage(STORAGE_KEYS.TEAMS, SEED_TEAMS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENT_RULES)) {
      this.setStorage(STORAGE_KEYS.ASSIGNMENT_RULES, SEED_ASSIGNMENT_RULES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENT_HISTORY)) {
      this.setStorage(STORAGE_KEYS.ASSIGNMENT_HISTORY, []);
    }
  }

  // Departments
  public getDepartments(): Department[] {
    return this.getStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
  }

  public getDepartmentById(id: number): Department | undefined {
    return this.getDepartments().find((d) => d.id === id);
  }

  // Members
  public getAllEmployees(): DepartmentMember[] {
    return this.getStorage<DepartmentMember[]>(STORAGE_KEYS.MEMBERS, SEED_MEMBERS);
  }

  public getDepartmentMembers(deptId: number): DepartmentMember[] {
    return this.getAllEmployees().filter((m) => m.departmentId === deptId);
  }

  public getDepartmentHead(deptId: number): DepartmentMember | undefined {
    const dept = this.getDepartmentById(deptId);
    if (!dept) return undefined;
    return this.getAllEmployees().find((m) => m.userId === dept.headUserId || (m.departmentId === deptId && m.isDepartmentHead));
  }

  public getEmployeeById(userId: number): DepartmentMember | undefined {
    return this.getAllEmployees().find((m) => m.userId === userId);
  }

  // Employee Reporting
  public getEmployeeReporting(userId: number): EmployeeReporting | undefined {
    const emp = this.getEmployeeById(userId);
    if (!emp) return undefined;
    const deptHead = this.getDepartmentHead(emp.departmentId);

    return {
      employeeId: emp.userId,
      employeeName: emp.userName,
      departmentId: emp.departmentId,
      departmentName: emp.departmentName,
      teamId: emp.teamId,
      teamName: emp.teamName,
      reportingManagerId: emp.reportingManagerId,
      reportingManagerName: emp.reportingManagerName,
      departmentHeadId: deptHead?.userId,
      departmentHeadName: deptHead?.userName,
      designation: emp.designation,
      employmentStatus: emp.employmentStatus,
    };
  }

  // Workload computation
  public getEmployeeWorkload(userId: number): EmployeeWorkload | undefined {
    const emp = this.getEmployeeById(userId);
    if (!emp) return undefined;

    // Derive deterministic realistic workload metrics based on userId
    const baseOpen = (userId * 3) % 9;
    const openTasks = baseOpen === 0 ? 2 : baseOpen;
    const overdueTasks = (userId % 4 === 0) ? 1 : (userId % 7 === 0 ? 2 : 0);
    const completedThisWeek = (userId * 2) % 6 + 1;
    const activeProjects = (userId % 3) + 1;

    let score = (openTasks * 10) + (overdueTasks * 20);
    if (score > 100) score = 100;

    let workloadLabel: EmployeeWorkload['workloadLabel'] = 'Light';
    if (score > 75) workloadLabel = 'Overloaded';
    else if (score > 50) workloadLabel = 'Heavy';
    else if (score > 25) workloadLabel = 'Moderate';

    return {
      userId: emp.userId,
      userName: emp.userName,
      designation: emp.designation,
      departmentId: emp.departmentId,
      departmentName: emp.departmentName,
      openTasks,
      overdueTasks,
      completedThisWeek,
      activeProjects,
      nextDeadline: '2026-11-28',
      workloadScore: score,
      workloadLabel,
    };
  }

  public getWorkloadsForDept(deptId: number): EmployeeWorkload[] {
    const members = this.getDepartmentMembers(deptId);
    return members.map((m) => this.getEmployeeWorkload(m.userId)!).filter(Boolean);
  }

  public getAllEmployeeWorkloads(): EmployeeWorkload[] {
    const all = this.getAllEmployees();
    return all.map((m) => this.getEmployeeWorkload(m.userId)!).filter(Boolean);
  }

  // Recommendations
  public getSmartRecommendations(deptId: number, _taskPriority: string): SmartAssignmentRecommendation[] {
    const workloads = this.getWorkloadsForDept(deptId);
    return workloads
      .map((w) => {
        // Lower workload score = higher recommendation score
        const score = 100 - w.workloadScore - (w.overdueTasks * 15);
        let reason = 'Balanced capacity and active in department.';
        if (w.workloadLabel === 'Light') {
          reason = 'Optimal availability; low active task backlog.';
        } else if (w.workloadLabel === 'Moderate') {
          reason = 'Consistent velocity with manageable queue.';
        } else if (w.workloadLabel === 'Heavy') {
          reason = 'Approaching capacity; suitable only for priority items.';
        } else {
          reason = 'Overloaded; reassignment or delegation recommended.';
        }
        return {
          userId: w.userId,
          userName: w.userName,
          reason,
          workload: w,
          score: Math.max(10, score),
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  // Permissions
  public getAssignmentPermissionRules(): AssignmentPermissionRule[] {
    return this.getStorage<AssignmentPermissionRule[]>(STORAGE_KEYS.ASSIGNMENT_RULES, SEED_ASSIGNMENT_RULES);
  }

  public updateAssignmentPermissionRule(
    id: number,
    data: Partial<AssignmentPermissionRule>
  ): AssignmentPermissionRule {
    const rules = this.getAssignmentPermissionRules();
    const idx = rules.findIndex((r) => r.id === id);
    if (idx !== -1) {
      rules[idx] = { ...rules[idx], ...data };
      this.setStorage(STORAGE_KEYS.ASSIGNMENT_RULES, rules);
      return rules[idx];
    }
    throw new Error('Rule not found');
  }

  public checkAssignmentPermission(
    assignerRole: string,
    assignerDeptId: number,
    targetDeptId: number
  ): { allowed: boolean; reason?: string } {
    const rules = this.getAssignmentPermissionRules();
    const rule = rules.find((r) => r.roleKey === assignerRole);
    if (!rule) return { allowed: true }; // default allow

    if (rule.canAssignScope === 'any') {
      return { allowed: true };
    }
    if (rule.canAssignScope === 'own_dept') {
      if (assignerDeptId === targetDeptId) return { allowed: true };
      if (rule.crossDeptAllowed) return { allowed: true };
      return { allowed: false, reason: 'Cross-department assignment requires Admin override.' };
    }
    if (rule.canAssignScope === 'self_only') {
      return { allowed: false, reason: 'This role is restricted to self-assignment.' };
    }
    return { allowed: true };
  }

  // Assignment history
  public getTaskAssignmentHistory(taskId: number): TaskAssignmentHistoryItem[] {
    const all = this.getStorage<TaskAssignmentHistoryItem[]>(STORAGE_KEYS.ASSIGNMENT_HISTORY, []);
    return all.filter((h) => h.taskId === taskId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addTaskAssignmentHistory(
    item: Omit<TaskAssignmentHistoryItem, 'id'>
  ): TaskAssignmentHistoryItem {
    const all = this.getStorage<TaskAssignmentHistoryItem[]>(STORAGE_KEYS.ASSIGNMENT_HISTORY, []);
    const newItem: TaskAssignmentHistoryItem = {
      ...item,
      id: Date.now(),
    };
    all.push(newItem);
    this.setStorage(STORAGE_KEYS.ASSIGNMENT_HISTORY, all);
    return newItem;
  }

  // ─── Real Backend / Hierarchy Synchronization ──────────────────────────────
  public syncFromLiveUsers(
    flatUsers: Array<{
      id: number;
      username: string;
      email: string;
      department?: string;
      department_id?: number | null;
      designation?: string | null;
      role?: string;
      reporting_manager_id?: number | null;
      reporting_manager_name?: string | null;
      account_status?: string;
      status?: string;
    }>,
    liveDepartments?: Array<{
      id: number;
      department_name: string;
      head_user_id?: number | null;
      head_name?: string | null;
      member_count?: number;
      is_active?: number | boolean;
    }>
  ): void {
    if (!flatUsers || flatUsers.length === 0) return;

    // Map departments if provided
    let departments: Department[] = this.getDepartments();
    if (liveDepartments && liveDepartments.length > 0) {
      departments = liveDepartments.map((d) => ({
        id: d.id,
        name: d.department_name,
        description: `${d.department_name} department`,
        headUserId: d.head_user_id ?? undefined,
        headUserName: d.head_name ?? undefined,
        memberCount: d.member_count ?? 0,
        isActive: Boolean(d.is_active ?? true),
        createdAt: '2026-01-01',
        updatedAt: new Date().toISOString(),
      }));
      this.setStorage(STORAGE_KEYS.DEPARTMENTS, departments);
    }

    // Convert live users into DepartmentMember items
    const liveMembers: DepartmentMember[] = flatUsers.map((u) => {
      const deptId = u.department_id || 1;
      const deptObj = departments.find((d) => d.id === deptId || d.name.toLowerCase() === (u.department || '').toLowerCase());
      const isHead = deptObj ? deptObj.headUserId === u.id : false;
      const isActive = u.account_status === 'Approved' || u.status === 'Active' || u.status === 'active';

      return {
        userId: u.id,
        userName: u.username,
        email: u.email,
        designation: u.designation || 'Specialist',
        departmentId: deptObj ? deptObj.id : deptId,
        departmentName: deptObj ? deptObj.name : (u.department || 'General'),
        reportingManagerId: u.reporting_manager_id ?? undefined,
        reportingManagerName: u.reporting_manager_name ?? undefined,
        isTeamLeader: u.role?.toLowerCase().includes('lead') || u.role?.toLowerCase().includes('manager') || false,
        isDepartmentHead: isHead,
        employmentStatus: isActive ? 'Active' : 'Inactive',
        joinedAt: '2026-01-01',
      };
    });

    if (liveMembers.length > 0) {
      this.setStorage(STORAGE_KEYS.MEMBERS, liveMembers);
    }
  }
}

export const departmentService = new DepartmentService();
