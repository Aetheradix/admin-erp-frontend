import React, { useState } from 'react';
import { Table, Tag, Button, Card, Typography, Space, App, Badge } from 'antd';
import { Plus, IndianRupee, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { useGetReimbursementsQuery, useUpdateReimbursementStatusMutation } from '@/store/api/reimbursementSlice';
import { useAuth } from '@/context/AuthContext';
import ReimbursementForm from './ReimbursementForm';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ReimbursementList: React.FC = () => {
    const { user } = useAuth();
    const { data: claims = [], isLoading } = useGetReimbursementsQuery();
    const [updateStatus] = useUpdateReimbursementStatusMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { message } = App.useApp();

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateStatus({ id, status }).unwrap();
            message.success(`Claim ${status.toLowerCase()} successfully.`);
        } catch (error: any) {
            message.error(error.data?.message || 'Failed to update status.');
        }
    };

    const columns = [
        {
            title: 'Employee',
            dataIndex: 'username',
            key: 'username',
            hidden: user?.role !== 'admin',
            render: (text: string) => <Text className="text-white font-bold">{text || 'Self'}</Text>
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <Text className="text-white/80">{text}</Text>
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amt: number) => <Text className="text-primary font-bold">₹{amt.toLocaleString()}</Text>
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (cat: string) => <Tag color="blue" className="rounded-lg border-none bg-blue-500/10 text-blue-400 font-bold uppercase text-[10px]">{cat}</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: any = { Pending: 'gold', Approved: 'green', Rejected: 'red' };
                return <Badge status={colors[status] as any} text={<Text className="text-white/40 text-xs font-bold uppercase tracking-widest">{status}</Text>} />;
            }
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => <Text className="text-white/20 text-xs">{dayjs(date).format('MMM D, YYYY')}</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    {user?.role === 'admin' && record.status === 'Pending' && (
                        <>
                            <Button 
                                type="primary" 
                                size="small" 
                                className="bg-green-500 hover:bg-green-600 border-none rounded-lg"
                                onClick={() => handleStatusChange(record.id, 'Approved')}
                            >
                                <CheckCircle size={14} />
                            </Button>
                            <Button 
                                danger 
                                size="small" 
                                className="rounded-lg"
                                onClick={() => handleStatusChange(record.id, 'Rejected')}
                            >
                                <XCircle size={14} />
                            </Button>
                        </>
                    )}
                    <Button type="text" className="text-primary/50 hover:text-primary p-0">
                        <FileText size={16} />
                    </Button>
                </Space>
            )
        }
    ].filter(c => !c.hidden);

    return (
        <div className="animate-fade-in pb-12">
            <PageHeader 
                title="Financial Reimbursements" 
                subtitle="Manage expense claims, item acquisitions, and fiscal settlements."
                actions={
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<Plus size={18} />} 
                        className="rounded-2xl h-12 px-8 shadow-xl shadow-primary/20 flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        NEW CLAIM
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard icon={IndianRupee} label="Total Disbursed" value="₹45,200" color="primary" />
                <StatCard icon={Clock} label="Pending Requests" value="12" color="gold" />
                <StatCard icon={CheckCircle} label="Settled Claims" value="156" color="green" />
            </div>

            <Card className="glass-card overflow-hidden">
                <Table 
                    dataSource={claims} 
                    columns={columns} 
                    rowKey="id" 
                    loading={isLoading}
                    pagination={{ pageSize: 8 }}
                    className="custom-financial-table"
                />
            </Card>

            <ReimbursementForm 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="glass-card border-white/5 hover:border-white/10 transition-all">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center text-${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <Text className="text-muted text-[10px] block uppercase font-black tracking-widest mb-1 opacity-50">{label}</Text>
                <Title level={3} className="text-white m-0 font-bold">{value}</Title>
            </div>
        </div>
    </Card>
);

export default ReimbursementList;
