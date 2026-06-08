'use client';

import React from 'react';
import AppTitle from './AppTitle';

interface ContainerHeaderProps {
    title: React.ReactNode;
    icon?: React.ReactNode;
    extra?: React.ReactNode;
    style?: React.CSSProperties;
}

const ContainerHeader: React.FC<ContainerHeaderProps> = ({
    title,
    icon,
    extra,
    style
}) => {
    return (
        <div
            className="container-header"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                ...style
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <span style={{ color: 'var(--primary)', fontSize: 16, display: 'flex' }}>{icon}</span>}
                <AppTitle level={5} style={{ margin: 0, fontSize: 15 }}>
                    {title}
                </AppTitle>
            </div>
            {extra && <div>{extra}</div>}
        </div>
    );
};

export default ContainerHeader;
