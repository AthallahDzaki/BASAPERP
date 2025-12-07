import mongoose from 'mongoose';

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
    const ret = await Counter.findOneAndUpdate(
      { _id: 'rfq' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    ).exec()

    const seq = ret.seq
    this.rfqNumber = `RFQ${String(seq).padStart(5, '0')}`
  }
})

export default mongoose.models.RFQ || mongoose.model('RFQ', RFQSchema);
