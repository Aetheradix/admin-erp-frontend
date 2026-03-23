import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from 'primereact/dialog';
import { FinanceStats } from './components/FinanceStats';
import { ReimbursementCard } from './components/ReimbursementCard';
import { FinanceForm } from './components/FinanceForm';
import { useGetReimbursementsQuery, useCreateReimbursementMutation } from '@/store/api/financeApiSlice';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { Reimbursement } from './hooks/mockFinance';
import { Sparkles, Filter, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { Tabs } from '@/components/ui/primitives/Tabs';

export function FinancePage() {
  const { data: requests = [], isLoading } = useGetReimbursementsQuery();
  const [createReimbursement] = useCreateReimbursementMutation();
  
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const CATEGORIES = ['All', 'Travel', 'Equipment', 'Software', 'Meals', 'Medical', 'Office Supplies'];

  const filteredRequests = requests.filter((r: Reimbursement) => 
    activeCategory === 'All' || r.category === activeCategory
  );

  const handleRequestSubmit = async (data: Partial<Reimbursement>) => {
    try {
      await createReimbursement(data).unwrap();
      setShowForm(false);
    } catch (err) {
      console.error('Failed to submit reimbursement request:', err);
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
        title="Finance & Reimbursements"
        description="Streamline your expense reporting and item acquisition requests with transparency and speed."
        primaryAction={{
          label: 'File New Request',
          onClick: () => setShowForm(true),
          icon: 'pi pi-credit-card',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      {/* Stats Overview */}
      <FinanceStats />

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[40px] border border-border-subtle shadow-soft transition-all duration-500 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Expense Explorer</h4>
              <p className="text-xs text-muted font-bold italic">Filtering {filteredRequests.length} active requests</p>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            <Tabs 
              items={CATEGORIES}
              activeItem={activeCategory}
              onItemChange={setActiveCategory}
            />
          </div>

          <Button variant="secondary" className="h-12 px-6 rounded-2xl! gap-2 border-border-subtle!">
            <Filter size={16} />
            <span className="font-bold text-xs uppercase tracking-widest">Advanced Filters</span>
          </Button>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRequests.map((request) => (
            <ReimbursementCard key={request.id} request={request} />
          ))}

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center gap-6 bg-white/50 backdrop-blur-sm rounded-[48px] border-2 border-dashed border-border-strong">
              <div className="w-24 h-24 rounded-full bg-surface-subtle flex items-center justify-center text-muted/30">
                <Receipt size={48} />
              </div>
              <div className="max-w-md px-6">
                <h3 className="text-2xl font-black text-foreground mb-2">No Requests Found</h3>
                <p className="text-muted font-medium leading-relaxed">
                  We couldn't find any reimbursement requests matching your criteria. 
                  Ready to file a new expense?
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Finance Policy Prompt */}
      <div className="p-10 rounded-[48px] bg-foreground text-white relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl flex flex-col gap-4">
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              Review our <span className="text-primary">Finance Policy</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              Ensure all your acquisition requests and expense filings adhere to the latest company guidelines 
              to expedite the approval process and maintain compliance.
            </p>
          </div>
          <Button variant="primary" className="h-14 px-10 rounded-2xl! font-black tracking-widest shadow-xl shadow-primary/20">
            View Rulebook
          </Button>
        </div>
      </div>

      {/* Request Modal */}
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
