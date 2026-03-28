import { PageHeader } from '@/components/ui/composed/PageHeader';
import { useGetFeaturePermissionsQuery, useToggleFeatureMutation } from '@/store/api/permissionSlice';
import { Shield, Layout, Settings2, CheckCircle2, Calendar, Briefcase, MessageSquare, CreditCard, Check, Plus, Users, AlertCircle, Key } from 'lucide-react';


import { ProgressSpinner } from 'primereact/progressspinner';
import { classNames } from 'primereact/utils';

const DEPARTMENTS = ['HR', 'Sales', 'Engineering', 'Marketing', 'Product', 'Design'];

const FEATURES = [
  { id: 'Finance', icon: CreditCard, description: 'Payroll, reimbursements and financial reporting.', color: 'emerald' },
  { id: 'Attendance', icon: Calendar, description: 'Clock-in/out and overall attendance tracking.', color: 'blue' },
  { id: 'Blogs', icon: Layout, description: 'Company-wide internal knowledge base and posts.', color: 'purple' },
  { id: 'Gallery', icon: Layout, description: 'Media asset repository and event albums.', color: 'pink' },
  { id: 'Events', icon: Calendar, description: 'Manage and display upcoming company events.', color: 'amber' },
  { id: 'Careers', icon: Users, description: 'Job postings and internal talent acquisition.', color: 'indigo' },
  { id: 'Grievances', icon: AlertCircle, description: 'Internal support system and conflict resolution.', color: 'rose' },
  { id: 'Guest Pass', icon: Key, description: 'Visitor management and access authorizations.', color: 'blue' },
  { id: 'Approvals', icon: CheckCircle2, description: 'Personnel request processing and workflow control.', color: 'green' }
];


export function FeatureControl() {
  const { data: permissions = [], isLoading } = useGetFeaturePermissionsQuery();
  const [toggleFeature] = useToggleFeatureMutation();

  const handleToggle = async (feature_name: string, department: string, is_enabled: boolean) => {
    try {
      await toggleFeature({ feature_name, department, is_enabled }).unwrap();
    } catch (err) {
      console.error('Failed to toggle feature:', err);
    }
  };

  const isEnabled = (feature: string, dept: string) => {
    return permissions.some(p => p.feature_name === feature && p.department === dept && p.is_enabled);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-6 bg-surface-base">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4">
             <ProgressSpinner style={{ width: '32px', height: '32px' }} strokeWidth="8" animationDuration="1s" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Synchronizing Permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-14 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <PageHeader
        title="Intelligence & Access Control"
        description="A high-performance command center for managing feature availability and department-level permissions."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-10">
        {FEATURES.map((feature) => (
          <div 
            key={feature.id} 
            className="group relative bg-white/40 backdrop-blur-3xl p-10 rounded-[48px] border border-white/60 shadow-subtle hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            {/* Feature Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className={classNames(
                  "w-16 h-16 rounded-[24px] flex items-center justify-center transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110",
                  `bg-${feature.color}-500/10 text-${feature.color}-600`
                )}>
                  <feature.icon size={28} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-foreground tracking-tight leading-none uppercase">{feature.id}</h3>
                  <span className="text-[10px] text-muted font-black uppercase tracking-widest mt-2">Module Permissions</span>
                </div>
              </div>
            </div>

            <p className="text-xs font-bold text-muted/80 leading-relaxed mb-10 min-h-[40px] italic">
              {feature.description}
            </p>

            {/* Department Grid */}
            <div className="flex flex-wrap gap-3 mt-auto">
              {DEPARTMENTS.map((dept) => {
                const active = isEnabled(feature.id, dept);
                return (
                  <button
                    key={dept}
                    onClick={() => handleToggle(feature.id, dept, !active)}
                    className={classNames(
                      "flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      active 
                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-100" 
                        : "bg-surface-subtle text-muted/60 hover:bg-surface-base hover:text-muted scale-[0.98] hover:scale-100 border border-transparent hover:border-border-subtle"
                    )}
                  >
                    {active ? <Check size={12} strokeWidth={4} /> : <Plus size={12} strokeWidth={4} />}
                    {dept}
                  </button>
                );
              })}
            </div>

            {/* Subtle background decoration */}
            <div className={classNames(
              "absolute -bottom-10 -right-10 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none blur-3xl rounded-full",
              `bg-${feature.color}-600`
            )} />
          </div>
        ))}
      </div>

      <div className="mt-10 p-10 bg-gradient-to-br from-primary/5 to-primary/10 rounded-[48px] border border-primary/10 flex flex-col md:flex-row items-center gap-8 shadow-inner shadow-primary/5">
        <div className="p-5 bg-white shadow-xl rounded-[24px] text-primary">
          <Settings2 size={32} />
        </div>
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h4 className="text-lg font-black text-primary uppercase tracking-widest">Administrative Policy Control</h4>
          <p className="text-xs font-bold text-muted/80 leading-relaxed italic max-w-3xl">
            This module represents the highest tier of system intelligence. Adjusting these toggles will instantly recalibrate the digital experience for corresponding departments, affecting navigation, routing, and operational accessibility in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
