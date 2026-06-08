import React from 'react';
import { DollarOutlined, FileTextOutlined, WalletOutlined, RiseOutlined } from '@ant-design/icons';

export const financeStats = [
    {
        title: "Total Revenue",
        value: "$284,500",
        icon: <DollarOutlined />,
        color: "#059669",
        bgColor: "rgba(5,150,105,0.08)",
        accentColor: "#059669",
        trend: { value: '+12.5%', direction: 'up' as const }
    },
    {
        title: "Outstanding",
        value: "$42,300",
        icon: <FileTextOutlined />,
        color: "#d97706",
        bgColor: "rgba(217,119,6,0.08)",
        accentColor: "#d97706",
        trend: { value: '5 invoices', direction: 'up' as const }
    },
    {
        title: "Expenses",
        value: "$67,840",
        icon: <WalletOutlined />,
        color: "#e11d48",
        bgColor: "rgba(225,29,72,0.08)",
        accentColor: "#e11d48",
        trend: { value: '+3.2%', direction: 'down' as const }
    },
    {
        title: "Net Profit",
        value: "$216,660",
        icon: <RiseOutlined />,
        color: "#0284c7",
        bgColor: "rgba(2,132,199,0.08)",
        accentColor: "#0284c7",
        trend: { value: '+18.7%', direction: 'up' as const }
    },
];
