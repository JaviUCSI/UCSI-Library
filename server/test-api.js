#!/usr/bin/env node

/**
 * Simple API test script for UCSI Library Backend
 * Tests basic CRUD operations without requiring a database connection
 */

const BASE_URL = 'http://localhost:5000/api';

// Test health endpoint
async function testHealth() {
  console.log('\n=== Testing Health Endpoint ===');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check:', data.message);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

// Test that endpoints exist (even if they fail due to no DB)
async function testEndpointExists(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
      return true;
    } else {
      console.log(`⚠️  ${method} ${endpoint} - Non-JSON response: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting UCSI Library API Tests');
  console.log('📝 Note: Some tests may fail due to missing database connection');
  
  // Test health endpoint first
  const healthOk = await testHealth();
  
  if (!healthOk) {
    console.log('\n❌ Server not responding. Make sure the server is running on port 5000');
    process.exit(1);
  }
  
  console.log('\n=== Testing Book Endpoints ===');
  await testEndpointExists('GET', '/books');
  await testEndpointExists('POST', '/books', {
    title: 'Test Book',
    author: 'Test Author'
  });
  await testEndpointExists('GET', '/books/stats/overview');
  
  console.log('\n=== Testing User Endpoints ===');
  await testEndpointExists('GET', '/users');
  await testEndpointExists('POST', '/users', {
    name: 'Test User',
    email: 'test@ucsi.edu.my',
    type: 'student'
  });
  await testEndpointExists('GET', '/users/stats/overview');
  
  console.log('\n=== Testing Loan Endpoints ===');
  await testEndpointExists('GET', '/loans');
  await testEndpointExists('GET', '/loans/overdue/list');
  await testEndpointExists('GET', '/loans/stats/overview');
  
  console.log('\n✅ API endpoint tests completed!');
  console.log('💡 To test with data, set up MongoDB connection in .env file');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testHealth, testEndpointExists };