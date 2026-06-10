import { PageHeader } from '@/components/ui/composed/PageHeader';
import { CalloutBanner } from '@/components/ui/composed/CalloutBanner';
import { EmptySlate } from '@/components/ui/composed/EmptySlate';
import { ExplorerBar } from '@/components/ui/composed/ExplorerBar';
import { Dialog } from '@/components/ui/composed/Dialog';
import { FinanceStats } from './components/FinanceStats';
import { ReimbursementCard } from './components/ReimbursementCard';
import { FinanceForm } from './components/FinanceForm';
import { useFinancePage } from './hooks/useFinancePage';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { Receipt } from 'lucide-react';

export function FinancePage() {
  const {
    filteredRequests,
    isLoading,
    showForm,
    setShowForm,
    activeCategory,
    setActiveCategory,
    CATEGORIES,
    handleRequestSubmit
  } = useFinancePage();

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
        title="Finance & Reimbursements"
        description="Streamline your expense reporting and item acquisition requests with transparency and speed."
        primaryAction={{
          label: 'File New Request',
          onClick: () => setShowForm(true),
          icon: 'pi pi-credit-card',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      <FinanceStats />

      <div className="flex flex-col gap-8">
        <ExplorerBar
          title="Expense Explorer"
          countLabel={`Filtering ${filteredRequests.length} active requests`}
          tabs={CATEGORIES}
          activeTab={activeCategory}
          onTabChange={setActiveCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRequests.map((request) => (
            <ReimbursementCard key={request.id} request={request} />
          ))}

          {filteredRequests.length === 0 && (
            <EmptySlate
              icon={Receipt}
              title="No Requests Found"
              message="We couldn't find any reimbursement requests matching your criteria. Ready to file a new expense?"
            />
          )}
        </div>
      </div>

      <CalloutBanner
        title={<>Review our <span className="text-primary">Finance Policy</span></>}
        description="Ensure all your acquisition requests and expense filings adhere to the latest company guidelines to expedite the approval process and maintain compliance."
        action={{ label: 'View Rulebook' }}
      />

      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Submit Acquisition Request"
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' }
        }}
      >
        <FinanceForm
          onSubmit={handleRequestSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
}

