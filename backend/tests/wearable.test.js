const request = require('supertest');
const app = require('../app');

// Mock OpenAI to avoid actual API calls during testing
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mock AI analysis: Patient shows normal heart rate patterns with good sleep quality.'
            }
          }]
        })
      }
    }
  }));
});

describe('Wearable Device Integration', () => {
  describe('POST /api/v1/wearables/data', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/wearables/data')
        .send({
          patientId: '507f1f77bcf86cd799439011',
          deviceType: 'fitbit',
          timestamp: '2024-01-20T10:00:00Z',
          data: { heartRate: 75, steps: 8000 }
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/wearables/data')
        .send({
          deviceType: 'fitbit',
          data: { heartRate: 75 }
          // Missing patientId and timestamp
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);

    it('should return 400 for invalid timestamp', async () => {
      const response = await request(app)
        .post('/api/v1/wearables/data')
        .send({
          patientId: '507f1f77bcf86cd799439011',
          deviceType: 'fitbit',
          timestamp: 'invalid-date',
          data: { heartRate: 75 }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);

    it('should return 400 for missing data', async () => {
      const response = await request(app)
        .post('/api/v1/wearables/data')
        .send({
          patientId: '507f1f77bcf86cd799439011',
          deviceType: 'fitbit',
          timestamp: '2024-01-20T10:00:00Z'
          // Missing data
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('GET /api/v1/wearables/:patientId', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/wearables/507f1f77bcf86cd799439011')
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for invalid patient ID', async () => {
      const response = await request(app)
        .get('/api/v1/wearables/')
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('POST /api/v1/ai/wearables/analyze', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/ai/wearables/analyze')
        .send({
          patientId: '507f1f77bcf86cd799439011',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-07T23:59:59Z'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for missing patient ID', async () => {
      const response = await request(app)
        .post('/api/v1/ai/wearables/analyze')
        .send({
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-07T23:59:59Z'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .post('/api/v1/ai/wearables/analyze')
        .send({
          patientId: '507f1f77bcf86cd799439011',
          startDate: 'invalid-date',
          endDate: '2024-01-07T23:59:59Z'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('Route validation', () => {
    it('should have all required wearable routes defined', () => {
      const routes = app._router.stack
        .filter(layer => layer.route)
        .map(layer => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        }))
        .filter(route => route.path.includes('/wearables'));

      expect(routes.length).toBeGreaterThan(0);
      
      const routePaths = routes.map(route => route.path);
      expect(routePaths).toContain('/api/v1/wearables/data');
      expect(routePaths).toContain('/api/v1/wearables/:patientId');
    }, 10000);

    it('should have AI wearable analysis route defined', () => {
      const routes = app._router.stack
        .filter(layer => layer.route)
        .map(layer => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        }))
        .filter(route => route.path.includes('/ai/wearables'));

      expect(routes.length).toBeGreaterThan(0);
      
      const routePaths = routes.map(route => route.path);
      expect(routePaths).toContain('/api/v1/ai/wearables/analyze');
    }, 10000);
  });
}); 