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

// Base email template
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .footer { background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .table th { background: #f3f4f6; font-weight: bold; }
    .total { font-size: 18px; font-weight: bold; color: #667eea; text-align: right; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ERP Dashboard</h1>
      <p>Enterprise Resource Planning System</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ERP Dashboard. All rights reserved.</p>
      <p>Jl. Contoh No. 123, Jakarta 12345</p>
      <p>Tel: (021) 123-4567 | Email: info@erpdashboard.com</p>
    </div>
  </div>
</body>
</html>
`;

// Sales Order Email
export const salesOrderEmail = (salesOrder, customer) => {
  const itemsHtml = salesOrder.items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.product?.name || 'Unknown'}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="text-align: right;">${formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  `).join('');
  
  const content = `
    <h2>Sales Order Confirmation</h2>
    <p>Dear ${customer?.name || 'Customer'},</p>
    <p>Thank you for your order! Your sales order has been received and is being processed.</p>
    
    <h3>Order Details:</h3>
    <p><strong>Order Number:</strong> ${salesOrder.soNumber}</p>
    <p><strong>Order Date:</strong> ${formatDate(salesOrder.orderDate)}</p>
    <p><strong>Status:</strong> ${salesOrder.status.toUpperCase()}</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>No</th>
          <th>Product</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <p style="text-align: right;"><strong>Subtotal:</strong> ${formatCurrency(salesOrder.subtotal || 0)}</p>
    <p style="text-align: right;"><strong>Discount:</strong> -${formatCurrency(salesOrder.discount || 0)}</p>
    <p style="text-align: right;"><strong>Tax:</strong> ${formatCurrency(salesOrder.tax || 0)}</p>
    <p class="total">TOTAL: ${formatCurrency(salesOrder.total || 0)}</p>
    
    <p>We will notify you once your order is ready for delivery.</p>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    
    <p>Best regards,<br><strong>ERP Dashboard Team</strong></p>
  `;
  
  return {
    subject: `Sales Order Confirmation - ${salesOrder.soNumber}`,
    html: baseTemplate(content),
    text: `Sales Order ${salesOrder.soNumber} has been created. Total: ${formatCurrency(salesOrder.total || 0)}`
  };
};

// Purchase Order Email
export const purchaseOrderEmail = (purchaseOrder, vendor) => {
  const itemsHtml = purchaseOrder.items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.product?.name || 'Unknown'}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="text-align: right;">${formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  `).join('');
  
  const content = `
    <h2>Purchase Order</h2>
    <p>Dear ${vendor?.name || 'Vendor'},</p>
    <p>We would like to place the following purchase order with your company.</p>
    
    <h3>Order Details:</h3>
    <p><strong>PO Number:</strong> ${purchaseOrder.poNumber}</p>
    <p><strong>Order Date:</strong> ${formatDate(purchaseOrder.orderDate)}</p>
    <p><strong>Expected Delivery:</strong> ${purchaseOrder.expectedDelivery ? formatDate(purchaseOrder.expectedDelivery) : 'TBD'}</p>
    <p><strong>Status:</strong> ${purchaseOrder.status.toUpperCase()}</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>No</th>
          <th>Product</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <p style="text-align: right;"><strong>Subtotal:</strong> ${formatCurrency(purchaseOrder.subtotal || 0)}</p>
    <p style="text-align: right;"><strong>Tax (11%):</strong> ${formatCurrency(purchaseOrder.tax || 0)}</p>
    <p class="total">TOTAL: ${formatCurrency(purchaseOrder.total || 0)}</p>
    
    <p>Please confirm receipt of this purchase order and provide us with the expected delivery date.</p>
    <p>Payment terms: ${vendor?.paymentTerms || 'As agreed'}</p>
    
    <p>Best regards,<br><strong>Purchasing Department<br>ERP Dashboard</strong></p>
  `;
  
  return {
    subject: `Purchase Order - ${purchaseOrder.poNumber}`,
    html: baseTemplate(content),
    text: `Purchase Order ${purchaseOrder.poNumber} has been issued. Total: ${formatCurrency(purchaseOrder.total || 0)}`
  };
};

// Quotation Email
export const quotationEmail = (quotation, customer) => {
  const itemsHtml = quotation.items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.product?.name || 'Unknown'}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="text-align: right;">${formatCurrency(item.discount || 0)}</td>
      <td style="text-align: right;">${formatCurrency((item.quantity * item.unitPrice) - (item.discount || 0))}</td>
    </tr>
  `).join('');
  
  const content = `
    <h2>Quotation</h2>
    <p>Dear ${customer?.name || 'Customer'},</p>
    <p>Thank you for your interest in our products. Please find our quotation below:</p>
    
    <h3>Quotation Details:</h3>
    <p><strong>Quotation Number:</strong> ${quotation.quotationNumber}</p>
    <p><strong>Date:</strong> ${formatDate(quotation.quotationDate)}</p>
    <p><strong>Valid Until:</strong> ${formatDate(quotation.expiryDate)}</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>No</th>
          <th>Product</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Discount</th>
          <th style="text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <p style="text-align: right;"><strong>Subtotal:</strong> ${formatCurrency(quotation.subtotal || 0)}</p>
    <p style="text-align: right;"><strong>Tax:</strong> ${formatCurrency(quotation.tax || 0)}</p>
    <p class="total">TOTAL: ${formatCurrency(quotation.total || 0)}</p>
    
    ${quotation.terms ? `
      <h3>Terms & Conditions:</h3>
      <p>${quotation.terms}</p>
    ` : ''}
    
    <p>This quotation is valid until ${formatDate(quotation.expiryDate)}.</p>
    <p>Should you have any questions or require further information, please feel free to contact us.</p>
    
    <a href="#" class="button">Accept Quotation</a>
    
    <p>Best regards,<br><strong>Sales Team<br>ERP Dashboard</strong></p>
  `;
  
  return {
    subject: `Quotation - ${quotation.quotationNumber}`,
    html: baseTemplate(content),
    text: `Quotation ${quotation.quotationNumber} is ready. Total: ${formatCurrency(quotation.total || 0)}`
  };
};

