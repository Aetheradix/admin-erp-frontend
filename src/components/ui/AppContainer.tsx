'use client';

import React from 'react';

interface AppContainerProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    fluid?: boolean;
}

const AppContainer: React.FC<AppContainerProps> = ({
    children,
    className = '',
    style,
    fluid = false
}) => {
    const defaultStyle: React.CSSProperties = {
        maxWidth: fluid ? '100%' : '1400px',
        margin: '0 auto',
        padding: '0 24px',
        ...style,
    };

    return (
        <div className={`app-container ${className}`} style={defaultStyle}>
            {children}
        </div>
    );
};

export default AppContainer;
