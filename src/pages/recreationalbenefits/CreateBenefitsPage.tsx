import { useNavigate } from 'react-router-dom';
import { Button, Card, message } from 'antd';
import { ArrowLeft } from 'lucide-react';

import BenefitForm from './components/BenefitFormDialog';
import { useRecreationalBenefitForm } from './hooks/useRecreationalBenefits';
import type { CreateRecreationalBenefitRequest } from './types/index';

export default function CreateRecreationalBenefitPage() {
  const navigate = useNavigate();
  const { createBenefit, isCreating } = useRecreationalBenefitForm();

  const handleBack = () => {
    navigate('/recreational-benefits/perks');
  };

  const handleSubmit = async (data: CreateRecreationalBenefitRequest) => {
    try {
      await createBenefit(data);
      message.success('Recreational benefit created successfully!');
      handleBack();
    } catch (error) {
      console.error('Failed to create recreational benefit:', error);
      message.error('Failed to create benefit. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button
          type="text"
          icon={<ArrowLeft className="h-5 w-5" />}
          onClick={handleBack}
          title="Back to Perks"
        />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create Recreational Benefit</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up a new employee perk, allowance, or lifestyle subscription.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <Card className="shadow-sm">
        <BenefitForm
          mode="create"
          isLoading={isCreating}
          onSubmit={handleSubmit}
          onCancel={handleBack}
        />
      </Card>
    </div>
  );
}
