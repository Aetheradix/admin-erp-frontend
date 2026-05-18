'use client';

import React from 'react';
import { Typography } from 'antd';
import { TextProps } from 'antd/es/typography/Text';

const { Text } = Typography;

export interface AppTextProps extends TextProps {
  muted?: boolean;
  small?: boolean;
}

const AppText: React.FC<AppTextProps> = ({ muted, small, style, ...props }) => {
  const defaultStyle: React.CSSProperties = {
    color: muted ? 'var(--muted)' : undefined,
    fontSize: small ? 13 : undefined,
    ...style,
  };

  return <Text style={defaultStyle} {...props} />;
};

export default AppText;
