'use client';

import React from 'react';
import { Card, Descriptions, Typography, Tag, Button, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatusBadge from '@/src/components/ui/StatusBadge';

const { Text } = Typography;

const expense = { id: 'EXP-003', description: 'Team Dinner', category: 'Entertainment', amount: '$680.00', date: '2026-05-08', submittedBy: 'John Doe', department: 'Management', status: 'pending' as const, notes: 'Team celebration dinner for Q1 milestone completion. 12 attendees at The Grand Restaurant.', receipt: 'receipt_team_dinner.pdf' };

export default function ExpenseDetailPage() {
  return (
    <div>
      <PageHeader title={`Expense ${expense.id}`} subtitle={expense.description} breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Expenses', href: '/finance/expenses' }, { title: expense.id }]}
        actions={<>
          <Button icon={<CheckOutlined />} type="primary" style={{ borderRadius: 10, fontWeight: 600 }}>Approve</Button>
          <Button icon={<EditOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Edit</Button>
          <Button icon={<DeleteOutlined />} danger style={{ borderRadius: 10, fontWeight: 600 }}>Delete</Button>
        </>}
      />
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <Descriptions column={{ xs: 1, md: 2 }} labelStyle={{ fontWeight: 600, color: 'var(--muted)', fontSize: 13 }}>
              <Descriptions.Item label="Expense ID">{expense.id}</Descriptions.Item>
              <Descriptions.Item label="Status"><StatusBadge status={expense.status} /></Descriptions.Item>
              <Descriptions.Item label="Description">{expense.description}</Descriptions.Item>
              <Descriptions.Item label="Category"><Tag color="purple" style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{expense.category}</Tag></Descriptions.Item>
              <Descriptions.Item label="Amount"><span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{expense.amount}</span></Descriptions.Item>
              <Descriptions.Item label="Date">{expense.date}</Descriptions.Item>
              <Descriptions.Item label="Submitted By">{expense.submittedBy}</Descriptions.Item>
              <Descriptions.Item label="Department">{expense.department}</Descriptions.Item>
              <Descriptions.Item label="Notes" span={2}>{expense.notes}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Receipt" style={{ borderRadius: 16, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ padding: '40px 0', background: 'var(--surface-subtle)', borderRadius: 12, marginBottom: 16 }}>
              <Text style={{ color: 'var(--muted)' }}>📄 {expense.receipt}</Text>
            </div>
            <Button block style={{ borderRadius: 10, fontWeight: 600 }}>Download Receipt</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
