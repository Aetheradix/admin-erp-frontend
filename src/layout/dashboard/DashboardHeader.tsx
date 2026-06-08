'use client';

import React from 'react';
import { Layout, Input, Tooltip, Badge, Button, Dropdown, Avatar, Typography } from 'antd';
import { SearchOutlined, BellOutlined } from '@ant-design/icons';
import { userMenuItems } from '@/src/config/menu-config';

const { Header } = Layout;
const { Text } = Typography;

interface DashboardHeaderProps {
    siderWidth: number;
    handleUserMenuClick: (info: { key: string }) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    siderWidth,
    handleUserMenuClick
}) => {
    return (
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
    );
};

export default DashboardHeader;
