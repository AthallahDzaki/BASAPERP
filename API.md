# 📡 API Documentation

Base URL: `http://localhost:3000/api`

All responses follow this format:
```json
{
  "success": true/false,
  "data": {...},
  "message": "error message (if failed)"
}
```

---

## 🏥 Health Check

### Check API Status
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-11-30T...",
  "database": "Connected"
}
```

---

## 📦 Products

### Get All Products
```http
GET /api/products?page=1&limit=10&search=laptop&category=finished_good
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in name, sku, description
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Get Product by ID
```http
GET /api/products/:id
```

### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "Laptop Dell XPS",
  "sku": "DELL-XPS-001",
  "description": "High-performance laptop",
  "category": "finished_good",
  "type": "storable",
  "uom": "Unit",
  "cost": 12000000,
  "price": 15000000,
  "stockQty": 10,
  "minStockQty": 5
}
```

### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "price": 16000000,
  "stockQty": 15
}
```

### Delete Product (Soft Delete)
```http
DELETE /api/products/:id
```

### Get Product Statistics
```http
GET /api/products/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProducts": 100,
      "totalValue": 500000000,
      "avgPrice": 5000000,
      "lowStock": 5
    },
    "byCategory": [
      { "_id": "finished_good", "count": 50 },
      { "_id": "raw_material", "count": 30 }
    ]
  }
}
```

---

## 👥 Customers

### Get All Customers
```http
GET /api/customers?search=john
```

### Get Customer by ID
```http
GET /api/customers/:id
```

### Create Customer
```http
POST /api/customers
Content-Type: application/json

{
  "name": "PT. Customer Sejahtera",
  "email": "customer@example.com",
  "phone": "+62812345678",
  "address": {
    "street": "Jl. Sudirman No. 123",
    "city": "Jakarta",
    "state": "DKI Jakarta",
    "zipCode": "12190",
    "country": "Indonesia"
  },
  "taxId": "01.234.567.8-901.000",
  "paymentTerms": "Net 30",
  "creditLimit": 100000000
}
```

### Update Customer
```http
PUT /api/customers/:id
```

### Delete Customer
```http
DELETE /api/customers/:id
```

---

## 🏢 Vendors

### Get All Vendors
```http
GET /api/vendors?search=supplier
```

### Get Vendor by ID
```http
GET /api/vendors/:id
```

### Create Vendor
```http
POST /api/vendors
Content-Type: application/json

{
  "name": "PT. Vendor Makmur",
  "email": "vendor@example.com",
  "phone": "+62812345678",
  "address": {
    "street": "Jl. Thamrin No. 456",
    "city": "Jakarta",
    "country": "Indonesia"
  },
  "contactPerson": {
    "name": "John Doe",
    "email": "john@vendor.com",
    "phone": "+62812345679"
  },
  "rating": 4.5
}
```

### Update Vendor
```http
PUT /api/vendors/:id
```

### Delete Vendor
```http
DELETE /api/vendors/:id
```

---

## 🔧 Bill of Materials (BOM)

### Get All BOMs
```http
GET /api/bom
```

### Get BOM by ID
```http
GET /api/bom/:id
```

### Create BOM
```http
POST /api/bom
Content-Type: application/json

{
  "product": "product_id_here",
  "quantity": 1,
  "components": [
    {
      "component": "component_product_id",
      "quantity": 2,
      "uom": "Unit"
    }
  ]
}
```

### Update BOM
```http
PUT /api/bom/:id
```

### Delete BOM
```http
DELETE /api/bom/:id
```

---

## 📋 Request for Quotation (RFQ)

### Get All RFQs
```http
GET /api/rfq
```

### Create RFQ
```http
POST /api/rfq
Content-Type: application/json

{
  "vendor": "vendor_id_here",
  "requestDate": "2025-11-30",
  "requiredBy": "2025-12-15",
  "items": [
    {
      "product": "product_id",
      "description": "Raw material needed",
      "quantity": 100,
      "uom": "Kg"
    }
  ],
  "status": "draft",
  "notes": "Urgent requirement"
}
```

---

## 🛒 Purchase Orders

### Get All Purchase Orders
```http
GET /api/purchase-orders
```

