import React from 'react';
import { Input as AntdInput, Form } from 'antd';
import type { LucideIcon } from 'lucide-react';

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
  icon?: LucideIcon;
  rules?: any[];
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  name, 
  label, 
  placeholder, 
  type = 'text', 
  icon: Icon,
  rules = [],
  className = ''
}) => {
  const InputComponent = type === 'password' ? AntdInput.Password : AntdInput;
  
  return (
    <Form.Item
      name={name}
      label={<span className="text-gray-300 font-medium text-sm">{label}</span>}
      rules={rules}
      className={className}
    >
      <InputComponent 
        suffix={Icon && <Icon size={18} className="text-gray-500" />}
        className="h-12 rounded-xl border-white/10 focus:border-cyan-500 hover:border-cyan-500 bg-[#0f172a] text-white shadow-sm placeholder:text-gray-600"
        placeholder={placeholder}
      />
    </Form.Item>
  );
};

export default FormInput;
