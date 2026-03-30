import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { CalloutBanner } from '@/components/ui/composed/CalloutBanner';
import { EmptySlate } from '@/components/ui/composed/EmptySlate';
import { ExplorerBar } from '@/components/ui/composed/ExplorerBar';
import { Dialog } from 'primereact/dialog';
import { showToast } from '@/components/ui/composed/Toast';
import { GuestPassCard } from './components/GuestPassCard';
import { GuestPassForm } from './components/GuestPassForm';
import { useGetGuestPassesQuery, useIssueGuestPassMutation } from '@/store/api/guestPassApiSlice';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { GuestPass } from './hooks/mockGuestPass';
import { Key, ShieldCheck, History, AlertCircle } from 'lucide-react';

export function GuestPassPage() {
  const { data: passes = [], isLoading } = useGetGuestPassesQuery();
  const [issueGuestPass] = useIssueGuestPassMutation();
  
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const TABS = ['All', 'Active', 'Pending', 'Expired'];

  const filteredPasses = passes.filter((p: GuestPass) => 
    activeTab === 'All' || p.status === activeTab
  );

  const handlePassSubmit = async (data: Partial<GuestPass>) => {
    try {
      await issueGuestPass(data).unwrap();
      setShowForm(false);
      showToast({ severity: 'success', summary: 'Issued', detail: 'Guest pass issued successfully.', life: 3000 });
    } catch (err: any) {
      console.error('Failed to issue guest pass:', err);
      showToast({ severity: 'error', summary: 'Error', detail: err.data?.message || 'Failed to issue pass.', life: 3000 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <PageHeader
        title="Visitor Management"
        description="Securely manage premises access by issuing temporary guest passes and tracking visitor logs."
        primaryAction={{
          label: 'Issue New Pass',
          onClick: () => setShowForm(true),
          icon: 'pi pi-key',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      {/* Guest Pass Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Passes', value: passes.filter(p => p.status === 'Active').length, icon: ShieldCheck, color: 'text-success' },
          { label: 'Pending Arrival', value: passes.filter(p => p.status === 'Pending').length, icon: AlertCircle, color: 'text-warning' },
          { label: 'Total Visits', value: '142', icon: History, color: 'text-primary' },
          { label: 'Security Level', value: 'High', icon: Key, color: 'text-info' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-border-subtle shadow-soft transition-all duration-300 hover:shadow-lg flex items-center gap-6 group">
            <div className={`w-14 h-14 rounded-2xl bg-surface-subtle flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-foreground">{stat.value}</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-8">
        <ExplorerBar
          title="Entry Log"
          countLabel={`Filtering ${filteredPasses.length} visitor records`}
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Passes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPasses.map((pass) => (
            <GuestPassCard key={pass.id} pass={pass} />
          ))}

          {filteredPasses.length === 0 && (
            <EmptySlate
              icon={Key}
              title="No Passive Authorizations"
              message="Currently, there are no guest passes matching your selection. Ensure guests are registered prior to arrival."
            />
          )}
        </div>
      </div>

      <CalloutBanner
        title={<>Maintain <span className="text-primary">Perimeter Security</span></>}
        description="Always verify visitor identity matching the issued pass. For after-hours access or high-security zones, please refer to the building management guidelines."
        action={{ label: 'Building Rules' }}
      />

      {/* Issue Pass Modal */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Generate Access Pass"
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' }
        }}
      >
        <GuestPassForm
          onSubmit={handlePassSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
}
