const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test smart clothing vital data
async function testSmartClothingData() {
  console.log('🧪 Testing Smart Clothing Data Transmission...\n');

  const vitalData = {
    records: [{
      timestamp: new Date().toISOString(),
      temperature: 37.2, // Température corporelle
      heartRate: 75, // Fréquence cardiaque
      oxygenLevel: 98, // Taux d'oxygène
      deviceId: 'smart-shirt-001',
      userId: 'patient-123',
      batteryLevel: 95,
      signalStrength: 90
    }],
    analysisType: 'smart_clothing'
  };

  try {
    console.log('📡 Sending vital data to backend...');
    console.log('Data:', JSON.stringify(vitalData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/ai/records/analyze`, vitalData);
    
    console.log('✅ Success! Backend response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error sending vital data:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test emergency alert
async function testEmergencyAlert() {
  console.log('\n🚨 Testing Emergency Alert...\n');

  const emergencyData = {
    type: 'smart_clothing_critical',
    message: 'Critical: High fever detected - 39.5°C',
    vitalData: {
      timestamp: new Date().toISOString(),
      temperature: 39.5,
      heartRate: 120,
      oxygenLevel: 92,
      deviceId: 'smart-shirt-001',
      userId: 'patient-123',
      batteryLevel: 90,
      signalStrength: 95
    },
    timestamp: new Date().toISOString(),
    severity: 'critical',
    actionRequired: true
  };

  try {
    console.log('📡 Sending emergency alert to backend...');
    console.log('Alert:', JSON.stringify(emergencyData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/patients/notifications`, emergencyData);
    
    console.log('✅ Success! Emergency alert sent:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error sending emergency alert:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test wellness recommendations
async function testWellnessRecommendations() {
  console.log('\n💡 Testing Wellness Recommendations...\n');

  const wellnessData = {
    patientId: 'patient-123',
    vitalData: {
      temperature: 37.2,
      heartRate: 75,
      oxygenLevel: 98,
      activityLevel: 'moderate',
      sleepHours: 7.5
    },
    preferences: {
      diet: 'balanced',
      exercise: 'moderate',
      sleep: 'regular'
    }
  };

  try {
    console.log('📡 Requesting wellness recommendations...');
    console.log('Data:', JSON.stringify(wellnessData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/ai/wellness/recommendations`, wellnessData);
    
    console.log('✅ Success! Wellness recommendations:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error getting wellness recommendations:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Smart Clothing Backend Tests...\n');
  
  await testSmartClothingData();
  await testEmergencyAlert();
  await testWellnessRecommendations();
  
  console.log('\n✨ All tests completed!');
}

// Check if backend is running
async function checkBackendStatus() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is running:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend is not running or health endpoint not available');
    console.error('Please make sure the backend server is running on http://localhost:3000');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🏥 Smart Clothing Simulator Backend Test\n');
  
  const backendRunning = await checkBackendStatus();
  if (backendRunning) {
    await runAllTests();
  }
}

// Run the test
main().catch(console.error); 