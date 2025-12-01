import mongoose from 'mongoose';

let counter = 4000;

const QuotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  quotationDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
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
    enum: ['draft', 'sent', 'accepted', 'rejected', 'cancelled'],
    default: 'draft',
  },
  notes: String,
}, {
  timestamps: true,
});

QuotationSchema.pre('save', async function(next) {
  if (!this.quotationNumber) {
    this.quotationNumber = `QT${String(counter++).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);
