import { useState } from 'react';
import {
  Card,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Table,
  Spin,
  Empty,
  message,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  Gift,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  Calendar,
  Wallet,
} from 'lucide-react';

import {
  useGetMyRecreationalBenefitsQuery,
  useRecordRecreationalBenefitUsageMutation,
  useGetRecreationalBenefitUsageQuery,
} from '@/store/api/recreationalbenefitsSlice';

import type { RecreationalBenefitAssignment, RecreationalBenefitUsage } from '../types';

// Helper to format date strings (YYYY-MM-DD) to "15 Jan 2026" using native JS
const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Helper for default date (YYYY-MM-DD)
const getTodayString = () => new Date().toISOString().split('T')[0];

export default function MyRecreationalBenefitsPage() {
  const { data: assignments = [], isLoading } = useGetMyRecreationalBenefitsQuery();
  const [recordUsage, { isLoading: isSubmitting }] = useRecordRecreationalBenefitUsageMutation();

  const [selectedAssignment, setSelectedAssignment] =
    useState<RecreationalBenefitAssignment | null>(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch usage history for selected assignment
  const { data: usageHistory = [], isLoading: isUsageLoading } =
    useGetRecreationalBenefitUsageQuery(selectedAssignment?.assignment_id ?? 0, {
      skip: !selectedAssignment,
    });

  const handleOpenClaimModal = (assignment: RecreationalBenefitAssignment) => {
    setSelectedAssignment(assignment);
    form.resetFields();
    form.setFieldsValue({ usage_date: getTodayString() });
    setClaimModalOpen(true);
  };

  const handleClaimSubmit = async (values: any) => {
    if (!selectedAssignment) return;

    try {
      await recordUsage({
        assignmentId: selectedAssignment.assignment_id,
        data: {
          usage_amount: values.usage_amount,
          usage_description: values.usage_description,
          usage_date: values.usage_date, // Raw YYYY-MM-DD string
        },
      }).unwrap();

      message.success('Claim submitted successfully for approval!');
      setClaimModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to submit claim:', error);
      message.error('Failed to submit claim. Please try again.');
    }
  };

  // Status Badge Helper
  const getStatusTag = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <Tag icon={<CheckCircle2 className="inline-block h-3 w-3 mr-1" />} color="success">
            Approved
          </Tag>
        );
      case 'rejected':
        return (
          <Tag icon={<XCircle className="inline-block h-3 w-3 mr-1" />} color="error">
            Rejected
          </Tag>
        );
      default:
        return (
          <Tag icon={<Clock className="inline-block h-3 w-3 mr-1" />} color="warning">
            Pending Approval
          </Tag>
        );
    }
  };

  const historyColumns = [
    {
      title: 'Usage Date',
      dataIndex: 'usage_date',
      key: 'usage_date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Amount Claimed',
      dataIndex: 'usage_amount',
      key: 'usage_amount',
      render: (amount: number, record: RecreationalBenefitUsage) => (
        <span className="font-semibold text-gray-900">
          {record.currency || 'INR'} {Number(amount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      title: 'Description / Notes',
      dataIndex: 'usage_description',
      key: 'usage_description',
      render: (desc: string) => desc || <span className="text-gray-400">No notes provided</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <Spin size="large" />
        <p className="text-gray-500 text-sm">Loading your active benefits...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Benefits & Perks</h1>
        <p className="text-sm text-gray-500">
          Explore your active employee perks, track claims, and submit reimbursement requests.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col span={24} sm={8}>
          <Card className="shadow-sm border-slate-200">
            <Statistic
              title="Active Benefits"
              value={assignments.length}
              prefix={<Gift className="h-5 w-5 text-indigo-600 mr-2" />}
            />
          </Card>
        </Col>
        <Col span={24} sm={8}>
          <Card className="shadow-sm border-slate-200">
            <Statistic
              title="Benefit Frequencies"
              value={new Set(assignments.map((a) => a.benefit?.usage_frequency)).size}
              prefix={<Calendar className="h-5 w-5 text-emerald-600 mr-2" />}
              suffix="Types"
            />
          </Card>
        </Col>
        <Col span={24} sm={8}>
          <Card className="shadow-sm border-slate-200">
            <Statistic
              title="Claims Filed"
              value={usageHistory.length}
              prefix={<Wallet className="h-5 w-5 text-amber-600 mr-2" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Assigned Benefits Grid */}
      {assignments.length === 0 ? (
        <Card className="text-center py-12 shadow-sm">
          <Empty description="No recreational benefits are currently assigned to you." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((item) => {
            const benefit = item.benefit;
            const isSelected = selectedAssignment?.assignment_id === item.assignment_id;

            return (
              <Card
                key={item.assignment_id}
                hoverable
                className={`flex flex-col justify-between transition-all border ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'
                }`}
                actions={[
                  <Button
                    type="link"
                    key="claim"
                    icon={<PlusCircle className="h-4 w-4" />}
                    onClick={() => handleOpenClaimModal(item)}
                  >
                    Claim Usage
                  </Button>,
                  <Button
                    type="text"
                    key="history"
                    icon={<History className="h-4 w-4" />}
                    onClick={() => setSelectedAssignment(item)}
                  >
                    View History
                  </Button>,
                ]}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                      <Gift className="h-5 w-5 text-indigo-600 shrink-0" />
                      {benefit?.benefit_name ?? 'Employee Benefit'}
                    </h3>
                    <Tag color="blue">{benefit?.benefit_type ?? 'Perk'}</Tag>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 min-h-[36px]">
                    {benefit?.benefit_description || 'No description provided.'}
                  </p>

                  <div className="pt-3 grid grid-cols-2 gap-2 text-sm border-t border-slate-100">
                    <div>
                      <span className="text-xs text-gray-400 block">Allowed Value</span>
                      <span className="font-bold text-gray-800">
                        {benefit?.currency || 'INR'}{' '}
                        {benefit?.benefit_value
                          ? Number(benefit.benefit_value).toLocaleString('en-IN')
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Frequency</span>
                      <span className="font-medium text-gray-700">
                        {benefit?.usage_frequency || 'One-Time'}
                      </span>
                    </div>
                  </div>

                  {(benefit?.valid_from || benefit?.valid_until) && (
                    <div className="text-xs text-gray-400 bg-slate-50 p-2 rounded">
                      Validity: {formatDate(benefit.valid_from)} — {formatDate(benefit.valid_until)}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Selected Benefit Usage History Table */}
      {selectedAssignment && (
        <Card
          className="shadow-sm border-slate-200"
          title={
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-800">
                Claim History — {selectedAssignment.benefit?.benefit_name}
              </span>
              <Button
                type="primary"
                size="small"
                icon={<PlusCircle className="h-4 w-4" />}
                onClick={() => handleOpenClaimModal(selectedAssignment)}
              >
                New Claim
              </Button>
            </div>
          }
        >
          <Table
            rowKey="usage_id"
            loading={isUsageLoading}
            columns={historyColumns}
            dataSource={usageHistory}
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: 'No claims submitted for this benefit yet.' }}
          />
        </Card>
      )}

      {/* Submit Claim Modal */}
      <Modal
        title={`File Claim: ${selectedAssignment?.benefit?.benefit_name || ''}`}
        open={claimModalOpen}
        onCancel={() => setClaimModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleClaimSubmit}
          initialValues={{
            usage_date: getTodayString(),
          }}
          className="pt-2"
        >
          <Form.Item
            name="usage_amount"
            label="Claim Amount"
            rules={[
              { required: true, message: 'Please enter claim amount' },
              { type: 'number', min: 1, message: 'Amount must be greater than 0' },
            ]}
          >
            <InputNumber
              className="w-full"
              prefix={selectedAssignment?.benefit?.currency || 'INR'}
              placeholder="e.g. 1500"
            />
          </Form.Item>

          <Form.Item
            name="usage_date"
            label="Date of Expense"
            rules={[{ required: true, message: 'Please select expense date' }]}
          >
            <Input type="date" className="w-full" />
          </Form.Item>

          <Form.Item
            name="usage_description"
            label="Reason / Details"
            rules={[{ required: true, message: 'Please describe your claim' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Provide context or receipt invoice numbers for HR approval..."
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button onClick={() => setClaimModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Submit Claim
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
