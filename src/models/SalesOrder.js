import mongoose from 'mongoose';

let counter = 3000;

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
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    subtotal: Number,
  }],
  subtotal: {
    type: Number,
    default: 0,
  },
  discount: {
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
    enum: ['quotation', 'confirmed', 'locked', 'cancelled'],
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
  notes: String,
}, {
  timestamps: true,
});

SalesOrderSchema.pre('save', async function(next) {
  if (!this.soNumber) {
    this.soNumber = `SO${String(counter++).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.models.SalesOrder || mongoose.model('SalesOrder', SalesOrderSchema);
