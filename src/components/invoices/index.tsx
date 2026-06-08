'use client';

import React from 'react';
import { Table, Button, Input, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useInvoices } from './hooks/useInvoices';
import InvoiceModal from './components/InvoiceModal';
import { getInvoiceColumns } from './constants';

export default function Invoices() {
  const router = useRouter();
  const { invoices, totalInvoices, loading, search, setSearch, addInvoice } = useInvoices();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const columns = getInvoiceColumns(router);

  return (
    <AppContainer fluid>
      <PageHeader
        title="Invoices"
        subtitle={`${totalInvoices} invoices generated.`}
        breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Invoices' }]}
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
              New Invoice
            </Button>
          </Space>
        }
      />

      <InvoiceModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={addInvoice}
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
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 320, borderRadius: 10 }}
            allowClear
          />
        </div>
        <Table
          dataSource={invoices}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          onRow={(r) => ({
            onClick: () => router.push(`/finance/invoices/${r.id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </AppContainer>
  );
}
