import PDFDocument from 'pdfkit';

/**
 * Generate invoice PDF
 * @param {Object} payment - Payment document with populated fields
 * @returns {PDFDocument} - PDF document stream
 */
export const generateInvoicePDF = (payment) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Header
  doc
    .fontSize(20)
    .fillColor('#1F2937')
    .text('INVOICE', 50, 50, { align: 'left' })
    .fontSize(10)
    .fillColor('#6B7280')
    .text('Little Stars Nursery', 50, 75)
    .text('123 Main Street, City, State 12345', 50, 90)
    .text('Phone: (555) 123-4567', 50, 105)
    .text('Email: info@littlestars.com', 50, 120);

  // Invoice Number & Date (Right side)
  doc
    .fontSize(12)
    .fillColor('#1F2937')
    .text(`Invoice #: ${payment.invoiceNumber}`, 350, 50, { align: 'right' })
    .fontSize(10)
    .fillColor('#6B7280')
    .text(
      `Invoice Date: ${new Date(payment.createdAt).toLocaleDateString()}`,
      350,
      70,
      { align: 'right' }
    )
    .text(
      `Due Date: ${new Date(payment.dueDate).toLocaleDateString()}`,
      350,
      85,
      { align: 'right' }
    );

  // Status Badge
  const statusY = 100;
  const statusColor =
    payment.status === 'paid'
      ? '#10B981'
      : payment.status === 'overdue'
      ? '#DC2626'
      : '#F59E0B';
  
  doc
    .rect(350, statusY, 80, 20)
    .fillAndStroke(statusColor, statusColor)
    .fillColor('#FFFFFF')
    .fontSize(10)
    .text(payment.status.toUpperCase(), 355, statusY + 5, {
      width: 70,
      align: 'center',
    });

  // Bill To
  doc
    .fillColor('#1F2937')
    .fontSize(12)
    .text('BILL TO:', 50, 160)
    .fontSize(10)
    .fillColor('#374151')
    .text(
      `${payment.parent?.firstName || ''} ${payment.parent?.lastName || ''}`,
      50,
      180
    )
    .text(payment.parent?.email || '', 50, 195)
    .text(payment.parent?.phone || '', 50, 210);

  // Child Information
  doc
    .fillColor('#1F2937')
    .fontSize(12)
    .text('CHILD:', 350, 160, { align: 'right' })
    .fontSize(10)
    .fillColor('#374151')
    .text(
      `${payment.child?.firstName || ''} ${payment.child?.lastName || ''}`,
      350,
      180,
      { align: 'right' }
    )
    .text(`Age: ${payment.child?.age || 'N/A'}`, 350, 195, { align: 'right' });

  // Billing Period
  if (payment.billingPeriod) {
    doc
      .fontSize(9)
      .fillColor('#6B7280')
      .text(
        `Billing Period: ${new Date(
          payment.billingPeriod.startDate
        ).toLocaleDateString()} - ${new Date(
          payment.billingPeriod.endDate
        ).toLocaleDateString()}`,
        350,
        210,
        { align: 'right' }
      );
  }

  // Line separator
  doc
    .moveTo(50, 250)
    .lineTo(550, 250)
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .stroke();

  // Table Header
  const tableTop = 270;
  doc
    .fontSize(10)
    .fillColor('#1F2937')
    .text('DESCRIPTION', 50, tableTop, { width: 250 })
    .text('QTY', 320, tableTop, { width: 50, align: 'center' })
    .text('UNIT PRICE', 380, tableTop, { width: 80, align: 'right' })
    .text('AMOUNT', 470, tableTop, { width: 80, align: 'right' });

  // Table line
  doc
    .moveTo(50, tableTop + 20)
    .lineTo(550, tableTop + 20)
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .stroke();

  // Items
  let itemY = tableTop + 35;
  const items = payment.items || [];

  items.forEach((item) => {
    doc
      .fontSize(10)
      .fillColor('#374151')
      .text(item.description, 50, itemY, { width: 250 })
      .text(item.quantity || 1, 320, itemY, { width: 50, align: 'center' })
      .text(`$${(item.unitPrice || 0).toFixed(2)}`, 380, itemY, {
        width: 80,
        align: 'right',
      })
      .text(`$${(item.total || item.amount || 0).toFixed(2)}`, 470, itemY, {
        width: 80,
        align: 'right',
      });
    itemY += 25;
  });

  // Totals section
  const totalsY = itemY + 30;
  
  doc
    .moveTo(350, totalsY - 10)
    .lineTo(550, totalsY - 10)
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .stroke();

  doc
    .fontSize(10)
    .fillColor('#6B7280')
    .text('Subtotal:', 380, totalsY, { width: 90, align: 'right' })
    .fillColor('#374151')
    .text(`$${(payment.amount || 0).toFixed(2)}`, 470, totalsY, {
      width: 80,
      align: 'right',
    });

  if (payment.discount > 0) {
    doc
      .fillColor('#6B7280')
      .text('Discount:', 380, totalsY + 20, { width: 90, align: 'right' })
      .fillColor('#EF4444')
      .text(`-$${payment.discount.toFixed(2)}`, 470, totalsY + 20, {
        width: 80,
        align: 'right',
      });
  }

  if (payment.tax > 0) {
    doc
      .fillColor('#6B7280')
      .text('Tax:', 380, totalsY + 40, { width: 90, align: 'right' })
      .fillColor('#374151')
      .text(`$${payment.tax.toFixed(2)}`, 470, totalsY + 40, {
        width: 80,
        align: 'right',
      });
  }

  const finalY = totalsY + (payment.discount > 0 ? 60 : 40) + (payment.tax > 0 ? 20 : 0);
  
  doc
    .moveTo(350, finalY - 5)
    .lineTo(550, finalY - 5)
    .strokeColor('#1F2937')
    .lineWidth(2)
    .stroke();

  const finalAmount = payment.finalAmount || payment.amount - (payment.discount || 0) + (payment.tax || 0);
  
  doc
    .fontSize(12)
    .fillColor('#1F2937')
    .text('TOTAL:', 380, finalY + 5, { width: 90, align: 'right' })
    .fontSize(14)
    .text(`$${finalAmount.toFixed(2)}`, 470, finalY + 5, {
      width: 80,
      align: 'right',
    });

  // Payment Information (if paid)
  if (payment.status === 'paid' && payment.paidDate) {
    doc
      .fontSize(10)
      .fillColor('#10B981')
      .text('PAID', 380, finalY + 35, { width: 170, align: 'right' })
      .fontSize(9)
      .fillColor('#6B7280')
      .text(
        `Paid on: ${new Date(payment.paidDate).toLocaleDateString()}`,
        380,
        finalY + 50,
        { width: 170, align: 'right' }
      );
    
    if (payment.paymentMethod) {
      doc.text(
        `Method: ${payment.paymentMethod.toUpperCase().replace('_', ' ')}`,
        380,
        finalY + 65,
        { width: 170, align: 'right' }
      );
    }
    
    if (payment.transactionId) {
      doc.text(
        `Transaction ID: ${payment.transactionId}`,
        380,
        finalY + 80,
        { width: 170, align: 'right' }
      );
    }
  }

  // Notes
  if (payment.notes) {
    const notesY = finalY + 100;
    doc
      .fontSize(10)
      .fillColor('#1F2937')
      .text('NOTES:', 50, notesY)
      .fontSize(9)
      .fillColor('#6B7280')
      .text(payment.notes, 50, notesY + 15, { width: 500 });
  }

  // Footer
  const footerY = 750;
  doc
    .moveTo(50, footerY)
    .lineTo(550, footerY)
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .stroke();

  doc
    .fontSize(8)
    .fillColor('#9CA3AF')
    .text(
      'Thank you for choosing Little Stars Nursery!',
      50,
      footerY + 10,
      { align: 'center', width: 500 }
    )
    .text(
      'For any questions regarding this invoice, please contact us at info@littlestars.com',
      50,
      footerY + 25,
      { align: 'center', width: 500 }
    );

  return doc;
};
