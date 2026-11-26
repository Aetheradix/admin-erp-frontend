import { useState, useMemo } from 'react';
import { Clock, Plus, Send, Trash2 } from 'lucide-react';
import { Card, Table, Button, Tag, Modal, Form, Input, Select, Checkbox, Popconfirm, Row, Col, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetRawProjectsQuery,
  useGetTimeEntriesQuery,
  useCreateTimeEntryMutation,
  useDeleteTimeEntryMutation,
  useGetTimesheetsQuery,
  useSubmitTimesheetMutation,
  type BackendTimeEntry,
} from '@/store/api/projectApiSlice';

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

export function MyTimePage() {
  const { user } = useAuth();
  const [showLogModal, setShowLogModal] = useState(false);
  const [form] = Form.useForm();

  const { data: projects = [] } = useGetRawProjectsQuery(undefined);
  const { data: entries = [], isLoading, refetch } = useGetTimeEntriesQuery(
    user?.id ? { user_id: Number(user.id) } : undefined
  );
  const { data: timesheets = [], refetch: refetchSheets } = useGetTimesheetsQuery(
    user?.id ? { user_id: Number(user.id) } : undefined
  );
  const [createEntry, { isLoading: saving }] = useCreateTimeEntryMutation();
  const [deleteEntry] = useDeleteTimeEntryMutation();
  const [submitTimesheet, { isLoading: submitting }] = useSubmitTimesheetMutation();

  const week = useMemo(() => getWeekBounds(), []);

  const summary = useMemo(() => {
    const totalHours = entries.reduce((s, e) => s + (Number(e.hours) || 0), 0);
    const billableHours = entries
      .filter((e) => Boolean(e.is_billable))
      .reduce((s, e) => s + (Number(e.hours) || 0), 0);
    const thisWeekHours = entries
      .filter((e) => {
        const d = String(e.date).slice(0, 10);
        return d >= week.start && d <= week.end;
      })
      .reduce((s, e) => s + (Number(e.hours) || 0), 0);
    return { totalHours, billableHours, thisWeekHours };
  }, [entries, week]);

  const handleCreate = async (values: {
    project_id?: number;
    date: string;
    hours: number;
    description?: string;
    is_billable?: boolean;
  }) => {
    const proj = projects.find((p) => p.project_id === values.project_id);
    try {
      await createEntry({
        project_id: values.project_id,
        project_name: proj?.project_name,
        date: values.date,
        hours: Number(values.hours),
        description: values.description || '',
        is_billable: values.is_billable ?? true,
        is_running: false,
      }).unwrap();
      message.success('Time logged');
      form.resetFields();
      setShowLogModal(false);
      refetch();
    } catch (err: unknown) {
      message.error((err as { data?: { message?: string } })?.data?.message || 'Failed to log time');
    }
  };

  const handleSubmitWeek = async () => {
    try {
      await submitTimesheet({ week_start_date: week.start, week_end_date: week.end }).unwrap();
      message.success(`Timesheet (${week.start} → ${week.end}) submitted!`);
      refetchSheets();
    } catch (err: unknown) {
      message.error((err as { data?: { message?: string } })?.data?.message || 'Submission failed');
    }
  };

  const columns: ColumnsType<BackendTimeEntry> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (d: string) => <span className="font-mono text-xs">{String(d).slice(0, 10)}</span>,
    },
    {
      title: 'Project',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (p: string) => <span className="font-semibold text-xs">{p || 'General'}</span>,
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
      width: 90,
      render: (h: number) => <span className="font-bold text-xs">{Number(h || 0).toFixed(2)}h</span>,
    },
    {
      title: 'Billable',
      dataIndex: 'is_billable',
      key: 'is_billable',
      width: 90,
      render: (b: number | boolean) => <Tag color={b ? 'cyan' : 'default'}>{b ? 'Billable' : 'Internal'}</Tag>,
    },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, r) => (
        <Popconfirm
          title="Delete entry?"
          onConfirm={async () => {
            await deleteEntry(r.id).unwrap();
            refetch();
          }}>
          <Button size="small" type="text" danger icon={<Trash2 size={12} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <Clock className="text-primary" size={22} />
            <span>My Time & Weekly Timesheets</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Track daily hours across projects and submit weekly timesheets ({week.start} → {week.end}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<Plus size={14} />}
            onClick={() => setShowLogModal(true)}
            className="rounded-xl font-bold text-xs">
            Log Time
          </Button>
          <Button
            type="primary"
            icon={<Send size={14} />}
            loading={submitting}
            onClick={handleSubmitWeek}
            className="rounded-xl font-bold text-xs">
            Submit This Week
          </Button>
        </div>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={8}>
          <Card className="rounded-xl border-border-subtle bg-card" styles={{ body: { padding: '16px' } }}>
            <span className="text-xs text-muted block">This Week</span>
            <span className="text-2xl font-black">{summary.thisWeekHours.toFixed(2)} hrs</span>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="rounded-xl border-border-subtle bg-card" styles={{ body: { padding: '16px' } }}>
            <span className="text-xs text-muted block">Total Billable</span>
            <span className="text-2xl font-black text-primary">{summary.billableHours.toFixed(2)} hrs</span>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="rounded-xl border-border-subtle bg-card" styles={{ body: { padding: '16px' } }}>
            <span className="text-xs text-muted block">All Logged</span>
            <span className="text-2xl font-black">{summary.totalHours.toFixed(2)} hrs</span>
          </Card>
        </Col>
      </Row>

      <Card title={<span className="text-sm font-black">My Time Entries</span>} className="rounded-2xl border-border-subtle bg-card shadow-xs">
        <Table dataSource={entries} columns={columns} loading={isLoading} rowKey="id" pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      {timesheets.length > 0 && (
        <Card title={<span className="text-sm font-black">Submitted Timesheets</span>} className="rounded-2xl border-border-subtle bg-card shadow-xs">
          <div className="divide-y divide-border-subtle">
            {timesheets.map((ts) => (
              <div key={ts.id} className="flex items-center justify-between py-2.5 text-xs">
                <span className="font-mono">
                  {String(ts.week_start_date).slice(0, 10)} → {String(ts.week_end_date).slice(0, 10)}
                </span>
                <span className="font-bold">{Number(ts.total_hours || 0).toFixed(2)} hrs</span>
                <Tag
                  color={
                    ts.status === 'approved'
                      ? 'success'
                      : ts.status === 'rejected'
                        ? 'error'
                        : 'processing'
                  }
                  className="uppercase font-bold text-[10px] m-0">
                  {ts.status}
                </Tag>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal title="Log Time" open={showLogModal} onCancel={() => setShowLogModal(false)} footer={null} destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ date: new Date().toISOString().split('T')[0], hours: 1, is_billable: true }}>
          <Form.Item name="project_id" label="Project">
            <Select
              allowClear
              placeholder="Select project"
              options={projects.map((p) => ({ value: p.project_id, label: p.project_name }))}
            />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <Input type="date" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="hours" label="Hours" rules={[{ required: true }]}>
            <Input type="number" step="0.25" min="0.1" max="24" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="What did you work on?" className="rounded-xl" />
          </Form.Item>
          <Form.Item name="is_billable" valuePropName="checked">
            <Checkbox>Billable</Checkbox>
          </Form.Item>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
            <Button onClick={() => setShowLogModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving} className="font-bold">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
export default MyTimePage;
