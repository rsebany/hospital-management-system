const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const blockchainService = require('../services/blockchainService');
const { generateTestToken } = require('./testUtils');

// Mock blockchain service
jest.mock('../services/blockchainService');

describe('Blockchain Integration Tests', () => {
  let testUser, testDoctor, testPatient, testRecord, authToken;

  beforeAll(async () => {
    // Create test users
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'admin',
      firstName: 'Test',
      lastName: 'User'
    });

    testDoctor = await User.create({
      email: 'doctor@example.com',
      password: 'password123',
      role: 'doctor',
      firstName: 'Dr. John',
      lastName: 'Doe',
      specialization: 'Cardiology'
    });

    testPatient = await User.create({
      email: 'patient@example.com',
      password: 'password123',
      role: 'patient',
      firstName: 'Jane',
      lastName: 'Smith'
    });

    // Create test medical record
    testRecord = await MedicalRecord.create({
      patientId: testPatient._id,
      doctorId: testDoctor._id,
      recordType: 'visit',
      data: 'encrypted-data-here',
      version: 1,
      recordHash: 'test-hash-123',
      blockchainTransactionHash: '0x1234567890abcdef',
      blockchainBlockNumber: 12345
    });

    authToken = generateTestToken(testUser);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await MedicalRecord.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Blockchain Service Tests', () => {
    test('should generate record hash correctly', () => {
      const recordData = {
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        recordType: 'visit',
        data: 'test-data',
        version: 1,
        createdAt: new Date()
      };

      const hash = blockchainService.generateRecordHash(recordData);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 hash length
    });

    test('should verify record hash on blockchain', async () => {
      const mockVerification = {
        exists: true,
        timestamp: 1640995200,
        verified: true
      };

      blockchainService.verifyRecordHash.mockResolvedValue(mockVerification);

      const result = await blockchainService.verifyRecordHash('test-hash');
      
      expect(result).toEqual(mockVerification);
      expect(blockchainService.verifyRecordHash).toHaveBeenCalledWith('test-hash');
    });

    test('should check blockchain connection', async () => {
      const mockStatus = {
        connected: true,
        blockNumber: 12345,
        networkId: 1337,
        nodeUrl: 'http://localhost:8545'
      };

      blockchainService.checkConnection.mockResolvedValue(mockStatus);

      const result = await blockchainService.checkConnection();
      
      expect(result).toEqual(mockStatus);
      expect(blockchainService.checkConnection).toHaveBeenCalled();
    });

    test('should get audit trail', async () => {
      const mockAuditTrail = {
        recordHash: 'test-hash',
        exists: true,
        timestamp: 1640995200,
        auditTrail: [
          {
            action: 'record_created',
            timestamp: 1640995200,
            blockNumber: 12345,
            transactionHash: '0x1234567890abcdef'
          }
        ]
      };

      blockchainService.getAuditTrail.mockResolvedValue(mockAuditTrail);

      const result = await blockchainService.getAuditTrail('test-hash');
      
      expect(result).toEqual(mockAuditTrail);
      expect(blockchainService.getAuditTrail).toHaveBeenCalledWith('test-hash');
    });
  });

  describe('Blockchain API Endpoints', () => {
    describe('GET /api/v1/blockchain/status', () => {
      test('should return blockchain status', async () => {
        const mockStatus = {
          connected: true,
          blockNumber: 12345,
          networkId: 1337,
          nodeUrl: 'http://localhost:8545'
        };

        blockchainService.checkConnection.mockResolvedValue(mockStatus);

        const response = await request(app)
          .get('/api/v1/blockchain/status')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.blockchain).toEqual(mockStatus);
      });

      test('should handle blockchain connection failure', async () => {
        const mockError = {
          connected: false,
          error: 'Connection failed'
        };

        blockchainService.checkConnection.mockResolvedValue(mockError);

        const response = await request(app)
          .get('/api/v1/blockchain/status')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.blockchain).toEqual(mockError);
      });
    });

    describe('GET /api/v1/blockchain/verify/:recordId', () => {
      test('should verify medical record integrity', async () => {
        const mockVerification = {
          exists: true,
          timestamp: 1640995200,
          verified: true
        };

        blockchainService.verifyRecordHash.mockResolvedValue(mockVerification);
        blockchainService.generateRecordHash.mockReturnValue('test-hash-123');

        const response = await request(app)
          .get(`/api/v1/blockchain/verify/${testRecord._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.recordId).toBe(testRecord._id.toString());
        expect(response.body.verification).toBeDefined();
        expect(response.body.verification.integrityCheck).toBe(true);
      });

      test('should return 404 for non-existent record', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
          .get(`/api/v1/blockchain/verify/${fakeId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Medical record not found');
      });

      test('should require authentication', async () => {
        await request(app)
          .get(`/api/v1/blockchain/verify/${testRecord._id}`)
          .expect(401);
      });

      test('should validate record ID format', async () => {
        const response = await request(app)
          .get('/api/v1/blockchain/verify/invalid-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/v1/blockchain/audit/:recordId', () => {
      test('should get audit trail for medical record', async () => {
        const mockAuditTrail = {
          recordHash: 'test-hash-123',
          exists: true,
          timestamp: 1640995200,
          auditTrail: [
            {
              action: 'record_created',
              timestamp: 1640995200,
              blockNumber: 12345,
              transactionHash: '0x1234567890abcdef'
            }
          ]
        };

        blockchainService.getAuditTrail.mockResolvedValue(mockAuditTrail);
        blockchainService.getTransactionDetails.mockResolvedValue({
          transactionHash: '0x1234567890abcdef',
          blockNumber: 12345,
          from: '0xabcdef1234567890',
          to: '0x1234567890abcdef',
          gasUsed: 150000,
          status: true,
          timestamp: 1640995200
        });

        const response = await request(app)
          .get(`/api/v1/blockchain/audit/${testRecord._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.recordId).toBe(testRecord._id.toString());
        expect(response.body.auditTrail).toBeDefined();
        expect(response.body.auditTrail.exists).toBe(true);
      });

      test('should handle missing transaction details gracefully', async () => {
        const mockAuditTrail = {
          recordHash: 'test-hash-123',
          exists: true,
          timestamp: 1640995200,
          auditTrail: []
        };

        blockchainService.getAuditTrail.mockResolvedValue(mockAuditTrail);
        blockchainService.getTransactionDetails.mockRejectedValue(new Error('Transaction not found'));

        const response = await request(app)
          .get(`/api/v1/blockchain/audit/${testRecord._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.auditTrail.transactionDetails).toBeNull();
      });
    });

    describe('GET /api/v1/blockchain/patient/:patientId', () => {
      test('should get patient records with blockchain verification', async () => {
        const mockVerification = {
          exists: true,
          timestamp: 1640995200,
          verified: true
        };

        blockchainService.verifyRecordHash.mockResolvedValue(mockVerification);

        const response = await request(app)
          .get(`/api/v1/blockchain/patient/${testPatient._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.patientId).toBe(testPatient._id.toString());
        expect(response.body.records).toBeDefined();
        expect(response.body.records.length).toBeGreaterThan(0);
        expect(response.body.records[0].blockchainVerification).toBeDefined();
      });

      test('should return empty array for patient with no records', async () => {
        const newPatient = await User.create({
          email: 'newpatient@example.com',
          password: 'password123',
          role: 'patient',
          firstName: 'New',
          lastName: 'Patient'
        });

        const response = await request(app)
          .get(`/api/v1/blockchain/patient/${newPatient._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.records).toEqual([]);

        await User.findByIdAndDelete(newPatient._id);
      });
    });

    describe('POST /api/v1/blockchain/store/:recordId', () => {
      test('should manually store record hash on blockchain', async () => {
        const mockBlockchainResult = {
          success: true,
          transactionHash: '0xabcdef1234567890',
          blockNumber: 12346,
          timestamp: 1640995300
        };

        blockchainService.generateRecordHash.mockReturnValue('new-hash-456');
        blockchainService.storeRecordHash.mockResolvedValue(mockBlockchainResult);

        const response = await request(app)
          .post(`/api/v1/blockchain/store/${testRecord._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.recordId).toBe(testRecord._id.toString());
        expect(response.body.blockchainResult).toEqual(mockBlockchainResult);
        expect(response.body.message).toBe('Record hash stored on blockchain successfully');
      });

      test('should generate hash if not exists', async () => {
        const recordWithoutHash = await MedicalRecord.create({
          patientId: testPatient._id,
          doctorId: testDoctor._id,
          recordType: 'lab',
          data: 'encrypted-lab-data',
          version: 1
        });

        const mockBlockchainResult = {
          success: true,
          transactionHash: '0xabcdef1234567890',
          blockNumber: 12347,
          timestamp: 1640995400
        };

        blockchainService.generateRecordHash.mockReturnValue('generated-hash-789');
        blockchainService.storeRecordHash.mockResolvedValue(mockBlockchainResult);

        const response = await request(app)
          .post(`/api/v1/blockchain/store/${recordWithoutHash._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(blockchainService.generateRecordHash).toHaveBeenCalled();

        await MedicalRecord.findByIdAndDelete(recordWithoutHash._id);
      });

      test('should handle blockchain storage failure', async () => {
        blockchainService.generateRecordHash.mockReturnValue('test-hash');
        blockchainService.storeRecordHash.mockRejectedValue(new Error('Blockchain error'));

        const response = await request(app)
          .post(`/api/v1/blockchain/store/${testRecord._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Failed to store record hash on blockchain');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle blockchain service errors gracefully', async () => {
      blockchainService.verifyRecordHash.mockRejectedValue(new Error('Blockchain connection failed'));

      const response = await request(app)
        .get(`/api/v1/blockchain/verify/${testRecord._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to verify medical record');
    });

    test('should handle invalid MongoDB ObjectId', async () => {
      const response = await request(app)
        .get('/api/v1/blockchain/verify/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Medical record not found');
    });
  });

  describe('Security Tests', () => {
    test('should require valid JWT token', async () => {
      await request(app)
        .get(`/api/v1/blockchain/verify/${testRecord._id}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    test('should validate request parameters', async () => {
      const response = await request(app)
        .get('/api/v1/blockchain/verify/not-an-object-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
}); 