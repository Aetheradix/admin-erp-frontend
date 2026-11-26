import { useState, useEffect, useMemo } from 'react';
import type { Project, ProjectTask, TimeEntry } from '@/types/project';
import { Play, Square, Clock, Plus, Trash2, Send } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetTimeEntriesQuery,
  useCreateTimeEntryMutation,
  useStopTimerMutation,
  useDeleteTimeEntryMutation,
  useGetTimeSettingQuery,
  useSubmitTimesheetMutation,
  type BackendTimeEntry,
} from '@/store/api/projectApiSlice';
import {
  Card,
  Table,
  Button,
  Select,
  Input,
  Tag,
  Modal,
  Form,
  Checkbox,
  Space,
  Popconfirm,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

interface TimeTabProps {
  project: Project;
  tasks: ProjectTask[];
}

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = (day === 0 ? -6 : 1) - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    start: mon.toISOString().split('T')[0],
    end: sun.toISOString().split('T')[0],
  };
}

export function TimeTab({ project, tasks }: TimeTabProps) {
  const { user } = useAuth();
  const { data: timeSetting } = useGetTimeSettingQuery();
  const { data: backendEntries = [], refetch } = useGetTimeEntriesQuery({ project_id: project.id });
  const [createEntryApi, { isLoading: isSubmittingLog }] = useCreateTimeEntryMutation();
  const [stopTimerApi] = useStopTimerMutation();
  const [deleteEntryApi] = useDeleteTimeEntryMutation();
  const [submitTimesheetApi, { isLoading: submittingSheet }] = useSubmitTimesheetMutation();

  const [localEntries, setLocalEntries] = useState<TimeEntry[]>(() =>
    projectService.getTimeEntries(project.id)
  );
  const [activeTimerId, setActiveTimerId] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(tasks[0]?.id);
  const [showLogModal, setShowLogModal] = useState(false);
  const [form] = Form.useForm();

  const isEnabled = timeSetting?.enabled ?? projectService.isTimeTrackingEnabled();

  // Detect any already-running timer from backend
  const runningBackendEntry = useMemo(
    () => backendEntries.find((e) => Boolean(e.is_running) && e.user_id === user?.id),
    [backendEntries, user?.id]
  );

  const isTimerRunning = Boolean(runningBackendEntry) || activeTimerId !== null;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTimerRunning) {
      interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const entries: TimeEntry[] = useMemo(() => {
    if (backendEntries.length > 0) {
      return backendEntries.map((be: BackendTimeEntry) => ({
        id: be.id,
        userId: be.user_id,
        userName: be.user_name || 'User',
        taskId: be.task_id,
        taskTitle: be.task_title || 'General',
        projectId: be.project_id || project.id,
        projectKey: project.key,
        category: be.category || 'Development',
        entryDate: be.date ? String(be.date).split('T')[0] : '',
        minutes: Math.round((Number(be.hours) || 0) * 60),
        note: be.description || '',
        billable: Boolean(be.is_billable),
        source: be.is_running ? 'timer' : 'manual',
        createdAt: be.created_at || new Date().toISOString(),
      }));
    }
    return localEntries;
  }, [backendEntries, localEntries, project.id, project.key]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleStartTimer = async () => {
    const targetTask = tasks.find((t) => t.id === selectedTaskId);
    try {
      const created = await createEntryApi({
        project_id: project.id,
        project_name: project.name,
        task_id: selectedTaskId,
        task_title: targetTask?.title || 'General Development',
        date: new Date().toISOString().split('T')[0],
        hours: 0,
        description: 'Live timer session',
        is_billable: true,
        is_running: true,
      }).unwrap();
      setActiveTimerId(created.id);
      setElapsedSeconds(0);
      refetch();
      message.info('Live timer started');
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      message.error(msg || 'Could not start timer');
    }
  };

  const handleStopTimer = async () => {
    const timerId = runningBackendEntry?.id || activeTimerId;
    if (timerId) {
      try {
        await stopTimerApi(timerId).unwrap();
        setActiveTimerId(null);
        setElapsedSeconds(0);
        refetch();
        message.success('Time logged from timer!');
        return;
      } catch {
        // fallback below
      }
    }
    const minutesLogged = Math.max(1, Math.round(elapsedSeconds / 60));
    const targetTask = tasks.find((t) => t.id === selectedTaskId);
    projectService.logTime({
      userId: (user?.id as number) || 1,
      userName: user?.username || 'User',
      taskId: selectedTaskId,
      taskTitle: targetTask?.title || 'General Development',
      projectId: project.id,
      projectKey: project.key,
      category: 'Development',
      entryDate: new Date().toISOString().split('T')[0],
      minutes: minutesLogged,
      note: 'Captured from live timer',
      billable: true,
      source: 'timer',
    });
    setActiveTimerId(null);
    setElapsedSeconds(0);
    setLocalEntries(projectService.getTimeEntries(project.id));
    message.success(`Logged ${minutesLogged} mins`);
  };

  const handleManualLog = async (values: {
    taskId?: number;
    hours: number;
    entryDate: string;
    note?: string;
    billable?: boolean;
  }) => {
    const targetTask = tasks.find((t) => t.id === values.taskId);
    const hrs = Number(values.hours || 1);
    try {
      await createEntryApi({
        project_id: project.id,
        project_name: project.name,
        task_id: values.taskId,
        task_title: targetTask?.title || 'General',
        date: values.entryDate || new Date().toISOString().split('T')[0],
        hours: hrs,
        description: values.note || '',
        is_billable: values.billable ?? true,
        is_running: false,
      }).unwrap();
      refetch();
    } catch {
      projectService.logTime({
        userId: (user?.id as number) || 1,
        userName: user?.username || 'User',
        taskId: values.taskId,
        taskTitle: targetTask?.title || 'General',
        projectId: project.id,
        projectKey: project.key,
        category: 'Development',
        entryDate: values.entryDate || new Date().toISOString().split('T')[0],
        minutes: Math.round(hrs * 60),
        note: values.note || '',
        billable: values.billable ?? true,
        source: 'manual',
      });
      setLocalEntries(projectService.getTimeEntries(project.id));
    }
    message.success('Time entry recorded');
    form.resetFields();
    setShowLogModal(false);
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await deleteEntryApi(id).unwrap();
      refetch();
      message.success('Time entry deleted');
    } catch {
      message.error('Failed to delete time entry');
    }
  };

  const handleSubmitWeeklyTimesheet = async () => {
    const { start, end } = getWeekBounds();
    try {
      await submitTimesheetApi({ week_start_date: start, week_end_date: end }).unwrap();
      message.success(`Weekly timesheet (${start} to ${end}) submitted for approval!`);
    } catch (err: unknown) {
      message.error((err as { data?: { message?: string } })?.data?.message || 'Failed to submit timesheet');
    }
  };

  if (!isEnabled) {
    return (
      <Card className="rounded-2xl border-border-subtle bg-card text-center py-12">
        <Clock size={28} className="mx-auto text-muted mb-2" />
        <h3 className="text-sm font-bold text-foreground">Time Tracking is Disabled</h3>
        <p className="text-xs text-muted mt-1">
          An administrator can enable Time Tracking in Project Settings.
        </p>
      </Card>
    );
  }

  const totalMinutes = entries.reduce((sum, e) => sum + (e.minutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(2);

  const columns: ColumnsType<TimeEntry> = [
    { title: 'Date', dataIndex: 'entryDate', key: 'entryDate', width: 110 },
    { title: 'User', dataIndex: 'userName', key: 'userName', width: 130 },
    { title: 'Task', dataIndex: 'taskTitle', key: 'taskTitle' },
    {
      title: 'Duration',
      key: 'minutes',
      width: 110,
      render: (_, r) => <span className="font-bold">{(r.minutes / 60).toFixed(2)} hrs</span>,
    },
    {
      title: 'Billable',
      dataIndex: 'billable',
      key: 'billable',
      width: 90,
      render: (b: boolean) => <Tag color={b ? 'cyan' : 'default'}>{b ? 'Billable' : 'Internal'}</Tag>,
    },
    { title: 'Notes', dataIndex: 'note', key: 'note' },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, r) => (
        <Popconfirm title="Delete entry?" onConfirm={() => handleDeleteEntry(r.id)}>
          <Button size="small" type="text" danger icon={<Trash2 size={13} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Timer & Actions */}
      <Card className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              placeholder="Select task for timer"
              value={selectedTaskId}
              onChange={setSelectedTaskId}
              className="w-64"
              allowClear
              options={tasks.map((t) => ({ value: t.id, label: `${project.key}-${t.keyNumber} ${t.title}` }))}
            />
            <span className="font-mono text-xl font-black text-primary px-3 py-1 rounded-xl bg-primary/10">
              {formatTimer(elapsedSeconds)}
            </span>
            {!isTimerRunning ? (
              <Button type="primary" icon={<Play size={14} />} onClick={handleStartTimer} className="rounded-xl font-bold">
                Start Timer
              </Button>
            ) : (
              <Button danger type="primary" icon={<Square size={14} />} onClick={handleStopTimer} className="rounded-xl font-bold">
                Stop & Log
              </Button>
            )}
          </div>

          <Space wrap>
            <Button
              icon={<Plus size={14} />}
              onClick={() => setShowLogModal(true)}
              className="rounded-xl font-bold text-xs">
              Log Time
            </Button>
            <Button
              type="default"
              icon={<Send size={14} />}
              loading={submittingSheet}
              onClick={handleSubmitWeeklyTimesheet}
              className="rounded-xl font-bold text-xs">
              Submit Weekly Timesheet
            </Button>
          </Space>
        </div>
      </Card>

      {/* Entries Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-sm font-black">Time Entries ({entries.length})</span>
            <Tag color="blue" className="font-bold m-0">
              Total: {totalHours} hrs
            </Tag>
          </div>
        }
        className="rounded-2xl border-border-subtle bg-card shadow-xs">
        <Table dataSource={entries} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      {/* Manual Time Log Modal */}
      <Modal
        title="Log Time Manually"
        open={showLogModal}
        onCancel={() => setShowLogModal(false)}
        footer={null}
        destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleManualLog}
          initialValues={{
            taskId: tasks[0]?.id,
            hours: 1,
            entryDate: new Date().toISOString().split('T')[0],
            billable: true,
          }}>
          <Form.Item name="taskId" label="Task">
            <Select
              allowClear
              placeholder="Select task"
              options={tasks.map((t) => ({ value: t.id, label: `${project.key}-${t.keyNumber} ${t.title}` }))}
            />
          </Form.Item>
          <Form.Item name="hours" label="Hours" rules={[{ required: true }]}>
            <Input type="number" step="0.25" min="0.1" max="24" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="entryDate" label="Date" rules={[{ required: true }]}>
            <Input type="date" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="note" label="Work Description">
            <TextArea rows={2} placeholder="What did you work on?" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="billable" valuePropName="checked">
            <Checkbox>Billable time</Checkbox>
          </Form.Item>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button onClick={() => setShowLogModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmittingLog} className="font-bold">
              Save Entry
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
