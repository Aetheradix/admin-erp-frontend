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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in duration-150">
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
            Assigned System Roles & Access
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

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
            Corporate Governance & Policy
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Authorized to access corporate ERP modules per organization security policy.
            Leaves and WFH requests route through designated hierarchical manager.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
            Technical Skills & Competencies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(skills.length > 0
              ? skills
              : ['React & TypeScript', 'Node.js Backend', 'System Architecture', 'Agile / Scrum', 'Enterprise Workflows']
            ).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#0078d4]/10 hover:text-[#0078d4] text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Enterprise Security Level
          </span>
          <span className="text-xs font-bold text-slate-800 block">Standard Corporate Identity (SSO Enabled)</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">2-Factor Authentication Verified</span>
        </div> */}
      </div>
    </div>
  );
});

SkillsTab.displayName = 'SkillsTab';
