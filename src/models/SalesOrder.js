import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  description: String,
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  uom: String,
  unitPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  // per-item percents
  discount: {
    type: Number,
    default: 0, // percent
  },
  tax: {
    type: Number,
    default: 0, // percent
  },
  // computed/numeric fields (kept for convenience; server will compute/normalize)
  itemSubtotal: {
    type: Number,
    default: 0, // quantity * unitPrice (before per-item discount/tax)
  },
  itemDiscountAmount: {
    type: Number,
    default: 0,
  },
  itemTaxAmount: {
    type: Number,
    default: 0,
  },
  subtotal: {
    type: Number,
    default: 0, // final per-item total after discount/tax
  }
}, { _id: false });

const SalesOrderSchema = new mongoose.Schema({
  soNumber: {
    type: String,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  customerReference: String,
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: Date,

  items: {
    type: [ItemSchema],
    default: [],
  },

  // discount fields (top-level)
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },

  // tax fields
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },

  // totals
  subtotal: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },

  // status: expanded to include client-side values such as 'draft' and 'processing'
  status: {
    type: String,
    enum: ['draft', 'quotation', 'confirmed', 'processing', 'shipped', 'delivered', 'locked', 'cancelled'],
    default: 'quotation',
  },

  invoiceAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  shippingAddress: String,
  notes: String,
}, {
  timestamps: true,
});

// Normalize & compute totals before validation to avoid NaN casting errors
SalesOrderSchema.pre('validate', function() {
  try {
    // ensure items array
    if (!Array.isArray(this.items)) this.items = [];

    // normalize and compute per-item numbers
    this.items = this.items.map(it => {
      const quantity = Number(it.quantity) || 0;
      const unitPrice = Number(it.unitPrice) || 0;
      const discountPct = Number(it.discount || 0) || 0;
      const taxPct = Number(it.tax || 0) || 0;

      const itemSubtotal = quantity * unitPrice;
      const itemDiscountAmount = itemSubtotal * (discountPct / 100);
      const itemTaxAmount = (itemSubtotal - itemDiscountAmount) * (taxPct / 100);
      const itemFinal = itemSubtotal - itemDiscountAmount + itemTaxAmount;

      return {
        ...it,
        quantity,
        unitPrice,
        discount: discountPct,
        tax: taxPct,
        itemSubtotal,
        itemDiscountAmount,
        itemTaxAmount,
        subtotal: itemFinal
      };
    });

    // sum item subtotals (final per-item totals)
    const itemsTotal = this.items.reduce((s, it) => s + (Number(it.subtotal) || 0), 0);

    // top-level discount handling
    const discountType = this.discountType || 'percentage';
    const discountValue = Number(this.discountValue || 0) || 0;
    let overallDiscountAmount = 0;
    if (discountType === 'percentage') {
      overallDiscountAmount = itemsTotal * (discountValue / 100);
    } else {
      overallDiscountAmount = discountValue;
    }

    const afterDiscount = itemsTotal - overallDiscountAmount;

    // tax using taxRate
    const taxRate = Number(this.taxRate || 0) || 0;
    const overallTaxAmount = afterDiscount * (taxRate / 100);

    const grandTotal = afterDiscount + overallTaxAmount;

    // set normalized totals
    this.subtotal = Number(itemsTotal) || 0;
    this.discountAmount = Number(overallDiscountAmount) || 0;
    this.taxAmount = Number(overallTaxAmount) || 0;
    this.total = Number(grandTotal) || 0;

    // generate soNumber if missing
    if (!this.soNumber) {
      this.soNumber = `SO-${uuidv4()}`;
    }

    // ensure status is valid: if an unknown status provided, fallback to 'quotation'
    const allowedStatuses = ['draft','quotation','confirmed','processing','shipped','delivered','locked','cancelled'];
    if (!allowedStatuses.includes(this.status)) {
      this.status = 'quotation';
    }
  } catch (err) {
    console.log(err);
  }
});

export default mongoose.models.SalesOrder || mongoose.model('SalesOrder', SalesOrderSchema);