import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InvoiceForm } from '../types';

interface AutoTableDocument extends jsPDF {
  lastAutoTable?: { finalY?: number };
}

/**
 * Direct jsPDF generator:
 * High-performance vector PDF rendering using jsPDF & autoTable.
 * Serves as an instant, infallible fallback if DOM canvas snapshot fails.
 */
export function generateDirectInvoicePdf(invoice: InvoiceForm): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageW, 36, 'F');

  doc.setTextColor(186, 230, 253);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AETHERADIX', margin, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(209, 213, 219);
  doc.text('Enterprise Cloud & ERP Solutions', margin, 26);

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

  doc.setTextColor(31, 41, 55);

  const y = 48;

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

  const finalY = (doc as AutoTableDocument).lastAutoTable?.finalY || 150;

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

  if (invoice.notes) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes / Payment Terms:', margin, totY + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.notes, margin, totY + 19, { maxWidth: pageW - margin * 2 });
  }

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
