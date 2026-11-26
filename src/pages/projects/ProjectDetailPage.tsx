import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FolderKanban,
  Play,
  FileText,
  Clock,
  ArrowLeft,
  Calendar,
  Sparkles,
  Columns,
  ListTodo,
  Layers,
  Activity,
} from 'lucide-react';
import { projectService } from '@/services/projectService';
import type {
  Milestone as MilestoneType,
  ProjectTask,
  Dependency,
  Sprint,
  ProjectDocument,
} from '@/types/project';
import type { Project } from '@/types/project';
import type { ProjectPhase } from '@/types/phase';
import { OverviewTab } from './tabs/OverviewTab';
import { BoardTab } from './tabs/BoardTab';
import { ListTab } from './tabs/ListTab';
import { PhasesTab } from './tabs/PhasesTab';
import { TimelineTab } from './tabs/TimelineTab';
import { SprintsTab } from './tabs/SprintsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { TimeTab } from './tabs/TimeTab';
import { ActivityTab } from './tabs/ActivityTab';
import { ProjectSettingsTab } from './tabs/ProjectSettingsTab';
import { SmartTaskCreateModal } from './modals/SmartTaskCreateModal';
import { StatusTag } from '@/components/projects/StatusTag';
import { AssigneeAvatar } from '@/components/projects/AssigneeAvatar';
import { Tabs, Button, Tag, Space, message, Spin } from 'antd';
import { Plus, Settings } from 'lucide-react';
import {
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
  useGetProjectTasksQuery,
  useGetMilestonesQuery,
  useGetSprintsQuery,
  useGetDependenciesQuery,
  useGetProjectDocumentsQuery,
  useGetTimeSettingQuery,
} from '@/store/api/projectApiSlice';
import type {
  BackendProject,
  BackendTask,
  BackendMilestone,
  BackendSprint,
  BackendDependency,
  BackendProjectDocument,
} from '@/store/api/projectApiSlice';

// Map BackendProject → local Project shape (best-effort)
function mapBackendToLocal(bp: BackendProject): Project {
  return {
    id: bp.project_id,
    name: bp.project_name,
    key: bp.project_key || 'N/A',
    description: bp.project_description || '',
    clientName: bp.client_name || '',
    status: (bp.project_status as Project['status']) || 'planning',
    health: (bp.health as Project['health']) || 'on_track',
    methodology: (bp.methodology as Project['methodology']) || 'scrum',
    estimationUnit: bp.estimation_unit || 'hours',
    autoShiftMode: bp.auto_shift_mode || 'flexible',
    projectType: bp.project_type || 'General',
    mode: bp.mode || 'simple',
    leadUserId: bp.owner_user_id || bp.project_manager_id || 1,
    startDate: bp.start_date || '',
    targetDate: bp.end_date || bp.deadline || '',
    departmentId: bp.department_id,
    departmentName: bp.department_name || '',
    createdById: bp.created_by,
    createdByName: bp.created_by_name || '',
    ownerUserId: bp.owner_user_id,
    ownerName: bp.owner_name || '',
    projectManagerId: bp.project_manager_id,
    projectManagerName: bp.project_manager_name || '',
    members: [],
    createdAt: bp.created_at || '',
    updatedAt: '',
    ownershipTransferHistory: [],
  };
}

function mapBackendMilestoneToLocal(bm: BackendMilestone): MilestoneType {
  return {
    id: bm.id,
    projectId: bm.project_id,
    name: bm.name,
    description: bm.description || '',
    targetDate: bm.target_date ? String(bm.target_date).slice(0, 10) : '',
    ownerUserId: bm.owner_id || 1,
    ownerName: bm.owner_name || 'Unassigned',
    isFixed: Boolean(bm.is_fixed),
    requiresSignoff: Boolean(bm.requires_signoff),
    signoffStatus: bm.approval_status || 'pending',
    status: bm.status === 'blocked' ? 'missed' : bm.status || 'not_started',
    progress: bm.progress ?? 0,
    sortOrder: bm.sort_order ?? 0,
  };
}

