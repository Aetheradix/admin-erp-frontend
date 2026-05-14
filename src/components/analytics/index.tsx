'use client';

import React from 'react';
import { Row, Col, Card, Typography, Progress, List, Tag, Button } from 'antd';
import { BarChartOutlined, ArrowRightOutlined, TrophyOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';
import { useAnalytics } from './hooks/useAnalytics';
import { typeColors } from './mockData';

const { Text } = Typography;

export default function Analytics() {
  const { metrics, departments, reports, loading } = useAnalytics();

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Performance metrics and insights." breadcrumbs={[{ title: 'Analytics' }, { title: 'Overview' }]} />

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {metrics.map((m, i) => (
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
          <Card title={<><TrophyOutlined style={{ marginRight: 8 }} />Department Performance</>} style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }} loading={loading}>
            {departments.map((dept) => (
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
            style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}
            loading={loading}>
            <List dataSource={reports} renderItem={(report) => (
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
