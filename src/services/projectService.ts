import type {
  Project,
  Milestone,
  Dependency,
  Sprint,
  ProjectTask,
  ProjectDocument,
  DocumentTemplate,
  TimeEntry,
  TaskComment,
  TaskAttachment,
} from '@/types/project';
import type { TaskStatus } from '@/types/taskStatus';
import type { ProjectPhase, PhaseTemplate } from '@/types/phase';
import { runScheduler, detectCycle } from './schedulingEngine';

const STORAGE_KEYS = {
  PROJECTS: 'aether_projects_v1',
  MILESTONES: 'aether_milestones_v1',
  DEPENDENCIES: 'aether_dependencies_v1',
  TASKS: 'aether_project_tasks_v1',
  SPRINTS: 'aether_sprints_v1',
  SPRINT_HISTORY: 'aether_sprint_history_v1',
  DOCUMENTS: 'aether_project_docs_v1',
  TEMPLATES: 'aether_doc_templates_v1',
  TIME_ENTRIES: 'aether_time_entries_v1',
  TIMESHEETS: 'aether_timesheets_v1',
  ORG_SETTINGS: 'aether_org_settings_v1',
  TASK_STATUSES: 'aether_task_statuses_v1',
  PHASES: 'aether_phases_v1',
  PHASE_TEMPLATES: 'aether_phase_templates_v1',
};

// ─── Starter Document Templates ──────────────────────────────────────────────

export const STARTER_TEMPLATES: DocumentTemplate[] = [
  { id: 1, name: 'Project Charter', phase: 'initiation', ownerRole: 'Project Manager', format: 'docx', isActive: true, version: 1 },
  { id: 2, name: 'Statement of Work', phase: 'initiation', ownerRole: 'Project Manager', format: 'docx', isActive: true, version: 1 },
  { id: 3, name: 'Stakeholder Register', phase: 'initiation', ownerRole: 'Project Manager', format: 'xlsx', isActive: true, version: 1 },
  { id: 4, name: 'Business Requirements Document (BRD)', phase: 'requirements', ownerRole: 'Business Analyst', format: 'docx', isActive: true, version: 1 },
  { id: 5, name: 'Software Requirements Spec (SRS)', phase: 'requirements', ownerRole: 'Business Analyst', format: 'docx', isActive: true, version: 1 },
  { id: 6, name: 'User Stories & Acceptance Criteria', phase: 'requirements', ownerRole: 'Business Analyst', format: 'xlsx', isActive: true, version: 1 },
  { id: 7, name: 'Requirements Traceability Matrix', phase: 'requirements', ownerRole: 'Business Analyst', format: 'xlsx', isActive: true, version: 1 },
  { id: 8, name: 'Product Requirements Doc (PRD)', phase: 'requirements', ownerRole: 'Product Manager', format: 'docx', isActive: true, version: 1 },
  { id: 9, name: 'Project Plan & Milestones', phase: 'planning', ownerRole: 'Project Manager', format: 'xlsx', isActive: true, version: 1 },
  { id: 10, name: 'Risk & Issues Register', phase: 'planning', ownerRole: 'Project Manager', format: 'xlsx', isActive: true, version: 1 },
  { id: 11, name: 'Communication Plan', phase: 'planning', ownerRole: 'Project Manager', format: 'docx', isActive: true, version: 1 },
  { id: 12, name: 'Product Roadmap & Release Plan', phase: 'planning', ownerRole: 'Product Manager', format: 'xlsx', isActive: true, version: 1 },
  { id: 13, name: 'Wireframes & UI Design Spec', phase: 'design', ownerRole: 'Designer', format: 'docx', isActive: true, version: 1 },
  { id: 14, name: 'Architecture & Technical Design', phase: 'design', ownerRole: 'Tech Lead', format: 'docx', isActive: true, version: 1 },
  { id: 15, name: 'Database Schema Design', phase: 'design', ownerRole: 'Tech Lead', format: 'docx', isActive: true, version: 1 },
  { id: 16, name: 'API Specifications', phase: 'design', ownerRole: 'Developer', format: 'docx', isActive: true, version: 1 },
  { id: 17, name: 'Coding Standards & PR Checklist', phase: 'build', ownerRole: 'Tech Lead', format: 'docx', isActive: true, version: 1 },
  { id: 18, name: 'Release Notes', phase: 'build', ownerRole: 'Developer', format: 'docx', isActive: true, version: 1 },
  { id: 19, name: 'Master Test Plan', phase: 'testing', ownerRole: 'QA Lead', format: 'docx', isActive: true, version: 1 },
  { id: 20, name: 'Test Cases & Execution Matrix', phase: 'testing', ownerRole: 'QA Lead', format: 'xlsx', isActive: true, version: 1 },
  { id: 21, name: 'Defect Log', phase: 'testing', ownerRole: 'QA Lead', format: 'xlsx', isActive: true, version: 1 },
  { id: 22, name: 'UAT Plan & Sign-off Document', phase: 'testing', ownerRole: 'QA Lead', format: 'docx', isActive: true, version: 1 },
  { id: 23, name: 'Deployment Runbook', phase: 'release', ownerRole: 'DevOps', format: 'docx', isActive: true, version: 1 },
  { id: 24, name: 'Launch Checklist', phase: 'release', ownerRole: 'Product Manager', format: 'xlsx', isActive: true, version: 1 },
  { id: 25, name: 'Handover & Knowledge Transfer', phase: 'closure', ownerRole: 'Project Manager', format: 'docx', isActive: true, version: 1 },
  { id: 26, name: 'Project Closure & Retrospective', phase: 'closure', ownerRole: 'Project Manager', format: 'docx', isActive: true, version: 1 },
];

// ─── Initial Seeded Data ─────────────────────────────────────────────────────

