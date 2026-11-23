import React from 'react';
import { Card, Row, Col, Statistic, Progress, Avatar } from 'antd';
import { Building2, Users, FolderKanban, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Department } from '@/types/department';

interface DepartmentSummaryProps {
  department: Department;
  activeProjectsCount?: number;
  totalTasksCount?: number;
  completedTasksCount?: number;
  overdueTasksCount?: number;
  className?: string;
}

export const DepartmentSummary: React.FC<DepartmentSummaryProps> = ({
  department,
  activeProjectsCount = 0,
  totalTasksCount = 0,
  completedTasksCount = 0,
  overdueTasksCount = 0,
  className = '',
}) => {
  const completionPct =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <Card
      className={`rounded-2xl border border-border-subtle bg-card shadow-xs ${className}`}
      styles={{ body: { padding: '20px' } }}>
      {/* Header: Dept Name & Head */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">{department.name}</h3>
            <span className="text-xs text-muted-foreground">{department.description || 'Department'}</span>
          </div>
        </div>

        {department.headUserName && (
          <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-surface-subtle border border-border-subtle">
            <Avatar size="small" className="bg-primary/20 text-primary font-bold text-xs">
              {department.headUserName.slice(0, 2).toUpperCase()}
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Dept. Head</span>
              <span className="text-xs font-bold text-foreground">{department.headUserName}</span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={12} sm={6}>
          <Statistic
            title={<span className="text-xs text-muted">Members</span>}
            value={department.memberCount || 0}
            prefix={<Users size={14} className="text-primary mr-1" />}
            valueStyle={{ fontSize: 18, fontWeight: 800 }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={<span className="text-xs text-muted">Active Projects</span>}
            value={activeProjectsCount}
            prefix={<FolderKanban size={14} className="text-blue-500 mr-1" />}
            valueStyle={{ fontSize: 18, fontWeight: 800 }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={<span className="text-xs text-muted">Tasks Completed</span>}
            value={`${completedTasksCount}/${totalTasksCount}`}
            prefix={<CheckCircle2 size={14} className="text-emerald-500 mr-1" />}
            valueStyle={{ fontSize: 18, fontWeight: 800 }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={<span className="text-xs text-muted">Overdue Tasks</span>}
            value={overdueTasksCount}
            prefix={<AlertCircle size={14} className="text-rose-500 mr-1" />}
            valueStyle={{
              fontSize: 18,
              fontWeight: 800,
              color: overdueTasksCount > 0 ? '#ff4d4f' : undefined,
            }}
          />
        </Col>
      </Row>

      {/* Overall Department Task Progress */}
      {totalTasksCount > 0 && (
        <div className="mt-4 pt-3 border-t border-border-subtle">
          <div className="flex justify-between text-xs text-muted mb-1 font-medium">
            <span>Overall Execution</span>
            <span className="font-bold text-foreground">{completionPct}%</span>
          </div>
          <Progress percent={completionPct} size="small" strokeColor="#52c41a" />
        </div>
      )}
    </Card>
  );
};
