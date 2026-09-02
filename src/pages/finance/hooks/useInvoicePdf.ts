import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InvoiceForm } from '../types/invoice.types';

export function useInvoicePdf() {
  const invoicePdfRef = useRef<HTMLDivElement>(null);
  const [pdfInvoice, setPdfInvoice] = useState<InvoiceForm | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generateInvoicePDF = async (invoiceData: InvoiceForm): Promise<Blob> => {
    try {
      setIsGeneratingPdf(true);
      setPdfInvoice(invoiceData);

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!invoicePdfRef.current) {
        throw new Error('Invoice template element not found.');
      }

      const canvas = await html2canvas(invoicePdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
      });

      const imageData = canvas.toDataURL('image/png', 1);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;

        pdf.addPage();

        pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);

        heightLeft -= pageHeight;
      }

      return pdf.output('blob');
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return {
    invoicePdfRef,
    pdfInvoice,
    isGeneratingPdf,
    generateInvoicePDF,
  };
}
