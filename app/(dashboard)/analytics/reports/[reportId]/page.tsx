'use client';

import React from 'react';
import { Col, Descriptions, Divider, Progress } from 'antd';
import { DownloadOutlined, PrinterOutlined, ShareAltOutlined } from '@ant-design/icons';
import { PageHeader, AppCard, AppRow, AppTitle, AppTag, AppButton, AppText } from '@/src/components/ui';

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
        actions={<><AppButton icon={<ShareAltOutlined />}>Share</AppButton><AppButton icon={<PrinterOutlined />}>Print</AppButton><AppButton type="primary" icon={<DownloadOutlined />}>Download PDF</AppButton></>}
      />
      <AppCard style={{ marginBottom: 20 }}>
        <Descriptions column={{ xs: 1, md: 4 }} labelStyle={{ fontWeight: 600, color: 'var(--muted)', fontSize: 13 }}>
          <Descriptions.Item label="Report Type"><AppTag color="green">{report.type}</AppTag></Descriptions.Item>
          <Descriptions.Item label="Created By">{report.createdBy}</Descriptions.Item>
          <Descriptions.Item label="Date">{report.date}</Descriptions.Item>
          <Descriptions.Item label="Status"><AppTag color="green">{report.status}</AppTag></Descriptions.Item>
        </Descriptions>
      </AppCard>

      <AppRow>
        {summaryData.map((s, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <AppCard style={{ textAlign: 'center' }} styles={{ body: { padding: 20 } }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>{s.value}</div>
              <AppText small strong style={{ display: 'block', marginBottom: 4 }}>{s.label}</AppText>
              <AppTag color={s.up ? 'green' : 'red'}>{s.change}</AppTag>
            </AppCard>
          </Col>
        ))}
      </AppRow>

      <AppCard>
        <AppTitle level={4}>Executive Summary</AppTitle>
        <AppText muted style={{ fontSize: 14, lineHeight: 1.8, display: 'block', marginBottom: 16 }}>
          Q1 2026 demonstrated strong financial performance with revenue growing 18.7% year-over-year. This growth was primarily driven by increased enterprise client acquisition and expansion of existing accounts. Operating expenses remained controlled at a 5.2% increase, resulting in a significant improvement in net profit margins.
        </AppText>
        <AppText muted style={{ fontSize: 14, lineHeight: 1.8, display: 'block', marginBottom: 16 }}>
          Key highlights include the successful onboarding of 12 new enterprise clients, reduction in accounts receivable cycle by 12.3%, and improved team utilization rates across all departments. The engineering team delivered 3 major product releases, contributing to reduced churn and higher customer satisfaction scores.
        </AppText>
        <Divider />
        <AppTitle level={5}>Revenue Breakdown by Department</AppTitle>
        {[{ name: 'Product Licensing', pct: 45, amt: '$379K' }, { name: 'Professional Services', pct: 30, amt: '$253K' }, { name: 'Support & Maintenance', pct: 15, amt: '$126K' }, { name: 'Other', pct: 10, amt: '$84K' }].map((dept) => (
          <div key={dept.name} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <AppText strong small>{dept.name}</AppText>
              <AppText muted small>{dept.amt} ({dept.pct}%)</AppText>
            </div>
            <Progress percent={dept.pct} strokeColor="var(--primary)" trailColor="rgba(0,0,0,0.04)" size="small" showInfo={false} />
          </div>
        ))}
      </AppCard>
    </div>
  );
}

