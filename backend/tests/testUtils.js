const mongoose = require('mongoose');

// Test database configuration
const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/hospital_test';

/**
 * Connect to test database
 */
const connectTestDB = async () => {
  try {
    await mongoose.connect(TEST_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to test database');
  } catch (error) {
    console.error('Test database connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from test database
 */
const disconnectTestDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Test database disconnection error:', error);
    throw error;
  }
};

/**
 * Clear all collections in test database
 */
const clearTestDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('Test database cleared');
  } catch (error) {
    console.error('Test database clear error:', error);
    throw error;
  }
};

/**
 * Create test user
 */
const createTestUser = async (userData = {}) => {
  const User = require('../models/User');
  
  const defaultUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    role: 'patient',
    firstName: 'Test',
    lastName: 'User',
    isEmailVerified: true,
    isActive: true,
    ...userData
  };

  const user = new User(defaultUser);
  await user.save();
  
  return user;
};

/**
 * Create test doctor
 */
const createTestDoctor = async (doctorData = {}) => {
  const User = require('../models/User');
  
  const defaultDoctor = {
    email: 'doctor@example.com',
    password: 'TestPassword123!',
    role: 'doctor',
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    isEmailVerified: true,
    isActive: true,
    profile: {
      licenseNumber: 'MD123456',
      specialization: ['Cardiology'],
      experience: '10 years',
      education: 'Medical School'
    },
    ...doctorData
  };

  const doctor = new User(defaultDoctor);
  await doctor.save();
  
  return doctor;
};

/**
 * Create test admin
 */
const createTestAdmin = async (adminData = {}) => {
  const User = require('../models/User');
  
  const defaultAdmin = {
    email: 'admin@example.com',
    password: 'TestPassword123!',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    isEmailVerified: true,
    isActive: true,
    ...adminData
  };

  const admin = new User(defaultAdmin);
  await admin.save();
  
  return admin;
};

/**
 * Create test department
 */
const createTestDepartment = async (departmentData = {}) => {
  const Department = require('../models/Department');
  
  const defaultDepartment = {
    name: 'Test Department',
    description: 'A test department for testing purposes',
    isActive: true,
    ...departmentData
  };

  const department = new Department(defaultDepartment);
  await department.save();
  
  return department;
};

/**
 * Create test appointment
 */
const createTestAppointment = async (appointmentData = {}) => {
  const Appointment = require('../models/Appointment');
  
  const defaultAppointment = {
    patientId: appointmentData.patientId || (await createTestUser())._id,
    doctorId: appointmentData.doctorId || (await createTestDoctor())._id,
    appointmentDate: new Date(),
    appointmentTime: '10:00',
    type: 'consultation',
    reason: 'Regular checkup',
    status: 'scheduled',
    duration: 30,
    ...appointmentData
  };

  const appointment = new Appointment(defaultAppointment);
  await appointment.save();
  
  return appointment;
};

/**
 * Generate JWT token for testing
 */
const generateTestToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

/**
 * Mock Redis for testing
 */
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn()
};

/**
 * Setup test environment
 */
const setupTestEnv = () => {
  // Mock environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  
  // Mock Redis
  jest.mock('../config/redis', () => ({
    getCache: mockRedis.get,
    setCache: mockRedis.set,
    deleteCache: mockRedis.del,
    exists: mockRedis.exists
  }));
};

/**
 * Cleanup test environment
 */
const cleanupTestEnv = () => {
  jest.clearAllMocks();
  jest.resetModules();
};

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestUser,
  createTestDoctor,
  createTestAdmin,
  createTestDepartment,
  createTestAppointment,
  generateTestToken,
  mockRedis,
  setupTestEnv,
  cleanupTestEnv
}; 