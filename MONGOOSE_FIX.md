# Solusi: Perbaikan Error "Schema hasn't been registered for model"

## Masalah

Aplikasi mengalami error:
```
Schema hasn't been registered for model "Product".
Use mongoose.model(name, schema)
```

Error ini terjadi ketika model MongoDB mencoba mereferensi model lain yang belum terdaftar di Mongoose.

## Penyebab

Model-model seperti `BOM`, `SalesOrder`, `RFQ`, dll. memiliki referensi ke model `Product`:

```javascript
// Contoh di BOM.js
component: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Product',  // ← Referensi ke Product
  required: true,
}
```

Jika model-model ini diimpor sebelum model `Product` terdaftar, Mongoose akan mengeluarkan error.

## Solusi

### 1. Membuat Central Models Index

File: `src/models/index.js`

File ini mengimpor dan mendaftarkan semua model dalam urutan yang benar:

```javascript
// STEP 1: Base models (tidak referensi model lain)
import Product from './Product.js';
import Customer from './Customer.js';
import Vendor from './Vendor.js';
import User from './User.js';
import Employee from './Employee.js';

// STEP 2: Dependent models (referensi base models)
import BOM from './BOM.js';
import RFQ from './RFQ.js';
import PurchaseOrder from './PurchaseOrder.js';
import Quotation from './Quotation.js';
import SalesOrder from './SalesOrder.js';
import ManufacturingOrder from './ManufacturingOrder.js';

// Export semua models
export {
  Product,
  Customer,
  Vendor,
  User,
  Employee,
  BOM,
  RFQ,
  PurchaseOrder,
  Quotation,
  SalesOrder,
  ManufacturingOrder
};
```

### 2. Update Import di Semua API Routes

**Sebelum:**
```javascript
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import BOM from '@/models/BOM';
```

**Sesudah:**
```javascript
import { Product, Customer, BOM } from '@/models';
```

Perubahan ini diterapkan di semua file API route:
- `/src/app/api/products/**/*.js`
- `/src/app/api/customers/**/*.js`
- `/src/app/api/vendors/**/*.js`
- `/src/app/api/employees/**/*.js`
- `/src/app/api/auth/**/*.js`
- `/src/app/api/bom/**/*.js`
- `/src/app/api/rfq/**/*.js`
- `/src/app/api/purchase-orders/**/*.js`
- `/src/app/api/quotations/**/*.js`
- `/src/app/api/sales-orders/**/*.js`
- `/src/app/api/manufacturing-orders/**/*.js`

## Testing

Untuk memverifikasi bahwa semua model terdaftar dengan benar, jalankan test script:

```bash
npm run test:models
```

Test script akan:
1. Connect ke MongoDB
2. Import semua models dari central index
3. Verify semua model terdaftar
4. Test model references dan populate functionality
5. Clean up test data

## Keuntungan Solusi Ini

1. **Urutan Loading Terjamin**: Model base selalu diload sebelum model dependent
2. **Single Source of Truth**: Semua import model dari satu file
3. **Mudah Maintenance**: Jika ada model baru, tambahkan di satu tempat
4. **Konsisten**: Semua API route menggunakan cara import yang sama
5. **Type Safety**: Export named memudahkan autocomplete dan type checking

## Struktur Model

### Base Models (Tidak ada referensi)
- `Product` - Model produk
- `Customer` - Model pelanggan
- `Vendor` - Model vendor/supplier
- `User` - Model user/akun
- `Employee` - Model karyawan

### Dependent Models (Memiliki referensi)
- `BOM` - Bill of Materials (referensi Product)
- `RFQ` - Request for Quotation (referensi Vendor, Product)
- `PurchaseOrder` - Purchase Order (referensi Vendor, Product)
- `Quotation` - Quotation (referensi Customer, Product)
- `SalesOrder` - Sales Order (referensi Customer, Product)
- `ManufacturingOrder` - Manufacturing Order (referensi Product, BOM)

## Catatan Penting

1. **Jangan import model secara langsung** dari file individualnya
2. **Selalu gunakan** central index: `import { ModelName } from '@/models'`
3. Jika menambah model baru:
   - Buat file model di `src/models/`
   - Tambahkan ke `src/models/index.js` di urutan yang benar
   - Update dokumentasi ini

## Troubleshooting

Jika masih ada error "Schema hasn't been registered":

1. Pastikan semua import menggunakan central index
2. Cek urutan loading di `src/models/index.js`
3. Jalankan `npm run test:models` untuk verify
4. Cek console log saat startup aplikasi

## File yang Dimodifikasi

### Files Created:
- `src/models/index.js` - Central models index
- `test-models.js` - Test script untuk verify model registration

### Files Modified:
- 28 API route files di `src/app/api/` - Update imports
- `package.json` - Tambah test script

## Referensi

- [Mongoose Model Registration](https://mongoosejs.com/docs/models.html)
- [Mongoose Populate](https://mongoosejs.com/docs/populate.html)
- [Next.js Path Aliases](https://nextjs.org/docs/advanced-features/module-path-aliases)
