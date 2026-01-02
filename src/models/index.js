/**
 * Central Models Index
 * 
 * This file ensures all MongoDB models are properly registered with Mongoose
 * in the correct order to avoid "Schema hasn't been registered" errors.
 * 
 * Models are loaded in dependency order:
 * 1. Base models (no references to other models)
 * 2. Dependent models (reference base models)
 */

import mongoose from 'mongoose';

// ============================================
// STEP 1: Import and register base models first
// These models don't reference other models
// ============================================

import Product from './Product.js';
import Customer from './Customer.js';
import Vendor from './Vendor.js';
import User from './User.js';
import Employee from './Employee.js';

// ============================================
// STEP 2: Import and register dependent models
// These models reference the base models above
// ============================================

import BOM from './BOM.js';
import RFQ from './RFQ.js';
import PurchaseOrder from './PurchaseOrder.js';
import Quotation from './Quotation.js';
import SalesOrder from './SalesOrder.js';
import ManufacturingOrder from './ManufacturingOrder.js';

// ============================================
// Export all models
// ============================================

export {
  // Base models
  Product,
  Customer,
  Vendor,
  User,
  Employee,
  
  // Dependent models
  BOM,
  RFQ,
  PurchaseOrder,
  Quotation,
  SalesOrder,
  ManufacturingOrder
};

// Default export for convenience
export default {
  Product,
  Customer,
  Vendor,
  User,
  Employee,
  BOM,
  RFQ,
  PurchaseOrder,
  Quotation,
  SalesOrder,
  ManufacturingOrder
};
