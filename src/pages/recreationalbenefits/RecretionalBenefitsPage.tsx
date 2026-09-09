import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { RecreationalBenefit } from './types/index';

import {
  useGetRecreationalBenefitsQuery,
  useGetRecreationalBenefitStatsQuery,
  useDeleteRecreationalBenefitMutation,
  useActivateRecreationalBenefitMutation,
  useDeactivateRecreationalBenefitMutation,
} from '@/store/api/recreationalbenefitsSlice';

import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';

import BenefitStats from './components/BenefitsStats';
import BenefitTable from './components/BenefitTable';
import BenefitFormDialog from './components/BenefitFormDialog';

export default function RecreationalBenefitsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [benefitType, setBenefitType] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<RecreationalBenefit | null>(null);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: status || undefined,
      benefit_type: benefitType || undefined,
    }),
    [search, status, benefitType]
  );

  const {
    data: benefits = [],
    isLoading,
    isFetching,
  } = useGetRecreationalBenefitsQuery(queryParams);

  const { data: stats, isLoading: statsLoading } = useGetRecreationalBenefitStatsQuery();

  const [deleteBenefit] = useDeleteRecreationalBenefitMutation();

  const [activateBenefit] = useActivateRecreationalBenefitMutation();

  const [deactivateBenefit] = useDeactivateRecreationalBenefitMutation();

  const handleAdd = () => {
    setSelectedBenefit(null);
    setFormOpen(true);
  };

  const handleEdit = (benefit: RecreationalBenefit) => {
    setSelectedBenefit(benefit);
    setFormOpen(true);
  };

  const handleDelete = async (benefit: RecreationalBenefit) => {
    const confirmed = window.confirm(`Delete "${benefit.benefit_name}"?`);

    if (!confirmed) return;

    await deleteBenefit(benefit.benefit_id).unwrap();
  };

  const handleActivate = async (benefit: RecreationalBenefit) => {
    await activateBenefit(benefit.benefit_id).unwrap();
  };

  const handleDeactivate = async (benefit: RecreationalBenefit) => {
    await deactivateBenefit(benefit.benefit_id).unwrap();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Recreational Benefits</h1>

          <p className="text-sm text-muted-foreground">
            Manage employee recreational and lifestyle benefits.
          </p>
        </div>

        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Benefit
        </Button>
      </div>

      <BenefitStats stats={stats} isLoading={statsLoading} />

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            className="pl-9"
            placeholder="Search benefits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="h-10 rounded-md border bg-background px-3"
          value={benefitType}
          onChange={(e) => setBenefitType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Food Delivery">Food Delivery</option>
          <option value="Outstation Travel">Outstation Travel</option>
          <option value="Gym Membership">Gym Membership</option>
          <option value="OTT Subscription">OTT Subscription</option>
          <option value="Other">Other</option>
        </select>

        <select
          className="h-10 rounded-md border bg-background px-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {isLoading || isFetching ? (
        <div className="rounded-lg border p-10 text-center">Loading benefits...</div>
      ) : (
        <BenefitTable
          benefits={benefits}
          onView={(benefit) => navigate(`/recreational-benefits/${benefit.benefit_id}`)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
        />
      )}

      <BenefitFormDialog open={formOpen} onOpenChange={setFormOpen} benefit={selectedBenefit} />
    </div>
  );
}
