import { Check, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FeatureCardProps {
    feature: any;
    departments: string[];
    isEnabled: (feature: string, dept: string) => boolean;
    onToggle: (feature: string, dept: string, active: boolean) => void;
}

export const FeatureCard = ({ feature, departments, isEnabled, onToggle }: FeatureCardProps) => {
    return (
        <div className="group relative bg-white/40 backdrop-blur-3xl p-10 rounded-[48px] border border-white/60 shadow-subtle hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                    <div className={cn(
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

            <div className="flex flex-wrap gap-3 mt-auto">
                {departments.map((dept) => {
                    const active = isEnabled(feature.id, dept);
                    return (
                        <button
                            key={dept}
                            onClick={() => onToggle(feature.id, dept, !active)}
                            className={cn(
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

            <div className={cn(
                "absolute -bottom-10 -right-10 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none blur-3xl rounded-full",
                `bg-${feature.color}-600`
            )} />
        </div>
    );
};