const SEED_PROJECTS: Project[] = [
  {
    id: 1,
    key: 'CDR',
    name: 'Cedar Client Portal & Billing Suite',
    description: 'Enterprise B2B client dashboard with invoice settlement, support ticket triage, and automated reporting.',
    clientId: 1,
    clientName: 'Cedar Capital Group',
    leadUserId: 1,
    leadName: 'Alex Mercer',
    status: 'active',
    health: 'on_track',
    startDate: '2026-11-01',
    targetDate: '2026-12-25',
    methodology: 'scrum',
    estimationUnit: 'hours',
    autoShiftMode: 'flexible',
    color: '#06b6d4',
    members: [
      { userId: 1, name: 'Alex Mercer', email: 'alex@aether.org', role: 'lead' },
      { userId: 2, name: 'Hasmukh Patel', email: 'hasmukh@aether.org', role: 'manager' },
      { userId: 3, name: 'Elena Rostova', email: 'elena@aether.org', role: 'member' },
      { userId: 4, name: 'David Kim', email: 'david@aether.org', role: 'member' },
    ],
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-19T10:00:00Z',
  },
  {
    id: 2,
    key: 'AETH',
    name: 'StartupOS Mobile Gateway',
    description: 'Flutter hybrid mobile client for iOS and Android check-in and task notifications.',
    clientId: 2,
    clientName: 'Internal Product',
    leadUserId: 2,
    leadName: 'Hasmukh Patel',
    status: 'planning',
    health: 'on_track',
    startDate: '2026-12-01',
    targetDate: '2027-02-15',
    methodology: 'timeline_first',
    estimationUnit: 'points',
    autoShiftMode: 'flexible',
    color: '#E8583A',
    members: [
      { userId: 2, name: 'Hasmukh Patel', email: 'hasmukh@aether.org', role: 'lead' },
      { userId: 1, name: 'Alex Mercer', email: 'alex@aether.org', role: 'manager' },
    ],
    createdAt: '2026-11-10T12:00:00Z',
    updatedAt: '2026-11-18T16:00:00Z',
  },
];

const SEED_MILESTONES: Milestone[] = [
  { id: 1, projectId: 1, name: 'M1: Architecture & API Foundation', targetDate: '2026-11-15', isFixed: true, requiresSignoff: false, status: 'completed', sortOrder: 1 },
  { id: 2, projectId: 1, name: 'M2: Core Billing & Invoicing Engine', targetDate: '2026-12-05', isFixed: false, requiresSignoff: true, signoffStatus: 'pending', status: 'in_progress', sortOrder: 2 },
  { id: 3, projectId: 1, name: 'M3: Client Portal Frontend & UAT', targetDate: '2026-12-20', isFixed: false, requiresSignoff: true, status: 'not_started', sortOrder: 3 },
];

const SEED_TASKS: ProjectTask[] = [
  {
    id: 1,
    projectId: 1,
    milestoneId: 1,
    sprintId: 1,
    keyNumber: 1,
    title: 'Database Schema & Multitenancy Setup',
    description: 'Set up PostgreSQL schemas, foreign keys, and indexes.',
    type: 'task',
    status: 'Done',
    priority: 'High',
    assigneeIds: [2],
    assigneeNames: ['Hasmukh Patel'],
    startDate: '2026-11-03',
    dueDate: '2026-11-07',
    durationDays: 5,
    estimatePoints: 8,
    estimateMinutes: 2400,
    remainingMinutes: 0,
    billable: true,
  },
  {
    id: 2,
    projectId: 1,
    milestoneId: 1,
    sprintId: 1,
    keyNumber: 2,
    title: 'Authentication & Session Middleware',
    description: 'JWT signing, refresh token rotation, and RBAC guards.',
    type: 'task',
    status: 'Done',
    priority: 'High',
    assigneeIds: [4],
    assigneeNames: ['David Kim'],
    startDate: '2026-11-08',
    dueDate: '2026-11-14',
    durationDays: 5,
    estimatePoints: 5,
    estimateMinutes: 1800,
    remainingMinutes: 0,
    billable: true,
  },
  {
    id: 3,
    projectId: 1,
    milestoneId: 2,
    sprintId: 2,
    keyNumber: 3,
    title: 'Invoice Generation & PDF Export Service',
    description: 'Handle automatic generation of branded PDF invoices.',
    type: 'task',
    status: 'In Progress',
    priority: 'High',
    assigneeIds: [2, 3],
    assigneeNames: ['Hasmukh Patel', 'Elena Rostova'],
    startDate: '2026-11-17',
    dueDate: '2026-11-25',
    durationDays: 7,
    estimatePoints: 8,
    estimateMinutes: 2880,
    remainingMinutes: 1200,
    billable: true,
  },
  {
    id: 4,
    projectId: 1,
    milestoneId: 2,
    sprintId: 2,
    keyNumber: 4,
    title: 'Stripe & Banking Webhook Handlers',
    description: 'Handle synchronous settlement and dispute notifications.',
    type: 'task',
    status: 'In Progress',
    priority: 'Medium',
    assigneeIds: [4],
    assigneeNames: ['David Kim'],
    startDate: '2026-11-20',
    dueDate: '2026-11-28',
    durationDays: 7,
    estimatePoints: 5,
    estimateMinutes: 1920,
    remainingMinutes: 1100,
    billable: true,
  },
  {
    id: 5,
    projectId: 1,
    milestoneId: 3,
    sprintId: 2,
    keyNumber: 5,
    title: 'Client Dashboard UI & Analytics Charts',
    description: 'Chart.js widgets for monthly burn and cash inflow.',
    type: 'task',
    status: 'To Do',
    priority: 'High',
    assigneeIds: [3],
    assigneeNames: ['Elena Rostova'],
    startDate: '2026-11-29',
    dueDate: '2026-12-08',
    durationDays: 8,
    estimatePoints: 8,
    estimateMinutes: 2400,
    remainingMinutes: 2400,
    billable: true,
  },
  {
    id: 6,
    projectId: 1,
    milestoneId: 3,
    keyNumber: 6,
    title: 'Security Audit & Penetration Testing Sign-off',
    description: 'Review OWASP vulnerabilities and acquire sign-off.',
    type: 'approval',
    status: 'To Do',
    priority: 'High',
    assigneeIds: [1],
    assigneeNames: ['Alex Mercer'],
    startDate: '2026-12-09',
    dueDate: '2026-12-16',
    durationDays: 6,
    estimatePoints: 3,
    estimateMinutes: 1200,
    remainingMinutes: 1200,
    billable: false,
  },
];

