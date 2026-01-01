import mongoose from 'mongoose';
import { v4 } from 'uuid';

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

RFQSchema.pre('save', async function() {
  if (this.isNew && !this.rfqNumber) {
    this.rfqNumber = `RFQ-${v4()}`
  }
})

export default mongoose.models.RFQ || mongoose.model('RFQ', RFQSchema);
