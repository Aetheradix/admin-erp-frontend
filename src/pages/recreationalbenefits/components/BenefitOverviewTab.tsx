import type { RecreationalBenefit } from '../types/index';
import BenefitConfigurationDisplay from '../components/BenefitEligiblityDisplay';
import BenefitEligibilityDisplay from '../components/BenefitEligiblityDisplay';

interface Props {
  benefit: RecreationalBenefit;
}

const BenefitOverviewTab = ({ benefit }: Props) => {
  return (
    <div className="space-y-6">
      {/* Basic information */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Benefit Information</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Benefit Name" value={benefit.benefit_name} />

          <InfoItem label="Type" value={benefit.benefit_type} />

          <InfoItem
            label="Value"
            value={
              benefit.benefit_value != null
                ? `${benefit.currency} ${benefit.benefit_value}`
                : 'Not specified'
            }
          />

          <InfoItem
            label="Usage Limit"
            value={
              benefit.usage_limit != null
                ? `${benefit.currency} ${benefit.usage_limit}`
                : 'No limit'
            }
          />

          <InfoItem label="Frequency" value={benefit.usage_frequency} />

          <InfoItem label="Status" value={benefit.status} />

          <InfoItem label="Valid From" value={formatDate(benefit.valid_from)} />

          <InfoItem label="Valid Until" value={formatDate(benefit.valid_until)} />
        </div>

        {benefit.benefit_description && (
          <div className="mt-6 border-t pt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Description</h3>

            <p className="text-sm leading-6 text-gray-600">{benefit.benefit_description}</p>
          </div>
        )}
      </div>

      {/* Eligibility */}
      <BenefitEligibilityDisplay eligibility={benefit.eligibility} />

      {/* Configuration */}
      <BenefitConfigurationDisplay configuration={benefit.configuration} />
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>

    <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
  </div>
);

const formatDate = (date?: string | null) => {
  if (!date) return 'Not specified';

  return new Date(date).toLocaleDateString();
};

export default BenefitOverviewTab;
