# 🚀 ERP DASHBOARD - COMPLETE FEATURES GUIDE

## 📋 Table of Contents
1. [All Integrated Pages](#all-integrated-pages)
2. [Authentication System](#authentication-system)
3. [PDF Export](#pdf-export)
4. [Email Notifications](#email-notifications)
5. [API Endpoints](#api-endpoints)
6. [Usage Examples](#usage-examples)

---

## ✅ ALL INTEGRATED PAGES (100% COMPLETE!)

### 1. **Dashboard** - `/`
- Real-time statistics from API
- Product count, sales count, revenue
- Low stock alerts
- API connection status
- Quick access module grid

### 2. **Products** - `/products`
- Full CRUD operations
- Search by name, SKU, description
- Filter by category
- Pagination support
- Stock warnings
- Price formatting (Rp)

### 3. **Customers** - `/customer-new`
- Customer management
- Address management (billing, shipping, main)
- Payment terms
- Credit limit tracking
- Tax ID

### 4. **Vendors** - `/vendor-new`
- Vendor management
- Contact person details
- Rating system (0-5 stars)
- Payment terms
- Address management

### 5. **Bill of Materials (BOM)** - `/bom-new`
- Product assembly management
- Components array with quantities
- Unit of Measure (UoM) per component
- Auto-populate product details

### 6. **Request for Quotation (RFQ)** - `/rfq-new`
- Vendor selection
- Items array management
- Status tracking (draft, sent, received, cancelled)
- Request & required dates
- Estimated pricing

### 7. **Purchase Orders (PO)** - `/po-new`
- Vendor selection
- Items with unit prices
- **Auto-calculate**: Subtotal, Tax (11%), Total
- Status tracking (draft, confirmed, received, cancelled)
- Expected delivery dates

### 8. **Sales Orders (SO)** - `/sales-new`
- Customer selection
- Items with quantities & prices
- **Discount system**: Percentage or Fixed Amount
- **Tax calculation**: Configurable tax rate
- **Auto-calculate**: Subtotal, Discount, Tax, Grand Total
- Status tracking (draft, confirmed, processing, shipped, delivered, cancelled)
- Shipping address
- Delivery date tracking

### 9. **Quotations** - `/quotation-new`
- Customer selection
- Expiry date tracking
- Items with individual discounts
- Tax calculation
- **Auto-calculate totals**
- Terms & conditions
- Status tracking (draft, sent, accepted, rejected, expired)

### 10. **Manufacturing Orders (MO)** - `/manufacturing-new`
- Product & BOM selection
- Quantity planning
- Planned vs Actual dates tracking
- Work center assignment
- Priority levels (low, normal, high, urgent)
- Status tracking (draft, planned, ready, in-progress, completed, cancelled)

---

## 🔐 AUTHENTICATION SYSTEM

### Features
✅ JWT-based authentication
✅ User registration & login
✅ Role-based access control (admin, manager, user)
✅ Department assignment
✅ Permission system
✅ Secure password hashing (bcrypt)
✅ Token expiration (7 days)
✅ Protected routes
✅ User profile management

### User Roles
- **Admin**: Full access to all modules
- **Manager**: Access to assigned departments
- **User**: Limited access based on permissions

### Departments
- Admin
- Sales
- Purchasing
- Manufacturing
- Warehouse
- Finance

### API Endpoints

**Register:**
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "department": "sales"
}
```

**Login:**
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Current User:**
```bash
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

### Implementation

**1. Add AuthProvider to layout:**
```javascript
// src/app/layout.js
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

**2. Use in components:**
```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, hasPermission } = useAuth();
  
  if (!user) return <LoginPage />;
  
  if (hasPermission('products')) {
    // Show products
  }
}
```

**3. Protect routes:**
```javascript
// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');
  
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

---

## 📄 PDF EXPORT

### Features
✅ Professional PDF generation
✅ Company branding
✅ Automatic formatting
✅ Tables with styling
✅ Currency formatting (Rp)
✅ Date formatting
✅ Totals calculation

### Available Exports

#### 1. **Sales Order PDF**
```javascript
import { exportSalesOrderPDF } from '@/lib/pdfExport';

// In your component
<button onClick={() => exportSalesOrderPDF(salesOrder)}>
  Export PDF
</button>
```

**Features:**
- Company header with logo space
- Order details (SO Number, Date, Status)
- Customer information
- Items table with quantities & prices
- Subtotal, Discount, Tax, Total
- Footer with thank you message

#### 2. **Purchase Order PDF**
```javascript
import { exportPurchaseOrderPDF } from '@/lib/pdfExport';

<button onClick={() => exportPurchaseOrderPDF(purchaseOrder)}>
  Export PDF
</button>
```

**Features:**
- Company header
- PO details
- Vendor information
- Items table
- Subtotal, Tax (11%), Total
- Payment terms
- Delivery instructions

#### 3. **Quotation PDF**
```javascript
import { exportQuotationPDF } from '@/lib/pdfExport';

<button onClick={() => exportQuotationPDF(quotation)}>
  Export PDF
</button>
```

**Features:**
- Quotation header
- Valid until date
- Customer details
- Items with individual discounts
- Terms & conditions
- Totals with tax

#### 4. **Invoice PDF**
```javascript
import { exportInvoicePDF } from '@/lib/pdfExport';

<button onClick={() => exportInvoicePDF(salesOrder)}>
  Export Invoice
</button>
```

**Features:**
- Professional invoice layout
- Invoice number (INV-XXX)
- Due date (Net 30)
- Payment terms
- Bank account details
- Tax information (NPWP)
- Amount due highlighted in red

### Customization

Edit `src/lib/pdfExport.js` to customize:
- Company name & address
- Logo (add `doc.addImage()`)
- Colors & styling
- Footer text
- Currency formatting
- Additional fields

---

## 📧 EMAIL NOTIFICATIONS

### Features
✅ HTML email templates
✅ Professional design
✅ Responsive layout
✅ Multiple email types
✅ Nodemailer integration
✅ SMTP configuration

### Setup

**1. Configure environment variables:**
```env
# .env.local
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password as `EMAIL_PASSWORD`

### Available Email Templates

#### 1. **Sales Order Confirmation**
```javascript
import { salesOrderEmail, sendEmail } from '@/lib/emailTemplates';

const emailData = salesOrderEmail(salesOrder, customer);
await sendEmail(customer.email, emailData);
```

#### 2. **Purchase Order**
```javascript
import { purchaseOrderEmail, sendEmail } from '@/lib/emailTemplates';

const emailData = purchaseOrderEmail(purchaseOrder, vendor);
await sendEmail(vendor.email, emailData);
```

#### 3. **Quotation**
```javascript
import { quotationEmail, sendEmail } from '@/lib/emailTemplates';

const emailData = quotationEmail(quotation, customer);
await sendEmail(customer.email, emailData);
```

#### 4. **Invoice**
```javascript
import { invoiceEmail, sendEmail } from '@/lib/emailTemplates';

const emailData = invoiceEmail(salesOrder, customer);
await sendEmail(customer.email, emailData);
```

#### 5. **Welcome Email**
```javascript
import { welcomeEmail, sendEmail } from '@/lib/emailTemplates';

const emailData = welcomeEmail(user);
await sendEmail(user.email, emailData);
```

### Example Integration

**Send email after creating Sales Order:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Create sales order
  const result = await createSO(() => salesOrdersAPI.create(formData));
  
  if (result.success) {
    // Send confirmation email
    const emailData = salesOrderEmail(result.data, customer);
    await sendEmail(customer.email, emailData);
    
    showAlert('Sales Order created and email sent!');
  }
};
```

### Custom Email Template

```javascript
const customEmail = {
  subject: 'Your Custom Subject',
  html: `
    <h1>Hello!</h1>
    <p>This is a custom email.</p>
  `,
  text: 'Plain text version'
};

await sendEmail('recipient@example.com', customEmail);
```

---

## 🔌 ALL API ENDPOINTS

### Health Check
```bash
GET /api/health
```

### Products
```bash
GET    /api/products?page=1&limit=10&search=laptop&category=electronics
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id (soft delete)
GET    /api/products/stats
```

### Customers
```bash
GET    /api/customers?search=john
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
```

### Vendors
```bash
GET    /api/vendors?search=supplier
POST   /api/vendors
GET    /api/vendors/:id
PUT    /api/vendors/:id
DELETE /api/vendors/:id
```

### BOM
```bash
GET    /api/bom (with populate)
POST   /api/bom
GET    /api/bom/:id
PUT    /api/bom/:id
DELETE /api/bom/:id
```

### RFQ
```bash
GET    /api/rfq (with populate)
POST   /api/rfq (auto-number: RFQ00001)
GET    /api/rfq/:id
PUT    /api/rfq/:id
DELETE /api/rfq/:id
```

### Purchase Orders
```bash
GET    /api/purchase-orders (with populate)
POST   /api/purchase-orders (auto-number: PO00001, auto-calculate)
GET    /api/purchase-orders/:id
PUT    /api/purchase-orders/:id
DELETE /api/purchase-orders/:id
```

### Sales Orders
```bash
GET    /api/sales-orders?status=confirmed (with populate)
POST   /api/sales-orders (auto-number: SO00001, auto-calculate)
GET    /api/sales-orders/:id
PUT    /api/sales-orders/:id
DELETE /api/sales-orders/:id
GET    /api/sales-orders/stats
```

### Quotations
```bash
GET    /api/quotations (with populate)
POST   /api/quotations (auto-number: QT00001, auto-calculate)
GET    /api/quotations/:id
PUT    /api/quotations/:id
DELETE /api/quotations/:id
```

### Manufacturing Orders
```bash
GET    /api/manufacturing-orders (with populate)
POST   /api/manufacturing-orders (auto-number: MO00001)
GET    /api/manufacturing-orders/:id
PUT    /api/manufacturing-orders/:id
DELETE /api/manufacturing-orders/:id
```

### Authentication
```bash
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Email
```bash
POST   /api/email/send
{
  "to": "recipient@example.com",
  "subject": "Subject",
  "html": "<h1>HTML Content</h1>",
  "text": "Plain text"
}
```

---

## 💡 USAGE EXAMPLES

### Example 1: Create Sales Order with Email & PDF

```javascript
import { exportInvoicePDF } from '@/lib/pdfExport';
import { invoiceEmail, sendEmail } from '@/lib/emailTemplates';

const handleCreateSalesOrder = async () => {
  // 1. Create sales order
  const result = await salesOrdersAPI.create(formData);
  
  if (result.success) {
    const salesOrder = result.data;
    
    // 2. Generate PDF Invoice
    exportInvoicePDF(salesOrder);
    
    // 3. Send email to customer
    const emailData = invoiceEmail(salesOrder, customer);
    await sendEmail(customer.email, emailData);
    
    // 4. Show success message
    showAlert('Sales Order created! Invoice sent to customer.');
  }
};
```

### Example 2: Protected Admin Page

```javascript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, hasPermission, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading]);
  
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return null;
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}!</p>
    </div>
  );
}
```

### Example 3: Send Welcome Email After Registration

```javascript
// In registration handler
const handleRegister = async () => {
  const result = await register(name, email, password, role, department);
  
  if (result.success) {
    // Send welcome email
    const emailData = welcomeEmail({
      name,
      email,
      role,
      department
    });
    await sendEmail(email, emailData);
  }
};
```

### Example 4: Export Multiple Documents

```javascript
import { 
  exportSalesOrderPDF, 
  exportInvoicePDF, 
  exportQuotationPDF 
} from '@/lib/pdfExport';

