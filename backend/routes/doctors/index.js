const express = require('express');
const router = express.Router();
const doctorController = require('../../controllers/doctorController');
const { authenticateToken, authorizeDoctor } = require('../../middleware/auth');
const { validateMedicalRecord, validatePrescription, validateUserUpdate } = require('../../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor-specific endpoints
 */

/**
 * @swagger
 * /api/v1/doctors/schedule:
 *   get:
 *     summary: Get doctor's schedule
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for range
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully
 */
router.get('/schedule', authenticateToken, authorizeDoctor, doctorController.getSchedule);

/**
 * @swagger
 * /api/v1/doctors/patients:
 *   get:
 *     summary: Get doctor's patients
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of patients to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 */
router.get('/patients', authenticateToken, authorizeDoctor, doctorController.getPatients);

/**
 * @swagger
 * /api/v1/doctors/patients/:id:
 *   get:
 *     summary: Get specific patient details
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient details retrieved successfully
 *       404:
 *         description: Patient not found
 */
router.get('/patients/:id', authenticateToken, authorizeDoctor, doctorController.getPatientDetails);

/**
 * @swagger
 * /api/v1/doctors/patients/:id/records:
 *   get:
 *     summary: Get patient's medical records
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by record type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Medical records retrieved successfully
 */
router.get('/patients/:id/records', authenticateToken, authorizeDoctor, doctorController.getPatientRecords);

/**
 * @swagger
 * /api/v1/doctors/patients/:id/records:
 *   post:
 *     summary: Add medical record for patient
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recordType
 *               - data
 *             properties:
 *               recordType:
 *                 type: string
 *                 enum: [visit, lab, imaging, prescription, allergy, immunization, surgery, note]
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Medical record created successfully
 */
router.post('/patients/:id/records', authenticateToken, authorizeDoctor, validateMedicalRecord, doctorController.addMedicalRecord);

/**
 * @swagger
 * /api/v1/doctors/prescriptions:
 *   post:
 *     summary: Create prescription for patient
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - medications
 *             properties:
 *               patientId:
 *                 type: string
 *               appointmentId:
 *                 type: string
 *               medications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     duration:
 *                       type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prescription created successfully
 */
router.post('/prescriptions', authenticateToken, authorizeDoctor, validatePrescription, doctorController.createPrescription);

/**
 * @swagger
 * /api/v1/doctors/appointments/:id:
 *   put:
 *     summary: Update appointment status
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, in_progress, completed, cancelled]
 *               notes:
 *                 type: string
 *               diagnosis:
 *                 type: object
 *               treatment:
 *                 type: object
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 */
router.put('/appointments/:id', authenticateToken, authorizeDoctor, doctorController.updateAppointmentStatus);

/**
 * @swagger
 * /api/v1/doctors/profile:
 *   get:
 *     summary: Get doctor's profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 */
router.get('/profile', authenticateToken, authorizeDoctor, doctorController.getProfile);

/**
 * @swagger
 * /api/v1/doctors/profile:
 *   put:
 *     summary: Update doctor's profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               profile:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', authenticateToken, authorizeDoctor, validateUserUpdate, doctorController.updateProfile);

/**
 * @swagger
 * /api/v1/doctors/availability:
 *   get:
 *     summary: Get doctor's availability
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability retrieved successfully
 */
router.get('/availability', authenticateToken, authorizeDoctor, (req, res) => {
  // TODO: Implement availability endpoint
  res.status(501).json({
    error: 'Not implemented',
    message: 'Availability endpoint will be implemented soon'
  });
});

/**
 * @swagger
 * /api/v1/doctors/availability:
 *   put:
 *     summary: Update doctor's availability
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedule:
 *                 type: object
 *     responses:
 *       200:
 *         description: Availability updated successfully
 */
router.put('/availability', authenticateToken, authorizeDoctor, (req, res) => {
  // TODO: Implement update availability endpoint
  res.status(501).json({
    error: 'Not implemented',
    message: 'Update availability endpoint will be implemented soon'
  });
});

/**
 * @swagger
 * /api/v1/doctors/telemedicine:
 *   post:
 *     summary: Start telemedicine session
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Telemedicine session started successfully
 */
router.post('/telemedicine', authenticateToken, authorizeDoctor, (req, res) => {
  // TODO: Implement telemedicine endpoint
  res.status(501).json({
    error: 'Not implemented',
    message: 'Telemedicine endpoint will be implemented soon'
  });
});

module.exports = router; 