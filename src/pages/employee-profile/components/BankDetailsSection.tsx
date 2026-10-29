import { useState, useEffect, useRef } from 'react';
import { CreditCard, Save, Eye, EyeOff, AlertTriangle, Cloud } from 'lucide-react';
import { Input, Select } from 'antd';
import type { BankDetails } from '@/services/employeeProfileService';
import { isDataModified } from '@/utils/formDraftManager';

interface Props {
  data?: BankDetails;
  onSave: (data: BankDetails) => void;
  onSaveDraft?: (data: BankDetails) => void;
  onDraftChange?: (data: BankDetails, isDirty: boolean) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

const labelClass = 'block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider';

export function BankDetailsSection({
  data,
  onSave,
  onSaveDraft,
  onDraftChange,
  isSaving,
  readOnly,
}: Props) {
  const [form, setForm] = useState<BankDetails>({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountType: '',
    ...data,
  });

  const [showAccount, setShowAccount] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accountMismatch, setAccountMismatch] = useState(false);
  const isLocalChange = useRef(false);

  useEffect(() => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }
    if (data) setForm({ ...data });
  }, [data]);

  const set = (key: keyof BankDetails, val: string) => {
    isLocalChange.current = true;
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'accountNumber' || key === 'confirmAccountNumber') {
        setAccountMismatch(
          next.accountNumber !== '' &&
            next.confirmAccountNumber !== '' &&
            next.accountNumber !== next.confirmAccountNumber
        );
      }
      if (onDraftChange) {
        onDraftChange(next, isDataModified(data, next));
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.accountNumber !== form.confirmAccountNumber) {
      setAccountMismatch(true);
      return;
    }
    const { confirmAccountNumber: _omit, ...bankData } = form;
    onSave(bankData as BankDetails);
  };

  const handleDraftClick = () => {
    if (onSaveDraft) {
      const { confirmAccountNumber: _omit, ...bankData } = form;
      onSaveDraft(bankData as BankDetails);
    }
  };

  const maskedAccount = (acc: string) => {
    if (!acc || acc.length < 5) return acc;
    return '*'.repeat(acc.length - 4) + acc.slice(-4);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <CreditCard size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-base font-black text-foreground">Bank Account Details</h3>
          <p className="text-xs text-muted">Banking information for payroll and reimbursements</p>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning/5 border border-warning/20">
        <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-warning/80">
          Your bank details are encrypted and only accessible to authorized payroll team members.
          Never share these details via email or chat.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <label className={labelClass}>Account Holder Name *</label>
          <Input
            size="large"
            value={form.accountHolderName}
            onChange={(e) => set('accountHolderName', e.target.value)}
            placeholder="As per bank records"
            className="rounded-xl!"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className={labelClass}>Bank Name *</label>
          <Input
            size="large"
            value={form.bankName}
            onChange={(e) => set('bankName', e.target.value)}
            placeholder="e.g. State Bank of India"
            className="rounded-xl!"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className={labelClass}>Branch Name</label>
          <Input
            size="large"
            value={form.branchName || ''}
            onChange={(e) => set('branchName', e.target.value)}
            placeholder="Branch name"
            className="rounded-xl!"
            disabled={readOnly}
          />
        </div>

        <div>
          <label className={labelClass}>Account Number *</label>
          <Input
            size="large"
            type={showAccount || readOnly ? 'text' : 'password'}
            value={readOnly ? maskedAccount(form.accountNumber) : form.accountNumber}
            onChange={(e) => set('accountNumber', e.target.value)}
            placeholder="Enter account number"
            className="rounded-xl!"
            required
            disabled={readOnly}
            suffix={
              !readOnly && (
                <button
                  type="button"
                  onClick={() => setShowAccount(!showAccount)}
                  className="text-muted hover:text-foreground">
                  {showAccount ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )
            }
          />
        </div>

        {!readOnly && (
          <div>
            <label className={labelClass}>Confirm Account Number *</label>
            <Input
              size="large"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmAccountNumber || ''}
              onChange={(e) => set('confirmAccountNumber', e.target.value)}
              placeholder="Re-enter account number"
              className={`rounded-xl! ${accountMismatch ? 'border-error!' : ''}`}
              required
              disabled={readOnly}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-muted hover:text-foreground">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            {accountMismatch && (
              <p className="text-xs text-error mt-1 font-semibold">Account numbers do not match</p>
            )}
          </div>
        )}

        <div>
          <label className={labelClass}>IFSC Code *</label>
          <Input
            size="large"
            value={form.ifscCode}
            onChange={(e) => set('ifscCode', e.target.value.toUpperCase())}
            placeholder="e.g. SBIN0001234"
            className="rounded-xl!"
            required
            disabled={readOnly}
            maxLength={11}
          />
        </div>

        <div>
          <label className={labelClass}>Account Type</label>
          <Select
            size="large"
            className="w-full"
            value={form.accountType || undefined}
            onChange={(val) => set('accountType', val)}
            placeholder="Select type"
            disabled={readOnly}
            options={[
              { label: 'Savings', value: 'Savings' },
              { label: 'Current', value: 'Current' },
              { label: 'Salary', value: 'Salary' },
            ]}
          />
        </div>
      </div>

      {/* Bank Document Upload Note */}
      <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle">
        <p className="text-xs text-muted">
          <strong className="text-foreground">Supporting Document:</strong> Please upload a
          cancelled cheque or bank passbook (first page) in the Documents section to verify your
          bank details.
        </p>
      </div>

      {!readOnly && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle/50">
          {onSaveDraft && (
            <button
              type="button"
              onClick={handleDraftClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle text-foreground text-sm font-semibold transition-all">
              <Cloud size={16} className="text-muted" />
              Save as Draft
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving || accountMismatch}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50">
            {isSaving ? <i className="pi pi-spin pi-spinner" /> : <Save size={16} />}
            Save & Continue
          </button>
        </div>
      )}
    </form>
  );
}
