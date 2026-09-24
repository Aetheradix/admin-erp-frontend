import { apiSlice } from './apiSlice';

interface UploadFileResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    salarySlipUrl: string;
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

export const uploadApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadFileResponse, { file: Blob }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append('file', file, 'salary-slip.pdf');

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
  }),
});

export const { useUploadFileMutation, useUploadInvoiceMutation } = uploadApiSlice;
