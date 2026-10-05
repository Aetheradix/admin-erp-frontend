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

      // Wait for DOM to finish rendering
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 100)));

      const element = invoicePdfRef.current;
      if (!element) {
        throw new Error('Salary slip template element not found.');
      }

      // Render canvas with CORS enabled for external images/fonts
      const canvas = await html2canvas(element, {
        scale: 2, // Keeps image resolution crisp
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // Proportional dimensions based on PDF page width
      let imageWidth = pdfWidth;
      let imageHeight = (canvas.height * pdfWidth) / canvas.width;

      // Scale down if height exceeds single A4 page height
      if (imageHeight > pdfHeight) {
        const ratio = pdfHeight / imageHeight;
        imageWidth = imageWidth * ratio;
        imageHeight = pdfHeight;
      }

      // Center horizontally if scaled down width wise
      const xOffset = (pdfWidth - imageWidth) / 2;

      const imageData = canvas.toDataURL('image/png', 1.0);

      // Add image exactly once to page 1
      pdf.addImage(imageData, 'PNG', xOffset, 0, imageWidth, imageHeight);

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
