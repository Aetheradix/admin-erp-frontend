import React, { useMemo } from 'react';
import { Select, Avatar, Space } from 'antd';
import { useGetOrganizationHierarchyQuery } from '@/store/api/organizationApiSlice';

interface UserSelectProps {
  value?: number | null;
  onChange?: (userId: number | null) => void;
  placeholder?: string;
  departmentId?: number | null;
  allowClear?: boolean;
  className?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
}

export const UserSelect: React.FC<UserSelectProps> = ({
  value,
  onChange,
  placeholder = 'Select user',
  departmentId,
  allowClear = true,
  className = 'w-full',
  style,
  size = 'middle',
  disabled = false,
}) => {
  const { data: hierarchyData, isLoading } = useGetOrganizationHierarchyQuery();

  const options = useMemo(() => {
    const users = hierarchyData?.data?.flatUsers ?? [];
    const filtered = departmentId
      ? users.filter((u) => u.department_id === departmentId)
      : users;

    return filtered.map((u) => {
      const name = u.username || u.email || `User ${u.id}`;
      const initials = name
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      return {
        value: u.id,
        label: name,
        searchText: `${name} ${u.designation ?? ''} ${u.department ?? ''}`.toLowerCase(),
        initials,
        designation: u.designation,
        department: u.department,
        image_url: u.image_url,
      };
    });
  }, [hierarchyData, departmentId]);

  return (
    <Select
      value={value ?? undefined}
      onChange={(val) => onChange?.(val ?? null)}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch
      size={size}
      disabled={disabled}
      loading={isLoading}
      className={className}
      style={style}
      filterOption={(input, option) =>
        (option as { searchText?: string })?.searchText?.includes(input.toLowerCase()) ?? false
      }
      options={options}
      optionRender={(opt) => {
        const o = opt.data as {
          initials: string;
          label: string;
          designation?: string;
          department?: string;
          image_url?: string;
        };
        return (
          <div className="flex items-center gap-2 py-0.5">
            <Avatar
              size="small"
              src={o.image_url || undefined}
              className="bg-primary/20 text-primary font-bold text-xs shrink-0">
              {o.initials || 'U'}
            </Avatar>
            <Space direction="vertical" size={0}>
              <span className="text-xs font-semibold text-foreground leading-tight">
                {o.label}
              </span>
              {(o.designation || o.department) && (
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {[o.designation, o.department].filter(Boolean).join(' · ')}
                </span>
              )}
            </Space>
          </div>
        );
      }}
    />
  );
};
