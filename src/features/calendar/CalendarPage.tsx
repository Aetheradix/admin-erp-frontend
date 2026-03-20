import React from 'react';
import { Calendar, Badge, Card, Tag, Typography, Button, Space, App, Spin } from 'antd';
import { Plus, Coffee, Home, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { useGetLeavesQuery } from '@/store/api/leaveSlice';
import { useState } from 'react';
import LeaveRequestModal from './components/LeaveRequestModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CalendarPage: React.FC = () => {
    const { data: leaves = [], isLoading } = useGetLeavesQuery();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { message } = App.useApp();

    const getListData = (value: dayjs.Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        return leaves.filter(l => 
            dayjs(l.start_date).format('YYYY-MM-DD') <= dateStr && 
            dayjs(l.end_date).format('YYYY-MM-DD') >= dateStr
        );
    };

    const dateCellRender = (value: dayjs.Dayjs) => {
        const listData = getListData(value);
        return (
            <ul className="events-list m-0 p-0 list-none">
                {listData.map((item) => (
                    <li key={item.id}>
                        <Badge 
                            status={item.type === 'WFH' ? 'processing' : 'warning'} 
                            text={
                                <span className="text-[10px] uppercase font-bold tracking-tight text-white/60">
                                    {item.type}: {item.username || 'Me'}
                                </span>
                            } 
                        />
                    </li>
                ))}
            </ul>
        );
    };

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Spin size="large" /></div>;

    return (
        <div className="animate-fade-in pb-12">
            <PageHeader 
                title="Employee Calendar" 
                subtitle="Synchronize your schedule, WFH sessions, and leave protocols."
                actions={
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<Plus size={18} />} 
                        className="rounded-2xl h-12 px-8 shadow-xl shadow-primary/20 flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        NEW REQUEST
                    </Button>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3">
                    <Card className="glass-card p-4 overflow-hidden">
                        <Calendar 
                            dateCellRender={dateCellRender} 
                            className="custom-calendar-system"
                        />
                    </Card>
                </div>

                <div className="xl:col-span-1 space-y-6">
                    <Card className="glass-card p-6 border-primary/20 bg-primary/5">
                        <Title level={5} className="text-white mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                            <Clock size={16} className="text-primary" />
                            Active Protocols
                        </Title>
                        <Space direction="vertical" className="w-full">
                            {leaves.slice(0, 5).map(leaf => (
                                <div key={leaf.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <Tag color={leaf.type === 'WFH' ? 'blue' : 'orange'} className="rounded-lg font-black text-[9px] uppercase border-none">
                                            {leaf.type}
                                        </Tag>
                                        <Text className="text-white/20 text-[10px] font-bold">
                                            {dayjs(leaf.start_date).format('MMM D')}
                                        </Text>
                                    </div>
                                    <Text className="text-white font-bold block truncate">{leaf.reason || 'No reason provided'}</Text>
                                    <Text className="text-white/40 text-[10px] mt-1 block uppercase tracking-widest">{leaf.status}</Text>
                                </div>
                            ))}
                        </Space>
                    </Card>
                </div>
            </div>

            <LeaveRequestModal 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default CalendarPage;
