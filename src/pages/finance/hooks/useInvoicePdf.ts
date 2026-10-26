import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InvoiceForm } from '../types/invoice.types';

/**
 * Direct jsPDF generator:
 * High-performance vector PDF rendering using jsPDF & autoTable.
 * Serves as an instant, infallible fallback if DOM canvas snapshot fails.
 */
export function generateDirectInvoicePdf(invoice: InvoiceForm): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;

  // Header background
  doc.setFillColor(17, 24, 39); // #111827 (dark slate)
  doc.rect(0, 0, pageW, 36, 'F');

  // Brand Name
  doc.setTextColor(186, 230, 253); // #BAE6FD
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AETHERADIX', margin, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(209, 213, 219);
  doc.text('Enterprise Cloud & ERP Solutions', margin, 26);

  // TAX INVOICE title right-aligned
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', pageW - margin, 16, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253);
  doc.text(`INVOICE: ${invoice.invoiceNumber || 'INV-000'}`, pageW - margin, 24, {
    align: 'right',
  });

  // Reset text color to dark
  doc.setTextColor(31, 41, 55);

  // Two columns: Issuer Details (Left) and Bill To (Right)
  const y = 48;

  // Left: Issuer Company
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ISSUER DETAILS:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(invoice.companyName || 'Aetheradix Private Limited', margin, y + 6);
  if (invoice.companyContact) doc.text(`Contact: ${invoice.companyContact}`, margin, y + 11);
  if (invoice.companyAddress) doc.text(invoice.companyAddress, margin, y + 16);
  const compLoc = [invoice.companyCity, invoice.companyState, invoice.companyPincode]
    .filter(Boolean)
    .join(', ');
  if (compLoc) doc.text(compLoc, margin, y + 21);
  if (invoice.companyGSTIN) doc.text(`GSTIN: ${invoice.companyGSTIN}`, margin, y + 26);

  // Right: Bill To
  const rightX = pageW / 2 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILL TO:', rightX, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(invoice.billToName || 'Client Name', rightX, y + 6);
  if (invoice.billToAddress) doc.text(invoice.billToAddress, rightX, y + 11);
  const billLoc = [invoice.billToCity, invoice.billToState, invoice.billToPincode]
    .filter(Boolean)
    .join(', ');
  if (billLoc) doc.text(billLoc, rightX, y + 16);
  if (invoice.billToCountry) doc.text(invoice.billToCountry, rightX, y + 21);
  if (invoice.billToGSTIN) doc.text(`GSTIN: ${invoice.billToGSTIN}`, rightX, y + 26);

  // Dates & Supply bar
  const barY = 82;
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(margin, barY, pageW - margin * 2, 14, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', margin + 4, barY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceDate || '-', margin + 25, barY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Due Date:', margin + 65, barY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.dueDate || '-', margin + 82, barY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Place of Supply:', margin + 125, barY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.placeOfSupply || 'Madhya Pradesh', margin + 152, barY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', margin + 4, barY + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.status || 'Pending', margin + 25, barY + 11);

  // Line items table
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const tableRows = items.map((it, idx) => [
    String(idx + 1),
    it.description || 'Professional Services',
    String(it.quantity || 1),
    `₹${Number(it.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `₹${(Number(it.quantity || 1) * Number(it.rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: 102,
    margin: { left: margin, right: margin },
    head: [['#', 'Description', 'Qty', 'Rate', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [17, 24, 39],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;

  // Totals Breakdown
  const subTotal = items.reduce(
    (sum, it) => sum + Number(it.quantity || 0) * Number(it.rate || 0),
    0
  );
  const gstAmount = (subTotal * Number(invoice.gstRate || 0)) / 100;
  const grandTotal = subTotal + gstAmount;

  const summaryX = pageW - margin - 75;
  let totY = finalY + 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', summaryX, totY);
  doc.text(
    `₹${subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    pageW - margin,
    totY,
    { align: 'right' }
  );

  totY += 6;
  doc.text(`GST (${invoice.gstRate || 0}%):`, summaryX, totY);
  doc.text(
    `₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    pageW - margin,
    totY,
    { align: 'right' }
  );

  totY += 7;
  doc.setDrawColor(209, 213, 219);
  doc.line(summaryX, totY - 4, pageW - margin, totY - 4);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', summaryX, totY);
  doc.text(
    `₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    pageW - margin,
    totY,
    { align: 'right' }
  );

  // Notes
  if (invoice.notes) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes / Payment Terms:', margin, totY + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.notes, margin, totY + 19, { maxWidth: pageW - margin * 2 });
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    'Thank you for your business! This is a system-generated computer invoice.',
    pageW / 2,
    pageH - 10,
    { align: 'center' }
  );

  return doc;
}

export function useInvoicePdf() {
  const invoicePdfRef = useRef<HTMLDivElement>(null);
  const [pdfInvoice, setPdfInvoice] = useState<InvoiceForm | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  /**
   * Internal generator: attempts DOM snapshot first, falls back to direct jsPDF
   */
  const createInvoicePdfDocument = async (invoiceData: InvoiceForm): Promise<jsPDF> => {
    setIsGeneratingPdf(true);
    setPdfInvoice(invoiceData);

    // 1. Force layout flush & wait for web fonts
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
      scale: 2, // Keeps image resolution crisp
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

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    let imageWidth = pdfWidth;
    let imageHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imageHeight > pdfHeight) {
      const ratio = pdfHeight / imageHeight;
      imageWidth = imageWidth * ratio;
      imageHeight = pdfHeight;
    }

    const xOffset = (pdfWidth - imageWidth) / 2;
    const imageData = canvas.toDataURL('image/png', 1.0);

    pdf.addImage(imageData, 'PNG', xOffset, 0, imageWidth, imageHeight);
    return pdf;
  };

  /**
   * Generates a Blob (for uploading to remote server or attachments)
   */
  const generateInvoicePDF = async (invoiceData: InvoiceForm): Promise<Blob> => {
    try {
      const pdf = await createInvoicePdfDocument(invoiceData);
      return pdf.output('blob');
    } catch (html2canvasErr) {
      console.warn(
        'html2canvas snapshot failed, using direct jsPDF generator fallback:',
        html2canvasErr
      );
      const directPdf = generateDirectInvoicePdf(invoiceData);
      return directPdf.output('blob');
    } finally {
      setIsGeneratingPdf(false);
      setPdfInvoice(null);
    }
  };

  /**
   * Direct download triggering jsPDF's built-in file saver:
   * Guarantees file is downloaded immediately with zero popup/blob revoke issues.
   */
  const downloadInvoicePDF = async (invoiceData: InvoiceForm, fileName: string): Promise<void> => {
    try {
      const pdf = await createInvoicePdfDocument(invoiceData);
      pdf.save(fileName);
    } catch (html2canvasErr) {
      console.warn(
        'html2canvas snapshot failed, using direct jsPDF download fallback:',
        html2canvasErr
      );
      const directPdf = generateDirectInvoicePdf(invoiceData);
      directPdf.save(fileName);
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