function mapBackendSprintToLocal(bs: BackendSprint): Sprint {
  return {
    id: bs.id,
    projectId: bs.project_id,
    name: bs.name,
    goal: bs.goal || '',
    startDate: bs.start_date ? String(bs.start_date).slice(0, 10) : '',
    endDate: bs.end_date ? String(bs.end_date).slice(0, 10) : '',
    capacity: bs.capacity_points ?? bs.capacity_hours ?? 0,
    status: bs.status === 'planning' ? 'planned' : bs.status || 'planned',
    committedPoints: bs.total_points ?? 0,
    completedPoints: 0,
  };
}

function mapBackendDepToLocal(bd: BackendDependency): Dependency {
  return {
    id: bd.id,
    projectId: bd.project_id,
    predecessorId: bd.predecessor_id,
    successorId: bd.successor_id,
    depType: bd.dependency_type || 'FS',
    lagDays: bd.lag_days ?? 0,
  };
}

function mapBackendDocToLocal(bd: BackendProjectDocument): ProjectDocument {
  return {
    id: bd.id,
    projectId: bd.project_id,
    name: bd.name,
    phase: (bd.phase as ProjectDocument['phase']) || 'planning',
    ownerRole: bd.owner_role || 'Project Manager',
    ownerUserId: bd.assigned_user_id,
    ownerName: bd.assigned_user_name,
    dueDate: bd.due_date ? String(bd.due_date).slice(0, 10) : '',
    milestoneId: bd.milestone_id,
    status: bd.status || 'not_started',
    fileUrl: bd.file_url,
    fileName: bd.file_name,
    fileSizeBytes: bd.file_size,
    externalLink: bd.external_link,
    notNeededReason: bd.not_needed_reason,
    updatedAt: bd.uploaded_at,
  };
}

