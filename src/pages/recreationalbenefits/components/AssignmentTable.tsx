import { MoreHorizontal, UserMinus } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import type { RecreationalBenefitAssignment } from '@/types/recreationalBenefits';

interface AssignmentTableProps {
  assignments: RecreationalBenefitAssignment[];
  onRevoke: (assignment: RecreationalBenefitAssignment) => void;
}

export default function AssignmentTable({ assignments, onRevoke }: AssignmentTableProps) {
  if (!assignments.length) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No employees have been assigned this benefit.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.assignment_id}>
              <TableCell>
                {assignment.employee?.name ?? `Employee #${assignment.employee_id}`}
              </TableCell>

              <TableCell>{assignment.assigned_date ?? '-'}</TableCell>

              <TableCell>{assignment.valid_until ?? '-'}</TableCell>

              <TableCell>
                <Badge variant="secondary">{assignment.status}</Badge>
              </TableCell>

              <TableCell>
                {assignment.status === 'Active' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRevoke(assignment)}
                    title="Revoke"
                  >
                    <UserMinus className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
