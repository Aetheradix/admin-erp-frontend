'use client';

import React from 'react';
import { Card, Typography, Switch, Tag, Button } from 'antd';

const { Text } = Typography;

interface IntegrationCardProps {
    integration: any;
    loading: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, loading }) => {
    return (
        <Card
            style={{
                borderRadius: 16,
                border: '1px solid var(--border-subtle)',
                height: '100%',
                transition: 'all 0.3s'
            }}
            hoverable
            styles={{
                body: {
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    padding: 24
                }
            }}
            loading={loading}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 16
                }}
            >
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: `${integration.color}12`,
                        color: integration.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24
                    }}
                >
                    {integration.icon}
                </div>
                <Switch checked={integration.connected} />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                {integration.name}
            </h3>

            <Text
                style={{
                    color: 'var(--muted)',
                    fontSize: 13,
                    display: 'block',
                    marginBottom: 16,
                    flex: 1
                }}
            >
                {integration.description}
            </Text>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Tag style={{ borderRadius: 6, border: 'none', fontWeight: 600 }}>
                    {integration.category}
                </Tag>
                <Button
                    type={integration.connected ? 'default' : 'primary'}
                    size="small"
                    style={{ borderRadius: 8, fontWeight: 600 }}
                >
                    {integration.connected ? 'Configure' : 'Connect'}
                </Button>
            </div>
        </Card>
    );
};

export default IntegrationCard;
