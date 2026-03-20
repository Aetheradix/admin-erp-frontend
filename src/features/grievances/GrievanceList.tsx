import React, { useState } from 'react';
import { Table, Button, Card, Typography, Space, App, Badge, Select } from 'antd';
import { Plus, Eye, EyeOff } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { useGetGrievancesQuery, useUpdateGrievanceStatusMutation } from '@/store/api/grievanceSlice';
import { useAuth } from '@/context/AuthContext';
import GrievanceForm from './GrievanceForm';
import dayjs from 'dayjs';

const { Text } = Typography;

const GrievanceList: React.FC = () => {
    const { user } = useAuth();
    const { data: records = [], isLoading } = useGetGrievancesQuery();
    const [updateStatus] = useUpdateGrievanceStatusMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { message } = App.useApp();

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateStatus({ id, status }).unwrap();
            message.success(`Grievance status updated to ${status}.`);
        } catch (error: any) {
            message.error(error.data?.message || 'Failed to update status.');
        }
    };

    const columns = [
        {
            title: 'Reporter',
            key: 'reporter',
            render: (_: any, record: any) => (
                record.is_anonymous 
                    ? <Space className="text-white/40"><EyeOff size={14} /> <Text className="text-xs uppercase italic font-bold tracking-widest">Anonymous</Text></Space>
                    : <Text className="text-white font-bold">{record.username || 'Self'}</Text>
            )
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            render: (text: string) => <Text className="text-white/80">{text}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: any = { Open: 'processing', 'Under Investigation': 'warning', Resolved: 'success', Closed: 'default' };
                return <Badge status={colors[status] as any} text={<Text className="text-white/40 text-xs font-bold uppercase tracking-widest">{status}</Text>} />;
            }
        },
        {
            title: 'Filed On',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => <Text className="text-white/20 text-xs">{dayjs(date).format('MMM D, YYYY')}</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    {user?.role === 'admin' && (
                        <Select 
                            className="w-40 custom-select" 
                            defaultValue={record.status}
                            onChange={(val) => handleStatusChange(record.id, val)}
                            options={[
                                { value: 'Open', label: 'Open' },
                                { value: 'Under Investigation', label: 'Investigating' },
                                { value: 'Resolved', label: 'Resolve' },
                                { value: 'Closed', label: 'Close' },
                            ]}
                        />
                    )}
                    <Button type="text" className="text-primary/50 hover:text-primary p-0">
                        <Eye size={16} />
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="animate-fade-in pb-12">
            <PageHeader 
                title="Grievance Management" 
                subtitle="A secure channel for voicing concerns and ensuring professional integrity."
                actions={
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<Plus size={18} />} 
                        className="rounded-2xl h-12 px-8 shadow-xl shadow-primary/20 flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        NEW REPORT
                    </Button>
                }
            />

            <Card className="glass-card overflow-hidden mt-8">
                <Table 
                    dataSource={records} 
                    columns={columns} 
                    rowKey="id" 
                    loading={isLoading}
                    pagination={{ pageSize: 8 }}
                    className="custom-financial-table"
                />
            </Card>

            <GrievanceForm 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default GrievanceList;
