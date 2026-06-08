'use client';

import React from 'react';
import { Table, Button, Input, Card, Space } from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader, AppContainer } from '@/src/components/ui';
import { useReimbursements } from './hooks/useReimbursements';
import ReimbursementModal from './components/ReimbursementModal';
import { getReimbursementColumns } from './constants';

export default function Reimbursements() {
    const router = useRouter();
    const { reimbursements, totalReimbursements, loading, search, setSearch, addReimbursement } = useReimbursements();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const columns = getReimbursementColumns(router);

    return (
        <AppContainer fluid>
            <PageHeader
                title="Reimbursements"
                subtitle={`${totalReimbursements} reimbursement requests.`}
                breadcrumbs={[{ title: 'Finance', href: '/finance' }, { title: 'Reimbursements' }]}
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
                            New Request
                        </Button>
                    </Space>
                }
            />

            <ReimbursementModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={addReimbursement}
            />

            <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ marginBottom: 20 }}>
                    <Input
                        prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />}
                        placeholder="Search reimbursements..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: 320, borderRadius: 10 }}
                        allowClear
                    />
                </div>
                <Table
                    dataSource={reimbursements}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                    onRow={(r) => ({
                        onClick: () => router.push(`/finance/reimbursements/${r.id}`),
                        style: { cursor: 'pointer' },
                    })}
                />
            </Card>
        </AppContainer>
    );
}
