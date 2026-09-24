import { apiSlice } from './apiSlice';

export interface ExpenseParticipant {
  id?: number;
  userId?: number | null;
  participantName: string;
  allocatedAmount?: number;
  isExternalGuest?: boolean;
}

export interface ExpenseReceipt {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at?: string;
}

export interface ExpenseRecord {
  id: number;
  expense_number: string;
  user_id: number;
  employee_name?: string;
  trip_id?: number | null;
  title: string;
  description?: string | null;
  amount: number;
  category: string;
  expense_date: string;
  vendor_name?: string | null;
  payment_mode: string;
  is_group_expense: boolean | number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  rejection_reason?: string | null;
  approved_by?: number | null;
  approved_at?: string | null;
  created_at?: string;
  participants?: ExpenseParticipant[];
  receipts?: ExpenseReceipt[];
}

export interface UpdateExpenseStatusArgs {
  id: number | string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  rejectionReason?: string;
  approvedBy?: number;
}

export const expenseSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // -------------------------------------------------------
    // FETCH ALL COMPANY EXPENSES
    // -------------------------------------------------------
    getAllExpenses: builder.query<ExpenseRecord[], void>({
      query: () => '/finance', // Updated from /expenses
      transformResponse: (response: unknown) => {
        const data = (response as { data?: ExpenseRecord[] })?.data ?? response;
        return Array.isArray(data) ? data : [];
      },
      providesTags: ['Expense'],
    }),

    createExpense: builder.mutation<
      { success: boolean; message: string; data: ExpenseRecord },
      FormData
    >({
      query: (formData) => ({
        url: '/finance', // Updated from /expenses
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Expense'],
    }),

    getExpensesByUser: builder.query<ExpenseRecord[], number | string>({
      query: (userId) => `/finance/user/${userId}`, // Updated from /expenses
      transformResponse: (response: unknown) => {
        const data = (response as { data?: ExpenseRecord[] })?.data ?? response;
        return Array.isArray(data) ? data : [];
      },
      providesTags: ['Expense'],
    }),

    getExpenseDetails: builder.query<ExpenseRecord, number | string>({
      query: (id) => `/finance/${id}`, // Updated from /expenses
      transformResponse: (response: unknown) => {
        const data = (response as { data?: ExpenseRecord })?.data ?? response;
        return (data ?? {}) as ExpenseRecord;
      },
      providesTags: ['Expense'],
    }),

    updateExpenseStatus: builder.mutation<
      { success: boolean; message: string; data: Partial<ExpenseRecord> },
      UpdateExpenseStatusArgs
    >({
      query: ({ id, ...body }) => ({
        url: `/finance/${id}/status`, // Updated from /expenses
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Expense'],
    }),

    getExpensesByTrip: builder.query<ExpenseRecord[], number | string>({
      query: (tripId) => `/finance/trip/${tripId}`, // Updated from /expenses
      transformResponse: (response: unknown) => {
        const data = (response as { data?: ExpenseRecord[] })?.data ?? response;
        return Array.isArray(data) ? data : [];
      },
      providesTags: ['Expense'],
    }),
  }),
});

export const {
  useGetAllExpensesQuery,
  useCreateExpenseMutation,
  useGetExpensesByUserQuery,
  useGetExpenseDetailsQuery,
  useUpdateExpenseStatusMutation,
  useGetExpensesByTripQuery,
} = expenseSlice;
