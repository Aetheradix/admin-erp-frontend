'use client';

import React from 'react';
import { Row, Col, Card, Typography, Progress, List, Tag, Button } from 'antd';
import { BarChartOutlined, RiseOutlined, TeamOutlined, DollarOutlined, ArrowRightOutlined, ProjectOutlined, TrophyOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import StatCard from '@/src/components/ui/StatCard';

const { Text } = Typography;

const topMetrics = [
  { label: 'Revenue Growth', value: '18.7%', desc: 'vs last quarter' },
  { label: 'Task Completion Rate', value: '87%', desc: 'across all projects' },
  { label: 'Avg. Project Duration', value: '42 days', desc: '↓ 8 days from avg' },
  { label: 'Team Utilization', value: '78%', desc: 'target: 85%' },
];

const departmentPerformance = [
  { name: 'Engineering', score: 92, tasks: 245, color: '#0284c7' },
  { name: 'Design', score: 88, tasks: 128, color: '#7c3aed' },
  { name: 'Marketing', score: 85, tasks: 96, color: '#E8583A' },
  { name: 'Sales', score: 79, tasks: 184, color: '#059669' },
  { name: 'Operations', score: 75, tasks: 67, color: '#d97706' },
];

const recentReports = [
  { id: 'r1', title: 'Q1 2026 Financial Summary', date: 'Apr 1, 2026', type: 'Finance' },
  { id: 'r2', title: 'Engineering Sprint Report', date: 'May 10, 2026', type: 'Operations' },
  { id: 'r3', title: 'Monthly Revenue Analysis', date: 'May 1, 2026', type: 'Finance' },
  { id: 'r4', title: 'Team Performance Review', date: 'Apr 28, 2026', type: 'HR' },
  { id: 'r5', title: 'Customer Satisfaction Survey', date: 'Apr 15, 2026', type: 'Support' },
];

const typeColors: Record<string, string> = { Finance: 'green', Operations: 'blue', HR: 'purple', Support: 'cyan' };

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Performance metrics and insights." breadcrumbs={[{ title: 'Analytics' }, { title: 'Overview' }]} />

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {topMetrics.map((m, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)', textAlign: 'center' }} styles={{ body: { padding: 20 } }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginBottom: 4, letterSpacing: '-1px' }}>{m.value}</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{m.label}</div>
              <Text style={{ color: 'var(--muted)', fontSize: 12 }}>{m.desc}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card title={<><TrophyOutlined style={{ marginRight: 8 }} />Department Performance</>} style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            {departmentPerformance.map((dept) => (
              <div key={dept.name} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text strong style={{ fontSize: 14 }}>{dept.name}</Text>
                  <div><Text style={{ color: 'var(--muted)', fontSize: 12, marginRight: 12 }}>{dept.tasks} tasks</Text><Text strong style={{ fontSize: 14 }}>{dept.score}%</Text></div>
                </div>
                <Progress percent={dept.score} strokeColor={dept.color} trailColor="rgba(0,0,0,0.04)" size="small" showInfo={false} />
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title={<><BarChartOutlined style={{ marginRight: 8 }} />Recent Reports</>}
            extra={<Button type="link" href="/analytics/reports" style={{ fontWeight: 600, padding: 0 }}>View All <ArrowRightOutlined /></Button>}
            style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <List dataSource={recentReports} renderItem={(report) => (
              <List.Item style={{ padding: '12px 0', border: 'none' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><Text strong style={{ fontSize: 14 }}>{report.title}</Text><br/><Text style={{ fontSize: 12, color: 'var(--muted)' }}>{report.date}</Text></div>
                    <Tag color={typeColors[report.type]} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{report.type}</Tag>
                  </div>
                </div>
              </List.Item>
            )} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
