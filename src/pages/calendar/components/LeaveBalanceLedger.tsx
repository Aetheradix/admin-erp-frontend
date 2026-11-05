import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button as AntButton } from 'antd';
import dayjs from 'dayjs';
import {
  useGetMyBalancesQuery,
  usePreviewLeaveDeductionMutation,
  type LeaveDeductionPreview,
} from '@/store/api/leaveSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { Button } from '@/components/ui/primitives/Button';
import {
  Wallet,
  Sparkles,
  Calculator,
  CalendarCheck,
} from 'lucide-react';

export function LeaveBalanceLedger({ onApplyClick }: { onApplyClick?: () => void }) {
  const currentYear = new Date().getFullYear();
  const { data: balances = [] } = useGetMyBalancesQuery({ year: currentYear });

  const [previewDeduction, { isLoading: isPreviewing }] = usePreviewLeaveDeductionMutation();
  const [previewResult, setPreviewResult] = useState<LeaveDeductionPreview | null>(null);

  // Ant Design Form
  const [form] = Form.useForm();

  useEffect(() => {
    if (balances.length > 0 && !form.getFieldValue('leave_type_id')) {
      form.setFieldsValue({
        leave_type_id: balances[0].leave_type_id,
      });
    }
  }, [balances, form]);

  const handleCalculatePreview = async (values: {
    leave_type_id: number;
    start_date: dayjs.Dayjs;
    end_date: dayjs.Dayjs;
  }) => {
    const startDateStr = dayjs.isDayjs(values.start_date)
      ? values.start_date.format('YYYY-MM-DD')
      : String(values.start_date || '');
    const endDateStr = dayjs.isDayjs(values.end_date)
      ? values.end_date.format('YYYY-MM-DD')
      : String(values.end_date || '');

    if (!startDateStr || !endDateStr) {
      showToast({ severity: 'warn', summary: 'Required', detail: 'Select start and end date' });
      return;
    }

    try {
      const res = await previewDeduction({
        leave_type_id: Number(values.leave_type_id),
        start_date: startDateStr,
        end_date: endDateStr,
        day_fraction: 'FULL',
      }).unwrap();
      setPreviewResult(res);
    } catch (err: any) {
      showToast({ severity: 'error', summary: 'Preview Failed', detail: err?.data?.message || 'Calculation error' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-surface border border-border-subtle shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              My Real-Time Leave Balances ({currentYear})
            </h3>
            <p className="text-xs text-muted">
              Live double-entry ledger tracking opening credits, monthly accruals, approved deductions, and LOP.
            </p>
          </div>
        </div>

        {onApplyClick && (
          <Button
            onClick={onApplyClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-black shadow-md shadow-primary/20 hover:bg-primary-hover">
            <CalendarCheck size={16} />
            <span>Apply For Leave</span>
          </Button>
        )}
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((b) => {
          const isLop = b.leave_category === 'UNPAID';
          return (
            <div
              key={b.id}
              className={`p-5 rounded-3xl border transition-all ${
                isLop
                  ? 'bg-rose-500/5 border-rose-500/20'
                  : 'bg-surface border-border-subtle hover:border-primary/30 shadow-xs'
              }`}>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] tracking-wider uppercase ${
                  isLop ? 'bg-rose-500/20 text-rose-500' : 'bg-primary/10 text-primary'
                }`}>
                  {b.leave_type_code}
                </span>
                <span className="text-[11px] font-bold text-muted capitalize">
                  {b.leave_category.toLowerCase()}
                </span>
              </div>

              <h4 className="text-sm font-black text-foreground mt-3 line-clamp-1">
                {b.leave_type_name}
              </h4>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground tracking-tight">
                  {isLop ? b.lop_balance : b.available_balance}
                </span>
                <span className="text-xs font-bold text-muted">days {isLop ? 'LOP taken' : 'available'}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle/80 grid grid-cols-3 gap-1 text-[10px] text-muted">
                <div>
                  <span className="block font-bold">Accrued</span>
                  <span className="font-extrabold text-foreground">{b.accrued_balance}</span>
                </div>
                <div>
                  <span className="block font-bold">Used</span>
                  <span className="font-extrabold text-foreground">{b.used_balance}</span>
                </div>
                <div>
                  <span className="block font-bold">Pending</span>
                  <span className="font-extrabold text-foreground">{b.pending_approval_balance}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Deduction Previewer with Sandwich Engine */}
      <div className="p-6 rounded-3xl bg-surface border border-border-subtle shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Calculator className="text-primary" size={20} />
          <h4 className="text-base font-black text-foreground">
            Interactive Leave Day & Sandwich Calculator
          </h4>
        </div>
        <p className="text-xs text-muted -mt-3">
          Simulate an upcoming leave span to preview weekend skips, company holidays, sandwich rule deductions, and automatic Loss of Pay (LOP) splits.
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCalculatePreview}
          className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Leave Type</span>}
              name="leave_type_id"
              rules={[{ required: true, message: 'Select leave type' }]}
              className="!mb-0">
              <Select
                size="large"
                className="w-full"
                placeholder="Select Leave Type"
                options={balances.map((b) => ({
                  value: b.leave_type_id,
                  label: `${b.leave_type_name} (${b.leave_type_code})`,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground">Start Date</span>}
              name="start_date"
              rules={[{ required: true, message: 'Select start date' }]}
              className="!mb-0">
              <DatePicker
                size="large"
                className="w-full"
                format="YYYY-MM-DD"
                placeholder="Start Date"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground">End Date</span>}
              name="end_date"
              rules={[{ required: true, message: 'Select end date' }]}
              className="!mb-0">
              <DatePicker
                size="large"
                className="w-full"
                format="YYYY-MM-DD"
                placeholder="End Date"
              />
            </Form.Item>

            <Form.Item className="!mb-0">
              <AntButton
                type="primary"
                htmlType="submit"
                size="large"
                loading={isPreviewing}
                icon={<Sparkles size={14} />}
                className="w-full font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: '#E8583A' }}>
                Simulate
              </AntButton>
            </Form.Item>
          </div>
        </Form>

        {/* Evaluation Output */}
        {previewResult && (
          <div className="mt-2 p-5 rounded-2xl bg-surface-elevated/70 border border-border-subtle flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
              <div>
                <p className="text-xs text-muted">
                  Applied Policy: <strong className="text-foreground">{previewResult.policyName}</strong> ({previewResult.calendarName})
                </p>
                {previewResult.applySandwichRule && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black">
                    Sandwich Rule Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-black">
                <div>
                  <span className="text-muted text-[10px] uppercase block">Total Net Days</span>
                  <span className="text-lg text-foreground">{previewResult.totalDays}d</span>
                </div>
                <div>
                  <span className="text-muted text-[10px] uppercase block">Paid From Balance</span>
                  <span className="text-lg text-emerald-500">{previewResult.paidDays}d</span>
                </div>
                {previewResult.lopDays > 0 && (
                  <div>
                    <span className="text-rose-500 text-[10px] uppercase block">Loss of Pay (LOP)</span>
                    <span className="text-lg text-rose-500">{previewResult.lopDays}d</span>
                  </div>
                )}
              </div>
            </div>

            {/* Itemized days pill list */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted block mb-2">
                Calendar Days Breakdown
              </span>
              <div className="flex flex-wrap gap-2">
                {previewResult.days.map((d) => (
                  <div
                    key={d.date}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                      d.isLop
                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                        : d.isSandwichApplied
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        : d.isWeekend || d.isHoliday
                        ? 'bg-surface text-muted border-border-subtle line-through opacity-70'
                        : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                    }`}>
                    <span>{d.date}</span>
                    <span className="text-[10px] font-extrabold opacity-80">
                      ({d.deductionUnits}d {d.isSandwichApplied ? 'Sandwich' : d.holidayName || (d.isWeekend ? 'Off' : '')})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
