import { useState, useEffect } from 'react';
import { Card, Table, Tag, Switch, Select, Button, Space, Typography, message, Alert } from 'antd';
import { SafetyCertificateOutlined, SaveOutlined } from '@ant-design/icons';
import { departmentService } from '@/services/departmentService';
import type { AssignmentPermissionRule } from '@/types/department';

const { Title, Text, Paragraph } = Typography;

export default function AssignmentPermissionsPage() {
  const [rules, setRules] = useState<AssignmentPermissionRule[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    setRules(departmentService.getAssignmentPermissionRules());
  }, []);

  const handleScopeChange = (id: number, scope: AssignmentPermissionRule['canAssignScope']) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, canAssignScope: scope } : r)));
  };

  const handleCrossDeptChange = (id: number, checked: boolean) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, crossDeptAllowed: checked } : r)));
  };

  const handleOverrideChange = (id: number, checked: boolean) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, requiresOverride: checked } : r)));
  };

  const handleSave = (record: AssignmentPermissionRule) => {
    setSavingId(record.id);
    try {
      departmentService.updateAssignmentPermissionRule(record.id, {
        canAssignScope: record.canAssignScope,
        crossDeptAllowed: record.crossDeptAllowed,
        requiresOverride: record.requiresOverride,
      });
      message.success(`Permissions for ${record.roleLabel} updated successfully!`);
    } catch {
      message.error('Failed to update rule');
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    {
      title: 'System Role',
      dataIndex: 'roleLabel',
      key: 'roleLabel',
      render: (text: string, record: AssignmentPermissionRule) => (
        <Space direction="vertical" size={2}>
          <Text strong>{text}</Text>
          <Tag color="geekblue" style={{ fontSize: 11 }}>
            {record.roleKey}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Allowed Assignment Scope',
      dataIndex: 'canAssignScope',
      key: 'canAssignScope',
      render: (scope: AssignmentPermissionRule['canAssignScope'], record: AssignmentPermissionRule) => (
        <Select
          value={scope}
          onChange={(val) => handleScopeChange(record.id, val)}
          style={{ width: 190 }}
          options={[
            { value: 'any', label: 'Any Department & Member' },
            { value: 'own_dept', label: 'Own Department Only' },
            { value: 'own_team', label: 'Own Team Only' },
            { value: 'project_members', label: 'Assigned Project Members' },
            { value: 'self_only', label: 'Self Only' },
            { value: 'none', label: 'No Assignment Permissions' },
          ]}
        />
      ),
    },
    {
      title: 'Cross-Dept Allowed',
      dataIndex: 'crossDeptAllowed',
      key: 'crossDeptAllowed',
      render: (checked: boolean, record: AssignmentPermissionRule) => (
        <Switch
          checked={checked}
          onChange={(val) => handleCrossDeptChange(record.id, val)}
          checkedChildren="Yes"
          unCheckedChildren="No"
        />
      ),
    },
    {
      title: 'Requires Supervisor Override',
      dataIndex: 'requiresOverride',
      key: 'requiresOverride',
      render: (checked: boolean, record: AssignmentPermissionRule) => (
        <Switch
          checked={checked}
          onChange={(val) => handleOverrideChange(record.id, val)}
          checkedChildren="Required"
          unCheckedChildren="None"
        />
      ),
    },
    {
      title: 'Policy Guidance',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => <Text type="secondary" style={{ fontSize: 12 }}>{notes}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: AssignmentPermissionRule) => (
        <Button
          type="primary"
          size="small"
          icon={<SaveOutlined />}
          loading={savingId === record.id}
          onClick={() => handleSave(record)}
        >
          Save
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          <SafetyCertificateOutlined style={{ color: '#1677ff', marginRight: 8 }} />
          Smart Task Assignment & Governance Permissions
        </Title>
        <Paragraph type="secondary">
          Configure which organizational roles can assign tasks, restrict cross-department delegation, and enforce supervisor sign-off rules.
        </Paragraph>
      </div>

      <Alert
        message="Governance Rule Hierarchy Active"
        description="Task creation workflows will dynamically validate the assigner's role against target departments based on the rules configured below."
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Table
          dataSource={rules}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
