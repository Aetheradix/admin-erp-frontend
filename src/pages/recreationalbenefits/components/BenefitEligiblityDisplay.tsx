import type { RecreationalBenefitJson } from '../types/index';

interface Props {
  eligibility?: RecreationalBenefitJson | null;
}

const BenefitEligibilityDisplay = ({ eligibility }: Props) => {
  if (!eligibility || Object.keys(eligibility).length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold">Eligibility</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(eligibility).map(([key, value]) => (
          <div key={key} className="rounded-md bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {formatKey(key)}
            </p>

            <p className="mt-1 wrap-break-word text-sm font-medium text-gray-900">
              {formatValue(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatKey = (key: string) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '-';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

export default BenefitEligibilityDisplay;
