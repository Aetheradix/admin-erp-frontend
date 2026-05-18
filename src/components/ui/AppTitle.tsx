'use client';

import React from 'react';
import { Typography } from 'antd';
import { TitleProps } from 'antd/es/typography/Title';

const { Title } = Typography;

export interface AppTitleProps extends TitleProps {
  // Add any custom props here if needed
}

const AppTitle: React.FC<AppTitleProps> = ({ style, ...props }) => {
  const defaultStyle: React.CSSProperties = {
    letterSpacing: '-0.5px',
    ...style,
  };

  return <Title style={defaultStyle} {...props} />;
};

export default AppTitle;
