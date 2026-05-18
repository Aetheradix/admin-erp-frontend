'use client';

import React from 'react';
import { Button, ButtonProps } from 'antd';

export interface AppButtonProps extends ButtonProps {
  // Add any custom props here if needed
}

const AppButton: React.FC<AppButtonProps> = ({ style, ...props }) => {
  const defaultStyle: React.CSSProperties = {
    borderRadius: 10,
    fontWeight: 600,
    ...style,
  };

  return <Button style={defaultStyle} {...props} />;
};

export default AppButton;
