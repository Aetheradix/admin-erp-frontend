'use client';

import React from 'react';
import { Typography, Tag } from 'antd';

const { Text } = Typography;

export const recentActivity = [
    {
        color: '#E8583A',
        content: (
            <>
                <Text strong style={{ fontSize: 13 }}>Sarah Chen</Text>{' '}
                <Text style={{ color: 'var(--muted)', fontSize: 13 }}>completed task</Text>{' '}
                <Tag color="green" style={{ borderRadius: 6, border: 'none' }}>UI Redesign</Tag>
                <br />
                <Text style={{ fontSize: 11, color: 'var(--muted)' }}>2 minutes ago</Text>
            </>
        ),
    },
    {
        color: '#0284c7',
        content: (
            <>
                <Text strong style={{ fontSize: 13 }}>Marcus Johnson</Text>{' '}
                <Text style={{ color: 'var(--muted)', fontSize: 13 }}>created invoice</Text>{' '}
                <Tag color="blue" style={{ borderRadius: 6, border: 'none' }}>INV-2024-089</Tag>
                <br />
                <Text style={{ fontSize: 11, color: 'var(--muted)' }}>15 minutes ago</Text>
            </>
        ),
    },
    {
        color: '#059669',
        content: (
            <>
                <Text strong style={{ fontSize: 13 }}>Emily Watson</Text>{' '}
                <Text style={{ color: 'var(--muted)', fontSize: 13 }}>added 3 members to</Text>{' '}
                <Tag color="purple" style={{ borderRadius: 6, border: 'none' }}>Marketing Team</Tag>
                <br />
                <Text style={{ fontSize: 11, color: 'var(--muted)' }}>1 hour ago</Text>
            </>
        ),
    },
    {
        color: '#d97706',
        content: (
            <>
                <Text strong style={{ fontSize: 13 }}>Alex Rivera</Text>{' '}
                <Text style={{ color: 'var(--muted)', fontSize: 13 }}>updated project status to</Text>{' '}
                <Tag color="gold" style={{ borderRadius: 6, border: 'none' }}>In Review</Tag>
                <br />
                <Text style={{ fontSize: 11, color: 'var(--muted)' }}>3 hours ago</Text>
            </>
        ),
    },
    {
        color: '#e11d48',
        content: (
            <>
                <Text strong style={{ fontSize: 13 }}>System</Text>{' '}
                <Text style={{ color: 'var(--muted)', fontSize: 13 }}>flagged expense report</Text>{' '}
                <Tag color="red" style={{ borderRadius: 6, border: 'none' }}>Overdue</Tag>
                <br />
                <Text style={{ fontSize: 11, color: 'var(--muted)' }}>5 hours ago</Text>
            </>
        ),
    },
];
