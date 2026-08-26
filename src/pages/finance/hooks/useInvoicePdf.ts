import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InvoiceForm } from '../types/invoice.types';

export function useInvoicePdf() {
    const invoicePdfRef = useRef<HTMLDivElement>(null);
    const [pdfInvoice, setPdfInvoice] = useState<InvoiceForm | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const generateInvoicePDF = async (invoiceData: InvoiceForm) => {
        try {
            setIsGeneratingPdf(true);
            setPdfInvoice(invoiceData);

            // Give React time to render the template
            await new Promise((resolve) => setTimeout(resolve, 300));

            if (!invoicePdfRef.current) {
                console.error('Invoice template element not found.');
                return;
            }

            const element = invoicePdfRef.current;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imageData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
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
                position = heightLeft - imageHeight;
                pdf.addPage();
                pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${invoiceData.invoiceNumber}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
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
