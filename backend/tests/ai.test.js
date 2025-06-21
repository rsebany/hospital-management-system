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
              content: 'Mock AI response for testing purposes'
            }
          }]
        })
      }
    }
  }));
});

describe('AI Endpoints', () => {
  // Simple test without database setup
  describe('GET /api/v1/ai/health', () => {
    it('should return AI service health status', async () => {
      const response = await request(app)
        .get('/api/v1/ai/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.services).toBeDefined();
    }, 10000);
  });

  describe('POST /api/v1/ai/symptoms/analyze', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/ai/symptoms/analyze')
        .send({
          symptoms: 'Headache, fever, and fatigue',
          patientAge: 35,
          gender: 'male'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/ai/symptoms/analyze')
        .send({
          symptoms: 'Headache'
          // Missing patientAge and gender
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for invalid age', async () => {
      const response = await request(app)
        .post('/api/v1/ai/symptoms/analyze')
        .send({
          symptoms: 'Headache',
          patientAge: -5,
          gender: 'male'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);

    it('should return 400 for invalid gender', async () => {
      const response = await request(app)
        .post('/api/v1/ai/symptoms/analyze')
        .send({
          symptoms: 'Headache',
          patientAge: 35,
          gender: 'invalid'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('POST /api/v1/ai/text/process', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/ai/text/process')
        .send({
          text: 'Some medical text',
          type: 'diagnosis'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for empty text', async () => {
      const response = await request(app)
        .post('/api/v1/ai/text/process')
        .send({
          text: '',
          type: 'general'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);

    it('should return 400 for invalid text type', async () => {
      const response = await request(app)
        .post('/api/v1/ai/text/process')
        .send({
          text: 'Some medical text',
          type: 'invalid_type'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('POST /api/v1/ai/appointments/assist', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/ai/appointments/assist')
        .send({
          appointmentType: 'Cardiology Consultation',
          patientInfo: { age: 45, gender: 'female' }
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for missing appointment type', async () => {
      const response = await request(app)
        .post('/api/v1/ai/appointments/assist')
        .send({
          patientInfo: { age: 45, gender: 'female' }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('POST /api/v1/ai/records/analyze', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/ai/records/analyze')
        .send({
          records: [{ date: '2024-01-15', type: 'appointment' }],
          analysisType: 'general'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for empty records array', async () => {
      const response = await request(app)
        .post('/api/v1/ai/records/analyze')
        .send({
          records: [],
          analysisType: 'general'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('POST /api/v1/ai/reports/summary', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/ai/reports/summary')
        .send({
          reportData: { patientName: 'John Doe' },
          reportType: 'patient_summary'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for invalid report type', async () => {
      const response = await request(app)
        .post('/api/v1/ai/reports/summary')
        .send({
          reportData: { someData: 'value' },
          reportType: 'invalid_type'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('POST /api/v1/ai/medications/info', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/ai/medications/info')
        .send({
          medicationName: 'Lisinopril',
          patientMedications: ['Amlodipine']
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for empty medication name', async () => {
      const response = await request(app)
        .post('/api/v1/ai/medications/info')
        .send({
          medicationName: '',
          patientMedications: ['Amlodipine']
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('POST /api/v1/ai/wellness/recommendations', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/ai/wellness/recommendations')
        .send({
          patientProfile: { age: 40, gender: 'male' },
          healthGoals: ['Weight management']
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for missing patient profile', async () => {
      const response = await request(app)
        .post('/api/v1/ai/wellness/recommendations')
        .send({
          healthGoals: ['Weight management']
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('POST /api/v1/ai/emergency/triage', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/ai/emergency/triage')
        .send({
          symptoms: 'Chest pain',
          patientAge: 55,
          gender: 'male'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    }, 10000);

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/ai/emergency/triage')
        .send({
          symptoms: 'Chest pain'
          // Missing patientAge and gender
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('Route validation', () => {
    it('should have all required AI routes defined', () => {
      const routes = app._router.stack
        .filter(layer => layer.route)
        .map(layer => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        }))
        .filter(route => route.path.includes('/ai'));

      expect(routes.length).toBeGreaterThan(0);
      
      const routePaths = routes.map(route => route.path);
      expect(routePaths).toContain('/api/v1/ai/health');
      expect(routePaths).toContain('/api/v1/ai/symptoms/analyze');
      expect(routePaths).toContain('/api/v1/ai/text/process');
      expect(routePaths).toContain('/api/v1/ai/appointments/assist');
      expect(routePaths).toContain('/api/v1/ai/records/analyze');
      expect(routePaths).toContain('/api/v1/ai/reports/summary');
      expect(routePaths).toContain('/api/v1/ai/medications/info');
      expect(routePaths).toContain('/api/v1/ai/wellness/recommendations');
      expect(routePaths).toContain('/api/v1/ai/emergency/triage');
    }, 10000);
  });
}); 