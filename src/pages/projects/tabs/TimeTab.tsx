import { useState, useEffect } from 'react';
import type { Project, ProjectTask, TimeEntry } from '@/types/project';
import { Play, Square, Clock, Plus } from 'lucide-react';
import { projectService } from '@/services/projectService';
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
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

interface TimeTabProps {
  project: Project;
  tasks: ProjectTask[];
}

export function TimeTab({ project, tasks }: TimeTabProps) {
  const [entries, setEntries] = useState<TimeEntry[]>(() => projectService.getTimeEntries(project.id));
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(tasks[0]?.id);
  const [showLogModal, setShowLogModal] = useState(false);
  const [form] = Form.useForm();

  const isEnabled = projectService.isTimeTrackingEnabled();

  // Timer tick
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    message.info('Task timer started');
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    const minutesLogged = Math.max(1, Math.round(elapsedSeconds / 60));
    const targetTask = tasks.find((t) => t.id === selectedTaskId);

    projectService.logTime({
      userId: 1,
      userName: 'Alex Mercer',
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

    setElapsedSeconds(0);
    setEntries(projectService.getTimeEntries(project.id));
    message.success(`Logged ${minutesLogged} minutes successfully`);
  };

  const handleManualLog = (values: {
    taskId: number;
    hours: number;
    note?: string;
    billable?: boolean;
  }) => {
    const minutes = Math.round(Number(values.hours) * 60);
    const targetTask = tasks.find((t) => t.id === values.taskId);

    projectService.logTime({
      userId: 1,
      userName: 'Alex Mercer',
      taskId: values.taskId,
      taskTitle: targetTask?.title || 'General Work',
      projectId: project.id,
      projectKey: project.key,
      category: 'Development',
      entryDate: new Date().toISOString().split('T')[0],
      minutes,
      note: values.note || '',
      billable: !!values.billable,
      source: 'manual',
    });

    setEntries(projectService.getTimeEntries(project.id));
    setShowLogModal(false);
    form.resetFields();
    message.success(`Logged ${values.hours} hours`);
  };

  if (!isEnabled) {
    return (
      <Card className="p-8 text-center bg-surface-subtle border-border-subtle rounded-2xl">
        <Clock size={32} className="mx-auto text-muted mb-2" />
        <h3 className="text-sm font-bold text-foreground">Time Tracking is Disabled</h3>
        <p className="text-xs text-muted max-w-sm mx-auto mt-1">
          Time tracking has been turned off for this organization in System Settings.
        </p>
      </Card>
    );
  }

  const totalMinutes = entries.reduce((acc, curr) => acc + curr.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const columns: ColumnsType<TimeEntry> = [
    {
      title: 'Date',
      dataIndex: 'entryDate',
      key: 'entryDate',
      width: 120,
      render: (d: string) => <span className="text-xs text-muted font-medium">{d}</span>,
    },
    {
      title: 'Member',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      render: (u: string) => <span className="text-xs font-bold text-foreground">{u || 'Member'}</span>,
    },
    {
      title: 'Task',
      dataIndex: 'taskTitle',
      key: 'taskTitle',
      render: (t: string) => <span className="text-xs text-foreground font-semibold">{t || 'General Work'}</span>,
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 120,
      render: (_, r) => (
        <span className="font-mono text-xs font-bold text-primary">
          {(r.minutes / 60).toFixed(1)} hrs
        </span>
      ),
    },
    {
      title: 'Billable',
      dataIndex: 'billable',
      key: 'billable',
      width: 120,
      render: (b: boolean) => (
        <Tag color={b ? 'green' : 'default'} className="font-bold text-[10px] uppercase">
          {b ? 'Billable' : 'Non-Billable'}
        </Tag>
      ),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (n: string) => <span className="text-xs text-muted line-clamp-1">{n || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Timer Widget & KPI */}
      <Card className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs" styles={{ body: { padding: '20px' } }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Timer Control */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-2xl font-black text-foreground w-32 text-center bg-background px-3 py-1.5 rounded-xl border border-border-subtle shadow-inner">
              {formatTimer(elapsedSeconds)}
            </span>

            {isTimerRunning ? (
              <Button
                danger
                type="primary"
                icon={<Square size={13} />}
                onClick={handleStopTimer}
                className="rounded-xl font-bold">
                Stop & Save
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<Play size={13} />}
                onClick={handleStartTimer}
                className="rounded-xl font-bold shadow-xs">
                Start Timer
              </Button>
            )}

            <Select
              value={selectedTaskId}
              onChange={setSelectedTaskId}
              className="w-64"
              options={tasks.map((t) => ({
                value: t.id,
                label: `${project.key}-${t.keyNumber}: ${t.title}`,
              }))}
            />
          </div>

          {/* Total Hours & Manual Log */}
          <Space size="large">
            <div className="text-right">
              <span className="text-xl font-black text-foreground">{totalHours}h</span>
              <span className="text-xs text-muted block">Total Hours Logged</span>
            </div>

            <Button
              icon={<Plus size={13} />}
              onClick={() => {
                form.resetFields();
                form.setFieldsValue({
                  taskId: selectedTaskId || tasks[0]?.id,
                  hours: 1.5,
                  billable: true,
                });
                setShowLogModal(true);
              }}
              className="rounded-xl font-bold">
              Manual Log
            </Button>
          </Space>
        </div>
      </Card>

      {/* Time Entries Ant Design Table */}
      <Card
        className="rounded-2xl border-border-subtle bg-surface-subtle overflow-hidden shadow-xs"
        title={<span className="text-xs font-bold text-foreground">Logged Hours History</span>}
        extra={<span className="text-[11px] text-muted">Weekly Timesheet</span>}
        styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={entries}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      {/* Manual Time Log Modal */}
      <Modal
        title={<span className="text-base font-black">Log Work Hours</span>}
        open={showLogModal}
        onCancel={() => setShowLogModal(false)}
        footer={null}
        destroyOnClose
        centered>
        <Form form={form} layout="vertical" onFinish={handleManualLog} className="pt-2">
          <Form.Item name="taskId" label="Select Task" rules={[{ required: true }]}>
            <Select
              options={tasks.map((t) => ({
                value: t.id,
                label: `${project.key}-${t.keyNumber}: ${t.title}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="hours"
            label="Hours Spent"
            rules={[{ required: true, message: 'Please enter hours' }]}>
            <Input type="number" step="0.25" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="note" label="Work Description / Note">
            <TextArea rows={3} placeholder="Summary of work completed..." className="rounded-xl" />
          </Form.Item>

          <Form.Item name="billable" valuePropName="checked">
            <Checkbox>Billable to Client</Checkbox>
          </Form.Item>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle mt-4">
            <Button onClick={() => setShowLogModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="rounded-xl font-bold shadow-xs">
              Save Log
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
