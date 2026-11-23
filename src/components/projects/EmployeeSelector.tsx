import React from 'react';
import { Select, Avatar, Space, Tag } from 'antd';
import { departmentService } from '@/services/departmentService';

interface EmployeeSelectorProps {
  value?: number;
  onChange?: (userId: number) => void;
  placeholder?: string;
  departmentId?: number;
  allowClear?: boolean;
  className?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Select Employee',
  departmentId,
  allowClear = true,
  className = 'w-full',
  style,
  size = 'middle',
  disabled = false,
}) => {
  const allEmployees = departmentService.getAllEmployees();
  const filteredEmployees = departmentId
    ? allEmployees.filter((e) => e.departmentId === departmentId)
    : allEmployees;

  const options = filteredEmployees.map((emp) => ({
    value: emp.userId,
    label: emp.userName,
    employee: emp,
  }));

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch
      size={size}
      disabled={disabled}
      className={className}
      style={style}
      filterOption={(input, option) => {
        const emp = option?.employee;
        if (!emp) return false;
        const text = `${emp.userName} ${emp.designation} ${emp.departmentName}`.toLowerCase();
        return text.includes(input.toLowerCase());
      }}
      options={options}
      optionRender={(option) => {
        const emp = option.data.employee;
        const safeEmpName = (emp?.userName && typeof emp.userName === 'string' && emp.userName.trim()) || 'User';
        const initials = safeEmpName
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        const workload = departmentService.getEmployeeWorkload(emp.userId);

        return (
          <div className="flex items-center justify-between py-1">
            <Space size={8}>
              <Avatar
                size="small"
                className="bg-primary/20 text-primary font-bold text-xs">
                {initials}
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground leading-tight">
                  {emp.userName}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {emp.designation} · {emp.departmentName}
                </span>
              </div>
            </Space>
            {workload && (
              <Tag
                color={
                  workload.workloadLabel === 'Overloaded'
                    ? 'error'
                    : workload.workloadLabel === 'Heavy'
                    ? 'warning'
                    : 'success'
                }
                className="text-[10px] m-0 rounded-md">
                {workload.openTasks ?? 0} tasks
              </Tag>
            )}
          </div>
        );
      }}
    />
  );
};
