'use client';

import React from 'react';
import { Card, Row, Col, Tabs, Typography, Tag, Progress, Descriptions, Timeline, Button, Table } from 'antd';
import { EditOutlined, TeamOutlined, CalendarOutlined, FlagOutlined, CheckSquareOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';
import StatusBadge, { StatusType } from '@/src/components/ui/StatusBadge';
import Link from 'next/link';

const { Text } = Typography;

const project = { name: 'Website Redesign', description: 'Complete overhaul of the company website with modern design, improved UX, and mobile-first approach.', status: 'in-progress' as const, progress: 75, team: 'Design', lead: 'Mike Ross', deadline: '2026-06-15', priority: 'High', members: 6 };

const milestones = [
  { color: '#059669' as const, children: <><Text strong style={{ fontSize: 13 }}>Research & Discovery</Text><br /><Text style={{ fontSize: 12, color: 'var(--muted)' }}>Completed · Jan 15</Text></> },
  { color: '#059669' as const, children: <><Text strong style={{ fontSize: 13 }}>Wireframes & Prototyping</Text><br /><Text style={{ fontSize: 12, color: 'var(--muted)' }}>Completed · Feb 28</Text></> },
  { color: '#E8583A' as const, children: <><Text strong style={{ fontSize: 13 }}>Visual Design</Text><br /><Text style={{ fontSize: 12, color: 'var(--muted)' }}>In Progress · Mar 15 - Apr 30</Text></> },
  { color: 'gray' as const, children: <><Text strong style={{ fontSize: 13 }}>Development</Text><br /><Text style={{ fontSize: 12, color: 'var(--muted)' }}>Upcoming · May 1 - Jun 1</Text></> },
  { color: 'gray' as const, children: <><Text strong style={{ fontSize: 13 }}>Testing & Launch</Text><br /><Text style={{ fontSize: 12, color: 'var(--muted)' }}>Upcoming · Jun 1 - Jun 15</Text></> },
];

interface ProjectTask {
  id: string;
  title: string;
  assignee: string;
  status: StatusType;
  priority: string;
}

const tasks: ProjectTask[] = [
  { id: '1', title: 'Design homepage hero section', assignee: 'Lisa Park', status: 'completed' as const, priority: 'High' },
  { id: '2', title: 'Create component library', assignee: 'Mike Ross', status: 'in-progress' as const, priority: 'Critical' },
  { id: '3', title: 'Mobile responsive layouts', assignee: 'Sarah Chen', status: 'in-progress' as const, priority: 'High' },
  { id: '4', title: 'Animation & micro-interactions', assignee: 'Lisa Park', status: 'pending' as const, priority: 'Medium' },
  { id: '5', title: 'Cross-browser testing', assignee: 'Ana Martinez', status: 'pending' as const, priority: 'Medium' },
];

const priorityColors: Record<string, string> = { Critical: 'red', High: 'volcano', Medium: 'gold', Low: 'blue' };

const taskColumns = [
  { title: 'Task', dataIndex: 'title', key: 'title', render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span> },
  { title: 'Assignee', dataIndex: 'assignee', key: 'assignee' },
  { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (p: string) => <Tag color={priorityColors[p]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{p}</Tag> },
  { title: 'Status', dataIndex: 'status', key: 'status', render: (s: StatusType) => <StatusBadge status={s} /> },
];

export default function ProjectDetailPage() {
  return (
    <div>
      <PageHeader title={project.name} subtitle={project.description}
        breadcrumbs={[{ title: 'Projects', href: '/projects' }, { title: project.name }]}
        actions={<><Link href="/projects/p1/tasks"><Button icon={<CheckSquareOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>All Tasks</Button></Link><Button icon={<EditOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Edit</Button></>}
      />
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}><StatCard title="Progress" value={`${project.progress}%`} icon={<FlagOutlined />} color="var(--primary)" bgColor="var(--primary-soft)" accentColor="var(--primary)" /></Col>
        <Col xs={24} sm={6}><StatCard title="Team Members" value={project.members} icon={<TeamOutlined />} color="#7c3aed" bgColor="rgba(124,58,237,0.08)" accentColor="#7c3aed" /></Col>
        <Col xs={24} sm={6}><StatCard title="Tasks" value={tasks.length} icon={<CheckSquareOutlined />} color="#0284c7" bgColor="rgba(2,132,199,0.08)" accentColor="#0284c7" /></Col>
        <Col xs={24} sm={6}><StatCard title="Deadline" value="Jun 15" icon={<CalendarOutlined />} color="#d97706" bgColor="rgba(217,119,6,0.08)" accentColor="#d97706" /></Col>
      </Row>
      <Tabs defaultActiveKey="overview" items={[
        {
          key: 'overview', label: 'Overview', children: (
            <Row gutter={[20, 20]}>
              <Col xs={24} lg={14}>
                <Card title="Project Details" style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                  <Descriptions column={{ xs: 1, md: 2 }} labelStyle={{ fontWeight: 600, color: 'var(--muted)', fontSize: 13 }}>
                    <Descriptions.Item label="Status"><StatusBadge status={project.status} /></Descriptions.Item>
                    <Descriptions.Item label="Priority"><Tag color="volcano" style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{project.priority}</Tag></Descriptions.Item>
                    <Descriptions.Item label="Team">{project.team}</Descriptions.Item>
                    <Descriptions.Item label="Lead">{project.lead}</Descriptions.Item>
                    <Descriptions.Item label="Deadline">{project.deadline}</Descriptions.Item>
                    <Descriptions.Item label="Progress"><Progress percent={project.progress} size="small" style={{ maxWidth: 160 }} /></Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={10}>
                <Card title="Milestones" style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                  <Timeline items={milestones} />
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: 'tasks', label: `Tasks (${tasks.length})`, children: (
            <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
              <Table dataSource={tasks} columns={taskColumns} rowKey="id" pagination={false} />
            </Card>
          )
        },
      ]} />
    </div>
  );
}
