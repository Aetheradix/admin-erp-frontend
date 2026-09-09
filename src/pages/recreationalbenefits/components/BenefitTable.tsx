import { Pencil, Eye, Trash2, Power, PowerOff } from 'lucide-react';

import type { RecreationalBenefit } from '../types/index';

import { Button } from '@/components/ui/primitives/Button';
import { Badge } from '@/components/ui/primitives/Badge';

interface BenefitTableProps {
  benefits: RecreationalBenefit[];
  onView: (benefit: RecreationalBenefit) => void;
  onEdit: (benefit: RecreationalBenefit) => void;
  onDelete: (benefit: RecreationalBenefit) => void;
  onActivate: (benefit: RecreationalBenefit) => void;
  onDeactivate: (benefit: RecreationalBenefit) => void;
}

export default function BenefitTable({
  benefits,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: BenefitTableProps) {
  if (!benefits.length) {
    return (
      <div className="rounded-lg border p-10 text-center text-muted-foreground">
        No recreational benefits found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left">Benefit</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Value</th>
            <th className="px-4 py-3 text-left">Frequency</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {benefits.map((benefit) => (
            <tr key={benefit.benefit_id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="font-medium">{benefit.benefit_name}</div>

                {benefit.benefit_description && (
                  <div className="max-w-xs truncate text-xs text-muted-foreground">
                    {benefit.benefit_description}
                  </div>
                )}
              </td>

              <td className="px-4 py-3">{benefit.benefit_type}</td>

              <td className="px-4 py-3">
                {benefit.benefit_value != null
                  ? `${benefit.currency} ${benefit.benefit_value}`
                  : '—'}
              </td>

              <td className="px-4 py-3">{benefit.usage_frequency}</td>

              <td className="px-4 py-3">
                <Badge variant={benefit.status === 'Active' ? 'default' : 'secondary'}>
                  {benefit.status}
                </Badge>
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(benefit)}>
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" size="icon" onClick={() => onEdit(benefit)}>
                    <Pencil className="h-4 w-4" />
                  </Button>

                  {benefit.status === 'Active' ? (
                    <Button variant="ghost" size="icon" onClick={() => onDeactivate(benefit)}>
                      <PowerOff className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => onActivate(benefit)}>
                      <Power className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => onDelete(benefit)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
