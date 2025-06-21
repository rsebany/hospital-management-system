// Simple test script to check server startup
require('dotenv').config();

// Set minimal environment variables
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
process.env.JWT_REFRESH_SECRET = 'your-refresh-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/hospital_management_2025';
process.env.PORT = '3000';

console.log('Starting server with minimal configuration...');
console.log('Environment variables set:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set'
});

try {
  require('./server.js');
  console.log('Server started successfully!');
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
} 