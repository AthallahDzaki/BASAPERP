import mongoose from 'mongoose';
import {v4} from 'uuid';

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

PurchaseOrderSchema.pre('save', async function() {
  if (!this.poNumber) {
    this.poNumber = `PO-${v4()}`;
  }
});

export default mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', PurchaseOrderSchema);