const handleExportAll = (order) => {
  // Export as Sales Order
  exportSalesOrderPDF(order);
  
  // Export as Invoice
  exportInvoicePDF(order);
  
  showAlert('Documents exported successfully!');
};
```

---

## 🎨 CUSTOMIZATION TIPS

### 1. **Custom Email Templates**
Edit `src/lib/emailTemplates.js`:
- Change colors
- Add your logo
- Modify content
- Add custom fields

### 2. **PDF Branding**
Edit `src/lib/pdfExport.js`:
- Add company logo: `doc.addImage(imgData, 'PNG', x, y, width, height)`
- Change colors: `headStyles: { fillColor: [R, G, B] }`
- Modify layout
- Add watermark

### 3. **Authentication Rules**
Edit `src/contexts/AuthContext.js`:
- Add custom permissions
- Modify role hierarchy
- Add password validation
- Customize token expiry

---

## 🚀 PRODUCTION DEPLOYMENT

### 1. **Environment Variables**
```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key-min-32-chars
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email
EMAIL_PASSWORD=your-password
```

### 2. **Security Checklist**
✅ Use strong JWT_SECRET (32+ characters)
✅ Enable HTTPS
✅ Use environment variables (never commit secrets)
✅ Enable CORS only for your domain
✅ Use MongoDB Atlas with IP whitelist
✅ Enable password complexity requirements
✅ Implement rate limiting
✅ Add CAPTCHA for registration

### 3. **Deployment Platforms**
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **Heroku**
- **DigitalOcean**

---

## 📊 SYSTEM STATUS

✅ **Backend**: 100% Complete (30+ API routes)
✅ **Frontend**: 100% Complete (10 integrated pages)
✅ **Authentication**: 100% Complete (JWT + Role-based)
✅ **PDF Export**: 100% Complete (4 document types)
✅ **Email**: 100% Complete (5 templates)
✅ **Documentation**: 100% Complete

---

## 🎉 CONGRATULATIONS!

Your **Full-Stack ERP Dashboard** is complete with:
- ✅ 10 fully integrated pages
- ✅ 30+ REST API endpoints
- ✅ JWT Authentication
- ✅ PDF Export (SO, PO, Quotation, Invoice)
- ✅ Email Notifications
- ✅ Role-based Access Control
- ✅ Auto-numbering & Auto-calculations
- ✅ Beautiful UI with Tailwind CSS
- ✅ Production-ready code

**Made with ❤️ by AI Assistant**