// Invoice Email
export const invoiceEmail = (salesOrder, customer) => {
  const itemsHtml = salesOrder.items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.product?.name || 'Unknown'}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="text-align: right;">${formatCurrency(item.quantity * item.unitPrice)}</td>
    </tr>
  `).join('');
  
  const dueDate = new Date(Date.now() + 30*24*60*60*1000); // 30 days from now
  
  const content = `
    <h2 style="color: #dc2626;">INVOICE</h2>
    <p>Dear ${customer?.name || 'Customer'},</p>
    <p>Please find your invoice details below. Payment is due within 30 days.</p>
    
    <h3>Invoice Details:</h3>
    <p><strong>Invoice Number:</strong> INV-${salesOrder.soNumber}</p>
    <p><strong>Invoice Date:</strong> ${formatDate(new Date())}</p>
    <p><strong>Due Date:</strong> ${formatDate(dueDate)}</p>
    <p><strong>Payment Terms:</strong> Net 30</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>No</th>
          <th>Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <p style="text-align: right;"><strong>Subtotal:</strong> ${formatCurrency(salesOrder.subtotal || 0)}</p>
    ${salesOrder.discount > 0 ? `<p style="text-align: right;"><strong>Discount:</strong> -${formatCurrency(salesOrder.discount)}</p>` : ''}
    <p style="text-align: right;"><strong>PPN (11%):</strong> ${formatCurrency(salesOrder.tax || 0)}</p>
    <p class="total" style="color: #dc2626;">AMOUNT DUE: ${formatCurrency(salesOrder.total || 0)}</p>
    
    <h3>Payment Information:</h3>
    <p><strong>Bank:</strong> BCA<br>
    <strong>Account Number:</strong> 1234567890<br>
    <strong>Account Name:</strong> ERP Dashboard Indonesia</p>
    
    <p>Please make payment by <strong>${formatDate(dueDate)}</strong>.</p>
    <p>If you have any questions regarding this invoice, please contact us.</p>
    
    <a href="#" class="button" style="background: #dc2626;">Pay Now</a>
    
    <p>Thank you for your business!</p>
    <p>Best regards,<br><strong>Finance Department<br>ERP Dashboard</strong></p>
  `;
  
  return {
    subject: `Invoice INV-${salesOrder.soNumber} - Payment Due`,
    html: baseTemplate(content),
    text: `Invoice INV-${salesOrder.soNumber} is ready. Amount Due: ${formatCurrency(salesOrder.total || 0)}. Due Date: ${formatDate(dueDate)}`
  };
};

// Welcome Email
export const welcomeEmail = (user) => {
  const content = `
    <h2>Welcome to ERP Dashboard!</h2>
    <p>Dear ${user.name},</p>
    <p>Your account has been successfully created. Welcome to the team!</p>
    
    <h3>Your Account Details:</h3>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Role:</strong> ${user.role.toUpperCase()}</p>
    <p><strong>Department:</strong> ${user.department.toUpperCase()}</p>
    
    <p>You can now log in to the system using your credentials.</p>
    
    <a href="http://localhost:3000/login" class="button">Login to Dashboard</a>
    
    <h3>Quick Start Guide:</h3>
    <ul>
      <li>Navigate through the dashboard to explore features</li>
      <li>Manage products, customers, and vendors</li>
      <li>Create and track orders</li>
      <li>Generate reports and analytics</li>
    </ul>
    
    <p>If you need any assistance, our support team is here to help!</p>
    
    <p>Best regards,<br><strong>ERP Dashboard Team</strong></p>
  `;
  
  return {
    subject: 'Welcome to ERP Dashboard!',
    html: baseTemplate(content),
    text: `Welcome ${user.name}! Your ERP Dashboard account is ready.`
  };
};

// Helper function to send email
export const sendEmail = async (to, emailData) => {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Send email error:', error);
    return { success: false, error: error.message };
  }
};
