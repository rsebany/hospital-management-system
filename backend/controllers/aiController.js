const aiService = require('../services/aiService');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const WearableData = require('../models/WearableData');
const Appointment = require('../models/Appointment');

class AIController {
  /**
   * @swagger
   * /api/v1/ai/symptoms/analyze:
   *   post:
   *     summary: Analyze patient symptoms
   *     tags: [AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - symptoms
   *               - patientAge
   *               - gender
   *             properties:
   *               symptoms:
   *                 type: string
   *                 description: Patient symptoms description
   *               patientAge:
   *                 type: number
   *                 description: Patient age
   *               gender:
   *                 type: string
   *                 enum: [male, female, other]
   *                 description: Patient gender
   *               medicalHistory:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Previous medical conditions
   *     responses:
   *       200:
   *         description: Symptom analysis completed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     analysis:
   *                       type: string
   *                     timestamp:
   *                       type: string
   *                     disclaimer:
   *                       type: string
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  async analyzeSymptoms(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { symptoms, patientAge, gender, medicalHistory = [] } = req.body;

      // Validate required fields
      if (!symptoms || !patientAge || !gender) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: symptoms, patientAge, gender'
        });
      }

      // Validate age
      if (patientAge < 0 || patientAge > 150) {
        return res.status(400).json({
          success: false,
          error: 'Invalid age value'
        });
      }

      // Validate gender
      const validGenders = ['male', 'female', 'other'];
      if (!validGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid gender value'
        });
      }

      const result = await aiService.analyzeSymptoms(symptoms, patientAge, gender, medicalHistory);

      logger.auditLog('AI_SYMPTOM_ANALYSIS', req.user?._id || 'anonymous', 'symptom_analysis', {
        patientAge,
        gender,
        symptomsLength: symptoms.length,
        hasMedicalHistory: medicalHistory.length > 0
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in symptom analysis controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze symptoms',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/v1/ai/text/process:
   *   post:
   *     summary: Process and summarize medical text
   *     tags: [AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - text
   *             properties:
   *               text:
   *                 type: string
   *                 description: Medical text to process
   *               type:
   *                 type: string
   *                 enum: [general, lab_results, prescription, diagnosis, notes]
   *                 description: Type of medical text
   *     responses:
   *       200:
   *         description: Text processing completed
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  async processMedicalText(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { text, type = 'general' } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Text content is required'
        });
      }

      const result = await aiService.processMedicalText(text, type);

      logger.auditLog('AI_TEXT_PROCESSING', req.user?._id || 'anonymous', 'text_processing', {
        textType: type,
        textLength: text.length
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in medical text processing controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process medical text',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/v1/ai/appointments/assist:
   *   post:
   *     summary: Get appointment scheduling assistance
   *     tags: [AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - appointmentType
   *               - patientInfo
   *             properties:
   *               appointmentType:
   *                 type: string
   *                 description: Type of appointment
   *               patientInfo:
   *                 type: object
   *                 description: Patient information
   *               symptoms:
   *                 type: string
   *                 description: Patient symptoms
   *     responses:
   *       200:
   *         description: Appointment assistance provided
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  async assistAppointmentScheduling(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { appointmentType, patientInfo, symptoms = '' } = req.body;

      if (!appointmentType || !patientInfo) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: appointmentType, patientInfo'
        });
      }

      const result = await aiService.assistAppointmentScheduling(appointmentType, patientInfo, symptoms);

      logger.auditLog('AI_APPOINTMENT_ASSISTANCE', req.user?._id || 'anonymous', 'appointment_assistance', {
        appointmentType,
        hasSymptoms: symptoms.length > 0
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in appointment assistance controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to provide appointment assistance',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/v1/ai/records/analyze:
   *   post:
   *     summary: Analyze medical records for patterns and insights
   *     tags: [AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - records
   *             properties:
   *               records:
   *                 type: array
   *                 items:
   *                   type: object
   *                 description: Medical records to analyze
   *               analysisType:
   *                 type: string
   *                 enum: [general, medication, lab_results, appointments]
   *                 description: Type of analysis to perform
   *     responses:
   *       200:
   *         description: Medical records analysis completed
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  async analyzeMedicalRecords(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { records, analysisType = 'general' } = req.body;

      if (!records || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Records array is required and must not be empty'
        });
      }

      const result = await aiService.analyzeMedicalRecords(records, analysisType);

      logger.auditLog('AI_RECORD_ANALYSIS', req.user?._id || 'anonymous', 'record_analysis', {
        analysisType,
        recordCount: records.length
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in medical records analysis controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze medical records',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/v1/ai/reports/summary:
   *   post:
   *     summary: Generate medical report summaries
   *     tags: [AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - reportData
   *               - reportType
   *             properties:
   *               reportData:
   *                 type: object
   *                 description: Report data to summarize
   *               reportType:
   *                 type: string
   *                 enum: [patient_summary, lab_report, appointment_summary, billing_report]
   *                 description: Type of report
   *     responses:
   *       200:
   *         description: Report summary generated
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  async generateReportSummary(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { reportData, reportType } = req.body;

      if (!reportData || !reportType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: reportData, reportType'
        });
      }

      const result = await aiService.generateReportSummary(reportData, reportType);

      logger.auditLog('AI_REPORT_SUMMARY', req.user?._id || 'anonymous', 'report_summary', {
        reportType
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in report summary generation controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate report summary',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/v1/ai/medications/info:
   *   post:
   *     summary: Get medication information and interactions
   *     tags: [AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - medicationName
   *             properties:
   *               medicationName:
   *                 type: string
   *                 description: Name of the medication
   *               patientMedications:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Current patient medications
   *     responses:
   *       200:
   *         description: Medication information retrieved
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  async getMedicationInfo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { medicationName, patientMedications = [] } = req.body;

      if (!medicationName || medicationName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Medication name is required'
        });
      }

      const result = await aiService.getMedicationInfo(medicationName, patientMedications);

      logger.auditLog('AI_MEDICATION_INFO', req.user?._id || 'anonymous', 'medication_info', {
        medicationName,
        currentMedicationsCount: patientMedications.length
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in medication info controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve medication information',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/v1/ai/wellness/recommendations:
   *   post:
   *     summary: Get personalized wellness recommendations
   *     tags: [AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - patientProfile
   *             properties:
   *               patientProfile:
   *                 type: object
   *                 description: Patient profile information
   *               healthGoals:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Patient health goals
   *     responses:
   *       200:
   *         description: Wellness recommendations provided
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  async getWellnessRecommendations(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { patientProfile, healthGoals = [] } = req.body;

      if (!patientProfile) {
        return res.status(400).json({
          success: false,
          error: 'Patient profile is required'
        });
      }

      const result = await aiService.getWellnessRecommendations(patientProfile, healthGoals);

      logger.auditLog('AI_WELLNESS_RECOMMENDATIONS', req.user?._id || 'anonymous', 'wellness_recommendations', {
        healthGoalsCount: healthGoals.length
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in wellness recommendations controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate wellness recommendations',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/v1/ai/emergency/triage:
   *   post:
   *     summary: Emergency triage assistance
   *     tags: [AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - symptoms
   *               - patientAge
   *               - gender
   *             properties:
   *               symptoms:
   *                 type: string
   *                 description: Patient symptoms
   *               vitalSigns:
   *                 type: object
   *                 description: Patient vital signs
   *               patientAge:
   *                 type: number
   *                 description: Patient age
   *               gender:
   *                 type: string
   *                 enum: [male, female, other]
   *                 description: Patient gender
   *     responses:
   *       200:
   *         description: Triage assessment completed
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  async emergencyTriage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { symptoms, vitalSigns = {}, patientAge, gender } = req.body;

      if (!symptoms || !patientAge || !gender) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: symptoms, patientAge, gender'
        });
      }

      const result = await aiService.emergencyTriage(symptoms, vitalSigns, patientAge, gender);

      logger.auditLog('AI_EMERGENCY_TRIAGE', req.user?._id || 'anonymous', 'emergency_triage', {
        patientAge,
        gender,
        hasVitalSigns: Object.keys(vitalSigns).length > 0
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in emergency triage controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform triage assessment',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/v1/ai/health:
   *   get:
   *     summary: AI service health check
   *     tags: [AI]
   *     responses:
   *       200:
   *         description: AI service is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 timestamp:
   *                   type: string
   *                 services:
   *                   type: object
   */
  async healthCheck(req, res) {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
          aiService: 'operational'
        }
      };

      res.status(200).json({
        success: true,
        data: healthStatus
      });
    } catch (error) {
      logger.error('Error in AI health check:', error);
      res.status(500).json({
        success: false,
        error: 'AI service health check failed',
        message: error.message
      });
    }
  }

  /**
   * AI-powered appointment slot suggestion
   * POST /api/v1/ai/appointments/suggest
   */
  async suggestAppointmentSlots(req, res) {
    try {
      const { patientId, doctorId, preferredDates, timeRange, constraints = {} } = req.body;
      // Fetch doctor and patient schedules (stubbed for now)
      // In production, fetch from DB: appointments, doctor availability, hospital load, etc.
      const doctorSchedule = []; // TODO: fetch from DB
      const patientSchedule = []; // TODO: fetch from DB
      const hospitalLoad = []; // TODO: fetch from DB

      const aiResult = await aiService.suggestAppointmentSlots({
        patientId,
        doctorId,
        preferredDates,
        timeRange,
        constraints,
        doctorSchedule,
        patientSchedule,
        hospitalLoad
      });

      res.status(200).json({
        success: true,
        suggestions: aiResult.suggestions
      });
    } catch (error) {
      logger.error('Error in AI appointment slot suggestion:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to suggest appointment slots',
        message: error.message
      });
    }
  }

  /**
   * AI-powered analysis of wearable data
   * POST /api/v1/ai/wearables/analyze
   */
  async analyzeWearableData(req, res) {
    try {
      const { patientId, startDate, endDate } = req.body;
      const query = { patientId };
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
      const wearableData = await WearableData.find(query).sort({ timestamp: 1 });
      if (!wearableData.length) {
        return res.status(404).json({ success: false, error: 'No wearable data found for analysis.' });
      }
      const aiResult = await aiService.analyzeWearableData(wearableData);
      res.status(200).json({ success: true, analysis: aiResult.analysis });
    } catch (error) {
      logger.error('Error in AI wearable data analysis:', error);
      res.status(500).json({ success: false, error: 'Failed to analyze wearable data', message: error.message });
    }
  }

  /**
   * AI-powered patient flow predictions
   * POST /api/v1/ai/patient-flow/predict
   */
  async predictPatientFlow(req, res) {
    try {
      const { forecastType, timeRange, department, confidenceLevel = 0.95 } = req.body;
      
      // Fetch historical data (stubbed for now)
      // In production, fetch from DB: appointments, admissions, discharges, etc.
      const historicalData = {
        admissions: [], // TODO: fetch from DB
        discharges: [], // TODO: fetch from DB
        appointments: [], // TODO: fetch from DB
        bedOccupancy: [] // TODO: fetch from DB
      };

      const aiResult = await aiService.predictPatientFlow({
        forecastType,
        timeRange,
        department,
        confidenceLevel,
        historicalData
      });

      res.status(200).json({
        success: true,
        predictions: aiResult.predictions,
        summary: aiResult.summary
      });
    } catch (error) {
      logger.error('Error in AI patient flow prediction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to predict patient flow',
        message: error.message
      });
    }
  }
}

module.exports = new AIController(); 