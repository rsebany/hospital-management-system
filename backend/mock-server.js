const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Mock Hospital Management System API is running'
  });
});

// Mock AI symptoms analysis endpoint
app.post('/api/v1/ai/symptoms/analyze', (req, res) => {
  console.log('Received symptoms analysis request:', req.body);
  
  const { symptoms, patientAge, gender, medicalHistory } = req.body;
  
  // Mock AI analysis
  const analysis = {
    success: true,
    analysis: {
      possibleConditions: [
        {
          condition: 'Common Cold',
          probability: 0.7,
          symptoms: ['Fever', 'Cough', 'Sore Throat', 'Fatigue'],
          severity: 'Mild',
          recommendations: [
            'Rest and stay hydrated',
            'Take over-the-counter fever reducers',
            'Monitor symptoms for 3-5 days',
            'Seek medical attention if symptoms worsen'
          ]
        },
        {
          condition: 'Seasonal Flu',
          probability: 0.6,
          symptoms: ['High Fever', 'Body Aches', 'Fatigue', 'Cough'],
          severity: 'Moderate',
          recommendations: [
            'Rest in bed',
            'Stay hydrated',
            'Take acetaminophen for fever',
            'Consider antiviral medication if diagnosed early',
            'Monitor for complications'
          ]
        },
        {
          condition: 'COVID-19',
          probability: 0.4,
          symptoms: ['Fever', 'Cough', 'Fatigue', 'Body Aches'],
          severity: 'Moderate to Severe',
          recommendations: [
            'Get tested for COVID-19',
            'Isolate from others',
            'Monitor oxygen levels',
            'Seek emergency care if breathing difficulties',
            'Follow local health guidelines'
          ]
        }
      ],
      riskLevel: 'Medium',
      urgentCare: false,
      emergencyCare: false,
      followUp: 'Schedule appointment with primary care physician within 3-5 days',
      disclaimer: 'This analysis is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.',
      timestamp: new Date().toISOString()
    }
  };
  
  // Simulate processing delay
  setTimeout(() => {
    res.json(analysis);
  }, 1000);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Mock Hospital Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      aiSymptoms: '/api/v1/ai/symptoms/analyze'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock Hospital Management System API running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Symptoms: http://localhost:${PORT}/api/v1/ai/symptoms/analyze`);
});

module.exports = app; 