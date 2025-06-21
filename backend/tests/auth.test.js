const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./testUtils');

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new patient successfully', async () => {
      const patientData = {
        email: 'patient@test.com',
        password: 'TestPassword123!',
        role: 'patient',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(patientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.email).toBe(patientData.email);
      expect(response.body.data.role).toBe('patient');
    });

    it('should register a new doctor successfully', async () => {
      const doctorData = {
        email: 'doctor@test.com',
        password: 'TestPassword123!',
        role: 'doctor',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+1234567891',
        profile: {
          licenseNumber: 'MD123456',
          specialization: ['Cardiology']
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(doctorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.email).toBe(doctorData.email);
      expect(response.body.data.role).toBe('doctor');
    });

    it('should fail with invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        role: 'patient',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should fail with weak password', async () => {
      const weakPasswordData = {
        email: 'patient@test.com',
        password: 'weak',
        role: 'patient',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should fail with duplicate email', async () => {
      const patientData = {
        email: 'duplicate@test.com',
        password: 'TestPassword123!',
        role: 'patient',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(patientData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(patientData)
        .expect(409);

      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        email: 'test@test.com',
        password: 'TestPassword123!',
        role: 'patient',
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should fail with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should fail with invalid password', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Create and login a user
      const userData = {
        email: 'test@test.com',
        password: 'TestPassword123!',
        role: 'patient',
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@test.com',
          password: 'TestPassword123!'
        });

      refreshToken = loginResponse.body.data.tokens.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.error).toBe('Invalid refresh token');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken;

    beforeEach(async () => {
      // Create and login a user
      const userData = {
        email: 'test@test.com',
        password: 'TestPassword123!',
        role: 'patient',
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@test.com',
          password: 'TestPassword123!'
        });

      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken: 'test-refresh-token' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.error).toBe('Access denied');
    });
  });
});