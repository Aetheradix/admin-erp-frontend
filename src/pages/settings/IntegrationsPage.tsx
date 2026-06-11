import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Slack, Github, Mail, CreditCard, Layers, Zap, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { InputSwitch } from '@/components/ui/primitives/Switch';
import { Button } from '@/components/ui/primitives/Button';
import { useState } from 'react';

const integrations = [
    { id: 1, name: 'Slack', description: 'Get notifications and updates directly in Slack channels.', category: 'Communication', icon: Slack, connected: true, color: '#4A154B' },
    { id: 2, name: 'GitHub', description: 'Sync repositories, PRs, and issues with your projects.', category: 'Development', icon: Github, connected: true, color: '#333' },
    { id: 3, name: 'Google Workspace', description: 'Connect Gmail, Calendar, and Drive.', category: 'Productivity', icon: Layers, connected: false, color: '#4285F4' },
    { id: 4, name: 'Email (SMTP)', description: 'Configure outgoing email for notifications and invoices.', category: 'Communication', icon: Mail, connected: true, color: '#E8583A' },
    { id: 5, name: 'Stripe', description: 'Payment processing for invoices and subscriptions.', category: 'Finance', icon: CreditCard, connected: false, color: '#635BFF' },
    { id: 6, name: 'Jira', description: 'Sync issues and sprints with AetherERP projects.', category: 'Development', icon: Zap, connected: false, color: '#0052CC' },
    { id: 7, name: 'Zapier', description: 'Automate workflows with 5000+ apps.', category: 'Automation', icon: Zap, connected: false, color: '#FF4A00' },
    { id: 8, name: 'Twilio', description: 'SMS notifications and two-factor authentication.', category: 'Communication', icon: MessageSquare, connected: false, color: '#F22F46' },
];

export function IntegrationsPage() {
    const [activeItems, setActiveItems] = useState<Record<number, boolean>>(
        integrations.reduce<Record<number, boolean>>((acc, item) => ({ ...acc, [item.id]: item.connected }), {})
    );

    const toggle = (id: number) => {
        setActiveItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Integrations"
                description="Connect third-party services to enhance your workflow."
                breadcrumbs={[
                    { label: 'Home', url: '/' },
                    { label: 'Settings', url: '/settings' },
                    { label: 'Integrations' },
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {integrations.map((app, i) => (
                    <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                        className="bg-white rounded-xl border border-border-subtle shadow-soft p-10 flex flex-col gap-8 group hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className="w-16 h-16 rounded-xl bg-surface-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xs border border-white/50" style={{ color: app.color }}>
                                <app.icon size={32} />
                            </div>
                            <InputSwitch checked={activeItems[app.id]} onChange={() => toggle(app.id)} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-black text-foreground tracking-tight leading-none">{app.name}</h3>
                                {activeItems[app.id] && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
                            </div>
                            <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">{app.description}</p>
                            <div className="mt-2 px-3 py-1 bg-surface-subtle rounded-lg text-[10px] font-black inline-block uppercase text-muted tracking-widest self-start">{app.category}</div>
                        </div>

                        <div className="pt-6 border-t border-border-subtle/50 flex items-center justify-end">
                            <Button variant="secondary" className="h-10 px-8 rounded-md font-black tracking-widest text-[10px] uppercase shadow-sm border border-border-subtle">
                                {activeItems[app.id] ? 'Configure' : 'Connect'}
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
