import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban, MessageSquare, Play, FileText, Clock,
  ArrowLeft, Calendar, Sparkles, Columns, ListTodo, Layers, Activity,
} from 'lucide-react';
import { projectService } from '@/services/projectService';
import type { Milestone as MilestoneType, ProjectTask, Dependency, Sprint, ProjectDocument } from '@/types/project';
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
import { useGetProjectByIdQuery, useUpdateProjectMutation, useGetProjectTasksQuery } from '@/store/api/projectApiSlice';
import type { BackendProject, BackendTask } from '@/store/api/projectApiSlice';

// Map BackendProject → local Project shape (best-effort)
function mapBackendToLocal(bp: BackendProject): Project {
  return {
    id: bp.project_id,
    name: bp.project_name,
    key: bp.project_key || 'N/A',
    description: bp.project_description || '',
    clientName: '',
    status: (bp.project_status as Project['status']) || 'planning',
    health: (bp.health as Project['health']) || 'on_track',
    methodology: (bp.methodology as Project['methodology']) || 'scrum',
    estimationUnit: 'hours',
    autoShiftMode: 'flexible',
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

function mapBackendTaskToProjectTask(bt: BackendTask, _projectKey: string = 'PRJ'): ProjectTask {
  let mappedStatus: ProjectTask['status'] = 'To Do';
  const raw = (bt.task_status || '').trim();
  if (raw === 'Completed' || raw === 'Done') mappedStatus = 'Done';
  else if (raw === 'On-Going' || raw === 'In Progress' || raw === 'In-Progress') mappedStatus = 'In Progress';
  else if (raw === 'In Review' || raw === 'In-Review') mappedStatus = 'In Review';
  else if (raw === 'Blocked') mappedStatus = 'Blocked';
  else mappedStatus = 'To Do';

  return {
    id: bt.task_id,
    projectId: bt.project_id || 0,
    keyNumber: bt.task_id,
    title: bt.task_title,
    description: bt.task_description || '',
    type: (bt.task_type as ProjectTask['type']) || 'task',
    priority: (bt.priority as ProjectTask['priority']) || 'Medium',
    status: mappedStatus,
    startDate: bt.start_date ? String(bt.start_date).slice(0, 10) : '',
    dueDate: bt.due_date ? String(bt.due_date).slice(0, 10) : '',
    durationDays: bt.duration || 1,
    assignedToId: bt.allocated_to,
    assignedToName: bt.allocated_to_name || 'Unassigned',
    assignedToImage: bt.allocated_to_image,
    assigneeNames: bt.allocated_to_name ? [bt.allocated_to_name] : [],
    assignedById: bt.allocated_by,
    assignedByName: bt.allocated_by_name,
    reportingManagerId: bt.reporting_manager_id,
    reportingManagerName: bt.reporting_manager_name,
    deptHeadId: bt.dept_head_id,
    deptHeadName: bt.dept_head_name,
    departmentId: bt.department_id,
    departmentName: bt.department_name,
    createdAt: bt.created_at || '',
    updatedAt: bt.created_at || '',
  };
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSmartTaskModal, setShowSmartTaskModal] = useState(false);

  const projectId = id ? Number(id) : undefined;

  // Try real API first
  const { data: backendProject, isLoading: loadingReal, refetch: refetchReal } = useGetProjectByIdQuery(projectId!, {
    skip: !projectId || isNaN(projectId),
  });

  const { data: backendTasks = [], refetch: refetchTasks } = useGetProjectTasksQuery(
    projectId ? { projectId } : undefined,
    { skip: !projectId || isNaN(projectId) }
  );

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
    loadLocalData();
  };

  // Merge live backend tasks and local storage tasks
  const tasks: ProjectTask[] = useMemo(() => {
    const live = backendTasks.map((bt) => mapBackendTaskToProjectTask(bt, backendProject?.project_key || 'PRJ'));
    if (live.length === 0) return localTasks;
    // Combine live and local so newly created items never disappear
    const liveIds = new Set(live.map((t) => t.id));
    const merged = [...live];
    for (const lt of localTasks) {
      if (!liveIds.has(lt.id)) {
        merged.push(lt);
      }
    }
    return merged;
  }, [backendTasks, localTasks, backendProject?.project_key]);

  if (loadingReal) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" tip="Loading project..." />
      </div>
    );
  }

  // Prefer backend data, fall back to local
  const project: Project | null = backendProject
    ? mapBackendToLocal(backendProject)
    : localProject;

  if (!project) {
    return (
      <div className="flex justify-center items-center py-24 text-muted">
        Project not found.{' '}
        <Button type="link" onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  const handleStartProject = async () => {
    if (backendProject) {
      try {
        await updateProject({ id: backendProject.project_id, data: { project_status: 'active' } }).unwrap();
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

  const doneDocsCount = documents.filter((d) => d.status === 'done').length;
  const activeDocsCount = documents.filter((d) => d.status !== 'not_needed').length;

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
          milestones={milestones}
          tasks={tasks}
          sprints={sprints}
          onTabChange={setActiveTab}
          onProjectUpdated={loadData}
        />
      ),
    },
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
          milestones={milestones}
          tasks={tasks}
          dependencies={dependencies}
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
          milestones={milestones}
          onTasksUpdated={loadData}
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
          milestones={milestones}
          tasks={tasks}
          phases={phases}
          onTasksUpdated={loadData}
        />
      ),
    },
    {
      key: 'phases',
      label: (
        <span className="flex items-center gap-1.5 font-bold">
          <Layers size={14} /> Phases
          <Tag className="ml-1 text-[10px] m-0 rounded-full" color="blue">
            {phases.length}
          </Tag>
        </span>
      ),
      children: (
        <PhasesTab
          project={project}
          phases={phases}
          tasks={tasks}
          onPhasesUpdated={loadData}
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
          sprints={sprints}
          onSprintsUpdated={loadData}
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
        <DocumentsTab
          project={project}
          documents={documents}
          onDocumentsUpdated={loadData}
        />
      ),
    },
    {
      key: 'time',
      label: (
        <span className="flex items-center gap-1.5 font-bold">
          <Clock size={14} /> My Time
        </span>
      ),
      children: <TimeTab project={project} tasks={tasks} />,
    },
    // Activity tab — real backend data
    ...(backendProject
      ? [{
          key: 'activity',
          label: (
            <span className="flex items-center gap-1.5 font-bold">
              <Activity size={14} /> Activity
            </span>
          ),
          children: <ActivityTab projectId={backendProject.project_id} />,
        }]
      : []),
    // Settings tab — real backend data & team management
    ...(backendProject
      ? [{
          key: 'settings',
          label: (
            <span className="flex items-center gap-1.5 font-bold">
              <Settings size={14} /> Settings
            </span>
          ),
          children: (
            <ProjectSettingsTab
              project={backendProject}
              onProjectUpdated={loadData}
            />
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/projects')}
            className="rounded-xl"
            title="Back to Projects"
          />
          <div>
            <Space size={8} wrap>
              <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                {project.key}
              </span>
              <h1 className="text-xl font-black text-foreground">{project.name}</h1>
              <StatusTag status={project.status} />
              {project.departmentName && (
                <Tag color="blue" className="text-xs font-semibold m-0">
                  {project.departmentName}
                </Tag>
              )}
            </Space>
            <div className="flex items-center gap-3 text-xs text-muted mt-1">
              <span>{project.description || 'General Project'}</span>
              {project.ownerName && (
                <span className="flex items-center gap-1">
                  · <span className="text-muted-foreground font-medium">Owner:</span>
                  <AssigneeAvatar name={project.ownerName} size={16} showName />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <Space wrap>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setShowSmartTaskModal(true)}
            className="rounded-xl font-bold text-xs shadow-xs">
            Add Task
          </Button>

          {project.status === 'planning' && (
            <Button
              type="primary"
              icon={<Play size={14} />}
              onClick={handleStartProject}
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold shadow-xs">
              Start Project
            </Button>
          )}

          <Button
            icon={<Settings size={14} />}
            onClick={() => setActiveTab('settings')}
            className="rounded-xl font-bold text-xs shadow-xs">
            Settings
          </Button>

          <Button
            icon={<MessageSquare size={14} className="text-primary" />}
            onClick={() => navigate('/channels')}
            className="rounded-xl font-bold text-xs shadow-xs">
            Team Chat
          </Button>
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
