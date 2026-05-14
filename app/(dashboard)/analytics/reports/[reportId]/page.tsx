'use client';

import React from 'react';
import { Card, Row, Col, Typography, Tag, Descriptions, Divider, Button, Progress } from 'antd';
import { DownloadOutlined, PrinterOutlined, ShareAltOutlined } from '@ant-design/icons';
import PageHeader from '@/src/components/ui/PageHeader';

const { Text, Title, Paragraph } = Typography;

const report = { id: 'r1', title: 'Q1 2026 Financial Summary', type: 'Finance', createdBy: 'David Kim', date: 'April 1, 2026', status: 'Published' };

const summaryData = [
  { label: 'Total Revenue', value: '$842,300', change: '+18.7%', up: true },
  { label: 'Total Expenses', value: '$423,150', change: '+5.2%', up: false },
  { label: 'Net Profit', value: '$419,150', change: '+34.1%', up: true },
  { label: 'Accounts Receivable', value: '$67,800', change: '-12.3%', up: true },
];

export default function ReportDetailPage() {
  return (
    <div>
      <PageHeader title={report.title} breadcrumbs={[{ title: 'Analytics', href: '/analytics' }, { title: 'Reports', href: '/analytics/reports' }, { title: report.title }]}
        actions={<><Button icon={<ShareAltOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Share</Button><Button icon={<PrinterOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Print</Button><Button type="primary" icon={<DownloadOutlined />} style={{ borderRadius: 10, fontWeight: 600 }}>Download PDF</Button></>}
      />
      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
        <Descriptions column={{ xs: 1, md: 4 }} labelStyle={{ fontWeight: 600, color: 'var(--muted)', fontSize: 13 }}>
          <Descriptions.Item label="Report Type"><Tag color="green" style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{report.type}</Tag></Descriptions.Item>
          <Descriptions.Item label="Created By">{report.createdBy}</Descriptions.Item>
          <Descriptions.Item label="Date">{report.date}</Descriptions.Item>
          <Descriptions.Item label="Status"><Tag color="green" style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{report.status}</Tag></Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        {summaryData.map((s, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)', textAlign: 'center' }} styles={{ body: { padding: 20 } }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.label}</div>
              <Tag color={s.up ? 'green' : 'red'} style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>{s.change}</Tag>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <Title level={4}>Executive Summary</Title>
        <Paragraph style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
          Q1 2026 demonstrated strong financial performance with revenue growing 18.7% year-over-year. This growth was primarily driven by increased enterprise client acquisition and expansion of existing accounts. Operating expenses remained controlled at a 5.2% increase, resulting in a significant improvement in net profit margins.
        </Paragraph>
        <Paragraph style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
          Key highlights include the successful onboarding of 12 new enterprise clients, reduction in accounts receivable cycle by 12.3%, and improved team utilization rates across all departments. The engineering team delivered 3 major product releases, contributing to reduced churn and higher customer satisfaction scores.
        </Paragraph>
        <Divider />
        <Title level={5}>Revenue Breakdown by Department</Title>
        {[{ name: 'Product Licensing', pct: 45, amt: '$379K' }, { name: 'Professional Services', pct: 30, amt: '$253K' }, { name: 'Support & Maintenance', pct: 15, amt: '$126K' }, { name: 'Other', pct: 10, amt: '$84K' }].map((dept) => (
          <div key={dept.name} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text strong style={{ fontSize: 13 }}>{dept.name}</Text>
              <Text style={{ fontSize: 13, color: 'var(--muted)' }}>{dept.amt} ({dept.pct}%)</Text>
            </div>
            <Progress percent={dept.pct} strokeColor="var(--primary)" trailColor="rgba(0,0,0,0.04)" size="small" showInfo={false} />
          </div>
        ))}
      </Card>
    </div>
  );
}
