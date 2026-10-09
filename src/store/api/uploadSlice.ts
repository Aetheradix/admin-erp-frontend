import { apiSlice } from './apiSlice';

export interface SalarySlipItem {
  id: number;
  user_id: number;
  salary_slip_url?: string;
  created_at?: string;
  updated_at?: string;
  month_year?: string;
  base_amount?: number | string;
  bonus_amount?: number | string;
  total_amount?: number | string;
  paid_days?: number;
  employee_name?: string;
  employee_email?: string;
  employee_position?: string;

  // Backwards compatibility fallbacks
  net_salary?: number;
  base_pay?: number;
  bonus?: number;
  position?: string;
}

/** Upload payload parameters */
export interface UploadSalarySlipArgs {
  file: Blob;
  userId?: number;
  employeeId?: number;
  employeeName?: string;
  monthYear?: string;
  netSalary?: number;
  paidDays?: number;
}

/** Response structure when uploading a salary slip */
export interface UploadSalarySlipResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    userId: number;
    salarySlipUrl: string;
    createdBy: number;
  };
}

/** Response structure when uploading an invoice */
export interface UploadInvoiceResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    invoiceUrl: string;
  };
}

/** Response wrapper for fetching salary slips */
export interface GetSalarySlipsResponse {
  success: boolean;
  data: SalarySlipItem[];
}


export interface UploadImageArgs {
  file: File | Blob;
  category?: 'blogs' | 'events' | 'gallery' | 'users' | 'general' | string;
  entityType?: string;
  entityId?: number;
}

export interface UploadImageResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    url: string;
    filename: string;
    originalName: string;
    category: string;
    sizeBytes: number;
    mimetype: string;
    createdAt: string;
  };
}

export interface UploadMultipleImagesArgs {
  files: (File | Blob)[];
  category?: 'blogs' | 'events' | 'gallery' | 'users' | 'general' | string;
}

export interface UploadMultipleImagesResponse {
  success: boolean;
  message: string;
  count: number;
  data: Array<{
    id: number;
    url: string;
    filename: string;
    originalName: string;
    category: string;
  }>;
}

export const uploadApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    /** Upload single image (Blogs, Events, Gallery, Profiles, General) */
    uploadImage: builder.mutation<UploadImageResponse, UploadImageArgs>({
      query: (args) => {
        const formData = new FormData();
        formData.append('image', args.file);
        if (args.category) formData.append('category', args.category);
        if (args.entityType) formData.append('entityType', args.entityType);
        if (args.entityId !== undefined) formData.append('entityId', String(args.entityId));

        return {
          url: '/uploads/image',
          method: 'POST',
          body: formData,
        };
      },
    }),

    /** Upload multiple images (Gallery albums / bulk upload) */
    uploadImages: builder.mutation<UploadMultipleImagesResponse, UploadMultipleImagesArgs>({
      query: (args) => {
        const formData = new FormData();
        args.files.forEach((file) => formData.append('images', file));
        if (args.category) formData.append('category', args.category);

        return {
          url: '/uploads/images',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Gallery'],
    }),

    /** Upload new salary slip PDF + metadata */
    uploadSalarySlip: builder.mutation<UploadSalarySlipResponse, UploadSalarySlipArgs>({
      query: (args) => {
        const formData = new FormData();
        formData.append('file', args.file, 'salary-slip.pdf');

        const resolvedUserId = args.userId ?? args.employeeId;
        if (resolvedUserId !== undefined) {
          formData.append('userId', String(resolvedUserId));
        }
        if (args.employeeName) {
          formData.append('employeeName', args.employeeName);
        }
        if (args.monthYear) {
          formData.append('monthYear', args.monthYear);
        }
        if (args.netSalary !== undefined) {
          formData.append('netSalary', String(args.netSalary));
        }
        if (args.paidDays !== undefined) {
          formData.append('paidDays', String(args.paidDays));
        }

        return {
          url: '/upload/salary-slip',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['SalarySlips'],
    }),

    /** Upload invoice document */
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

    /** 1. Fetch salary slips for a specific employee (User/My Payslips) */
    getSalarySlips: builder.query<GetSalarySlipsResponse, number | string>({
      query: (userId) => `/upload/salary-slips/${userId}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'SalarySlips' as const, id })),
              { type: 'SalarySlips', id: 'LIST' },
            ]
          : [{ type: 'SalarySlips', id: 'LIST' }],
    }),

    /** 2. Fetch ALL company salary slips (HR / Admin Payroll Page) */
    getAllSalarySlips: builder.query<GetSalarySlipsResponse, void>({
      query: () => '/finance/salary-slips/all',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'SalarySlips' as const, id })),
              { type: 'SalarySlips', id: 'ALL_LIST' },
            ]
          : [{ type: 'SalarySlips', id: 'ALL_LIST' }],
    }),
  }),
});

export const {
  useUploadImageMutation,
  useUploadImagesMutation,
  useUploadSalarySlipMutation,
  useUploadInvoiceMutation,
  useGetSalarySlipsQuery,
  useGetAllSalarySlipsQuery,
  useLazyGetSalarySlipsQuery,
  useLazyGetAllSalarySlipsQuery,
} = uploadApiSlice;
