import { useState, useMemo } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, RotateCcw, Clock } from 'lucide-react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Tabs,
  Modal,
  Input,
  Popconfirm,
  Row,
  Col,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetTimesheetsQuery,
  useApproveTimesheetMutation,
  useRejectTimesheetMutation,
  useReopenTimesheetMutation,
  type BackendTimesheet,
} from '@/store/api/projectApiSlice';

export function ApprovalsPage() {
  const [statusTab, setStatusTab] = useState<'submitted' | 'approved' | 'rejected' | 'all'>('submitted');
  const [rejectModalItem, setRejectModalItem] = useState<BackendTimesheet | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: timesheets = [], isLoading, refetch } = useGetTimesheetsQuery();
  const [approveApi, { isLoading: approving }] = useApproveTimesheetMutation();
  const [rejectApi, { isLoading: rejecting }] = useRejectTimesheetMutation();
  const [reopenApi] = useReopenTimesheetMutation();

  const filtered = useMemo(() => {
    if (statusTab === 'all') return timesheets;
    return timesheets.filter((t) => t.status === statusTab);
  }, [timesheets, statusTab]);

  const counts = useMemo(
    () => ({
      pending: timesheets.filter((t) => t.status === 'submitted').length,
      approved: timesheets.filter((t) => t.status === 'approved').length,
      rejected: timesheets.filter((t) => t.status === 'rejected').length,
    }),
    [timesheets]
  );

  const handleApprove = async (id: number) => {
    try {
      await approveApi(id).unwrap();
      message.success('Timesheet approved');
      refetch();
    } catch (err: unknown) {
      message.error((err as { data?: { message?: string } })?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async () => {
    if (!rejectModalItem || !rejectReason.trim()) {
      message.error('Rejection reason is required');
      return;
    }
    try {
      await rejectApi({ id: rejectModalItem.id, rejection_reason: rejectReason.trim() }).unwrap();
      message.success('Timesheet rejected');
      setRejectModalItem(null);
      setRejectReason('');
      refetch();
    } catch (err: unknown) {
      message.error((err as { data?: { message?: string } })?.data?.message || 'Rejection failed');
    }
  };

  const handleReopen = async (id: number) => {
    try {
      await reopenApi(id).unwrap();
      message.success('Timesheet reopened as draft');
      refetch();
    } catch {
      message.error('Failed to reopen timesheet');
    }
  };

  const columns: ColumnsType<BackendTimesheet> = [
    {
      title: 'Employee',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name: string) => <span className="font-bold text-xs">{name || 'User'}</span>,
    },
    {
      title: 'Week Period',
      key: 'period',
      render: (_, r) => (
        <span className="text-xs font-mono">
          {String(r.week_start_date).slice(0, 10)} → {String(r.week_end_date).slice(0, 10)}
        </span>
      ),
    },
    {
      title: 'Total Hours',
      dataIndex: 'total_hours',
      key: 'total_hours',
      render: (h: number) => <span className="font-bold text-xs">{Number(h || 0).toFixed(2)} hrs</span>,
    },
    {
      title: 'Billable',
      dataIndex: 'billable_hours',
      key: 'billable_hours',
      render: (h: number) => <span className="text-xs text-muted">{Number(h || 0).toFixed(2)} hrs</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (st: string, r) => (
        <Space direction="vertical" size={2}>
          <Tag
            color={
              st === 'approved'
                ? 'success'
                : st === 'rejected'
                  ? 'error'
                  : st === 'submitted'
                    ? 'processing'
                    : 'default'
            }
            className="uppercase font-bold text-[10px] m-0">
            {st}
          </Tag>
          {r.rejection_reason && (
            <span className="text-[11px] text-red-500">Reason: {r.rejection_reason}</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Approver',
      dataIndex: 'approver_name',
      key: 'approver_name',
      render: (a: string) => <span className="text-xs text-muted">{a || '—'}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, r) => (
        <Space size="small">
          {r.status === 'submitted' && (
            <>
              <Popconfirm title="Approve this timesheet?" onConfirm={() => handleApprove(r.id)}>
                <Button
                  size="small"
                  type="primary"
                  loading={approving}
                  icon={<CheckCircle2 size={12} />}
                  className="rounded-lg text-xs">
                  Approve
                </Button>
              </Popconfirm>
              <Button
                size="small"
                danger
                icon={<XCircle size={12} />}
                onClick={() => setRejectModalItem(r)}
                className="rounded-lg text-xs">
                Reject
              </Button>
            </>
          )}
          {(r.status === 'approved' || r.status === 'rejected') && (
            <Button
              size="small"
              icon={<RotateCcw size={12} />}
              onClick={() => handleReopen(r.id)}
              className="rounded-lg text-xs">
              Reopen
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="pb-4 border-b border-border-subtle">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
          <ShieldCheck className="text-primary" size={22} />
          <span>Timesheet Approvals</span>
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Review, approve, or reject submitted weekly timesheets with audit logging.
        </p>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={8}>
          <Card className="rounded-xl border-border-subtle bg-card" styles={{ body: { padding: '16px' } }}>
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span>Pending Review</span>
              <Clock size={14} className="text-amber-500" />
            </div>
            <span className="text-2xl font-black">{counts.pending}</span>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="rounded-xl border-border-subtle bg-card" styles={{ body: { padding: '16px' } }}>
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span>Approved</span>
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            <span className="text-2xl font-black">{counts.approved}</span>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="rounded-xl border-border-subtle bg-card" styles={{ body: { padding: '16px' } }}>
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span>Rejected</span>
              <XCircle size={14} className="text-rose-500" />
            </div>
            <span className="text-2xl font-black">{counts.rejected}</span>
          </Card>
        </Col>
      </Row>

      <Card className="rounded-2xl border-border-subtle bg-card shadow-xs">
        <Tabs
          activeKey={statusTab}
          onChange={(k) => setStatusTab(k as typeof statusTab)}
          items={[
            { key: 'submitted', label: `Pending (${counts.pending})` },
            { key: 'approved', label: `Approved (${counts.approved})` },
            { key: 'rejected', label: `Rejected (${counts.rejected})` },
            { key: 'all', label: `All (${timesheets.length})` },
          ]}
        />
        <Table
          dataSource={filtered}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 12 }}
          size="middle"
        />
      </Card>

      <Modal
        title="Reject Timesheet"
        open={Boolean(rejectModalItem)}
        onCancel={() => {
          setRejectModalItem(null);
          setRejectReason('');
        }}
        onOk={handleReject}
        confirmLoading={rejecting}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true }}>
        <p className="text-xs text-muted mb-2">
          Provide a rejection reason for <strong>{rejectModalItem?.user_name}</strong>:
        </p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Missing task breakdown for Wednesday..."
        />
      </Modal>
    </div>
  );
}
export default ApprovalsPage;
