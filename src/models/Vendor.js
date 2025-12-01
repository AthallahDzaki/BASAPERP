import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  contactPerson: {
    name: String,
    email: String,
    phone: String,
  },
  taxId: String,
  paymentTerms: {
    type: String,
    default: 'Net 30',
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

VendorSchema.index({ name: 'text', email: 'text' });

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
