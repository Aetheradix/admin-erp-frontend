'use client';

import React from 'react';
import { Button, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title = 'No data yet',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
      }}
      className="animate-fade-in-up"
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'var(--primary-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          color: 'var(--primary)',
          marginBottom: 24,
        }}
      >
        {icon || <InboxOutlined />}
      </div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--foreground)',
          margin: '0 0 8px',
        }}
      >
        {title}
      </h3>
      <Text
        style={{
          color: 'var(--muted)',
          fontSize: 14,
          maxWidth: 360,
          marginBottom: actionLabel ? 24 : 0,
        }}
      >
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button type="primary" size="large" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
