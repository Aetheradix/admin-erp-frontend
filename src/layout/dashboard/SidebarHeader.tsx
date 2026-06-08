'use client';

import React from 'react';
import { Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface SidebarHeaderProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ collapsed, setCollapsed }) => {
    const router = useRouter();

    return (
        <div
            className="sidebar-header"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                padding: '0 24px',
                borderBottom: '1px solid var(--border-subtle)',
                height: 'var(--header-height)',
            }}
        >
            <div
                className="sidebar-logo"
                onClick={() => router.push('/dashboard')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    borderBottom: 'none',
                    padding: 0,
                }}
            >
                <div className="sidebar-logo-icon">A</div>
                {!collapsed && <span className="sidebar-logo-text">AetherERP</span>}
            </div>

            {!collapsed && (
                <Button
                    type="text"
                    icon={<MenuFoldOutlined />}
                    onClick={() => setCollapsed(true)}
                    style={{
                        fontSize: 16,
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                    }}
                />
            )}

            {collapsed && (
                <Button
                    type="text"
                    icon={<MenuUnfoldOutlined />}
                    onClick={() => setCollapsed(false)}
                    style={{
                        fontSize: 16,
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        marginTop: 8
                    }}
                />
            )}
        </div>
    );
};

export default SidebarHeader;
