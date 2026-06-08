'use client';

import React from 'react';
import { Typography } from 'antd';
import { TitleProps } from 'antd/es/typography/Title';

const { Title } = Typography;

export type AppTitleProps = TitleProps;

const AppTitle: React.FC<AppTitleProps> = ({ style, ...props }) => {
  const defaultStyle: React.CSSProperties = {
    letterSpacing: '-0.5px',
    ...style,
  };

  return <Title style={defaultStyle} {...props} />;
};

export default AppTitle;
