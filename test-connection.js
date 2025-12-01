#!/usr/bin/env node

/**
 * Test script untuk MongoDB Connection Management
 * Run: node test-connection.js
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

console.log('🧪 Testing MongoDB Connection Management...\n');
console.log(`📍 Base URL: ${BASE_URL}\n`);

async function testEndpoint(name, url, method = 'GET') {
  try {
    const start = Date.now();
    const response = await fetch(url, { method });
    const duration = Date.now() - start;
    const data = await response.json();
    
    const status = response.ok ? '✅' : '❌';
    console.log(`${status} ${name}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Time: ${duration}ms`);
    
    if (data.poolStats) {
      console.log(`   Active Connections: ${data.poolStats.activeConnections || 0}`);
      console.log(`   Available Connections: ${data.poolStats.availableConnections || 0}`);
    }
    
    if (data.data?.poolSize) {
      console.log(`   Pool Active: ${data.data.poolSize.active || 0}`);
      console.log(`   Pool Available: ${data.data.poolSize.available || 0}`);
    }
    
    console.log('');
    return { success: response.ok, data, duration };
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  const results = [];
  
  // Test 1: Health Check
  console.log('📋 Test 1: Health Check');
  console.log('─'.repeat(50));
  const health = await testEndpoint(
    'Health Check',
    `${BASE_URL}/api/health`
  );
  results.push({ name: 'Health Check', ...health });
  
  // Test 2: Connection Monitor
  console.log('📋 Test 2: Connection Monitor');
  console.log('─'.repeat(50));
  const monitor = await testEndpoint(
    'Connection Monitor',
    `${BASE_URL}/api/monitor`
  );
  results.push({ name: 'Connection Monitor', ...monitor });
  
  // Test 3: Warmup
  console.log('📋 Test 3: Connection Warmup');
  console.log('─'.repeat(50));
  const warmup = await testEndpoint(
    'Warmup Endpoint',
    `${BASE_URL}/api/health`,
    'POST'
  );
  results.push({ name: 'Warmup', ...warmup });
  
  // Test 4: Multiple Requests (Test Pooling)
  console.log('📋 Test 4: Connection Pooling (10 concurrent requests)');
  console.log('─'.repeat(50));
  const start = Date.now();
  const promises = Array.from({ length: 10 }, (_, i) =>
    testEndpoint(`Request ${i + 1}`, `${BASE_URL}/api/health`)
  );
  
  const poolingResults = await Promise.all(promises);
  const duration = Date.now() - start;
  
  const successful = poolingResults.filter(r => r.success).length;
  console.log(`✅ ${successful}/10 requests successful`);
  console.log(`⏱️  Total time: ${duration}ms`);
  console.log(`📊 Average time: ${Math.round(duration / 10)}ms per request\n`);
  
  // Summary
  console.log('═'.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(50));
  
  const totalSuccess = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const time = result.duration ? `(${result.duration}ms)` : '';
    console.log(`${icon} ${result.name} ${time}`);
  });
  
  console.log('');
  console.log(`Total: ${totalSuccess}/${totalTests} tests passed`);
  
  if (totalSuccess === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Connection management is working properly.');
    console.log('\n📊 Next Steps:');
    console.log('   1. Open http://localhost:3000/monitor untuk visual dashboard');
    console.log('   2. Check MongoDB Atlas connections (should be ≤ 10)');
    console.log('   3. Ready to deploy to Vercel!');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Check the errors above.');
    console.log('   Make sure MongoDB is running and MONGODB_URI is set.');
  }
  
  console.log('\n' + '═'.repeat(50));
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
