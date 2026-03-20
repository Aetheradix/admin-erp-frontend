import React, { useState } from 'react';
import { Table, Tag, Button, Card, Typography, Space, App, Badge, Modal, QRCode } from 'antd';
import { Plus, Eye, Trash2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { useGetPassesQuery, useRevokePassMutation } from '@/store/api/guestpassSlice';
import GuestPassForm from './GuestPassForm';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const GuestPassList: React.FC = () => {
    const { data: passes = [], isLoading } = useGetPassesQuery();
    const [revokePass] = useRevokePassMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewPass, setPreviewPass] = useState<any>(null);
    const { message } = App.useApp();

    const handleRevoke = async (id: string) => {
        try {
            await revokePass(id).unwrap();
            message.success('Pass revoked successfully.');
        } catch (error: any) {
            message.error(error.data?.message || 'Failed to revoke pass.');
        }
    };

    const columns = [
        {
            title: 'Guest Name',
            dataIndex: 'guest_name',
            key: 'guest_name',
            render: (text: string) => <Text className="text-white font-bold">{text}</Text>
        },
        {
            title: 'Pass Code',
            dataIndex: 'pass_code',
            key: 'pass_code',
            render: (code: string) => <Tag color="primary" className="rounded-lg border-none bg-primary/10 text-primary font-black uppercase tracking-widest">{code}</Tag>
        },
        {
            title: 'Visit Date',
            dataIndex: 'visit_date',
            key: 'visit_date',
            render: (date: string) => <Text className="text-white/40 text-xs font-bold uppercase ">{dayjs(date).format('MMM D, YYYY')}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: any = { Active: 'success', Expired: 'default', Used: 'processing' };
                return <Badge status={colors[status] as any} text={<Text className="text-white/40 text-[10px] font-black uppercase tracking-widest">{status}</Text>} />;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button 
                        type="primary" 
                        size="small" 
                        className="rounded-lg bg-primary/10 text-primary border-none"
                        onClick={() => setPreviewPass(record)}
                    >
                        <Eye size={14} />
                    </Button>
                    {record.status === 'Active' && (
                        <Button 
                            danger 
                            size="small" 
                            className="rounded-lg"
                            onClick={() => handleRevoke(record.id)}
                        >
                            <Trash2 size={14} />
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="animate-fade-in pb-12">
            <PageHeader 
                title="Guest Access Terminal" 
                subtitle="Issue temporary clearance protocols and monitor external visitations."
                actions={
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<Plus size={18} />} 
                        className="rounded-2xl h-12 px-8 shadow-xl shadow-primary/20 flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        GENERATE PASS
                    </Button>
                }
            />

            <Card className="glass-card overflow-hidden mt-8">
                <Table 
                    dataSource={passes} 
                    columns={columns} 
                    rowKey="id" 
                    loading={isLoading}
                    pagination={{ pageSize: 8 }}
                    className="custom-financial-table"
                />
            </Card>

            <GuestPassForm 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
            />

            <Modal
                open={!!previewPass}
                onCancel={() => setPreviewPass(null)}
                footer={null}
                width={350}
                className="glass-modal"
            >
                {previewPass && (
                    <div className="text-center py-6">
                        <Title level={4} className="text-white mb-2 uppercase tracking-widest ">Guest Clearance</Title>
                        <Text className="text-primary font-black block mb-6">{previewPass.pass_code}</Text>
                        
                        <div className="bg-white p-6 rounded-3xl inline-block mb-6 shadow-2xl">
                            <QRCode value={previewPass.pass_code} size={200} bordered={false} />
                        </div>

                        <div className="text-left space-y-2 px-4">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <Text className="text-muted text-[10px] uppercase font-bold">Guest</Text>
                                <Text className="text-white font-bold">{previewPass.guest_name}</Text>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <Text className="text-muted text-[10px] uppercase font-bold">Protocol Date</Text>
                                <Text className="text-white font-bold">{dayjs(previewPass.visit_date).format('MMM D, YYYY')}</Text>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default GuestPassList;
