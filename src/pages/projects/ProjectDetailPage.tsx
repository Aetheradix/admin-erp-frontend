import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  MessageSquare,
  Play,
  FileText,
  Clock,
  ArrowLeft,
  Calendar,
  Sparkles,
  Columns,
  ListTodo,
  Layers,
} from 'lucide-react';
import { projectService } from '@/services/projectService';
import type { Project, Milestone as MilestoneType, ProjectTask, Dependency, Sprint, ProjectDocument } from '@/types/project';
import type { ProjectPhase } from '@/types/phase';
import { OverviewTab } from './tabs/OverviewTab';
import { BoardTab } from './tabs/BoardTab';
import { ListTab } from './tabs/ListTab';
import { PhasesTab } from './tabs/PhasesTab';
import { TimelineTab } from './tabs/TimelineTab';
import { SprintsTab } from './tabs/SprintsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { TimeTab } from './tabs/TimeTab';
import { Tabs, Button, Tag, Space, message } from 'antd';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<MilestoneType[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);

  const loadData = () => {
    if (!id) return;
    const proj = projectService.getProjectById(Number(id));
    if (!proj) {
      message.error('Project not found');
      navigate('/projects');
      return;
    }
    setProject(proj);
    setMilestones(projectService.getMilestones(proj.id));
    setPhases(projectService.getPhases(proj.id));
    setTasks(projectService.getProjectTasks(proj.id));
    setDependencies(projectService.getDependencies(proj.id));
    setSprints(projectService.getSprints(proj.id));
    setDocuments(projectService.getDocuments(proj.id));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!project) return null;

  const handleStartProject = () => {
    const updated = projectService.updateProjectStatus(project.id, 'active');
    if (updated) {
      setProject(updated);
      message.success(`Project ${project.name} is now ACTIVE! Team chat channel created.`);
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
            <Space size={8}>
              <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                {project.key}
              </span>
              <h1 className="text-xl font-black text-foreground">{project.name}</h1>
              <Tag
                color={project.status === 'active' ? 'green' : 'gold'}
                className="font-bold text-[10px] uppercase rounded-md m-0">
                {project.status.replace('_', ' ')}
              </Tag>
            </Space>
            <p className="text-xs text-muted mt-0.5">{project.description || project.clientName}</p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <Space>
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
    </div>
  );
}
