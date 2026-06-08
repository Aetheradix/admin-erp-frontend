import React from 'react';
import { Avatar } from 'antd';
import { DollarOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { PayrollEntry } from '../types';

export const payrollStats = [
    {
        title: "Total Payroll",
        value: "$49,100",
        icon: <DollarOutlined />,
        color: "var(--primary)",
        bgColor: "var(--primary-soft)",
        accentColor: "var(--primary)"
    },
    {
        title: "Employees",
        value: "156",
        icon: <TeamOutlined />,
        color: "#7c3aed",
        bgColor: "rgba(124,58,237,0.08)",
        accentColor: "#7c3aed"
    },
    {
        title: "Pay Period",
        value: "May 2026",
        icon: <CalendarOutlined />,
        color: "#0284c7",
        bgColor: "rgba(2,132,199,0.08)",
        accentColor: "#0284c7"
    },
];

export const payrollColumns = [
    {
        title: 'Employee',
        dataIndex: 'name',
        key: 'name',
        render: (n: string, r: PayrollEntry) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar
                    style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 11 }}
                    size={32}
                >
                    {n.split(' ').map(c => c[0]).join('')}
                </Avatar>
                <div>
                    <div style={{ fontWeight: 600 }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.department}</div>
                </div>
            </div>
        )
    },
    {
        title: 'Base Salary',
        dataIndex: 'baseSalary',
        key: 'baseSalary',
        render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>
    },
    {
        title: 'Bonus',
        dataIndex: 'bonus',
        key: 'bonus',
        render: (v: string) => <span style={{ color: 'var(--success)' }}>{v}</span>
    },
    {
        title: 'Deductions',
        dataIndex: 'deductions',
        key: 'deductions',
        render: (v: string) => <span style={{ color: 'var(--error)' }}>{v}</span>
    },
    {
        title: 'Net Pay',
        dataIndex: 'netPay',
        key: 'netPay',
        render: (v: string) => <span style={{ fontWeight: 700, fontSize: 15 }}>{v}</span>
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (s: PayrollEntry['status']) => <StatusBadge status={s} />
    },
];
