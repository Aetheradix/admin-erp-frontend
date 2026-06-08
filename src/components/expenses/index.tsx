'use client';

import React from 'react';
import { Table, Button, Input, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useExpenses } from './hooks/useExpenses';
import ExpenseModal from './components/ExpenseModal';
import { getExpenseColumns } from './constants';

export default function Expenses() {
  const router = useRouter();
  const { expenses, totalExpenses, loading, search, setSearch, addExpense } = useExpenses();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const columns = getExpenseColumns(router);

  return (
    <AppContainer fluid>
      <PageHeader
        title="Expenses"
        subtitle={`${totalExpenses} expense reports.`}
        breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Expenses' }]}
        actions={
          <Space>
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>
              Export
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ borderRadius: 10, fontWeight: 600 }}
              onClick={() => setIsModalOpen(true)}
            >
              New Expense
            </Button>
          </Space>
        }
      />

      <ExpenseModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={addExpense}
      />

      <Card
        style={{
          borderRadius: 16,
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />}
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 320, borderRadius: 10 }}
            allowClear
          />
        </div>
        <Table
          dataSource={expenses}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          onRow={(r) => ({
            onClick: () => router.push(`/finance/expenses/${r.id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </AppContainer>
  );
}
