import { Card, Row, Col, Typography, Space, Progress, Statistic, Table, Tag } from 'antd';
import { Briefcase, Users, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { useGetProjectsQuery, useGetProjectStatsQuery } from '@/store/api/projectSlice';

const { Text } = Typography;

const CompanyStats: React.FC = () => {
    const { data: stats } = useGetProjectStatsQuery();
    const { data: projects = [], isLoading } = useGetProjectsQuery();

    const statsConfig = [
        { title: 'Total Projects', value: stats?.projects?.total || 0, icon: Briefcase, color: 'blue' },
        { title: 'Active Mission', value: stats?.projects?.active || 0, icon: Clock, color: 'orange' },
        { title: 'Personnel Count', value: stats?.employees?.total || 0, icon: Users, color: 'green' },
        { title: 'Efficiency Rate', value: '94%', icon: TrendingUp, color: 'primary' },
    ];

    const columns = [
        {
            title: 'Mission / Project',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text className="text-white font-bold">{text}</Text>
        },
        {
            title: 'Progress',
            dataIndex: 'progress',
            key: 'progress',
            render: (val: number) => <Progress percent={val} size="small" strokeColor="#6366f1" trailColor="rgba(255,255,255,0.05)" />
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: any = { Active: 'processing', Completed: 'success', Paused: 'warning' };
                return <Tag color={colors[status] as any} className="rounded-lg uppercase text-[10px] font-black">{status}</Tag>;
            }
        }
    ];

    return (
        <div className="animate-fade-in pb-12">
            <PageHeader 
                title="Organizational Analytics" 
                subtitle="Real-time transparency into project vectoring, resource allocation, and mission status."
            />

            <Row gutter={[24, 24]} className="mb-8 mt-8">
                {statsConfig.map((item, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card className="glass-card border-white/5 hover:border-white/10 transition-all">
                            <Statistic
                                title={<Text className="text-muted text-[10px] uppercase font-black tracking-widest block mb-2 opacity-50">{item.title}</Text>}
                                value={item.value}
                                prefix={<item.icon size={20} className={`text-${item.color} mr-2`} />}
                                valueStyle={{ color: '#fff', fontWeight: 900, fontSize: '2rem' }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[24, 24]}>
                <Col lg={16} xs={24}>
                    <Card title={<Space><BarChart3 size={18} className="text-primary" /> <Text className="text-white uppercase font-black tracking-widest">Active Operations</Text></Space>} className="glass-card h-full">
                        <Table 
                            columns={columns} 
                            dataSource={projects.filter(p => p.status === 'Active')} 
                            pagination={false} 
                            loading={isLoading}
                            className="custom-financial-table"
                        />
                    </Card>
                </Col>
                <Col lg={8} xs={24}>
                    <Card title={<Space><TrendingUp size={18} className="text-green-400" /> <Text className="text-white uppercase font-black tracking-widest">Efficiency Metrics</Text></Space>} className="glass-card">
                        <Space direction="vertical" className="w-full" size={24}>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <Text className="text-muted text-xs">Project Completion</Text>
                                    <Text className="text-white font-bold">88%</Text>
                                </div>
                                <Progress percent={88} status="active" strokeColor="#10b981" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <Text className="text-muted text-xs">Employee Retention</Text>
                                    <Text className="text-white font-bold">96%</Text>
                                </div>
                                <Progress percent={96} strokeColor="#6366f1" />
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CompanyStats;
