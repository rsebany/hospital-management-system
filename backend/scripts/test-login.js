const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testLogin() {
  console.log('🔑 Testing admin login...\n');

  const credentials = {
    email: 'admin@hospital.com',
    password: 'AdminPass123!'
  };

  try {
    console.log('📡 Attempting login with:', credentials.email);
    
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    
    console.log('✅ Login successful!');
    console.log('User:', response.data.data.user.email);
    console.log('Role:', response.data.data.user.role);
    console.log('Token:', response.data.data.tokens.accessToken ? 'Present' : 'Missing');
    
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Check if backend is running
async function checkBackend() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is running');
    return true;
  } catch (error) {
    console.error('❌ Backend is not running');
    return false;
  }
}

async function main() {
  console.log('🏥 Testing Admin Login\n');
  
  const backendRunning = await checkBackend();
  if (backendRunning) {
    await testLogin();
  }
}

main().catch(console.error); 