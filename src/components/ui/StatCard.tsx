'use client';

import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  color?: string;
  bgColor?: string;
  accentColor?: string;
  style?: React.CSSProperties;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'var(--primary)',
  bgColor = 'var(--primary-soft)',
  accentColor = 'var(--primary)',
  style,
}: StatCardProps) {
  return (
    <div className="stat-card" style={style}>
      <div
        className="stat-card-icon"
        style={{ background: bgColor, color: color }}
      >
        {icon}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{title}</div>
      {trend && (
        <div className={`stat-card-trend ${trend.direction}`}>
          {trend.direction === 'up' ? (
            <ArrowUpOutlined style={{ fontSize: 10 }} />
          ) : (
            <ArrowDownOutlined style={{ fontSize: 10 }} />
          )}
          {trend.value}
        </div>
      )}
      <style jsx>{`
        .stat-card::before {
          background: linear-gradient(90deg, ${accentColor}, transparent);
        }
      `}</style>
    </div>
  );
}
