import { useState } from 'react';

import { useGetRecreationalBenefitAssignmentsQuery } from '@/store/api/recreationalbenefitsSlice';

import AssignBenefitDialog from './AssignBenefitDialog';
import RevokeAssignmentDialog from './RevokeAssignmentDialog';

interface Props {
  benefitId: number;
}

const BenefitEmployeesTab = ({ benefitId }: Props) => {
  const [showAssign, setShowAssign] = useState(false);
  const [revokeAssignmentId, setRevokeAssignmentId] = useState<number | null>(null);

  const {
    data: assignments = [],
    isLoading,
    isError,
  } = useGetRecreationalBenefitAssignmentsQuery(benefitId);

  if (isLoading) {
    return <p className="text-gray-500">Loading employees...</p>;
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
        Failed to load assigned employees.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-white">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold">Assigned Employees</h2>

            <p className="mt-1 text-sm text-gray-500">
              Employees currently assigned to this benefit.
            </p>
          </div>

          <button
            onClick={() => setShowAssign(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Assign Employee
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">No employees assigned</p>

            <p className="mt-1 text-sm text-gray-500">
              Assign this benefit to an employee to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                    Assigned Date
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                    Valid Until
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {assignments.map((assignment) => (
                  <tr key={assignment.assignment_id}>
                    <td className="px-5 py-4 text-sm">
                      {assignment.employee?.name ?? `Employee #${assignment.employee_id}`}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(assignment.assigned_date)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(assignment.valid_until)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        {assignment.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {assignment.status !== 'Revoked' && (
                        <button
                          onClick={() => setRevokeAssignmentId(assignment.assignment_id)}
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AssignBenefitDialog
        benefitId={benefitId}
        open={showAssign}
        onClose={() => setShowAssign(false)}
      />

      {revokeAssignmentId && (
        <RevokeAssignmentDialog
          assignmentId={revokeAssignmentId}
          open
          onClose={() => setRevokeAssignmentId(null)}
        />
      )}
    </>
  );
};

const formatDate = (date?: string | null) => {
  if (!date) return '-';

  return new Date(date).toLocaleDateString();
};

export default BenefitEmployeesTab;
