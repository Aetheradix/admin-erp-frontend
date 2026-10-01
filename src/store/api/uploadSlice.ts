import { apiSlice } from './apiSlice';

interface UploadSalarySlipResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    userId: number;
    salarySlipUrl: string;
    createdBy: number;
  };
}

interface UploadInvoiceResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    invoiceUrl: string;
  };
}

export interface SalarySlipItem {
  id: number;
  user_id: number;
  salary_slip_url: string;
  created_by: number | null;
  created_at: string;
}

interface GetSalarySlipsResponse {
  success: boolean;
  data: SalarySlipItem[];
}

export const uploadApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadSalarySlip: builder.mutation<
  UploadSalarySlipResponse,
  {
    file: Blob;
    userId?: number;
    employeeId?: number;
    employeeName?: string;
    monthYear?: string;
    netSalary?: number;
    paidDays?: number;
  }
>({

      query: ({ file, userId }) => {
        const formData = new FormData();
        formData.append('file', file, 'salary-slip.pdf');
        if (userId) {
          formData.append('userId', String(userId));
        }

        return {
          url: '/upload/salary-slip',
          method: 'POST',
          body: formData,
        };
      },
    }),

    uploadInvoice: builder.mutation<UploadInvoiceResponse, { file: Blob }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('file', file, 'invoice.pdf');

        return {
          url: '/upload/invoice',
          method: 'POST',
          body: formData,
        };
      },
    }),

getSalarySlips: builder.query<GetSalarySlipsResponse, number | string>({
 query: (userId) => `/upload/salary-slips/${userId}`,
}),
  }),
});

export const { useUploadSalarySlipMutation, useUploadInvoiceMutation, useGetSalarySlipsQuery } =
  uploadApiSlice;
