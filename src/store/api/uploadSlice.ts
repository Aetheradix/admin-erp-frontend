import { API_URL } from '@/config/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    uploadFile: builder.mutation<
      UploadFileResponse,
      {
        file: Blob;
      }
    >({
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

    uploadInvoice: builder.mutation<
      UploadInvoiceResponse,
      {
        file: Blob;
      }
    >({
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

export const { useUploadFileMutation, useUploadInvoiceMutation } = uploadApi;
