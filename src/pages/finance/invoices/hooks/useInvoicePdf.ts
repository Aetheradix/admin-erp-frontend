import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InvoiceForm } from '../types';
import { generateDirectInvoicePdf } from '../pdf/directInvoicePdf';

export function useInvoicePdf() {
  const invoicePdfRef = useRef<HTMLDivElement>(null);
  const [pdfInvoice, setPdfInvoice] = useState<InvoiceForm | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  /** Attempts DOM snapshot first, falls back to direct jsPDF */
  const createInvoicePdfDocument = async (invoiceData: InvoiceForm): Promise<jsPDF> => {
    setIsGeneratingPdf(true);
    setPdfInvoice(invoiceData);

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    if (document.fonts) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));

    let element = invoicePdfRef.current;
    for (let attempt = 0; attempt < 12 && !element; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      element = invoicePdfRef.current;
    }

    if (!element) {
      throw new Error('Invoice template DOM element not ready');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const hiddenContainer = clonedDoc.getElementById('invoice-pdf-hidden-container');
        if (hiddenContainer) {
          hiddenContainer.style.opacity = '1';
          hiddenContainer.style.position = 'static';
          hiddenContainer.style.visibility = 'visible';
          hiddenContainer.style.zIndex = '1';
        }
        const target = clonedDoc.querySelector('[data-invoice-template="true"]') as HTMLElement;
        if (target) {
          target.style.position = 'static';
          target.style.display = 'block';
          target.style.margin = '0 auto';
          target.style.opacity = '1';
          target.style.visibility = 'visible';
        }
      },
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendering produced zero-dimension output');
    }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    let imageWidth = pdfWidth;
    let imageHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imageHeight > pdfHeight) {
      const ratio = pdfHeight / imageHeight;
      imageWidth *= ratio;
      imageHeight = pdfHeight;
    }

    const xOffset = (pdfWidth - imageWidth) / 2;
    const imageData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imageData, 'PNG', xOffset, 0, imageWidth, imageHeight);
    return pdf;
  };

  const generateInvoicePDF = async (invoiceData: InvoiceForm): Promise<Blob> => {
    try {
      const pdf = await createInvoicePdfDocument(invoiceData);
      return pdf.output('blob');
    } catch (html2canvasErr) {
      console.warn(
        'html2canvas snapshot failed, using direct jsPDF generator fallback:',
        html2canvasErr
      );
      return generateDirectInvoicePdf(invoiceData).output('blob');
    } finally {
      setIsGeneratingPdf(false);
      setPdfInvoice(null);
    }
  };

  const downloadInvoicePDF = async (invoiceData: InvoiceForm, fileName: string): Promise<void> => {
    try {
      const pdf = await createInvoicePdfDocument(invoiceData);
      pdf.save(fileName);
    } catch (html2canvasErr) {
      console.warn(
        'html2canvas snapshot failed, using direct jsPDF download fallback:',
        html2canvasErr
      );
      generateDirectInvoicePdf(invoiceData).save(fileName);
    } finally {
      setIsGeneratingPdf(false);
      setPdfInvoice(null);
    }
  };

  return {
    invoicePdfRef,
    pdfInvoice,
    isGeneratingPdf,
    generateInvoicePDF,
    downloadInvoicePDF,
  };
}
