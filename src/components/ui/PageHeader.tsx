'use client';

import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Space } from 'antd';
import React from 'react';

// const { Title } = Typography; not being used, so commenting out to satisfy linter | but in future might be useful for styling the title differently than h1

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
}: PageHeaderProps) {
  const breadcrumbItems = breadcrumbs
    ? [
      { title: <HomeOutlined />, href: '/dashboard' },
      ...breadcrumbs.map((b) => ({
        title: b.href ? <a href={b.href}>{b.title}</a> : b.title,
      })),
    ]
    : undefined;

  return (
    <div className="page-header animate-fade-in-up">
      {breadcrumbItems && (
        <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
      )}
      <div className="page-header-row">
        <div>
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actions && <Space wrap>{actions}</Space>}
      </div>
      {children}
    </div>
  );
}
