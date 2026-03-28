import { PageHeader } from '@/components/ui/composed/PageHeader';
import { CalloutBanner } from '@/components/ui/composed/CalloutBanner';
import { EmptySlate } from '@/components/ui/composed/EmptySlate';
import { ExplorerBar } from '@/components/ui/composed/ExplorerBar';
import { Dialog } from 'primereact/dialog';
import { GrievanceCard } from './components/GrievanceCard';
import { GrievanceForm } from './components/GrievanceForm';
import { useGrievancePage } from './hooks/useGrievancePage';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Scale, AlertTriangle } from 'lucide-react';

export function GrievancePage() {
  const {
    grievances,
    filteredGrievances,
    isLoading,
    showForm,
    setShowForm,
    activeCategory,
    setActiveCategory,
    CATEGORIES,
    handleGrievanceSubmit
  } = useGrievancePage();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Grievance Management"
        description="Share your concerns in a safe, confidential environment. We are committed to your well-being and psychological safety."
        primaryAction={{
          label: 'File a Concern',
          onClick: () => setShowForm(true),
          icon: 'pi pi-megaphone',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-[40px] bg-white border border-border-subtle shadow-soft flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Scale size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-foreground">Zero Retaliation Policy</h3>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              Our grievance process is built on trust and accessibility. We guarantee that no employee 
              will face adverse consequences for raising valid concerns or issues.
            </p>
          </div>
        </div>
        <div className="p-8 rounded-[40px] bg-foreground text-white flex flex-col justify-center gap-2">
          <span className="text-3xl font-black text-primary">{grievances.length}</span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Active Concerns</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <ExplorerBar
          title="Support Portal"
          countLabel={`Browsing ${filteredGrievances.length} status updates`}
          tabs={CATEGORIES}
          activeTab={activeCategory}
          onTabChange={setActiveCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGrievances.map((grievance) => (
            <GrievanceCard key={grievance.id} grievance={grievance} />
          ))}

          {filteredGrievances.length === 0 && (
            <EmptySlate
              icon={AlertTriangle}
              title="Clear Records"
              message="No concerns match the current filter. Our environment seems to be functioning optimally!"
            />
          )}
        </div>
      </div>

      <CalloutBanner
        color="primary"
        title={<>A Healthier Future <span className="text-foreground">Together</span></>}
        description="Your feedback is essential for our growth as an organization. By sharing your concerns, you directly contribute to a better, more inclusive workspace for everyone."
        action={{ label: 'Our Rulebook' }}
      />

      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Submit Confidential Concern"
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' }
        }}
      >
        <GrievanceForm
          onSubmit={handleGrievanceSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
}