const SEED_DEPENDENCIES: Dependency[] = [
  { id: 1, projectId: 1, predecessorId: 1, successorId: 2, depType: 'FS', lagDays: 0 },
  { id: 2, projectId: 1, predecessorId: 2, successorId: 3, depType: 'FS', lagDays: 0 },
  { id: 3, projectId: 1, predecessorId: 3, successorId: 5, depType: 'FS', lagDays: 0 },
  { id: 4, projectId: 1, predecessorId: 5, successorId: 6, depType: 'FS', lagDays: 0 },
];

const SEED_SPRINTS: Sprint[] = [
  {
    id: 1,
    projectId: 1,
    name: 'Sprint 1: Architecture Foundation',
    goal: 'Establish database, containerization, and authentication APIs.',
    startDate: '2026-11-03',
    endDate: '2026-11-14',
    capacity: 40,
    status: 'completed',
    committedPoints: 13,
    completedPoints: 13,
  },
  {
    id: 2,
    projectId: 1,
    name: 'Sprint 2: Billing Engine & UI',
    goal: 'Ship invoice generator, webhook processors, and initial client dashboard.',
    startDate: '2026-11-17',
    endDate: '2026-11-28',
    capacity: 45,
    status: 'active',
    committedPoints: 21,
    completedPoints: 8,
  },
];

const SEED_TASK_STATUSES: TaskStatus[] = [
  { id: 1, name: 'To Do', slug: 'to_do', category: 'initial', color: '#64748b', sortOrder: 1, isDefault: true, isActive: true, allowedTransitionIds: [2, 5, 6] },
  { id: 2, name: 'In Progress', slug: 'in_progress', category: 'active', color: '#3b82f6', sortOrder: 2, isDefault: false, isActive: true, allowedTransitionIds: [1, 3, 5, 6] },
  { id: 3, name: 'In Review', slug: 'in_review', category: 'active', color: '#8b5cf6', sortOrder: 3, isDefault: false, isActive: true, requiresApproval: true, allowedTransitionIds: [2, 4, 6] },
  { id: 4, name: 'Done', slug: 'done', category: 'completed', color: '#10b981', sortOrder: 4, isDefault: false, isActive: true, allowedTransitionIds: [2] },
  { id: 5, name: 'Blocked', slug: 'blocked', category: 'active', color: '#f59e0b', sortOrder: 5, isDefault: false, isActive: true, allowedTransitionIds: [1, 2, 6] },
  { id: 6, name: 'Cancelled', slug: 'cancelled', category: 'cancelled', color: '#ef4444', sortOrder: 6, isDefault: false, isActive: true, allowedTransitionIds: [1] },
];

const SEED_PHASES: ProjectPhase[] = [
  { id: 1, projectId: 1, name: 'Planning & Architecture', description: 'Tech stack alignment, DB schemas, initial wireframes', sortOrder: 1, ownerName: 'Alex Mercer', startDate: '2026-11-01', endDate: '2026-11-14', color: '#06b6d4', isCompleted: true },
  { id: 2, projectId: 1, name: 'Core Engine & Invoicing', description: 'Payment webhooks, PDF generation, data pipelines', sortOrder: 2, ownerName: 'Hasmukh Patel', startDate: '2026-11-15', endDate: '2026-12-05', color: '#3b82f6', isCompleted: false },
  { id: 3, projectId: 1, name: 'Frontend Portal & Dashboards', description: 'React client portal, analytics, responsive views', sortOrder: 3, ownerName: 'Elena Rostova', startDate: '2026-11-25', endDate: '2026-12-15', color: '#8b5cf6', isCompleted: false },
  { id: 4, projectId: 1, name: 'Security Audit & Launch', description: 'Penetration testing, UAT, production deployment', sortOrder: 4, ownerName: 'Alex Mercer', startDate: '2026-12-16', endDate: '2026-12-25', color: '#10b981', isCompleted: false },
];

const SEED_PHASE_TEMPLATES: PhaseTemplate[] = [
  {
    id: 1,
    name: 'Standard Software Development',
    description: 'Best for Web, Mobile, and Cloud Application projects',
    projectType: 'Engineering',
    phases: [
      { name: 'Requirements & Planning', description: 'BRD, SRS, architecture specs', color: '#64748b', durationDays: 14 },
      { name: 'UI / UX Design', description: 'Figma mockups and interactive prototypes', color: '#ec4899', durationDays: 14 },
      { name: 'Sprint Execution / Build', description: 'Backend APIs and Frontend engineering', color: '#3b82f6', durationDays: 30 },
      { name: 'Testing & QA / UAT', description: 'Test matrix execution and user sign-offs', color: '#f59e0b', durationDays: 14 },
      { name: 'Production Deployment', description: 'DevOps release runbook and launch', color: '#10b981', durationDays: 7 },
    ],
  },
  {
    id: 2,
    name: 'Marketing & Brand Campaign',
    description: 'Best for product releases, seasonal campaigns, and PR',
    projectType: 'Marketing',
    phases: [
      { name: 'Market Research & Goals', description: 'Audience analysis and KPIs', color: '#64748b', durationDays: 10 },
      { name: 'Creative Strategy & Copy', description: 'Design assets, landing pages, copy', color: '#8b5cf6', durationDays: 14 },
      { name: 'Channel Launch & Ads', description: 'Paid media, social, and email blasts', color: '#3b82f6', durationDays: 21 },
      { name: 'Performance Analytics', description: 'Conversion tracking and retrospective', color: '#10b981', durationDays: 7 },
    ],
  },
];