function mapBackendTaskToProjectTask(bt: BackendTask, _projectKey: string = 'PRJ'): ProjectTask {
  let mappedStatus: ProjectTask['status'] = 'To Do';
  const raw = (bt.task_status || '').trim();
  if (raw === 'Completed' || raw === 'Done') mappedStatus = 'Done';
  else if (raw === 'On-Going' || raw === 'In Progress' || raw === 'In-Progress')
    mappedStatus = 'In Progress';
  else if (
    raw === 'In Review' ||
    raw === 'In-Review' ||
    raw === 'QA' ||
    raw === 'In QA' ||
    raw === 'Testing'
  )
    mappedStatus = 'In Review';
  else if (raw === 'Blocked') mappedStatus = 'Blocked';
  else if (raw === 'Cancelled') mappedStatus = 'Cancelled';
  else mappedStatus = 'To Do';

  const assigneeId = bt.allocated_to || 1;
  const assigneeName = bt.allocated_to_name || 'Unassigned';

  return {
    id: bt.task_id,
    projectId: bt.project_id || 0,
    keyNumber: bt.task_id,
    title: bt.task_title,
    description: bt.task_description || '',
    type: (bt.task_type as ProjectTask['type']) || 'task',
    priority: (bt.priority as ProjectTask['priority']) || 'Medium',
    status: mappedStatus,
    assigneeIds: [assigneeId],
    assigneeNames: [assigneeName],
    durationDays: bt.duration || 1,
    estimatePoints: bt.estimate_points ?? 1,
    estimateMinutes: Math.round((bt.estimate_hours ?? 1) * 60),
    remainingMinutes: Math.round((bt.remaining_hours ?? bt.estimate_hours ?? 1) * 60),
    billable: bt.is_billable !== undefined ? Boolean(bt.is_billable) : true,
    milestoneId: bt.milestone_id ?? undefined,
    parentTaskId: bt.parent_task_id ?? undefined,
    sprintId: bt.sprint_id ?? undefined,
    remark: bt.blocked_reason || bt.remark || undefined,
    startDate: bt.start_date ? String(bt.start_date).slice(0, 10) : '',
    dueDate: bt.due_date ? String(bt.due_date).slice(0, 10) : '',
    assignedToId: bt.allocated_to,
    assignedToName: assigneeName,
    assignedById: bt.allocated_by,
    assignedByName: bt.allocated_by_name,
    reportingManagerId: bt.reporting_manager_id,
    reportingManagerName: bt.reporting_manager_name,
    deptHeadId: bt.dept_head_id,
    deptHeadName: bt.dept_head_name,
    departmentId: bt.department_id,
    departmentName: bt.department_name,
  };
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab }, { replace: true });
  };
  const [showSmartTaskModal, setShowSmartTaskModal] = useState(false);

  const projectId = id ? Number(id) : undefined;

  // Try real API first
  const {
    data: backendProject,
    isLoading: loadingReal,
    refetch: refetchReal,
  } = useGetProjectByIdQuery(projectId!, {
    skip: !projectId || isNaN(projectId),
  });

  const { data: backendTasks = [], refetch: refetchTasks } = useGetProjectTasksQuery(
    projectId ? { projectId } : undefined,
    { skip: !projectId || isNaN(projectId) }
  );

  const { data: backendMilestones = [], refetch: refetchMilestones } = useGetMilestonesQuery(
    projectId!,
    { skip: !projectId || isNaN(projectId) }
  );
  const { data: backendSprints = [], refetch: refetchSprints } = useGetSprintsQuery(
    projectId!,
    { skip: !projectId || isNaN(projectId) }
  );
  const { data: backendDeps = [], refetch: refetchDeps } = useGetDependenciesQuery(
    projectId!,
    { skip: !projectId || isNaN(projectId) }
  );
  const { data: backendDocs = [], refetch: refetchDocs } = useGetProjectDocumentsQuery(
    projectId!,
    { skip: !projectId || isNaN(projectId) }
  );
  const { data: timeSetting } = useGetTimeSettingQuery();
  const timeTrackingEnabled = timeSetting?.enabled ?? true;

  const [updateProject] = useUpdateProjectMutation();

  // Local state for localStorage fallback data
  const [milestones, setMilestones] = useState<MilestoneType[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [localTasks, setLocalTasks] = useState<ProjectTask[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [localProject, setLocalProject] = useState<Project | null>(null);

  const loadLocalData = () => {
    if (!id) return;
    const numId = Number(id);
    // Load supporting data from localStorage service
    const proj = projectService.getProjectById(numId);
    if (proj) {
      setLocalProject(proj);
      setMilestones(projectService.getMilestones(proj.id));
      setPhases(projectService.getPhases(proj.id));
      setLocalTasks(projectService.getProjectTasks(proj.id));
      setDependencies(projectService.getDependencies(proj.id));
      setSprints(projectService.getSprints(proj.id));
      setDocuments(projectService.getDocuments(proj.id));
    } else {
      // Still load any local tasks created for this project ID
      setLocalTasks(projectService.getProjectTasks(numId));
      setMilestones([]);
      setPhases([]);
      setDependencies([]);
      setSprints([]);
      setDocuments([]);
    }
  };

  useEffect(() => {
    loadLocalData();
  }, [id]);

  const loadData = () => {
    refetchReal();
    refetchTasks();
    refetchMilestones();
    refetchSprints();
    refetchDeps();
    refetchDocs();
    loadLocalData();
  };

  const effectiveMilestones: MilestoneType[] = useMemo(() => {
    if (backendMilestones.length > 0) return backendMilestones.map(mapBackendMilestoneToLocal);
    return milestones;
  }, [backendMilestones, milestones]);

  const effectiveSprints: Sprint[] = useMemo(() => {
    if (backendSprints.length > 0) return backendSprints.map(mapBackendSprintToLocal);
    return sprints;
  }, [backendSprints, sprints]);

  const effectiveDependencies: Dependency[] = useMemo(() => {
    if (backendDeps.length > 0) return backendDeps.map(mapBackendDepToLocal);
    return dependencies;
  }, [backendDeps, dependencies]);

  const effectiveDocuments: ProjectDocument[] = useMemo(() => {
    if (backendDocs.length > 0) return backendDocs.map(mapBackendDocToLocal);
    return documents;
  }, [backendDocs, documents]);

  // Prefer live backend tasks when backendProject is loaded; fall back to local only when offline
  const tasks: ProjectTask[] = useMemo(() => {
    if (backendProject) {
      return backendTasks.map((bt) =>
        mapBackendTaskToProjectTask(bt, backendProject.project_key || 'PRJ')
      );
    }
    return localTasks;
  }, [backendProject, backendTasks, localTasks]);

  if (loadingReal) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" tip="Loading project..." />
      </div>
    );
  }

  // Prefer backend data, fall back to local
  const project: Project | null = backendProject ? mapBackendToLocal(backendProject) : localProject;

  if (!project) {
    return (
      <div className="flex justify-center items-center py-24 text-muted">
        Project not found.{' '}
        <Button type="link" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const handleStartProject = async () => {
    if (backendProject) {
      try {
        await updateProject({
          id: backendProject.project_id,
          data: { project_status: 'active' },
        }).unwrap();
        message.success(`Project ${project.name} is now ACTIVE!`);
        refetchReal();
      } catch {
        // fallback to local
        const updated = projectService.updateProjectStatus(project.id, 'active');
        if (updated) {
          loadLocalData();
          message.success(`Project ${project.name} is now ACTIVE!`);
        }
      }
    } else {
      const updated = projectService.updateProjectStatus(project.id, 'active');
      if (updated) {
        loadLocalData();
        message.success(`Project ${project.name} is now ACTIVE!`);
      }
    }
  };

  const doneDocsCount = effectiveDocuments.filter((d) => d.status === 'done').length;
  const activeDocsCount = effectiveDocuments.filter((d) => d.status !== 'not_needed').length;
  const isAdvancedMode = project.mode === 'advanced';

  const handleToggleMode = async () => {
    const nextMode = isAdvancedMode ? 'simple' : 'advanced';
    if (backendProject) {
      try {
        await updateProject({
          id: backendProject.project_id,
          data: { mode: nextMode },
        }).unwrap();
        message.success(`Advanced tools ${nextMode === 'advanced' ? 'enabled' : 'turned off'}`);
        refetchReal();
      } catch {
        message.error('Failed to switch project mode');
      }
    }
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span className="flex items-center gap-1.5 font-bold">
          <FolderKanban size={14} /> Overview
        </span>
      ),
      children: (
        <OverviewTab
          project={project}
          milestones={effectiveMilestones}
          tasks={tasks}
          sprints={effectiveSprints}
          documents={effectiveDocuments}
          onTabChange={setActiveTab}
          onAddTask={() => setShowSmartTaskModal(true)}
          onProjectUpdated={loadData}
        />
      ),
    },
    {
      key: 'list',
      label: (
        <span className="flex items-center gap-1.5 font-bold">
          <ListTodo size={14} /> List
        </span>
      ),
      children: (
        <ListTab
          project={project}
          milestones={effectiveMilestones}
          tasks={tasks}
          phases={phases}
          onTasksUpdated={loadData}
        />
      ),
    },
    {
      key: 'board',
      label: (
        <span className="flex items-center gap-1.5 font-bold">
          <Columns size={14} /> Board
        </span>
      ),
      children: (
        <BoardTab
          project={project}
          tasks={tasks}
          phases={phases}
          milestones={effectiveMilestones}
          onTasksUpdated={loadData}
        />
      ),
    },
    {
      key: 'documents',
      label: (
        <span className="flex items-center gap-1.5 font-bold">
          <FileText size={14} /> Documents
          <Tag className="ml-1 text-[10px] m-0 rounded-full" color="default">
            {doneDocsCount}/{activeDocsCount}
          </Tag>
        </span>
      ),
      children: (
        <DocumentsTab project={project} documents={effectiveDocuments} onDocumentsUpdated={loadData} />
      ),
    },
    ...(isAdvancedMode
      ? [
          {
            key: 'timeline',
            label: (
              <span className="flex items-center gap-1.5 font-bold">
                <Calendar size={14} /> Timeline (Gantt)
              </span>
            ),
            children: (
              <TimelineTab
                project={project}
                milestones={effectiveMilestones}
                tasks={tasks}
                dependencies={effectiveDependencies}
                onUpdated={loadData}
              />
            ),
          },
          {
            key: 'sprints',
            label: (
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles size={14} /> Sprints
              </span>
            ),
            children: (
              <SprintsTab
                project={project}
                sprints={effectiveSprints}
                tasks={tasks}
                onSprintsUpdated={loadData}
              />
            ),
          },
          ...(timeTrackingEnabled
            ? [
                {
                  key: 'time',
                  label: (
                    <span className="flex items-center gap-1.5 font-bold">
                      <Clock size={14} /> My Time
                    </span>
                  ),
                  children: <TimeTab project={project} tasks={tasks} />,
                },
              ]
            : []),
        ]
      : []),
    {
      key: 'phases',
      label: (
        <span className="flex items-center gap-1.5 font-bold">
          <Layers size={14} /> Steps & Milestones
          <Tag className="ml-1 text-[10px] m-0 rounded-full" color="blue">
            {effectiveMilestones.length || phases.length}
          </Tag>
        </span>
      ),
      children: (
        <PhasesTab
          project={project}
          phases={phases}
          milestones={effectiveMilestones}
          tasks={tasks}
          onPhasesUpdated={loadData}
        />
      ),
    },
    // Activity tab — real backend data
    ...(backendProject
      ? [
          {
            key: 'activity',
            label: (
              <span className="flex items-center gap-1.5 font-bold">
                <Activity size={14} /> Activity
              </span>
            ),
            children: <ActivityTab projectId={backendProject.project_id} />,
          },
        ]
      : []),
    // Settings tab — real backend data & team management
    ...(backendProject
      ? [
          {
            key: 'settings',
            label: (
              <span className="flex items-center gap-1.5 font-bold">
                <Settings size={14} /> Settings
              </span>
            ),
            children: <ProjectSettingsTab project={backendProject} onProjectUpdated={loadData} />,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="flex items-start gap-3">
          <Button
            type="text"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/projects')}
            className="rounded-xl mt-0.5"
            title="Back to Projects"
          />
          <div>
            <div className="text-xs text-muted mb-1 flex items-center gap-1.5">
              <span
                className="hover:text-primary cursor-pointer"
                onClick={() => navigate('/projects')}>
                Projects
              </span>
              <span>/</span>
              <span className="text-foreground font-semibold">{project.name}</span>
            </div>
            <Space size={8} wrap>
              <h1 className="text-xl font-black text-foreground m-0">{project.name}</h1>
              <Tag
                color={
                  project.health === 'on_track'
                    ? 'green'
                    : project.health === 'at_risk'
                      ? 'gold'
                      : 'red'
                }
                className="text-xs font-semibold m-0">
                {project.health === 'on_track'
                  ? 'On track'
                  : project.health === 'at_risk'
                    ? 'At risk'
                    : 'Off track'}
              </Tag>
              <StatusTag status={project.status} />
            </Space>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-1">
              <span>{project.projectType || 'General'}</span>
              <span>·</span>
              <span>{project.clientName || 'Internal'}</span>
              {project.ownerName && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    Lead <AssigneeAvatar name={project.ownerName} size={16} showName />
                  </span>
                </>
              )}
              {(project.startDate || project.targetDate) && (
                <>
                  <span>·</span>
                  <span>
                    {project.startDate ? String(project.startDate).slice(0, 10) : '—'} →{' '}
                    {project.targetDate ? String(project.targetDate).slice(0, 10) : 'No end date'}
                  </span>
                </>
              )}
              <span>·</span>
              <span>{isAdvancedMode ? 'Advanced mode' : 'Simple mode'}</span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <Space wrap>
          <Button
            onClick={() => setActiveTab('documents')}
            className="rounded-xl font-semibold text-xs shadow-xs">
            Documents{' '}
            <span className="ml-1 font-mono text-emerald-600 font-bold">
              {doneDocsCount}/{activeDocsCount}
            </span>
          </Button>

          <Button
            onClick={() => setActiveTab('settings')}
            className="rounded-xl font-semibold text-xs shadow-xs">
            Members
          </Button>

          <Button
            onClick={handleToggleMode}
            className={`rounded-xl font-semibold text-xs shadow-xs ${
              isAdvancedMode ? 'border-primary text-primary' : ''
            }`}>
            Advanced tools: {isAdvancedMode ? 'on' : 'off'}
          </Button>

          {project.status === 'planning' ? (
            <Button
              type="primary"
              icon={<Play size={14} />}
              onClick={handleStartProject}
              className="rounded-xl font-bold text-xs shadow-xs">
              Start project
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<Plus size={14} />}
              onClick={() => setShowSmartTaskModal(true)}
              className="rounded-xl font-bold text-xs shadow-xs">
              + Task
            </Button>
          )}
        </Space>
      </div>

      {/* Ant Design Navigation Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        className="projects-detail-tabs"
      />

      {/* Smart Task Assignment Wizard */}
      <SmartTaskCreateModal
        visible={showSmartTaskModal}
        projectId={project.id}
        projectKey={project.key}
        phases={phases}
        onClose={() => setShowSmartTaskModal(false)}
        onSuccess={() => {
          setShowSmartTaskModal(false);
          loadData();
          message.success('Task created and assigned successfully!');
        }}
      />
    </div>
  );
}
