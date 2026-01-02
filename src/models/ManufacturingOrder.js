import mongoose from 'mongoose';
import { v4 } from 'uuid';

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
    default: 1,
  },
  plannedStartDate: {
    type: Date,
    default: Date.now,
  },
  plannedEndDate: {
    type: Date,
  },
  actualStartDate: {
    type: Date,
  },
  actualEndDate: {
    type: Date,
  },
  workCenter: {
    type: String,
    default: '',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal',
  },
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'in_progress', 'done', 'cancelled'],
    default: 'draft',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

ManufacturingOrderSchema.pre('save', function(next) {
  if (!this.moNumber) {
    // MO + short unique id (10 chars)
    this.moNumber = `MO${v4().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  }
  next();
});

export default mongoose.models.ManufacturingOrder || mongoose.model('ManufacturingOrder', ManufacturingOrderSchema);