// ─── Service Class ───────────────────────────────────────────────────────────

class ProjectService {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultValue;
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  public initSeedData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      this.setStorage(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MILESTONES)) {
      this.setStorage(STORAGE_KEYS.MILESTONES, SEED_MILESTONES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      this.setStorage(STORAGE_KEYS.TASKS, SEED_TASKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPENDENCIES)) {
      this.setStorage(STORAGE_KEYS.DEPENDENCIES, SEED_DEPENDENCIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SPRINTS)) {
      this.setStorage(STORAGE_KEYS.SPRINTS, SEED_SPRINTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      this.setStorage(STORAGE_KEYS.TEMPLATES, STARTER_TEMPLATES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      // Generate documents for project 1 from starter templates
      const docs: ProjectDocument[] = STARTER_TEMPLATES.map((tmpl) => ({
        id: tmpl.id,
        projectId: 1,
        templateId: tmpl.id,
        name: tmpl.name,
        phase: tmpl.phase,
        ownerRole: tmpl.ownerRole,
        ownerName: tmpl.ownerRole === 'Project Manager' ? 'Alex Mercer' : 'Team Member',
        status: tmpl.id <= 3 ? 'done' : tmpl.id <= 6 ? 'in_progress' : 'not_started',
        templateFormat: tmpl.format,
        updatedAt: '2026-11-19T09:00:00Z',
      }));
      this.setStorage(STORAGE_KEYS.DOCUMENTS, docs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORG_SETTINGS)) {
      this.setStorage(STORAGE_KEYS.ORG_SETTINGS, { time_tracking_enabled: true });
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASK_STATUSES)) {
      this.setStorage(STORAGE_KEYS.TASK_STATUSES, SEED_TASK_STATUSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PHASES)) {
      this.setStorage(STORAGE_KEYS.PHASES, SEED_PHASES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PHASE_TEMPLATES)) {
      this.setStorage(STORAGE_KEYS.PHASE_TEMPLATES, SEED_PHASE_TEMPLATES);
    }
  }

  // ─── Projects ───
  public getProjects(): Project[] {
    this.initSeedData();
    return this.getStorage(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  }

  public getProjectById(id: number): Project | null {
    const list = this.getProjects();
    return list.find((p) => p.id === Number(id)) || null;
  }

  public createProject(payload: Partial<Project>): Project {
    const list = this.getProjects();
    const newId = list.length > 0 ? Math.max(...list.map((p) => p.id)) + 1 : 1;
    const project: Project = {
      id: newId,
      key: (payload.key || `PRJ${newId}`).toUpperCase(),
      name: payload.name || 'Untitled Project',
      description: payload.description || '',
      departmentId: payload.departmentId,
      departmentName: payload.departmentName,
      clientId: payload.clientId,
      clientName: payload.clientName || 'General Client',
      leadUserId: payload.leadUserId || 1,
      leadName: payload.leadName || 'Alex Mercer',
      ownerUserId: payload.ownerUserId || payload.leadUserId || 1,
      ownerName: payload.ownerName || payload.leadName || 'Alex Mercer',
      projectManagerId: payload.projectManagerId || payload.leadUserId || 1,
      projectManagerName: payload.projectManagerName || payload.leadName || 'Alex Mercer',
      createdById: payload.createdById || 1,
      createdByName: payload.createdByName || 'Authenticated User',
      deptHeadId: payload.deptHeadId,
      deptHeadName: payload.deptHeadName,
      status: payload.status || 'planning',
      health: 'on_track',
      startDate: payload.startDate || new Date().toISOString().split('T')[0],
      targetDate: payload.targetDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      methodology: payload.methodology || 'timeline_first',
      estimationUnit: payload.estimationUnit || 'hours',
      autoShiftMode: payload.autoShiftMode || 'flexible',
      color: payload.color || '#E8583A',
      members: payload.members || [{ userId: 1, name: 'Alex Mercer', email: 'alex@aether.org', role: 'lead' }],
      ownershipTransferHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(project);
    this.setStorage(STORAGE_KEYS.PROJECTS, list);

    // Auto-generate project documents from templates
    const templates = this.getTemplates();
    const docs = this.getDocuments(newId);
    if (docs.length === 0) {
      const generatedDocs: ProjectDocument[] = templates.map((tmpl, idx) => ({
        id: Date.now() + idx,
        projectId: newId,
        templateId: tmpl.id,
        name: tmpl.name,
        phase: tmpl.phase,
        ownerRole: tmpl.ownerRole,
        ownerName: tmpl.ownerRole === 'Project Manager' ? project.leadName : undefined,
        status: 'not_started',
        templateFormat: tmpl.format,
        updatedAt: new Date().toISOString(),
      }));
      const allDocs = this.getStorage<ProjectDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
      this.setStorage(STORAGE_KEYS.DOCUMENTS, [...allDocs, ...generatedDocs]);
    }

    return project;
  }

  public updateProjectStatus(id: number, status: Project['status']): Project | null {
    const list = this.getProjects();
    const item = list.find((p) => p.id === Number(id));
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.PROJECTS, list);
    return item;
  }

  public transferProjectOwnership(
    projectId: number,
    newOwnerId: number,
    newOwnerName: string,
    transferredById: number,
    transferredByName: string,
    reason: string
  ): Project | null {
    const list = this.getProjects();
    const item = list.find((p) => p.id === Number(projectId));
    if (!item) return null;

    const historyRecord = {
      id: Date.now(),
      fromUserId: item.ownerUserId || item.leadUserId,
      fromUserName: item.ownerName || item.leadName,
      toUserId: newOwnerId,
      toUserName: newOwnerName,
      transferredById,
      transferredByName,
      reason,
      timestamp: new Date().toISOString(),
    };

    item.ownerUserId = newOwnerId;
    item.ownerName = newOwnerName;
    item.ownershipTransferHistory = [...(item.ownershipTransferHistory || []), historyRecord];
    item.updatedAt = new Date().toISOString();

    this.setStorage(STORAGE_KEYS.PROJECTS, list);
    return item;
  }

  public updateProjectManager(
    projectId: number,
    newManagerId: number,
    newManagerName: string
  ): Project | null {
    const list = this.getProjects();
    const item = list.find((p) => p.id === Number(projectId));
    if (!item) return null;

    item.projectManagerId = newManagerId;
    item.projectManagerName = newManagerName;
    item.updatedAt = new Date().toISOString();

    this.setStorage(STORAGE_KEYS.PROJECTS, list);
    return item;
  }

  // ─── Milestones ───
  public getMilestones(projectId: number): Milestone[] {
    this.initSeedData();
    const list = this.getStorage<Milestone[]>(STORAGE_KEYS.MILESTONES, SEED_MILESTONES);
    return list.filter((m) => m.projectId === Number(projectId));
  }

  public createMilestone(data: Partial<Milestone>): Milestone {
    const list = this.getStorage<Milestone[]>(STORAGE_KEYS.MILESTONES, SEED_MILESTONES);
    const newId = list.length > 0 ? Math.max(...list.map((m) => m.id)) + 1 : 1;
    const milestone: Milestone = {
      id: newId,
      projectId: data.projectId!,
      name: data.name || 'New Milestone',
      targetDate: data.targetDate || new Date().toISOString().split('T')[0],
      isFixed: !!data.isFixed,
      requiresSignoff: !!data.requiresSignoff,
      status: 'not_started',
      sortOrder: list.length + 1,
    };
    list.push(milestone);
    this.setStorage(STORAGE_KEYS.MILESTONES, list);
    return milestone;
  }

  // ─── Tasks & Scheduler ───
  public getAllTasks(): ProjectTask[] {
    this.initSeedData();
    return this.getStorage<ProjectTask[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
  }

  public getProjectTasks(projectId: number): ProjectTask[] {
    this.initSeedData();
    const all = this.getStorage<ProjectTask[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const projectTasks = all.filter((t) => t.projectId === Number(projectId));
    const deps = this.getDependencies(projectId);
    const project = this.getProjectById(projectId);
    const result = runScheduler(projectTasks, deps, project?.autoShiftMode || 'flexible');
    return result.tasks;
  }

  public saveTask(task: Partial<ProjectTask>): ProjectTask {
    const all = this.getStorage<ProjectTask[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    let updated: ProjectTask;
    if (task.id) {
      const idx = all.findIndex((t) => t.id === task.id);
      all[idx] = { ...all[idx], ...task };
      updated = all[idx];
    } else {
      const newId = all.length > 0 ? Math.max(...all.map((t) => t.id)) + 1 : 1;
      const countForProj = all.filter((t) => t.projectId === task.projectId).length + 1;
      updated = {
        id: newId,
        projectId: task.projectId,
        milestoneId: task.milestoneId,
        phaseId: task.phaseId,
        phaseName: task.phaseName,
        sprintId: task.sprintId,
        keyNumber: countForProj,
        title: task.title || 'Untitled Task',
        description: task.description || '',
        type: task.type || 'task',
        status: task.status || 'To Do',
        statusId: task.statusId,
        priority: task.priority || 'Medium',
        assigneeIds: task.assigneeIds || [1],
        assigneeNames: task.assigneeNames || ['Alex Mercer'],
        collaboratorIds: task.collaboratorIds || [],
        collaboratorNames: task.collaboratorNames || [],
        startDate: task.startDate || new Date().toISOString().split('T')[0],
        dueDate: task.dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        durationDays: task.durationDays || 3,
        estimatePoints: task.estimatePoints || 0,
        estimateMinutes: task.estimateMinutes || 720,
        remainingMinutes: task.remainingMinutes || 720,
        actualMinutes: task.actualMinutes || 0,
        billable: task.billable ?? true,
        subtasks: task.subtasks || [],
        comments: task.comments || [],
        attachments: task.attachments || [],
      };
      all.push(updated);
    }
    this.setStorage(STORAGE_KEYS.TASKS, all);
    return updated;
  }

  public deleteTask(taskId: number): boolean {
    const all = this.getStorage<ProjectTask[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const filtered = all.filter((t) => t.id !== taskId);
    this.setStorage(STORAGE_KEYS.TASKS, filtered);
    return true;
  }

  // ─── Dependencies ───
  public getDependencies(projectId: number): Dependency[] {
    this.initSeedData();
    const all = this.getStorage<Dependency[]>(STORAGE_KEYS.DEPENDENCIES, SEED_DEPENDENCIES);
    return all.filter((d) => d.projectId === Number(projectId));
  }

  public addDependency(dep: Omit<Dependency, 'id'>): { success: boolean; cycle?: number[] } {
    const all = this.getStorage<Dependency[]>(STORAGE_KEYS.DEPENDENCIES, SEED_DEPENDENCIES);
    const newId = all.length > 0 ? Math.max(...all.map((d) => d.id)) + 1 : 1;
    const candidate: Dependency = { ...dep, id: newId };
    const projectTasks = this.getProjectTasks(dep.projectId);
    const allDeps = [...all.filter((d) => d.projectId === dep.projectId), candidate];

    const cycle = detectCycle(allDeps, projectTasks.map((t) => t.id));
    if (cycle) {
      return { success: false, cycle };
    }

    all.push(candidate);
    this.setStorage(STORAGE_KEYS.DEPENDENCIES, all);
    return { success: true };
  }

  // ─── Sprints ───
  public getSprints(projectId: number): Sprint[] {
    this.initSeedData();
    const all = this.getStorage<Sprint[]>(STORAGE_KEYS.SPRINTS, SEED_SPRINTS);
    return all.filter((s) => s.projectId === Number(projectId));
  }

  public createSprint(data: Partial<Sprint>): Sprint {
    const all = this.getStorage<Sprint[]>(STORAGE_KEYS.SPRINTS, SEED_SPRINTS);
    const newId = all.length > 0 ? Math.max(...all.map((s) => s.id)) + 1 : 1;
    const sprint: Sprint = {
      id: newId,
      projectId: data.projectId!,
      name: data.name || `Sprint ${all.length + 1}`,
      goal: data.goal || '',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      capacity: data.capacity || 40,
      status: 'planned',
      committedPoints: 0,
      completedPoints: 0,
    };
    all.push(sprint);
    this.setStorage(STORAGE_KEYS.SPRINTS, all);
    return sprint;
  }

  // ─── Documents ───
  public getTemplates(): DocumentTemplate[] {
    this.initSeedData();
    return this.getStorage(STORAGE_KEYS.TEMPLATES, STARTER_TEMPLATES);
  }

  public getDocuments(projectId: number): ProjectDocument[] {
    this.initSeedData();
    const all = this.getStorage<ProjectDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
    return all.filter((d) => d.projectId === Number(projectId));
  }

  public updateDocumentStatus(id: number, status: ProjectDocument['status'], note?: string): boolean {
    const all = this.getStorage<ProjectDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
    const doc = all.find((d) => d.id === id);
    if (!doc) return false;
    doc.status = status;
    if (note) doc.notNeededReason = note;
    doc.updatedAt = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.DOCUMENTS, all);
    return true;
  }

  // ─── Time Tracking ───
  public isTimeTrackingEnabled(): boolean {
    const settings = this.getStorage(STORAGE_KEYS.ORG_SETTINGS, { time_tracking_enabled: true });
    return settings.time_tracking_enabled;
  }

  public setTimeTrackingEnabled(enabled: boolean): void {
    this.setStorage(STORAGE_KEYS.ORG_SETTINGS, { time_tracking_enabled: enabled });
  }

  public getTimeEntries(projectId?: number): TimeEntry[] {
    this.initSeedData();
    const all = this.getStorage<TimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, [
      {
        id: 1,
        userId: 2,
        userName: 'Hasmukh Patel',
        taskId: 3,
        taskTitle: 'Invoice Generation & PDF Export Service',
        projectId: 1,
        projectKey: 'CDR',
        category: 'Development',
        entryDate: '2026-11-19',
        minutes: 240,
        note: 'Designed HTML template to PDF vector pipeline',
        billable: true,
        source: 'timer',
        createdAt: '2026-11-19T14:00:00Z',
      },
    ]);
    return projectId ? all.filter((e) => e.projectId === projectId) : all;
  }

  public logTime(entry: Omit<TimeEntry, 'id' | 'createdAt'>): TimeEntry {
    const all = this.getTimeEntries();
    const newId = all.length > 0 ? Math.max(...all.map((e) => e.id)) + 1 : 1;
    const newEntry: TimeEntry = {
      ...entry,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newEntry);
    this.setStorage(STORAGE_KEYS.TIME_ENTRIES, all);
    return newEntry;
  }

  // ─── Dynamic Task Statuses ───
  public getTaskStatuses(projectId?: number): TaskStatus[] {
    this.initSeedData();
    const all = this.getStorage<TaskStatus[]>(STORAGE_KEYS.TASK_STATUSES, SEED_TASK_STATUSES);
    return all
      .filter((s) => s.isActive && (!s.projectId || (projectId && s.projectId === projectId)))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getAllTaskStatuses(): TaskStatus[] {
    this.initSeedData();
    return this.getStorage<TaskStatus[]>(STORAGE_KEYS.TASK_STATUSES, SEED_TASK_STATUSES);
  }

  public createTaskStatus(data: Partial<TaskStatus>): TaskStatus {
    const all = this.getAllTaskStatuses();
    const newId = all.length > 0 ? Math.max(...all.map((s) => s.id)) + 1 : 1;
    const newStatus: TaskStatus = {
      id: newId,
      name: data.name || 'New Status',
      slug: (data.name || 'status').toLowerCase().replace(/\s+/g, '_'),
      description: data.description || '',
      color: data.color || '#64748b',
      category: data.category || 'active',
      sortOrder: data.sortOrder || all.length + 1,
      isDefault: false,
      isActive: true,
      requiresApproval: !!data.requiresApproval,
      allowedTransitionIds: data.allowedTransitionIds || [],
      projectId: data.projectId || null,
    };
    all.push(newStatus);
    this.setStorage(STORAGE_KEYS.TASK_STATUSES, all);
    return newStatus;
  }

  public updateTaskStatus(id: number, data: Partial<TaskStatus>): TaskStatus | null {
    const all = this.getAllTaskStatuses();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    this.setStorage(STORAGE_KEYS.TASK_STATUSES, all);
    return all[idx];
  }

  public deleteTaskStatus(id: number): boolean {
    const all = this.getAllTaskStatuses();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    if (all[idx].isDefault) return false;
    all[idx].isActive = false;
    this.setStorage(STORAGE_KEYS.TASK_STATUSES, all);
    return true;
  }

  public reorderTaskStatuses(orderedIds: number[]): TaskStatus[] {
    const all = this.getAllTaskStatuses();
    orderedIds.forEach((id, index) => {
      const item = all.find((s) => s.id === id);
      if (item) item.sortOrder = index + 1;
    });
    this.setStorage(STORAGE_KEYS.TASK_STATUSES, all);
    return all.filter((s) => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public canTransition(fromStatusName: string, toStatusName: string): boolean {
    if (fromStatusName === toStatusName) return true;
    const all = this.getTaskStatuses();
    const fromStatus = all.find((s) => s.name === fromStatusName);
    const toStatus = all.find((s) => s.name === toStatusName);
    if (!fromStatus || !toStatus) return true; // allow if custom/unmatched
    if (!fromStatus.allowedTransitionIds || fromStatus.allowedTransitionIds.length === 0) return true;
    return fromStatus.allowedTransitionIds.includes(toStatus.id);
  }

  // ─── Dynamic Phases ───
  public getPhases(projectId: number): ProjectPhase[] {
    this.initSeedData();
    const all = this.getStorage<ProjectPhase[]>(STORAGE_KEYS.PHASES, SEED_PHASES);
    return all
      .filter((p) => p.projectId === Number(projectId))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public createPhase(data: Partial<ProjectPhase>): ProjectPhase {
    const all = this.getStorage<ProjectPhase[]>(STORAGE_KEYS.PHASES, SEED_PHASES);
    const newId = all.length > 0 ? Math.max(...all.map((p) => p.id)) + 1 : 1;
    const projPhases = all.filter((p) => p.projectId === data.projectId);
    const phase: ProjectPhase = {
      id: newId,
      projectId: data.projectId!,
      name: data.name || 'New Phase',
      description: data.description || '',
      sortOrder: data.sortOrder || projPhases.length + 1,
      ownerId: data.ownerId,
      ownerName: data.ownerName || 'Project Lead',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      color: data.color || '#3b82f6',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    all.push(phase);
    this.setStorage(STORAGE_KEYS.PHASES, all);
    return phase;
  }

  public updatePhase(id: number, data: Partial<ProjectPhase>): ProjectPhase | null {
    const all = this.getStorage<ProjectPhase[]>(STORAGE_KEYS.PHASES, SEED_PHASES);
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.setStorage(STORAGE_KEYS.PHASES, all);
    return all[idx];
  }

  public deletePhase(id: number): boolean {
    const all = this.getStorage<ProjectPhase[]>(STORAGE_KEYS.PHASES, SEED_PHASES);
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;
    this.setStorage(STORAGE_KEYS.PHASES, filtered);
    return true;
  }

  public reorderPhases(projectId: number, orderedIds: number[]): ProjectPhase[] {
    const all = this.getStorage<ProjectPhase[]>(STORAGE_KEYS.PHASES, SEED_PHASES);
    orderedIds.forEach((id, index) => {
      const item = all.find((p) => p.id === id && p.projectId === projectId);
      if (item) item.sortOrder = index + 1;
    });
    this.setStorage(STORAGE_KEYS.PHASES, all);
    return this.getPhases(projectId);
  }

  public getPhaseTemplates(): PhaseTemplate[] {
    this.initSeedData();
    return this.getStorage<PhaseTemplate[]>(STORAGE_KEYS.PHASE_TEMPLATES, SEED_PHASE_TEMPLATES);
  }

  public applyPhaseTemplate(projectId: number, templateId: number): ProjectPhase[] {
    const templates = this.getPhaseTemplates();
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return this.getPhases(projectId);

    const all = this.getStorage<ProjectPhase[]>(STORAGE_KEYS.PHASES, SEED_PHASES);
    const existingForProj = all.filter((p) => p.projectId === projectId);
    let nextOrder = existingForProj.length + 1;
    let baseDate = Date.now();

    const createdPhases: ProjectPhase[] = tmpl.phases.map((p, idx) => {
      const dur = p.durationDays || 14;
      const sDate = new Date(baseDate).toISOString().split('T')[0];
      const eDate = new Date(baseDate + dur * 86400000).toISOString().split('T')[0];
      baseDate += dur * 86400000;
      return {
        id: Date.now() + idx,
        projectId,
        name: p.name,
        description: p.description || '',
        sortOrder: nextOrder++,
        ownerName: 'Project Lead',
        startDate: sDate,
        endDate: eDate,
        color: p.color || '#3b82f6',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };
    });

    this.setStorage(STORAGE_KEYS.PHASES, [...all, ...createdPhases]);
    return this.getPhases(projectId);
  }

  // ─── Task Comments & Attachments ───
  public addTaskComment(taskId: number, comment: { userId: number; userName: string; content: string }): TaskComment {
    const allTasks = this.getStorage<ProjectTask[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const task = allTasks.find((t) => t.id === taskId);
    const newComment: TaskComment = {
      id: Date.now(),
      taskId,
      userId: comment.userId,
      userName: comment.userName,
      content: comment.content,
      createdAt: new Date().toISOString(),
    };
    if (task) {
      task.comments = [...(task.comments || []), newComment];
      this.setStorage(STORAGE_KEYS.TASKS, allTasks);
    }
    return newComment;
  }

  public addTaskAttachment(taskId: number, attachment: { name: string; url: string; sizeBytes?: number; uploadedBy: string }): TaskAttachment {
    const allTasks = this.getStorage<ProjectTask[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const task = allTasks.find((t) => t.id === taskId);
    const newAtt: TaskAttachment = {
      id: Date.now(),
      taskId,
      name: attachment.name,
      url: attachment.url,
      sizeBytes: attachment.sizeBytes || 102400,
      uploadedBy: attachment.uploadedBy,
      uploadedAt: new Date().toISOString(),
    };
    if (task) {
      task.attachments = [...(task.attachments || []), newAtt];
      this.setStorage(STORAGE_KEYS.TASKS, allTasks);
    }
    return newAtt;
  }

  public addSubtask(parentTaskId: number, subtask: Partial<ProjectTask>): ProjectTask {
    const allTasks = this.getStorage<ProjectTask[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const parent = allTasks.find((t) => t.id === parentTaskId);
    const newId = allTasks.length > 0 ? Math.max(...allTasks.map((t) => t.id)) + 1 : 1;
    const newSub: ProjectTask = {
      id: newId,
      projectId: parent?.projectId,
      milestoneId: parent?.milestoneId,
      phaseId: parent?.phaseId,
      parentTaskId,
      keyNumber: newId,
      title: subtask.title || 'New Subtask',
      description: subtask.description || '',
      type: 'task',
      status: 'To Do',
      priority: subtask.priority || 'Medium',
      assigneeIds: subtask.assigneeIds || (parent?.assigneeIds || [1]),
      assigneeNames: subtask.assigneeNames || (parent?.assigneeNames || ['Alex Mercer']),
      startDate: subtask.startDate || parent?.startDate,
      dueDate: subtask.dueDate || parent?.dueDate,
      durationDays: subtask.durationDays || 1,
      estimatePoints: subtask.estimatePoints || 1,
      estimateMinutes: subtask.estimateMinutes || 120,
      remainingMinutes: subtask.remainingMinutes || 120,
      billable: parent?.billable ?? true,
    };
    if (parent) {
      parent.subtasks = [...(parent.subtasks || []), newSub];
    }
    allTasks.push(newSub);
    this.setStorage(STORAGE_KEYS.TASKS, allTasks);
    return newSub;
  }

  public createTaskWithOwnership(payload: Partial<ProjectTask> & { projectId: number; title: string }): ProjectTask {
    const allTasks = this.getStorage<ProjectTask[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const newId = allTasks.length > 0 ? Math.max(...allTasks.map((t) => t.id)) + 1 : 1;
    const newTask: ProjectTask = {
      id: newId,
      projectId: payload.projectId,
      phaseId: payload.phaseId ?? null,
      phaseName: payload.phaseName,
      milestoneId: payload.milestoneId ?? null,
      parentTaskId: payload.parentTaskId ?? null,
      sprintId: payload.sprintId ?? null,
      keyNumber: newId,
      title: payload.title,
      description: payload.description || '',
      type: payload.type || 'task',
      status: payload.status || 'To Do',
      statusId: payload.statusId,
      priority: payload.priority || 'Medium',
      assigneeIds: payload.assigneeIds || (payload.assignedToId ? [payload.assignedToId] : [1]),
      assigneeNames: payload.assigneeNames || (payload.assignedToName ? [payload.assignedToName] : ['Alex Mercer']),
      collaboratorIds: payload.collaboratorIds || [],
      collaboratorNames: payload.collaboratorNames || [],
      startDate: payload.startDate,
      dueDate: payload.dueDate,
      durationDays: payload.durationDays || 3,
      estimatePoints: payload.estimatePoints || 2,
      estimateMinutes: payload.estimateMinutes || 240,
      remainingMinutes: payload.remainingMinutes || 240,
      actualMinutes: payload.actualMinutes || 0,
      billable: payload.billable ?? true,
      subtasks: [],
      comments: [],
      attachments: [],
      approvalStatus: payload.approvalStatus || 'pending',
      // 6A Ownership Fields
      createdById: payload.createdById,
      createdByName: payload.createdByName,
      assignedById: payload.assignedById,
      assignedByName: payload.assignedByName,
      assignedToId: payload.assignedToId,
      assignedToName: payload.assignedToName,
      reportingManagerId: payload.reportingManagerId,
      reportingManagerName: payload.reportingManagerName,
      deptHeadId: payload.deptHeadId,
      deptHeadName: payload.deptHeadName,
      projectManagerId: payload.projectManagerId,
      projectManagerName: payload.projectManagerName,
      reviewedById: payload.reviewedById,
      reviewedByName: payload.reviewedByName,
      approvedById: payload.approvedById,
      approvedByName: payload.approvedByName,
      departmentId: payload.departmentId,
      departmentName: payload.departmentName,
      assignmentHistory: [],
    };
    allTasks.push(newTask);
    this.setStorage(STORAGE_KEYS.TASKS, allTasks);
    return newTask;
  }

  public reassignTask(
    taskId: number,
    newAssigneeId: number,
    newAssigneeName: string,
    reassignedById: number,
    reassignedByName: string,
    reason?: string
  ): ProjectTask | undefined {
    const allTasks = this.getStorage<ProjectTask[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return undefined;

    const historyItem: import('@/types/department').TaskAssignmentHistoryItem = {
      id: Date.now(),
      taskId,
      fromUserId: task.assignedToId || (task.assigneeIds?.[0]),
      fromUserName: task.assignedToName || (task.assigneeNames?.[0]),
      toUserId: newAssigneeId,
      toUserName: newAssigneeName,
      reassignedById,
      reassignedByName,
      reason,
      timestamp: new Date().toISOString(),
    };

    task.assignedToId = newAssigneeId;
    task.assignedToName = newAssigneeName;
    task.assigneeIds = [newAssigneeId];
    task.assigneeNames = [newAssigneeName];
    task.assignmentHistory = [...(task.assignmentHistory || []), historyItem];

    this.setStorage(STORAGE_KEYS.TASKS, allTasks);
    return task;
  }
}

export const projectService = new ProjectService();
