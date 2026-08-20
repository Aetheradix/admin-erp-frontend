import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import { useGetProjectsQuery } from '@/store/api/projectApiSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import TextArea from 'antd/es/input/TextArea';
import { message } from 'antd';

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: number;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'Pending' | 'On-Going';
  remark?: string;
  project: number;
  duration: string;
  assigneeTo: number | null;
}
//

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Design new dashboard layout',
    description:
      'Create a modern and user-friendly dashboard with updated navigation, widgets, and responsive layouts.',
    assignee: 1,
    priority: 'High',
    dueDate: '2026-06-15',
    status: 'In Progress',
    project: 1,
    duration: '5 Days',
    assigneeTo: 2,
  },
  {
    id: 2,
    title: 'Implement authentication flow',
    description:
      'Develop secure login, registration, password reset, and session management using JWT authentication.',
    assignee: 2,
    priority: 'High',
    dueDate: '2026-06-12',
    status: 'In Progress',
    project: 2,
    duration: '7 Days',
    assigneeTo: 3,
  },
  {
    id: 3,
    title: 'Write API documentation',
    description:
      'Document all REST API endpoints, request/response formats, authentication, and usage examples.',
    assignee: 3,
    priority: 'Medium',
    dueDate: '2026-06-20',
    status: 'To Do',
    project: 1,
    duration: '3 Days',
    assigneeTo: 1,
  },
  {
    id: 4,
    title: 'Database schema optimization',
    description:
      'Review database tables, add indexes where necessary, and optimize queries for better performance.',
    assignee: 4,
    priority: 'High',
    dueDate: '2026-06-11',
    status: 'Done',
    project: 3,
    duration: '4 Days',
    assigneeTo: 2,
  },
  {
    id: 5,
    title: 'User onboarding emails',
    description:
      'Design and implement a welcome email sequence to guide new users through key product features.',
    assignee: 5,
    priority: 'Low',
    dueDate: '2026-06-25',
    status: 'To Do',
    project: 4,
    duration: '6 Days',
    assigneeTo: 3,
  },
  {
    id: 6,
    title: 'Payment gateway integration',
    description:
      'Integrate payment processing with support for secure transactions, refunds, and webhook handling.',
    assignee: 6,
    priority: 'High',
    dueDate: '2026-06-14',
    status: 'In Progress',
    project: 5,
    duration: '10 Days',
    assigneeTo: 4,
  },
  {
    id: 7,
    title: 'Mobile responsive fixes',
    description:
      'Resolve UI issues across mobile devices and ensure layouts adapt correctly to different screen sizes.',
    assignee: 1,
    priority: 'Medium',
    dueDate: '2026-06-18',
    status: 'To Do',
    project: 2,
    duration: '2 Days',
    assigneeTo: 5,
  },
  {
    id: 8,
    title: 'Performance audit report',
    description:
      'Analyze application performance metrics and prepare a report with optimization recommendations.',
    assignee: 7,
    priority: 'Low',
    dueDate: '2026-06-22',
    status: 'Done',
    project: 1,
    duration: '5 Days',
    assigneeTo: 6,
  },
  {
    id: 9,
    title: 'CI/CD pipeline setup',
    description:
      'Configure automated build, testing, and deployment pipelines for continuous integration and delivery.',
    assignee: 4,
    priority: 'Medium',
    dueDate: '2026-06-16',
    status: 'In Progress',
    project: 3,
    duration: '8 Days',
    assigneeTo: 7,
  },
  {
    id: 10,
    title: 'Client feedback integration',
    description:
      'Review client feedback, prioritize requested improvements, and implement approved changes.',
    assignee: 8,
    priority: 'Medium',
    dueDate: '2026-06-19',
    status: 'To Do',
    project: 5,
    duration: '4 Days',
    assigneeTo: 1,
  },
];

const PRIORITIES = [
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];

const STATUSES = [
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Pending', value: 'Pending' },
  { label: 'On-Going', value: 'On-Going' },
];

const priorityColors: Record<string, string> = {
  High: 'bg-error/10 text-error',
  Medium: 'bg-warning/10 text-warning',
  Low: 'bg-info/10 text-info',
};

const statusColors: Record<string, string> = {
  'To Do': 'bg-surface-subtle border-border-subtle',
  'In Progress': 'bg-primary/5 border-primary/20',
  Done: 'bg-success/5 border-success/20',
};

