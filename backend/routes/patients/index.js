const express = require('express');
const router = express.Router();
const patientController = require('../../controllers/patientController');
const { authenticateToken, authorizePatient } = require('../../middleware/auth');
const { validateAppointment, validateUserUpdate } = require('../../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient-specific endpoints
 */

/**
 * @swagger
 * /api/v1/patients/me:
 *   get:
 *     summary: Get current patient profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateToken, authorizePatient, patientController.getProfile);

/**
 * @swagger
 * /api/v1/patients/me:
 *   put:
 *     summary: Update current patient profile
 *     tags: [Patients]
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
 *               address:
 *                 type: object
 *               emergencyContact:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/me', authenticateToken, authorizePatient, validateUserUpdate, patientController.updateProfile);

/**
 * @swagger
 * /api/v1/patients/me/records:
 *   get:
 *     summary: Get patient medical records
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
router.get('/me/records', authenticateToken, authorizePatient, patientController.getMedicalRecords);

/**
 * @swagger
 * /api/v1/patients/appointments:
 *   get:
 *     summary: Get patient appointments
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by appointment status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of appointments to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 */
router.get('/appointments', authenticateToken, authorizePatient, patientController.getAppointments);

/**
 * @swagger
 * /api/v1/patients/appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - appointmentDate
 *               - appointmentTime
 *               - type
 *               - reason
 *             properties:
 *               doctorId:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *               appointmentTime:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [consultation, follow_up, emergency, surgery, telemedicine]
 *               reason:
 *                 type: string
 *               duration:
 *                 type: number
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Validation error or conflict
 */
router.post('/appointments', authenticateToken, authorizePatient, validateAppointment, patientController.bookAppointment);

/**
 * @swagger
 * /api/v1/patients/appointments/:id:
 *   put:
 *     summary: Update appointment
 *     tags: [Patients]
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
 *             properties:
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *               appointmentTime:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 */
router.put('/appointments/:id', authenticateToken, authorizePatient, validateAppointment, patientController.updateAppointment);

/**
 * @swagger
 * /api/v1/patients/appointments/:id:
 *   delete:
 *     summary: Cancel appointment
 *     tags: [Patients]
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
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       404:
 *         description: Appointment not found
 */
router.delete('/appointments/:id', authenticateToken, authorizePatient, patientController.cancelAppointment);

/**
 * @swagger
 * /api/v1/patients/prescriptions:
 *   get:
 *     summary: Get patient prescriptions
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of prescriptions to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Prescriptions retrieved successfully
 */
router.get('/prescriptions', authenticateToken, authorizePatient, patientController.getPrescriptions);

/**
 * @swagger
 * /api/v1/patients/billing:
 *   get:
 *     summary: Get patient billing information
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of bills to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Billing information retrieved successfully
 */
router.get('/billing', authenticateToken, authorizePatient, patientController.getBilling);

/**
 * @swagger
 * /api/v1/patients/notifications:
 *   get:
 *     summary: Get patient notifications
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/notifications', authenticateToken, authorizePatient, patientController.getNotifications);

/**
 * @swagger
 * /api/v1/patients/notifications:
 *   post:
 *     summary: Create patient notification (for smart clothing alerts)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - message
 *               - severity
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of notification (e.g., smart_clothing_critical)
 *               message:
 *                 type: string
 *                 description: Notification message
 *               vitalData:
 *                 type: object
 *                 description: Vital signs data from smart clothing
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: When the alert was generated
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Alert severity level
 *               actionRequired:
 *                 type: boolean
 *                 description: Whether immediate action is required
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/notifications', authenticateToken, authorizePatient, patientController.createNotification);

/**
 * @swagger
 * /api/v1/patients/notifications/:id/read:
 *   post:
 *     summary: Mark notification as read
 *     tags: [Patients]
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
 *         description: Notification marked as read
 */
router.post('/notifications/:id/read', authenticateToken, authorizePatient, patientController.markNotificationAsRead);

module.exports = router; 