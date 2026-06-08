'use client';

import React from 'react';
import { Tag, TagProps } from 'antd';

export type AppTagProps = TagProps;

const AppTag: React.FC<AppTagProps> = ({ style, ...props }) => {
  const defaultStyle: React.CSSProperties = {
    borderRadius: 6,
    border: 'none',
    fontWeight: 600,
    ...style,
  };

  return <Tag style={defaultStyle} {...props} />;
};

export default AppTag;
