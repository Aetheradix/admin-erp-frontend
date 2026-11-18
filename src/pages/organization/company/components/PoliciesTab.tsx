import { Download } from 'lucide-react';
import { message, Tag } from 'antd';
import { motion } from 'framer-motion';
import type { PolicyItem } from '../types';

interface PoliciesTabProps {
  policies: PolicyItem[];
}

export function PoliciesTab({ policies }: PoliciesTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-foreground">Operational Policies & Guidelines</h3>
          <p className="text-xs text-muted">
            Official regulatory and cultural guidelines enforced across all departments and
            subsidiaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Filtered by:</span>
          <Tag color="blue" className="font-bold">
            All Employees
          </Tag>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy, index) => (
          <motion.div
            key={policy.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-8 rounded-[28px] bg-white border border-border-subtle shadow-soft flex flex-col justify-between gap-6 hover:shadow-lg transition-all">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {policy.category}
                </span>
                {policy.mandatory && (
                  <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded border border-error/20">
                    Mandatory
                  </span>
                )}
              </div>
              <h4 className="text-lg font-bold text-foreground">{policy.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{policy.summary}</p>
            </div>

            <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted">Version {policy.version}</span>
                <span className="text-[10px] text-muted">Effective {policy.effectiveDate}</span>
              </div>
              <button
                onClick={() => message.info(`Downloading full policy document: ${policy.title}`)}
                className="p-2 rounded-lg bg-surface-subtle hover:bg-primary/10 hover:text-primary transition-colors text-muted flex items-center gap-1.5 text-xs font-bold">
                <Download size={14} />
                <span>PDF</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
