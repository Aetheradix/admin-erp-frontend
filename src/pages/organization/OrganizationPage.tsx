import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Building2, MapPin, Globe, Calendar, Users, Mail, Phone, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const companyInfo = {
    name: 'Aetheradix Technologies',
    industry: 'Enterprise Software',
    founded: '2019',
    website: 'aetheradix.com',
    email: 'contact@aetheradix.com',
    phone: '+1 (555) 234-5678',
    employees: 156,
    address: '42 Innovation Drive, Tech City, CA 94043',
    description: 'Aetheradix Technologies is a leading provider of enterprise resource planning solutions, helping businesses streamline operations through intelligent automation and data-driven insights.',
    values: ['Innovation', 'Transparency', 'Excellence', 'Collaboration'],
};

export function OrganizationPage() {
    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Organization"
                description="Company profile and organizational information."
                breadcrumbs={[
                    { label: 'Home', url: '/' },
                    { label: 'Organization' },
                ]}
            />

            {/* Company Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[32px] border border-border-subtle shadow-soft p-10 flex flex-col lg:flex-row items-start gap-10"
            >
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 size={40} className="text-primary" />
                </div>
                <div className="flex flex-col gap-4 flex-1">
                    <div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight">{companyInfo.name}</h2>
                        <span className="text-xs font-bold text-muted uppercase tracking-widest">{companyInfo.industry}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{companyInfo.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {companyInfo.values.map((v) => (
                            <span key={v} className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">{v}</span>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { icon: MapPin, label: 'Headquarters', value: companyInfo.address },
                    { icon: Calendar, label: 'Founded', value: companyInfo.founded },
                    { icon: Users, label: 'Employees', value: `${companyInfo.employees} members` },
                    { icon: Globe, label: 'Website', value: companyInfo.website },
                    { icon: Mail, label: 'Email', value: companyInfo.email },
                    { icon: Phone, label: 'Phone', value: companyInfo.phone },
                ].map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                        className="bg-white rounded-[28px] border border-border-subtle shadow-soft p-8 flex items-start gap-5 group hover:shadow-lg transition-all duration-300"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shrink-0">
                            <item.icon size={22} />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">{item.label}</span>
                            <span className="text-sm font-bold text-foreground truncate">{item.value}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
