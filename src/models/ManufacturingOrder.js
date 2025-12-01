import mongoose from 'mongoose';

let counter = 5000;

const ManufacturingOrderSchema = new mongoose.Schema({
  moNumber: {
    type: String,
    unique: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  bom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BOM',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  deadlineDate: {
    type: Date,
    required: true,
  },
  completedDate: Date,
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'in_progress', 'done', 'cancelled'],
    default: 'draft',
  },
  notes: String,
}, {
  timestamps: true,
});

ManufacturingOrderSchema.pre('save', async function(next) {
  if (!this.moNumber) {
    this.moNumber = `MO${String(counter++).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.models.ManufacturingOrder || mongoose.model('ManufacturingOrder', ManufacturingOrderSchema);