const emptyForm = {
  title: '',
  description: '',
  assignee: null as number | null,
  priority: '',
  dueDate: '',
  status: 'Pending',
  project: null as number | null,
  duration: '',
  assigneeTo: null as number | null,
};

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [users, setUsers] = useState<{ label: string; value: number }[]>([]);
  const [projects, setProjects] = useState<{ label: string; value: number }[]>([]);
  const TABS = ['All', 'To Do', 'In Progress', 'Done'];
  const { data: usersData = [] } = useGetUsersQuery();
  const { data: projectsData = [] } = useGetProjectsQuery();
  const filtered = activeTab === 'All' ? tasks : tasks.filter((t) => t.status === activeTab);

  const [syncToJira, setSyncToJira] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isJiraConnected = localStorage.getItem('jira_connection_active') === 'true';
  const jiraConfigStr = localStorage.getItem('jira_integration_config');

  useEffect(() => {
    if (usersData?.length) {
      setUsers(
        usersData.map((u: any) => ({
          label: u.user_name,
          value: u.user_id,
        }))
      );
    }

    if (projectsData?.length) {
      setProjects(
        projectsData.map((p: any) => ({
          label: p.project_name,
          value: p.project_id,
        }))
      );
    }
  }, [usersData, projectsData]);

  const counts = {
    'To Do': tasks.filter((t) => t.status === 'To Do').length,
    'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
    Done: tasks.filter((t) => t.status === 'Done').length,
  };

  const handleSubmit = async () => {
    if (!form.title || !form.assignee || !form.priority || !form.project) return;

    setIsSyncing(true);
    let finalDescription = form.description;

    if (syncToJira && isJiraConnected && jiraConfigStr) {
      try {
        const config = JSON.parse(jiraConfigStr);
        const { hostUrl, email, apiToken, projectKey, issueType, useProxy } = config;

        if (hostUrl && email && apiToken && projectKey) {
          const cleanHostUrl = hostUrl.replace(/\/$/, '');
          let targetUrl = `${cleanHostUrl}/rest/api/2/issue`;
          if (useProxy) {
            targetUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
          }

          const credentialsBase64 = btoa(`${email}:${apiToken}`);
          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${credentialsBase64}`,
              Accept: 'application/json',
            },
            body: JSON.stringify({
              fields: {
                project: {
                  key: projectKey,
                },
                summary: form.title,
                description: form.description || '',
                issuetype: {
                  name: issueType || 'Task',
                },
              },
            }),
          });

          if (response.ok) {
            const resData = await response.json();
            const issueKey = resData.key;
            const issueLink = `${cleanHostUrl}/browse/${issueKey}`;
            finalDescription =
              (form.description ? form.description + '\n\n' : '') +
              `🔗 **Jira Issue:** [${issueKey}](${issueLink})`;
            message.success(`Successfully created Jira issue ${issueKey}!`);
          } else {
            const errText = await response.text();
            console.error('Jira issue creation failed response:', errText);
            message.error('Failed to create Jira issue. Using local fallback.');
          }
        }
      } catch (err) {
        console.error('Error syncing to Jira:', err);
        message.error('Jira sync error occurred. Using local fallback.');
      }
    }

    const newTask: Task = {
      id: Date.now(),
      title: form.title,
      description: finalDescription,
      assignee: form.assignee,
      priority: form.priority as Task['priority'],
      dueDate: form.dueDate || new Date().toISOString().slice(0, 10),
      status: form.status as Task['status'],
      project: form.project,
      duration: form.duration,
      assigneeTo: form.assigneeTo,
    };
    setTasks([newTask, ...tasks]);
    setForm(emptyForm);
    setSyncToJira(false);
    setIsSyncing(false);
    setShowForm(false);
  };

  //     const handleSubmit = async () => {
  //     if (!form.title || !form.assignee || !form.priority || !form.project) return;

  //     const payload = {
  //         title: form.title,
  //         description: form.description,
  //         assignee: form.assignee,
  //         priority: form.priority,
  //         due_date: form.dueDate,
  //         status: form.status,
  //         project_id: form.project,
  //         duration: form.duration,
  //         assignee_to: form.assigneeTo,
  //     };

  //     try {
  //         const response = await createTask(payload).unwrap();

  //         setTasks([response, ...tasks]);

  //         setForm(emptyForm);
  //         setShowForm(false);

  //     } catch (error) {
  //         console.error("Task creation failed:", error);
  //     }
  // };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Tasks"
        description="Manage and track tasks across all projects."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Tasks' }]}
        primaryAction={{ label: 'New Task', onClick: () => setShowForm(true), icon: 'pi pi-plus' }}
      />

      <div className="grid grid-cols-3 gap-6">
        {Object.entries(counts).map(([status, count]) => (
          <div
            key={status}
            className={`rounded-xl border p-6 shadow-soft flex items-center justify-between ${statusColors[status]}`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-foreground">{count}</span>
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-4 px-8 flex items-center justify-between">
        <span className="text-sm font-black text-foreground uppercase tracking-wider">
          Task Board
        </span>
        <Tabs items={TABS} activeItem={activeTab} onItemChange={setActiveTab} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((task, i) => {
          const renderDescriptionWithLinks = (text: string) => {
            if (!text) return null;
            const jiraRegex = /🔗 \*\*Jira Issue:\*\* \[(.+?)\]\((.+?)\)/;
            const match = text.match(jiraRegex);
            if (match) {
              const preText = text.split('🔗')[0];
              const issueKey = match[1];
              const issueLink = match[2];
              return (
                <div className="text-xs text-muted-foreground flex flex-col gap-1.5 pt-1">
                  {preText && <p className="whitespace-pre-line leading-relaxed">{preText}</p>}
                  <a
                    href={issueLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline font-bold text-[10px] w-fit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Jira Issue: {issueKey}
                  </a>
                </div>
              );
            }
            return (
              <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed pt-1 line-clamp-3">
                {text}
              </p>
            );
          };

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="bg-white rounded-xl border border-border-subtle shadow-soft p-7 flex flex-col gap-5 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-foreground leading-snug flex-1 pr-3">
                  {task.title}
                </h3>
                <span
                  className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${priorityColors[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>
              <span className="text-xs font-medium text-primary/80 bg-primary/5 self-start px-3 py-1 rounded">
                {task.project}
              </span>
              {renderDescriptionWithLinks(task.description)}
              <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50">
                <div className="flex items-center gap-2 text-muted">
                  <User size={13} />
                  <span className="text-xs font-medium">{task.assignee}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted">
                  <Calendar size={13} />
                  <span className="text-xs font-medium">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* New Task Dialog */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Create New Task"
        modal
        className="w-full max-w-xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Task Title
            </label>
            <Input
              placeholder="e.g. Design new feature"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Task Description
            </label>
            <TextArea
              placeholder="e.g. Add a Sidebar"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Assignee
              </label>
              {/* <Input placeholder="e.g. John Doe" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} /> */}
              <Select
                options={users}
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.value })}
                placeholder="Assigned By"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Due Date
              </label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Task Duration
              </label>
              <Input
                placeholder="e.g. 7 Hours"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Assiged To
              </label>
              {/* <Input placeholder="e.g. John Doe" value={form.assigneeTo} onChange={(e) => setForm({ ...form, assigneeTo: e.target.value })} /> */}
              <Select
                options={users}
                value={form.assigneeTo}
                onChange={(e) => setForm({ ...form, assigneeTo: e.value })}
                placeholder="Assigned To"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Priority
              </label>
              <Select
                options={PRIORITIES}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.value })}
                placeholder="Priority"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Status
              </label>
              <Select
                options={STATUSES}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.value })}
                placeholder="Status"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Project
              </label>
              <Select
                options={projects}
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.value })}
                placeholder="Project"
              />
            </div>
          </div>

          {isJiraConnected && jiraConfigStr && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-subtle border border-border-subtle mt-2">
              <input
                type="checkbox"
                id="syncToJira"
                checked={syncToJira}
                onChange={(e) => setSyncToJira(e.target.checked)}
                disabled={isSyncing}
                className="w-4 h-4 cursor-pointer accent-primary"
              />
              <div className="flex flex-col gap-0.5">
                <label
                  htmlFor="syncToJira"
                  className="text-xs font-bold text-foreground cursor-pointer select-none"
                >
                  Sync Task with Jira
                </label>
                <span className="text-[10px] text-muted italic">
                  Automatically generates a corresponding issue in Jira Cloud when created.
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="rounded-md!"
              disabled={isSyncing}
            />
            <Button
              label={isSyncing ? 'Syncing...' : 'Create Task'}
              onClick={handleSubmit}
              icon={isSyncing ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
              className="rounded-md! px-8!"
              disabled={isSyncing}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
