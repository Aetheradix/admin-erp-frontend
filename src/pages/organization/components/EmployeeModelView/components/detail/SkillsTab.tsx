import React from 'react';
import { Shield, Building2 } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';

interface SkillsTabProps {
  user: HierarchyNodeUser;
  skills: string[];
}

export const SkillsTab: React.FC<SkillsTabProps> = React.memo(({
  user,
  skills,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
          Assigned System Roles
        </span>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5">
            <Shield size={12} /> {user.role || 'Employee'}
          </span>
          <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5">
            <Building2 size={12} /> {user.department || 'Product'} Team
          </span>
        </div>
      </div>

      {/* Render skills only when present in real employee data */}
      {skills.length > 0 && (
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
            Technical Skills & Competencies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-slate-100">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
          Corporate Governance
        </span>
        <p className="text-xs text-slate-500 leading-relaxed">
          Authorized to access corporate ERP modules per organization security policy.
          Leaves and WFH requests route through designated hierarchical manager.
        </p>
      </div>
    </div>
  );
});

SkillsTab.displayName = 'SkillsTab';
