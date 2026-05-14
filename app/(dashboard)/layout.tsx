'use client';

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
import type { MenuProps } from 'antd';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

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
        getItem('Overview', '/finance'),
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
        getItem('Overview', '/analytics'),
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const siderWidth = collapsed ? 80 : 260;

  // Find currently open submenu keys
  const openKeys = menuSections
    .flatMap((s) => s.items)
    .filter((item: any) => item?.children && pathname.startsWith(item.key as string))
    .map((item: any) => item?.key as string);

  const handleMenuClick = (info: { key: string }) => {
    router.push(info.key);
  };

  const handleUserMenuClick = (info: { key: string }) => {
    if (info.key === 'logout') {
      router.push('/auth/login');
    } else if (info.key === 'settings') {
      router.push('/settings/general');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        collapsedWidth={80}
        trigger={null}
        className="dashboard-sider"
        style={{
          background: '#fff',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Logo */}
        <div className="sidebar-logo" onClick={() => router.push('/dashboard')}>
          <div className="sidebar-logo-icon">A</div>
          {!collapsed && <span className="sidebar-logo-text">AetherERP</span>}
        </div>

        {/* Navigation */}
        <div className="sidebar-nav no-scrollbar">
          {menuSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <div className="sidebar-section-label">{section.label}</div>
              )}
              <Menu
                mode="inline"
                selectedKeys={[pathname]}
                defaultOpenKeys={openKeys}
                onClick={handleMenuClick}
                items={section.items}
                style={{ border: 'none', background: 'transparent' }}
              />
            </div>
          ))}
        </div>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className="sidebar-footer" style={{ textAlign: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 16,
              width: '100%',
              height: 40,
              borderRadius: 10,
            }}
          />
        </div>
      </Sider>

      {/* Main Content */}
      <Layout style={{ marginLeft: siderWidth, transition: 'margin-left 0.3s cubic-bezier(0.2,0,0,1)' }}>
        {/* Header */}
        <Header
          className="dashboard-header"
          style={{ left: siderWidth }}
        >
          <div className="header-search">
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />}
              placeholder="Search anything..."
              style={{
                borderRadius: 10,
                background: 'var(--surface-subtle)',
                border: 'none',
                width: 300,
              }}
              allowClear
            />
          </div>

          <div className="header-actions">
            <Tooltip title="Notifications">
              <Badge count={3} size="small" offset={[-4, 4]}>
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: 18 }} />}
                  style={{ borderRadius: 10, width: 40, height: 40 }}
                />
              </Badge>
            </Tooltip>

            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              trigger={['click']}
              placement="bottomRight"
            >
              <div className="header-user-info">
                <Avatar
                  style={{
                    background: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                  size={36}
                >
                  JD
                </Avatar>
                <div style={{ lineHeight: 1.3 }}>
                  <Text
                    strong
                    style={{ fontSize: 13, display: 'block' }}
                  >
                    John Doe
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: 'var(--muted)',
                      display: 'block',
                    }}
                  >
                    Admin
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content
          className="dashboard-content-area"
          style={{
            marginTop: 'var(--header-height)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
