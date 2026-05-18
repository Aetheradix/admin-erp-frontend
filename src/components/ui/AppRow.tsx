'use client';

import React from 'react';
import { Row, RowProps } from 'antd';

export interface AppRowProps extends RowProps {
  marginBottom?: number | string;
}

const AppRow: React.FC<AppRowProps> = ({ gutter = [20, 20], marginBottom = 20, style, ...props }) => {
  const defaultStyle: React.CSSProperties = {
    marginBottom,
    ...style,
  };

  return <Row gutter={gutter} style={defaultStyle} {...props} />;
};

export default AppRow;
