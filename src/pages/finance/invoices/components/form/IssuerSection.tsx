import { useState } from 'react';
import { Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/composed/Input';
import type { InvoiceForm } from '../../types';
import { SectionTitle } from './SectionTitle';

interface IssuerSectionProps {
  form: InvoiceForm;
  updateField: <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => void;
}

export function IssuerSection({ form, updateField }: IssuerSectionProps) {
  const [showIssuerDetails, setShowIssuerDetails] = useState(false);

  return (
    <section className="space-y-4">
      <SectionTitle
        icon={<Building2 size={18} />}
        title="Issuer Business Details"
        description="Organization issuing this tax invoice."
        rightElement={
          <button
            type="button"
            onClick={() => setShowIssuerDetails(!showIssuerDetails)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-black hover:underline cursor-pointer">
            {showIssuerDetails ? 'Collapse Details' : 'Edit Issuer Details'}
            {showIssuerDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        }
      />

      {!showIssuerDetails ? (
        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap items-center gap-3 text-xs text-gray-600 font-medium">
          <span>
            <strong>Company:</strong> {form.companyName || 'Aetheradix Private Limited'}
          </span>
          <span>•</span>
          <span>
            <strong>GSTIN:</strong> {form.companyGSTIN || '23ABDCA8625L1ZJ'}
          </span>
          <span>•</span>
          <span>
            <strong>Address:</strong> {form.companyCity || 'Bhopal'},{' '}
            {form.companyState || 'Madhya Pradesh'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 animate-in fade-in duration-200">
          <Input
            label="Company Name"
            value={form.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
          />
          <Input
            label="Contact Person"
            value={form.companyContact}
            onChange={(e) => updateField('companyContact', e.target.value)}
          />
          <Input
            label="Company GSTIN"
            value={form.companyGSTIN}
            onChange={(e) => updateField('companyGSTIN', e.target.value)}
          />
          <div className="md:col-span-2">
            <Input
              label="Company Address"
              value={form.companyAddress}
              onChange={(e) => updateField('companyAddress', e.target.value)}
            />
          </div>
          <Input
            label="City"
            value={form.companyCity}
            onChange={(e) => updateField('companyCity', e.target.value)}
          />
          <Input
            label="State"
            value={form.companyState}
            onChange={(e) => updateField('companyState', e.target.value)}
          />
          <Input
            label="Pincode"
            value={form.companyPincode}
            onChange={(e) => updateField('companyPincode', e.target.value)}
          />
          <Input
            label="Country"
            value={form.companyCountry}
            onChange={(e) => updateField('companyCountry', e.target.value)}
          />
        </div>
      )}
    </section>
  );
}
