// Simple test to check server components
console.log('Testing server components...');

try {
  // Test basic requires
  console.log('1. Testing basic requires...');
  const express = require('express');
  const mongoose = require('mongoose');
  console.log('✅ Basic requires successful');
  
  // Test environment
  console.log('2. Testing environment...');
  process.env.NODE_ENV = 'development';
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
  console.log('✅ Environment set');
  
  // Test app creation
  console.log('3. Testing app creation...');
  const app = require('./app');
  console.log('✅ App created successfully');
  
  // Test simple server
  console.log('4. Testing simple server...');
  const server = require('http').createServer(app);
  server.listen(3001, () => {
    console.log('✅ Server started on port 3001');
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 