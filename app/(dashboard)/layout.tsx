'use client';

import { Layout } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { menuSections } from '@/src/config/menu-config';
import SidebarHeader from '@/src/layout/dashboard/SidebarHeader';
import SidebarNav from '@/src/layout/dashboard/SidebarNav';
import SidebarFooter from '@/src/layout/dashboard/SidebarFooter';
import DashboardHeader from '@/src/layout/dashboard/DashboardHeader';

const { Sider, Content } = Layout;

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
    const targetPath = info.key.endsWith('/overview')
      ? info.key.replace('/overview', '')
      : info.key;
    router.push(targetPath);
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
        <SidebarHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <SidebarNav
          collapsed={collapsed}
          pathname={pathname}
          openKeys={openKeys}
          handleMenuClick={handleMenuClick}
        />
        <SidebarFooter />
      </Sider>

      <Layout style={{ marginLeft: siderWidth, transition: 'margin-left 0.3s cubic-bezier(0.2,0,0,1)' }}>
        <DashboardHeader
          siderWidth={siderWidth}
          handleUserMenuClick={handleUserMenuClick}
        />
        <Content
          className="dashboard-content-area"
          style={{ marginTop: 'var(--header-height)' }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
