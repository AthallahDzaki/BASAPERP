import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Export Sales Order to PDF
export const exportSalesOrderPDF = (salesOrder) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('ERP DASHBOARD', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Jl. Contoh No. 123, Jakarta 12345', 105, 27, { align: 'center' });
  doc.text('Tel: (021) 123-4567 | Email: info@erpdashboard.com', 105, 32, { align: 'center' });
  
  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('SALES ORDER', 105, 45, { align: 'center' });
  
  // Order Details
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`SO Number: ${salesOrder.soNumber}`, 20, 60);
  doc.text(`Date: ${formatDate(salesOrder.orderDate)}`, 20, 67);
  doc.text(`Status: ${salesOrder.status.toUpperCase()}`, 20, 74);
  
  // Customer Info
  doc.setFont(undefined, 'bold');
  doc.text('CUSTOMER:', 20, 85);
  doc.setFont(undefined, 'normal');
  doc.text(salesOrder.customer?.name || 'N/A', 20, 92);
  doc.text(salesOrder.customer?.email || '', 20, 99);
  doc.text(salesOrder.customer?.phone || '', 20, 106);
  
  // Items Table
  const tableData = salesOrder.items.map((item, index) => [
    index + 1,
    item.product?.name || 'Unknown',
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.quantity * item.unitPrice)
  ]);
  
  doc.autoTable({
    startY: 120,
    head: [['No', 'Product', 'Qty', 'Unit Price', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  });
  
  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont(undefined, 'normal');
  doc.text('Subtotal:', 130, finalY);
  doc.text(formatCurrency(salesOrder.subtotal || 0), 190, finalY, { align: 'right' });
  
  doc.text(`Discount:`, 130, finalY + 7);
  doc.text(`- ${formatCurrency(salesOrder.discount || 0)}`, 190, finalY + 7, { align: 'right' });
  
  doc.text(`Tax:`, 130, finalY + 14);
  doc.text(formatCurrency(salesOrder.tax || 0), 190, finalY + 14, { align: 'right' });
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', 130, finalY + 24);
  doc.text(formatCurrency(salesOrder.total || 0), 190, finalY + 24, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  
  // Save PDF
  doc.save(`SO_${salesOrder.soNumber}_${new Date().getTime()}.pdf`);
};

// Export Purchase Order to PDF
export const exportPurchaseOrderPDF = (purchaseOrder) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('ERP DASHBOARD', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Jl. Contoh No. 123, Jakarta 12345', 105, 27, { align: 'center' });
  doc.text('Tel: (021) 123-4567 | Email: purchasing@erpdashboard.com', 105, 32, { align: 'center' });
  
  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('PURCHASE ORDER', 105, 45, { align: 'center' });
  
  // Order Details
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`PO Number: ${purchaseOrder.poNumber}`, 20, 60);
  doc.text(`Date: ${formatDate(purchaseOrder.orderDate)}`, 20, 67);
  doc.text(`Status: ${purchaseOrder.status.toUpperCase()}`, 20, 74);
  
  // Vendor Info
  doc.setFont(undefined, 'bold');
  doc.text('VENDOR:', 20, 85);
  doc.setFont(undefined, 'normal');
  doc.text(purchaseOrder.vendor?.name || 'N/A', 20, 92);
  doc.text(purchaseOrder.vendor?.email || '', 20, 99);
  doc.text(purchaseOrder.vendor?.phone || '', 20, 106);
  
  // Items Table
  const tableData = purchaseOrder.items.map((item, index) => [
    index + 1,
    item.product?.name || 'Unknown',
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.quantity * item.unitPrice)
  ]);
  
  doc.autoTable({
    startY: 120,
    head: [['No', 'Product', 'Qty', 'Unit Price', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 10 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  });
  
  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont(undefined, 'normal');
  doc.text('Subtotal:', 130, finalY);
  doc.text(formatCurrency(purchaseOrder.subtotal || 0), 190, finalY, { align: 'right' });
  
  doc.text(`Tax (11%):`, 130, finalY + 7);
  doc.text(formatCurrency(purchaseOrder.tax || 0), 190, finalY + 7, { align: 'right' });
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', 130, finalY + 17);
  doc.text(formatCurrency(purchaseOrder.total || 0), 190, finalY + 17, { align: 'right' });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text('Please deliver items as per agreed terms.', 105, 280, { align: 'center' });
  
  // Save PDF
  doc.save(`PO_${purchaseOrder.poNumber}_${new Date().getTime()}.pdf`);
};

// Export Quotation to PDF
export const exportQuotationPDF = (quotation) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('ERP DASHBOARD', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Jl. Contoh No. 123, Jakarta 12345', 105, 27, { align: 'center' });
  doc.text('Tel: (021) 123-4567 | Email: sales@erpdashboard.com', 105, 32, { align: 'center' });
  
  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('QUOTATION', 105, 45, { align: 'center' });
  
  // Quotation Details
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Quotation No: ${quotation.quotationNumber}`, 20, 60);
  doc.text(`Date: ${formatDate(quotation.quotationDate)}`, 20, 67);
  doc.text(`Valid Until: ${formatDate(quotation.expiryDate)}`, 20, 74);
  
  // Customer Info
  doc.setFont(undefined, 'bold');
  doc.text('TO:', 20, 85);
  doc.setFont(undefined, 'normal');
  doc.text(quotation.customer?.name || 'N/A', 20, 92);
  doc.text(quotation.customer?.email || '', 20, 99);
  
  // Items Table
  const tableData = quotation.items.map((item, index) => [
    index + 1,
    item.product?.name || 'Unknown',
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.discount || 0),
    formatCurrency((item.quantity * item.unitPrice) - (item.discount || 0))
  ]);
  
  doc.autoTable({
    startY: 110,
    head: [['No', 'Product', 'Qty', 'Unit Price', 'Discount', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 9 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  });
  
  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont(undefined, 'normal');
  doc.text('Subtotal:', 130, finalY);
  doc.text(formatCurrency(quotation.subtotal || 0), 190, finalY, { align: 'right' });
  
  doc.text(`Tax:`, 130, finalY + 7);
  doc.text(formatCurrency(quotation.tax || 0), 190, finalY + 7, { align: 'right' });
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', 130, finalY + 17);
  doc.text(formatCurrency(quotation.total || 0), 190, finalY + 17, { align: 'right' });
  
  // Terms
  if (quotation.terms) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Terms & Conditions:', 20, finalY + 30);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(quotation.terms, 170);
    doc.text(lines, 20, finalY + 37);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text('We look forward to doing business with you!', 105, 280, { align: 'center' });
  
  // Save PDF
  doc.save(`Quotation_${quotation.quotationNumber}_${new Date().getTime()}.pdf`);
};

// Export Invoice (same as Sales Order but with INVOICE title)
export const exportInvoicePDF = (salesOrder) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('ERP DASHBOARD', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Jl. Contoh No. 123, Jakarta 12345', 105, 27, { align: 'center' });
  doc.text('Tel: (021) 123-4567 | Email: finance@erpdashboard.com', 105, 32, { align: 'center' });
  doc.text('NPWP: 01.234.567.8-901.000', 105, 37, { align: 'center' });
  
  // Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(220, 38, 38); // Red color for invoice
  doc.text('INVOICE', 105, 50, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Invoice Number: INV-${salesOrder.soNumber}`, 20, 65);
  doc.text(`Invoice Date: ${formatDate(new Date())}`, 20, 72);
  doc.text(`Payment Terms: Net 30`, 20, 79);
  doc.text(`Due Date: ${formatDate(new Date(Date.now() + 30*24*60*60*1000))}`, 20, 86);
  
  // Customer Info
  doc.setFont(undefined, 'bold');
  doc.text('BILL TO:', 20, 100);
  doc.setFont(undefined, 'normal');
  doc.text(salesOrder.customer?.name || 'N/A', 20, 107);
  doc.text(salesOrder.customer?.email || '', 20, 114);
  doc.text(salesOrder.customer?.phone || '', 20, 121);
  if (salesOrder.customer?.address) {
    doc.text(salesOrder.customer.address, 20, 128);
  }
  
  // Items Table
  const tableData = salesOrder.items.map((item, index) => [
    index + 1,
    item.product?.name || 'Unknown',
    item.quantity,
    formatCurrency(item.unitPrice),
    formatCurrency(item.quantity * item.unitPrice)
  ]);
  
  doc.autoTable({
    startY: 140,
    head: [['No', 'Item Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [220, 38, 38] },
    styles: { fontSize: 10 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  });
  
  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont(undefined, 'normal');
  doc.text('Subtotal:', 130, finalY);
  doc.text(formatCurrency(salesOrder.subtotal || 0), 190, finalY, { align: 'right' });
  
  if (salesOrder.discount > 0) {
    doc.text(`Discount:`, 130, finalY + 7);
    doc.text(`- ${formatCurrency(salesOrder.discount || 0)}`, 190, finalY + 7, { align: 'right' });
  }
  
  doc.text(`PPN (11%):`, 130, finalY + 14);
  doc.text(formatCurrency(salesOrder.tax || 0), 190, finalY + 14, { align: 'right' });
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38);
  doc.text('AMOUNT DUE:', 130, finalY + 27);
  doc.text(formatCurrency(salesOrder.total || 0), 190, finalY + 27, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  // Payment Info
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('PAYMENT INFORMATION:', 20, finalY + 40);
  doc.setFont(undefined, 'normal');
  doc.text('Bank: BCA', 20, finalY + 47);
  doc.text('Account Number: 1234567890', 20, finalY + 54);
  doc.text('Account Name: ERP Dashboard Indonesia', 20, finalY + 61);
  
  // Footer
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text('Please make payment within 30 days. Thank you for your business!', 105, 280, { align: 'center' });
  
  // Save PDF
  doc.save(`Invoice_${salesOrder.soNumber}_${new Date().getTime()}.pdf`);
};
