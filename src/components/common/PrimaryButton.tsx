import React from 'react';
import { Button as AntdButton } from 'antd';

interface PrimaryButtonProps {
  children: React.ReactNode;
  htmlType?: 'submit' | 'button' | 'reset';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  htmlType = 'button',
  loading,
  onClick,
  className = '',
  icon
}) => {
  return (
    <AntdButton 
      type="primary" 
      htmlType={htmlType}
      loading={loading}
      onClick={onClick}
      icon={icon}
      className={`w-full h-12 bg-cyan-500 !border-none text-slate-950 font-bold rounded-xl flex items-center justify-center hover:!bg-cyan-400 transition-all shadow-none text-base ${className}`}
    >
      {children}
    </AntdButton>
  );
};

export default PrimaryButton;
