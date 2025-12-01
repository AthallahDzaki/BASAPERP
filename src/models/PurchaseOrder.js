import mongoose from 'mongoose';

let counter = 2000;

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    unique: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  expectedDate: {
    type: Date,
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
    },
    uom: String,
    unitPrice: {
      type: Number,
      required: true,
    },
    subtotal: Number,
  }],
  subtotal: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'received', 'cancelled'],
    default: 'draft',
  },
  notes: String,
}, {
  timestamps: true,
});

PurchaseOrderSchema.pre('save', async function(next) {
  if (!this.poNumber) {
    this.poNumber = `PO${String(counter++).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', PurchaseOrderSchema);
