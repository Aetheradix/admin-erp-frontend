import { MenuProps } from "antd";


import React, { useState } from 'react';
import { Layout, Menu, Input, Avatar, Badge, Dropdown, Button, Typography, Tooltip } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  BankOutlined,
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  ApiOutlined,
  AuditOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  FundProjectionScreenOutlined,
  WalletOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';


type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return { key, icon, children, label } as MenuItem;
}

const menuSections = [
  {
    label: 'MAIN',
    items: [
      getItem('Dashboard', '/dashboard', <DashboardOutlined />),
    ],
  },
  {
    label: 'ORGANIZATION',
    items: [
      getItem('Organization', '/org', <BankOutlined />, [
        getItem('Company Profile', '/org/profile'),
        getItem('Branches', '/org/branches'),
      ]),
      getItem('Teams', '/teams', <TeamOutlined />),
      getItem('Users', '/users', <UserOutlined />),
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      getItem('Projects', '/projects', <ProjectOutlined />),
      getItem('Tasks', '/tasks', <CheckSquareOutlined />),
    ],
  },
  {
    label: 'FINANCE',
    items: [
      getItem('Finance', '/finance', <DollarOutlined />, [
        getItem('Overview', '/finance/overview'),
        getItem('Invoices', '/finance/invoices'),
        getItem('Expenses', '/finance/expenses'),
        getItem('Payroll', '/finance/payroll'),
      ]),
    ],
  },
  {
    label: 'INVENTORY',
    items: [
      getItem('Inventory', '/inventory', <ShoppingOutlined />, [
        getItem('Items', '/inventory/items'),
        getItem('Stock Levels', '/inventory/stock'),
        getItem('Movements', '/inventory/stock-movements'),
      ]),
    ],
  },
  {
    label: 'INSIGHTS',
    items: [
      getItem('Analytics', '/analytics', <BarChartOutlined />, [
        getItem('Overview', '/analytics/overview'),
        getItem('Reports', '/analytics/reports'),
      ]),
    ],
  },
  {
    label: 'ADMIN',
    items: [
      getItem('Settings', '/settings', <SettingOutlined />, [
        getItem('General', '/settings/general'),
        getItem('Roles & Permissions', '/settings/roles'),
        getItem('Integrations', '/settings/integrations'),
        getItem('Audit Log', '/settings/audit-log'),
      ]),
    ],
  },
];

const userMenuItems: MenuProps['items'] = [
  { key: 'profile', label: 'My Profile', icon: <UserOutlined /> },
  { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
  { type: 'divider' },
  { key: 'logout', label: 'Sign Out', icon: <LogoutOutlined />, danger: true },
];
