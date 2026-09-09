import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetRecreationalBenefitQuery,
  useDeleteRecreationalBenefitMutation,
  useActivateRecreationalBenefitMutation,
  useDeactivateRecreationalBenefitMutation,
} from '@/store/api/recreationalbenefitsSlice';

import BenefitOverviewTab from './components/BenefitOverviewTab';
import BenefitEmployeesTab from './components/BenefitEmployeeTab';
import BenefitUsageTab from './components/BenefitOverviewTab';

import { useState } from 'react';

type Tab = 'overview' | 'employees' | 'usage';

const RecreationalBenefitDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const benefitId = Number(id);

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const {
    data: benefit,
    isLoading,
    isError,
  } = useGetRecreationalBenefitQuery(benefitId, {
    skip: !benefitId,
  });

  const [deleteBenefit, { isLoading: isDeleting }] = useDeleteRecreationalBenefitMutation();

  const [activateBenefit, { isLoading: isActivating }] = useActivateRecreationalBenefitMutation();

  const [deactivateBenefit, { isLoading: isDeactivating }] =
    useDeactivateRecreationalBenefitMutation();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading benefit...</p>
      </div>
    );
  }

  if (isError || !benefit) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-700">Benefit not found</h2>

          <p className="mt-2 text-sm text-red-600">The recreational benefit could not be loaded.</p>

          <button
            onClick={() => navigate('/recreational-benefits')}
            className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm text-white"
          >
            Back to Benefits
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${benefit.benefit_name}"?`);

    if (!confirmed) return;

    try {
      await deleteBenefit(benefit.benefit_id).unwrap();

      navigate('/recreational-benefits');
    } catch (error) {
      console.error('Failed to delete benefit:', error);
    }
  };

  const handleToggleStatus = async () => {
    try {
      if (benefit.status === 'Active') {
        await deactivateBenefit(benefit.benefit_id).unwrap();
      } else {
        await activateBenefit(benefit.benefit_id).unwrap();
      }
    } catch (error) {
      console.error('Failed to update benefit status:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <button
            onClick={() => navigate('/recreational-benefits')}
            className="mb-3 text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Benefits
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{benefit.benefit_name}</h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                benefit.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : benefit.status === 'Expired'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {benefit.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">{benefit.benefit_type}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/recreational-benefits/${benefit.benefit_id}/edit`)}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Edit
          </button>

          {benefit.status !== 'Expired' && (
            <button
              onClick={handleToggleStatus}
              disabled={isActivating || isDeactivating}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {benefit.status === 'Active'
                ? isDeactivating
                  ? 'Deactivating...'
                  : 'Deactivate'
                : isActivating
                  ? 'Activating...'
                  : 'Activate'}
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'employees', label: 'Employees' },
            { key: 'usage', label: 'Usage' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && <BenefitOverviewTab benefit={benefit} />}

        {activeTab === 'employees' && <BenefitEmployeesTab benefitId={benefit.benefit_id} />}

        {activeTab === 'usage' && <BenefitUsageTab benefitId={benefit.benefit_id} />}
      </div>
    </div>
  );
};

export default RecreationalBenefitDetailsPage;
