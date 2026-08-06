import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Slack, Github, Mail, CreditCard, Layers, Zap, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { InputSwitch } from '@/components/ui/primitives/Switch';
import { Button } from '@/components/ui/primitives/Button';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { useState } from 'react';

const integrations = [
  {
    id: 1,
    name: 'Slack',
    description: 'Get notifications and updates directly in Slack channels.',
    category: 'Communication',
    icon: Slack,
    connected: true,
    color: '#4A154B',
  },
  {
    id: 2,
    name: 'GitHub',
    description: 'Sync repositories, PRs, and issues with your projects.',
    category: 'Development',
    icon: Github,
    connected: true,
    color: '#333',
  },
  {
    id: 3,
    name: 'Google Workspace',
    description: 'Connect Gmail, Calendar, and Drive.',
    category: 'Productivity',
    icon: Layers,
    connected: false,
    color: '#4285F4',
  },
  {
    id: 4,
    name: 'Email (SMTP)',
    description: 'Configure outgoing email for notifications and invoices.',
    category: 'Communication',
    icon: Mail,
    connected: true,
    color: '#E8583A',
  },
  {
    id: 5,
    name: 'Stripe',
    description: 'Payment processing for invoices and subscriptions.',
    category: 'Finance',
    icon: CreditCard,
    connected: false,
    color: '#635BFF',
  },
  {
    id: 6,
    name: 'Jira',
    description: 'Sync issues and sprints with AetherERP projects.',
    category: 'Development',
    icon: Zap,
    connected: false,
    color: '#0052CC',
  },
  {
    id: 7,
    name: 'Zapier',
    description: 'Automate workflows with 5000+ apps.',
    category: 'Automation',
    icon: Zap,
    connected: false,
    color: '#FF4A00',
  },
  {
    id: 8,
    name: 'Twilio',
    description: 'SMS notifications and two-factor authentication.',
    category: 'Communication',
    icon: MessageSquare,
    connected: false,
    color: '#F22F46',
  },
];

export function IntegrationsPage() {
  const [showJiraModal, setShowJiraModal] = useState(false);

  const [jiraConfig, setJiraConfig] = useState(() => {
    const saved = localStorage.getItem('jira_integration_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      hostUrl: '',
      email: '',
      apiToken: '',
      projectKey: '',
      issueType: 'Task',
      useProxy: true,
    };
  });

  const [activeItems, setActiveItems] = useState<Record<number, boolean>>(() => {
    const base = integrations.reduce<Record<number, boolean>>(
      (acc, item) => ({ ...acc, [item.id]: item.connected }),
      {}
    );
    const savedJiraActive = localStorage.getItem('jira_connection_active');
    if (savedJiraActive !== null) {
      try {
        base[6] = JSON.parse(savedJiraActive); // Jira is ID 6
      } catch {}
    }
    return base;
  });

  const toggle = (id: number) => {
    const item = integrations.find((app) => app.id === id);
    if (item?.name === 'Jira') {
      const hasConfigValue = localStorage.getItem('jira_integration_config');
      if (!hasConfigValue && !activeItems[id]) {
        setShowJiraModal(true);
        return;
      }
    }
    setActiveItems((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      if (item?.name === 'Jira') {
        localStorage.setItem('jira_connection_active', JSON.stringify(updated[id]));
      }
      return updated;
    });
  };

  const handleSaveJira = () => {
    localStorage.setItem('jira_integration_config', JSON.stringify(jiraConfig));
    if (jiraConfig.hostUrl && jiraConfig.email && jiraConfig.apiToken && jiraConfig.projectKey) {
      setActiveItems((prev) => {
        const updated = { ...prev, [6]: true };
        localStorage.setItem('jira_connection_active', JSON.stringify(true));
        return updated;
      });
    }
    setShowJiraModal(false);
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
              <div
                className="w-16 h-16 rounded-xl bg-surface-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xs border border-white/50"
                style={{ color: app.color }}
              >
                <app.icon size={32} />
              </div>
              <InputSwitch checked={activeItems[app.id]} onChange={() => toggle(app.id)} />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-foreground tracking-tight leading-none">
                  {app.name}
                </h3>
                {activeItems[app.id] && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                {app.description}
              </p>
              <div className="mt-2 px-3 py-1 bg-surface-subtle rounded-lg text-[10px] font-black inline-block uppercase text-muted tracking-widest self-start">
                {app.category}
              </div>
            </div>

            <div className="pt-6 border-t border-border-subtle/50 flex items-center justify-end">
              <Button
                variant="secondary"
                className="h-10 px-8 rounded-md font-black tracking-widest text-[10px] uppercase shadow-sm border border-border-subtle"
                onClick={() => (app.name === 'Jira' ? setShowJiraModal(true) : undefined)}
              >
                {activeItems[app.id] ? 'Configure' : 'Connect'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Jira Integration Details Dialog */}
      <Dialog
        visible={showJiraModal}
        onHide={() => setShowJiraModal(false)}
        header="Configure Jira Integration"
        modal
        className="w-full max-w-xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Jira Site URL
            </label>
            <Input
              placeholder="e.g. https://your-domain.atlassian.net"
              value={jiraConfig.hostUrl}
              onChange={(e) => setJiraConfig({ ...jiraConfig, hostUrl: e.target.value })}
            />
            <span className="text-[10px] text-muted italic">
              Enterprise cloud URL of your Atlassian workspace.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Jira Account Email
            </label>
            <Input
              placeholder="e.g. developer@company.com"
              value={jiraConfig.email}
              onChange={(e) => setJiraConfig({ ...jiraConfig, email: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Jira API Token
            </label>
            <Input
              type="password"
              placeholder="ATATT3xFf..."
              value={jiraConfig.apiToken}
              onChange={(e) => setJiraConfig({ ...jiraConfig, apiToken: e.target.value })}
            />
            <span className="text-[9px] text-primary hover:underline cursor-pointer">
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                Create an Atlassian API Token here
              </a>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Project Key
              </label>
              <Input
                placeholder="e.g. KAN, PROJ"
                value={jiraConfig.projectKey}
                onChange={(e) =>
                  setJiraConfig({ ...jiraConfig, projectKey: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Default Issue Type
              </label>
              <Input
                placeholder="e.g. Task, Bug, Story"
                value={jiraConfig.issueType}
                onChange={(e) => setJiraConfig({ ...jiraConfig, issueType: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-subtle border border-border-subtle mt-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-foreground">Relay Via CORS Proxy</span>
              <span className="text-[10px] text-muted italic">
                Bypasses strict web browser CORS blocking rules automatically.
              </span>
            </div>
            <InputSwitch
              checked={jiraConfig.useProxy}
              onChange={() => setJiraConfig({ ...jiraConfig, useProxy: !jiraConfig.useProxy })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => setShowJiraModal(false)}
              className="rounded-md!"
            />
            <Button
              label="Save Configuration"
              onClick={handleSaveJira}
              icon="pi pi-check"
              className="rounded-md! px-8!"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
