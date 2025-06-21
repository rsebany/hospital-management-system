const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testAuth() {
  try {
    console.log('🔍 Testing authentication flow...');
    
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/ai/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@hospital.com',
      password: 'AdminPass123!'
    });
    console.log('✅ Login successful');
    console.log('Response structure:', Object.keys(loginResponse.data));
    
    const token = loginResponse.data.data.tokens.accessToken;
    console.log('Token received:', token ? token.substring(0, 20) + '...' : 'No token');
    
    // Test 3: AI endpoint with token
    console.log('\n3. Testing AI endpoint with token...');
    const aiResponse = await axios.post(`${BASE_URL}/ai/symptoms/analyze`, {
      symptoms: 'Test symptoms',
      patientAge: 30,
      gender: 'male',
      medicalHistory: []
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ AI endpoint successful:', aiResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testAuth(); 