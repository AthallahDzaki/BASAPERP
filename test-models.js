#!/usr/bin/env node

/**
 * Test script to verify all MongoDB models are properly registered
 * Run: node test-models.js
 */

import mongoose from 'mongoose';

// Set environment variable if not set
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/erp_dashboard_test';
}

console.log('🧪 Testing MongoDB Model Registration...\n');
console.log(`📍 MongoDB URI: ${process.env.MONGODB_URI}\n`);

async function testModels() {
  try {
    // Connect to MongoDB
    console.log('📋 Step 1: Connecting to MongoDB');
    console.log('─'.repeat(50));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Import all models from central index
    console.log('📋 Step 2: Importing Models from Central Index');
    console.log('─'.repeat(50));
    
    const models = await import('./src/models/index.js');
    
    console.log('✅ Models imported successfully\n');
    
    // Test 3: Verify all models are registered
    console.log('📋 Step 3: Verifying Model Registration');
    console.log('─'.repeat(50));
    
    const expectedModels = [
      'Product',
      'Customer',
      'Vendor',
      'User',
      'Employee',
      'BOM',
      'RFQ',
      'PurchaseOrder',
      'Quotation',
      'SalesOrder',
      'ManufacturingOrder'
    ];
    
    const registeredModels = mongoose.modelNames();
    console.log(`📊 Registered models: ${registeredModels.join(', ')}\n`);
    
    let allRegistered = true;
    expectedModels.forEach(modelName => {
      if (registeredModels.includes(modelName)) {
        console.log(`✅ ${modelName} - Registered`);
      } else {
        console.log(`❌ ${modelName} - NOT Registered`);
        allRegistered = false;
      }
    });
    
    console.log('');
    
    // Test 4: Test model references
    console.log('📋 Step 4: Testing Model References');
    console.log('─'.repeat(50));
    
    const Product = models.Product;
    const BOM = models.BOM;
    const SalesOrder = models.SalesOrder;
    
    // Test that models with refs can be created
    console.log('Creating test Product...');
    const testProduct = new Product({
      name: 'Test Product',
      sku: `TEST-${Date.now()}`,
      description: 'Test product for model verification',
      category: 'finished_good',
      type: 'storable',
      price: 100,
      cost: 50
    });
    
    await testProduct.save();
    console.log(`✅ Product created: ${testProduct._id}`);
    
    console.log('Creating test BOM (references Product)...');
    const testBOM = new BOM({
      product: testProduct._id,
      quantity: 1,
      components: []
    });
    
    await testBOM.save();
    console.log(`✅ BOM created: ${testBOM._id}`);
    
    // Test populate (this is where the error usually occurs)
    console.log('Testing populate (Product reference)...');
    const populatedBOM = await BOM.findById(testBOM._id).populate('product');
    
    if (populatedBOM && populatedBOM.product) {
      console.log(`✅ Populate successful: ${populatedBOM.product.name}`);
    } else {
      throw new Error('Populate failed - product reference not resolved');
    }
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await Product.findByIdAndDelete(testProduct._id);
    await BOM.findByIdAndDelete(testBOM._id);
    console.log('✅ Test data cleaned up\n');
    
    // Summary
    console.log('═'.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(50));
    
    if (allRegistered) {
      console.log('✅ All models registered successfully');
      console.log('✅ Model references working correctly');
      console.log('✅ Populate functionality working');
      console.log('\n🎉 ALL TESTS PASSED! Models are properly configured.');
    } else {
      console.log('❌ Some models are not registered');
      console.log('\n⚠️  TESTS FAILED. Check the errors above.');
    }
    
    console.log('\n' + '═'.repeat(50));
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
    
    process.exit(allRegistered ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    
    try {
      await mongoose.connection.close();
    } catch (e) {
      // Ignore close errors
    }
    
    process.exit(1);
  }
}

// Run tests
testModels();
