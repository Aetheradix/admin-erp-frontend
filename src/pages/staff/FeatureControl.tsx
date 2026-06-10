import { PageHeader } from '@/components/ui/composed/PageHeader';
import { FeatureCard } from './components/FeatureCard';
import { useFeatureControl } from './hooks/useFeatureControl';
import { Settings2, Calendar, Layout, CreditCard, Users, AlertCircle, Key, CheckCircle2 } from 'lucide-react';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { useGetDepartmentsQuery } from '@/store/api/authApiSlice';

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
  const { isLoading: isPermissionsLoading, handleToggle, isEnabled } = useFeatureControl();
  const { data: departmentsData, isLoading: isDeptsLoading } = useGetDepartmentsQuery({});
  
  const departments = departmentsData?.data ?? [];
  const departmentNames = departments.map((d: any) => d.department_name);

  if (isPermissionsLoading || isDeptsLoading) {
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
          <FeatureCard 
            key={feature.id}
            feature={feature}
            departments={departmentNames}
            isEnabled={isEnabled}
            onToggle={handleToggle}
          />
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
