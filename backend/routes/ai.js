const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { body } = require('express-validator');

// Validation schemas
const symptomAnalysisValidation = [
  body('symptoms').isString().notEmpty().withMessage('Symptoms are required'),
  body('patientAge').isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('medicalHistory').optional().isArray().withMessage('Medical history must be an array')
];

const textProcessingValidation = [
  body('text').isString().notEmpty().withMessage('Text content is required'),
  body('type').optional().isIn(['general', 'lab_results', 'prescription', 'diagnosis', 'notes']).withMessage('Invalid text type')
];

const appointmentAssistanceValidation = [
  body('appointmentType').isString().notEmpty().withMessage('Appointment type is required'),
  body('patientInfo').isObject().withMessage('Patient info is required'),
  body('symptoms').optional().isString().withMessage('Symptoms must be a string')
];

const recordAnalysisValidation = [
  body('records').isArray({ min: 1 }).withMessage('Records array is required and must not be empty'),
  body('analysisType').optional().isIn(['general', 'medication', 'lab_results', 'appointments']).withMessage('Invalid analysis type')
];

const reportSummaryValidation = [
  body('reportData').isObject().withMessage('Report data is required'),
  body('reportType').isIn(['patient_summary', 'lab_report', 'appointment_summary', 'billing_report']).withMessage('Valid report type is required')
];

const medicationInfoValidation = [
  body('medicationName').isString().notEmpty().withMessage('Medication name is required'),
  body('patientMedications').optional().isArray().withMessage('Patient medications must be an array')
];

const wellnessRecommendationsValidation = [
  body('patientProfile').isObject().withMessage('Patient profile is required'),
  body('healthGoals').optional().isArray().withMessage('Health goals must be an array')
];

const emergencyTriageValidation = [
  body('symptoms').isString().notEmpty().withMessage('Symptoms are required'),
  body('vitalSigns').optional().isObject().withMessage('Vital signs must be an object'),
  body('patientAge').isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required')
];

const vitalRecordsValidation = [
  body('records').isArray({ min: 1 }).withMessage('Records array is required and must not be empty'),
  body('records.*.timestamp').isISO8601().withMessage('Valid timestamp is required for each record'),
  body('records.*.heartRate').isFloat({ min: 0, max: 300 }).withMessage('Valid heart rate is required'),
  body('records.*.temperature').isFloat({ min: 30, max: 45 }).withMessage('Valid temperature is required'),
  body('records.*.oxygenLevel').isFloat({ min: 0, max: 100 }).withMessage('Valid oxygen level is required'),
  body('analysisType').optional().isIn(['general', 'trend', 'alert', 'comprehensive']).withMessage('Invalid analysis type')
];

const wellnessRecommendationsFromVitalsValidation = [
  body('records').isArray({ min: 1 }).withMessage('Records array is required and must not be empty'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('activityLevel').optional().isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']).withMessage('Invalid activity level'),
  body('healthGoals').optional().isArray().withMessage('Health goals must be an array'),
  body('currentHealth').optional().isArray().withMessage('Current health must be an array'),
  body('lifestyle').optional().isArray().withMessage('Lifestyle must be an array')
];

// Health check endpoint (no authentication required)
router.get('/health', aiController.healthCheck);

// Symptom analysis
router.post('/symptoms/analyze', 
  authenticateToken, 
  symptomAnalysisValidation, 
  validateRequest, 
  aiController.analyzeSymptoms
);

// Medical text processing
router.post('/text/process', 
  authenticateToken, 
  textProcessingValidation, 
  validateRequest, 
  aiController.processMedicalText
);

// Appointment scheduling assistance
router.post('/appointments/assist', 
  authenticateToken, 
  appointmentAssistanceValidation, 
  validateRequest, 
  aiController.assistAppointmentScheduling
);

// Medical records analysis
router.post('/records/analyze', 
  authenticateToken, 
  vitalRecordsValidation, 
  validateRequest, 
  aiController.analyzeVitalRecords
);

// Medical records analysis (legacy endpoint)
router.post('/medical-records/analyze', 
  authenticateToken, 
  recordAnalysisValidation, 
  validateRequest, 
  aiController.analyzeMedicalRecords
);

// Report summary generation
router.post('/reports/summary', 
  authenticateToken, 
  reportSummaryValidation, 
  validateRequest, 
  aiController.generateReportSummary
);

// Medication information
router.post('/medications/info', 
  authenticateToken, 
  medicationInfoValidation, 
  validateRequest, 
  aiController.getMedicationInfo
);

// Wellness recommendations (general)
router.post('/wellness/recommendations', 
  authenticateToken, 
  wellnessRecommendationsValidation, 
  validateRequest, 
  aiController.getWellnessRecommendations
);

// Wellness recommendations from vital data
router.post('/wellness/recommendations/vitals', 
  authenticateToken, 
  wellnessRecommendationsFromVitalsValidation, 
  validateRequest, 
  aiController.getWellnessRecommendationsFromVitals
);

// Emergency triage
router.post('/emergency/triage', 
  authenticateToken, 
  emergencyTriageValidation, 
  validateRequest, 
  aiController.emergencyTriage
);

// AI-powered wearable data analysis
router.post('/wearables/analyze',
  authenticateToken,
  [
    body('patientId').isString().notEmpty().withMessage('Patient ID is required'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
  ],
  validateRequest,
  aiController.analyzeWearableData
);

// AI-powered patient flow predictions
router.post('/patient-flow/predict',
  authenticateToken,
  [
    body('forecastType').isIn(['admissions', 'discharges', 'bed_occupancy', 'staffing']).withMessage('Valid forecast type is required'),
    body('timeRange.startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    body('timeRange.endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    body('department').optional().isString().withMessage('Department must be a string'),
    body('confidenceLevel').optional().isFloat({ min: 0.5, max: 1.0 }).withMessage('Confidence level must be between 0.5 and 1.0')
  ],
  validateRequest,
  aiController.predictPatientFlow
);

module.exports = router; 