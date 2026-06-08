'use client';

import React from 'react';
import { Menu } from 'antd';
import { menuSections } from '@/src/config/menu-config';

interface SidebarNavProps {
    collapsed: boolean;
    pathname: string;
    openKeys: string[];
    handleMenuClick: (info: { key: string }) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
    collapsed,
    pathname,
    openKeys,
    handleMenuClick
}) => {
    return (
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
    );
};

export default SidebarNav;