### Create Purchase Order
```http
POST /api/purchase-orders
Content-Type: application/json

{
  "vendor": "vendor_id_here",
  "orderDate": "2025-11-30",
  "expectedDate": "2025-12-15",
  "items": [
    {
      "product": "product_id",
      "quantity": 50,
      "unitPrice": 100000,
      "uom": "Unit"
    }
  ],
  "tax": 500000,
  "status": "draft"
}
```

---

## 💼 Sales Orders

### Get All Sales Orders
```http
GET /api/sales-orders?status=confirmed
```

### Get Sales Order by ID
```http
GET /api/sales-orders/:id
```

### Create Sales Order
```http
POST /api/sales-orders
Content-Type: application/json

{
  "customer": "customer_id_here",
  "customerReference": "PO-CUST-001",
  "orderDate": "2025-11-30",
  "deliveryDate": "2025-12-15",
  "items": [
    {
      "product": "product_id",
      "quantity": 10,
      "unitPrice": 15000000,
      "discount": 5,
      "tax": 11,
      "uom": "Unit"
    }
  ],
  "discount": 2,
  "tax": 11,
  "status": "quotation",
  "invoiceAddress": {...},
  "deliveryAddress": {...}
}
```

### Update Sales Order
```http
PUT /api/sales-orders/:id
```

### Delete Sales Order
```http
DELETE /api/sales-orders/:id
```

### Get Sales Statistics
```http
GET /api/sales-orders/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalOrders": 150,
      "totalRevenue": 2500000000,
      "avgOrderValue": 16666666
    },
    "byStatus": [
      { "_id": "confirmed", "count": 50, "total": 1000000000 },
      { "_id": "quotation", "count": 30, "total": 500000000 }
    ]
  }
}
```

---

## 📄 Quotations

### Get All Quotations
```http
GET /api/quotations
```

### Create Quotation
```http
POST /api/quotations
Content-Type: application/json

{
  "customer": "customer_id_here",
  "quotationDate": "2025-11-30",
  "expiryDate": "2025-12-30",
  "items": [
    {
      "product": "product_id",
      "quantity": 5,
      "unitPrice": 20000000,
      "uom": "Unit"
    }
  ],
  "tax": 11000000,
  "status": "draft"
}
```

---

## 🏭 Manufacturing Orders

### Get All Manufacturing Orders
```http
GET /api/manufacturing-orders
```

### Create Manufacturing Order
```http
POST /api/manufacturing-orders
Content-Type: application/json

{
  "product": "product_id_here",
  "bom": "bom_id_here",
  "quantity": 100,
  "startDate": "2025-12-01",
  "deadlineDate": "2025-12-15",
  "status": "draft",
  "notes": "Urgent production"
}
```

---

## 🔑 Status Enums

### Product Category
- `raw_material`
- `semi_finished`
- `finished_good`
- `service`

### Product Type
- `storable`
- `consumable`
- `service`

### RFQ Status
- `draft`
- `sent`
- `responded`
- `cancelled`

### Purchase Order Status
- `draft`
- `confirmed`
- `received`
- `cancelled`

### Sales Order Status
- `quotation`
- `confirmed`
- `locked`
- `cancelled`

### Quotation Status
- `draft`
- `sent`
- `accepted`
- `rejected`
- `cancelled`

### Manufacturing Order Status
- `draft`
- `confirmed`
- `in_progress`
- `done`
- `cancelled`

---

## 🚨 Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error message"
}
```

---

## 🧪 Testing with cURL

### Create a Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-001",
    "category": "finished_good",
    "price": 100000
  }'
```

### Get Products
```bash
curl http://localhost:3000/api/products?page=1&limit=5
```

### Get Health Check
```bash
curl http://localhost:3000/api/health
```

---

## 📝 Notes

- All dates should be in ISO 8601 format
- All monetary values are in the smallest currency unit (e.g., Rupiah)
- Soft delete is used for important entities (Products, Customers, Vendors, BOM)
- Auto-generated numbers: SO (Sales), PO (Purchase), RFQ, QT (Quotation), MO (Manufacturing)
- Population is automatic for related entities
