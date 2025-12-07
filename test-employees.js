#!/usr/bin/env node

/**
 * Test Employee Module Endpoints
 * Run: node test-employees.js
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

console.log('🧪 Testing Employee Module...\n');
console.log(`📍 Base URL: ${BASE_URL}\n`);

async function testEndpoint(name, url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const start = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - start;
    const data = await response.json();
    
    const status = response.ok ? '✅' : '❌';
    console.log(`${status} ${name}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Time: ${duration}ms`);
    
    if (data.data) {
      if (Array.isArray(data.data)) {
        console.log(`   Results: ${data.data.length} employees`);
      } else if (data.data.nextId) {
        console.log(`   Next ID: ${data.data.nextId}`);
      }
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
  
  // Test 1: Generate Employee ID
  console.log('📋 Test 1: Generate Employee ID');
  console.log('─'.repeat(50));
  const generateId = await testEndpoint(
    'Generate Employee ID',
    `${BASE_URL}/api/employees/generate-id`
  );
  results.push({ name: 'Generate ID', ...generateId });
  
  // Test 2: Get All Employees
  console.log('📋 Test 2: Get All Employees');
  console.log('─'.repeat(50));
  const getAll = await testEndpoint(
    'Get All Employees',
    `${BASE_URL}/api/employees`
  );
  results.push({ name: 'Get All', ...getAll });
  
  // Test 3: Create Employee
  console.log('📋 Test 3: Create Employee');
  console.log('─'.repeat(50));
  const testEmployee = {
    employeeId: generateId.data?.data?.nextId || 'EMP999',
    firstName: 'Test',
    lastName: 'Employee',
    email: `test${Date.now()}@company.com`,
    phone: '+62 812-1234-5678',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    department: 'IT',
    position: 'Software Engineer',
    employmentType: 'Full-time',
    hireDate: new Date().toISOString().split('T')[0],
    salary: 12000000,
    isActive: true,
  };
  
  const createEmployee = await testEndpoint(
    'Create Employee',
    `${BASE_URL}/api/employees`,
    'POST',
    testEmployee
  );
  results.push({ name: 'Create', ...createEmployee });
  
  let employeeId = null;
  if (createEmployee.success && createEmployee.data?.data?._id) {
    employeeId = createEmployee.data.data._id;
    console.log(`   Created ID: ${employeeId}\n`);
  }
  
  // Test 4: Get Employee by ID
  if (employeeId) {
    console.log('📋 Test 4: Get Employee by ID');
    console.log('─'.repeat(50));
    const getById = await testEndpoint(
      'Get Employee by ID',
      `${BASE_URL}/api/employees/${employeeId}`
    );
    results.push({ name: 'Get By ID', ...getById });
    
    // Test 5: Update Employee
    console.log('📋 Test 5: Update Employee');
    console.log('─'.repeat(50));
    const updateEmployee = await testEndpoint(
      'Update Employee',
      `${BASE_URL}/api/employees/${employeeId}`,
      'PUT',
      { salary: 15000000, position: 'Senior Software Engineer' }
    );
    results.push({ name: 'Update', ...updateEmployee });
    
    // Test 6: Delete Employee (Deactivate)
    console.log('📋 Test 6: Deactivate Employee');
    console.log('─'.repeat(50));
    const deleteEmployee = await testEndpoint(
      'Deactivate Employee',
      `${BASE_URL}/api/employees/${employeeId}`,
      'DELETE'
    );
    results.push({ name: 'Deactivate', ...deleteEmployee });
  }
  
  // Test 7: Search Employees
  console.log('📋 Test 7: Search Employees');
  console.log('─'.repeat(50));
  const search = await testEndpoint(
    'Search Employees',
    `${BASE_URL}/api/employees?search=test`
  );
  results.push({ name: 'Search', ...search });
  
  // Test 8: Filter by Department
  console.log('📋 Test 8: Filter by Department');
  console.log('─'.repeat(50));
  const filterDept = await testEndpoint(
    'Filter by Department',
    `${BASE_URL}/api/employees?department=IT`
  );
  results.push({ name: 'Filter Dept', ...filterDept });
  
  // Test 9: Filter by Status
  console.log('📋 Test 9: Filter by Status');
  console.log('─'.repeat(50));
  const filterStatus = await testEndpoint(
    'Filter by Status',
    `${BASE_URL}/api/employees?isActive=true`
  );
  results.push({ name: 'Filter Status', ...filterStatus });
  
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
    console.log('\n🎉 ALL TESTS PASSED! Employee module is working properly.');
    console.log('\n📊 Next Steps:');
    console.log('   1. Open http://localhost:3000/employees');
    console.log('   2. Try creating, editing, and deactivating employees');
    console.log('   3. Test search and filters');
    console.log('   4. Check manager selection');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Check the errors above.');
    console.log('   Make sure MongoDB is running and server is started.');
  }
  
  console.log('\n' + '═'.repeat(50));
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
