import React from 'react';
import { Button } from 'antd';
import {
  UserCheck,
  Users,
  GitCommit,
  UserMinus,
  Network,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';

interface HierarchyReorgStudioProps {
  onOpenFlowA: (user?: HierarchyNodeUser) => void;
  onOpenFlowB1: () => void;
  onOpenFlowB2: () => void;
  onOpenFlowB3: () => void;
  onOpenFlowC: (user?: HierarchyNodeUser) => void;
  stats: {
    totalEmployees: number;
    totalManagers: number;
    totalDepartments: number;
    hierarchyDepth: number;
  };
}

export const HierarchyReorgStudio: React.FC<HierarchyReorgStudioProps> = ({
  onOpenFlowA,
  onOpenFlowB1,
  onOpenFlowB2,
  onOpenFlowB3,
  onOpenFlowC,
  stats,
}) => {
  const flows = [
    {
      id: 'flow-a',
      title: 'Change Reporting Manager',
      desc: 'Updates reportsTo pointer with mandatory reason and effective date. Enforces Cycle Guard validation to prevent circular chains.',
      icon: UserCheck,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      btnText: 'Launch Manager Change',
      onClick: () => onOpenFlowA(),
    },
    {
      id: 'flow-b1',
      title: 'Bulk Team Handover',
      desc: 'Atomically transfers all direct reports of Manager A to Manager B while preserving underlying sub-teams and department hierarchy.',
      icon: Users,
      color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      btnText: 'Start Bulk Handover',
      onClick: onOpenFlowB1,
    },
    {
      id: 'flow-b2',
      title: 'Replace Manager (Succession)',
      desc: 'Manager B inherits Manager A’s supervisor position, parent line, and all direct reporting lines in one atomic transaction.',
      icon: GitCommit,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      btnText: 'Execute Succession Swap',
      onClick: onOpenFlowB2,
    },
    {
      id: 'flow-b3',
      title: 'Offboard Rollup',
      desc: 'Employee is deactivated; their direct reports automatically roll up to the grandparent manager to maintain continuous line-of-command.',
      icon: UserMinus,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      btnText: 'Initiate Offboard Rollup',
      onClick: onOpenFlowB3,
    },
    {
      id: 'flow-c',
      title: 'Matrix / Dotted-Line Managers',
      desc: 'Adds or removes dotted-line cross-functional manager links. Blocks duplicate assignments and primary manager collisions.',
      icon: Network,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      btnText: 'Manage Matrix Lines',
      onClick: () => onOpenFlowC(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-3xl bg-surface border border-border-subtle shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
              <Sparkles size={11} /> Organizational Governance
            </span>
            <span className="text-muted text-xs">•</span>
            <span className="text-xs font-bold text-muted">Closure Table Engine</span>
          </div>
          <h3 className="text-lg font-black text-foreground">
            Structural Reorganization & Governance Operations
          </h3>
          <p className="text-xs text-muted mt-0.5 max-w-2xl">
            Execute enterprise-grade structural changes with automatic cycle detection, transactional closure-table updates, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-muted uppercase block">Active Managers</span>
            <span className="text-xl font-black text-foreground">{stats.totalManagers}</span>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div className="text-right">
            <span className="text-[10px] font-bold text-muted uppercase block">Max Depth</span>
            <span className="text-xl font-black text-foreground">{stats.hierarchyDepth} Lvl</span>
          </div>
        </div>
      </div>

      {/* Reorg Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flows.map((flow) => {
          const Icon = flow.icon;
          return (
            <div
              key={flow.id}
              className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${flow.color}`}>
                    <Icon size={18} />
                  </div>
                </div>

                <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                  {flow.title}
                </h4>

                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {flow.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-border-subtle/60">
                <Button
                  onClick={flow.onClick}
                  className="w-full flex items-center justify-center gap-1.5 font-bold text-xs"
                  style={{ borderColor: '#E8583A', color: '#E8583A' }}>
                  <span>{flow.btnText}</span>
                  <ArrowRight size={13} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

