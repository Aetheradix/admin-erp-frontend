'use client';

import React from 'react';
import { Card, CardProps } from 'antd';

export interface AppCardProps extends CardProps {
  // Add any custom props here if needed
}

const AppCard: React.FC<AppCardProps> = ({ style, ...props }) => {
  const defaultStyle: React.CSSProperties = {
    borderRadius: 16,
    border: '1px solid var(--border-subtle)',
    ...style,
  };

  return <Card style={defaultStyle} {...props} />;
};

export default AppCard;
