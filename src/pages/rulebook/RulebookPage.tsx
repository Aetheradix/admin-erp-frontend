import { Shield, Scale, Info, ChevronRight, Search, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Input } from '@/components/ui/primitives/Input';

export function RulebookPage() {
  const policies = [
    { 
      title: 'Code of Conduct', 
      icon: Shield, 
      color: 'text-primary',
      description: 'Guidelines for professional behavior, ethics, and workplace decorum.'
    },
    { 
      title: 'Finance & Reimbursements', 
      icon: Scale, 
      color: 'text-success',
      description: 'Official protocol for expensing items and acquisition requests.'
    },
    { 
      title: 'Data Privacy & Security', 
      icon: Info, 
      color: 'text-info',
      description: 'Safeguarding company data and intellectual property.'
    },
    { 
      title: 'Remote Work & WFH', 
      icon: BookOpen, 
      color: 'text-warning',
      description: 'Terms and conditions for working outside the primary office.'
    }
  ];

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Company Rulebook"
        description="The source of truth for all company policies, governance protocols, and operational guidelines."
      />

      {/* Search Header */}
      <div className="bg-white p-6 rounded-4xl border border-border-subtle shadow-soft flex items-center gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <Input 
            className="!pl-16 !h-14 !rounded-3xl !bg-surface-subtle/50 !border-none" 
            placeholder="Search policies, keywords, or legal terms..." 
          />
        </div>
        <div className="px-8 flex flex-col items-end whitespace-nowrap">
           <span className="text-[10px] font-black text-muted uppercase tracking-widest">Last Updated</span>
           <span className="text-xs font-bold text-foreground">March 2026 (v2.4)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {policies.map((policy) => (
          <div key={policy.title} className="group bg-white p-10 rounded-4xl border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 hover:-translate-y-1 relative overflow-hidden flex items-start gap-8">
            <div className={`w-16 h-16 rounded-3xl bg-surface-subtle flex items-center justify-center ${policy.color} group-hover:scale-110 transition-transform duration-500`}>
              <policy.icon size={32} />
            </div>
            
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{policy.title}</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {policy.description}
                </p>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline group/btn pt-2">
                Read Full Documentation
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Prompt */}
      <div className="p-10 rounded-4xl bg-foreground text-white flex flex-col gap-6 relative overflow-hidden group">
         <div className="absolute right-0 top-0 w-1/3 h-full bg-primary/20 -skew-x-12 translate-x-12" />
         <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
            <h2 className="text-3xl font-black leading-tight">Digital Signature <span className="text-primary">Required</span></h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              Every employee is required to acknowledge the latest updates to the Code of Conduct 
              and Security Policy annually. 
            </p>
         </div>
         <div className="relative z-10 pt-4 flex items-center gap-6">
            <div className="flex items-center gap-3 h-14 px-8 rounded-3xl bg-white/5 border border-white/10">
               <Shield className="text-success" size={20} />
               <span className="text-xs font-black uppercase tracking-widest">Acknowledged for 2026</span>
            </div>
         </div>
      </div>
    </div>
  );
}
