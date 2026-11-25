import React from 'react';
import { Tooltip } from 'antd';
import { Mail, MessageSquare, Phone, Calendar } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';

interface QuickActionsBarProps {
  user: HierarchyNodeUser;
  onScheduleClick: () => void;
}

interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  title: string;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = React.memo(
  ({ user, onScheduleClick }) => {
    const actions: ActionItem[] = [
      {
        id: 'mail',
        label: 'Mail',
        icon: <Mail size={16} className="mb-1 text-slate-500 group-hover:text-[#0078d4]" />,
        href: user.email ? `mailto:${user.email}` : undefined,
        title: `Send email to ${user.username}`,
      },
      {
        id: 'chat',
        label: 'Chat',
        icon: (
          <MessageSquare size={16} className="mb-1 text-slate-500 group-hover:text-[#0078d4]" />
        ),
        href: user.email ? `mailto:${user.email}?subject=Teams%20Chat` : undefined,
        title: `Chat with ${user.username}`,
      },
      {
        id: 'call',
        label: 'Call',
        icon: <Phone size={16} className="mb-1 text-slate-500 group-hover:text-[#0078d4]" />,
        href: user.contact_number ? `tel:${user.contact_number}` : undefined,
        title: `Call ${user.username}`,
      },
      {
        id: 'schedule',
        label: 'Schedule',
        icon: <Calendar size={16} className="mb-1 text-slate-500 group-hover:text-[#0078d4]" />,
        onClick: onScheduleClick,
        title: 'View Calendar & Schedule',
      },
    ];

    return (
      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
        {actions.map((act) => (
          <Tooltip key={act.id} title={act.title}>
            {act.href ? (
              <a
                href={act.href}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-50 hover:bg-[#0078d4]/10 hover:text-[#0078d4] text-slate-600 text-[10px] font-bold transition-all border border-slate-200/80 group">
                {act.icon}
                <span>{act.label}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={act.onClick}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-50 hover:bg-[#0078d4]/10 hover:text-[#0078d4] text-slate-600 text-[10px] font-bold transition-all border border-slate-200/80 group cursor-pointer w-full">
                {act.icon}
                <span>{act.label}</span>
              </button>
            )}
          </Tooltip>
        ))}
      </div>
    );
  }
);

QuickActionsBar.displayName = 'QuickActionsBar';
