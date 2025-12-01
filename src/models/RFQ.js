import mongoose from 'mongoose';

let counter = 1000;

const RFQSchema = new mongoose.Schema({
  rfqNumber: {
    type: String,
    unique: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  requiredBy: {
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
  }],
  status: {
    type: String,
    enum: ['draft', 'sent', 'responded', 'cancelled'],
    default: 'draft',
  },
  notes: String,
}, {
  timestamps: true,
});

RFQSchema.pre('save', async function(next) {
  if (!this.rfqNumber) {
    this.rfqNumber = `RFQ${String(counter++).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.models.RFQ || mongoose.model('RFQ', RFQSchema);
