import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['raw_material', 'semi_finished', 'finished_good', 'service'],
    default: 'finished_good',
  },
  type: {
    type: String,
    enum: ['storable', 'consumable', 'service'],
    default: 'storable',
  },
  uom: {
    type: String,
    default: 'Unit',
  },
  cost: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
  stockQty: {
    type: Number,
    default: 0,
  },
  minStockQty: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

ProductSchema.index({ name: 'text', sku: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
