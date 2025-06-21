const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Billing = require('../models/Billing');
const { auditLog } = require('../utils/logger');
const encryptionService = require('../utils/encryption');
const { getCache, setCache } = require('../config/redis');

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
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Try to get from cache first
    let patient = await getCache(`patient:${userId}`);
    
    if (!patient) {
      patient = await User.findById(userId)
        .select('-password -passwordResetToken -emailVerificationToken')
        .populate('profile.department', 'name description');
      
      if (!patient) {
        return res.status(404).json({
          error: 'Patient not found',
          message: 'Patient profile not found'
        });
      }

      // Cache patient data for 15 minutes
      await setCache(`patient:${userId}`, patient, 900);
    }

    // Audit log
    auditLog('PROFILE_ACCESS', userId, 'PATIENT_PROFILE', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: {
        patient
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'An error occurred while retrieving your profile'
    });
  }
};

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
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.email;
    delete updateData.role;
    delete updateData.password;
    delete updateData.isActive;

    const patient = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedBy: userId },
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Patient profile not found'
      });
    }

    // Clear cache
    await setCache(`patient:${userId}`, patient, 900);

    // Audit log
    auditLog('PROFILE_UPDATE', userId, 'PATIENT_PROFILE', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        patient
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating your profile'
    });
  }
};

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
const getMedicalRecords = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, limit = 10, page = 1 } = req.query;

    const query = { patientId: userId, isActive: true };
    if (type) {
      query.recordType = type;
    }

    const skip = (page - 1) * limit;

    const records = await MedicalRecord.find(query)
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MedicalRecord.countDocuments(query);

    // Decrypt medical data
    const decryptedRecords = records.map(record => {
      const decryptedData = encryptionService.decryptObject(record.data);
      return {
        ...record.toObject(),
        data: decryptedData
      };
    });

    // Audit log
    auditLog('MEDICAL_RECORDS_ACCESS', userId, 'PATIENT_RECORDS', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      recordCount: records.length
    });

    res.status(200).json({
      success: true,
      data: {
        records: decryptedRecords,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      error: 'Failed to get medical records',
      message: 'An error occurred while retrieving your medical records'
    });
  }
};

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
const getAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, page = 1 } = req.query;

    const query = { patientId: userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    // Audit log
    auditLog('APPOINTMENTS_ACCESS', userId, 'PATIENT_APPOINTMENTS', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      appointmentCount: appointments.length
    });

    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      error: 'Failed to get appointments',
      message: 'An error occurred while retrieving your appointments'
    });
  }
};

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
const bookAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentData = {
      ...req.body,
      patientId: userId,
      createdBy: userId
    };

    // Check for conflicts
    const conflicts = await Appointment.findConflicting(
      appointmentData.doctorId,
      appointmentData.appointmentDate,
      appointmentData.appointmentTime,
      appointmentData.duration || 30
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'Appointment conflict',
        message: 'The selected time slot is not available. Please choose another time.',
        conflicts: conflicts.map(c => ({
          date: c.appointmentDate,
          time: c.appointmentTime,
          duration: c.duration
        }))
      });
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Populate doctor information
    await appointment.populate('doctorId', 'firstName lastName specialization');

    // Audit log
    auditLog('APPOINTMENT_BOOKED', userId, 'PATIENT_APPOINTMENT', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      appointmentId: appointment.appointmentId,
      doctorId: appointment.doctorId._id
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      error: 'Failed to book appointment',
      message: 'An error occurred while booking your appointment'
    });
  }
};

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
const updateAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: userId
    });

    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'Appointment not found or you do not have permission to modify it'
      });
    }

    // Check if appointment can be modified
    if (!appointment.canBeRescheduled()) {
      return res.status(400).json({
        error: 'Cannot modify appointment',
        message: 'This appointment cannot be modified. Please contact the hospital for assistance.'
      });
    }

    const updateData = req.body;
    updateData.updatedBy = userId;

    // Check for conflicts if date/time is being changed
    if (updateData.appointmentDate || updateData.appointmentTime) {
      const conflicts = await Appointment.findConflicting(
        appointment.doctorId,
        updateData.appointmentDate || appointment.appointmentDate,
        updateData.appointmentTime || appointment.appointmentTime,
        updateData.duration || appointment.duration,
        appointmentId
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          error: 'Appointment conflict',
          message: 'The selected time slot is not available. Please choose another time.'
        });
      }
    }

    Object.assign(appointment, updateData);
    await appointment.save();

    await appointment.populate('doctorId', 'firstName lastName specialization');

    // Audit log
    auditLog('APPOINTMENT_UPDATED', userId, 'PATIENT_APPOINTMENT', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      appointmentId: appointment.appointmentId
    });

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      error: 'Failed to update appointment',
      message: 'An error occurred while updating your appointment'
    });
  }
};

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
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    const { reason } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: userId
    });

    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'Appointment not found or you do not have permission to cancel it'
      });
    }

    // Check if appointment can be cancelled
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        error: 'Cannot cancel appointment',
        message: 'This appointment cannot be cancelled. Please contact the hospital for assistance.'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellation = {
      cancelledBy: userId,
      cancelledAt: new Date(),
      reason: reason || 'Cancelled by patient'
    };
    appointment.updatedBy = userId;

    await appointment.save();

    // Audit log
    auditLog('APPOINTMENT_CANCELLED', userId, 'PATIENT_APPOINTMENT', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      appointmentId: appointment.appointmentId,
      reason
    });

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      error: 'Failed to cancel appointment',
      message: 'An error occurred while cancelling your appointment'
    });
  }
};

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
const getPrescriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const prescriptions = await Prescription.find({ patientId: userId })
      .populate('doctorId', 'firstName lastName specialization')
      .populate('appointmentId', 'appointmentDate appointmentTime')
      .sort({ issuedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Prescription.countDocuments({ patientId: userId });

    // Audit log
    auditLog('PRESCRIPTIONS_ACCESS', userId, 'PATIENT_PRESCRIPTIONS', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      prescriptionCount: prescriptions.length
    });

    res.status(200).json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      error: 'Failed to get prescriptions',
      message: 'An error occurred while retrieving your prescriptions'
    });
  }
};

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
const getBilling = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, page = 1 } = req.query;

    const query = { patientId: userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bills = await Billing.find(query)
      .populate('appointmentId', 'appointmentDate appointmentTime type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Billing.countDocuments(query);

    // Calculate totals
    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidAmount = bills
      .filter(bill => bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    // Audit log
    auditLog('BILLING_ACCESS', userId, 'PATIENT_BILLING', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      billCount: bills.length
    });

    res.status(200).json({
      success: true,
      data: {
        bills,
        summary: {
          totalAmount,
          paidAmount,
          pendingAmount,
          totalBills: total
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get billing error:', error);
    res.status(500).json({
      error: 'Failed to get billing information',
      message: 'An error occurred while retrieving your billing information'
    });
  }
};

/**
 * @swagger
 * /api/v1/patients/notifications:
 *   get:
 *     summary: Get patient notifications
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of notifications to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *         description: Filter by severity level
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, page = 1, severity, isRead } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Patient not found'
      });
    }

    let notifications = user.notifications || [];

    // Filter by severity if provided
    if (severity) {
      notifications = notifications.filter(notification => notification.severity === severity);
    }

    // Filter by read status if provided
    if (isRead !== undefined) {
      const readStatus = isRead === 'true';
      notifications = notifications.filter(notification => notification.isRead === readStatus);
    }

    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedNotifications = notifications.slice(skip, skip + parseInt(limit));

    // Count unread notifications
    const unreadCount = notifications.filter(notification => !notification.isRead).length;

    // Audit log
    auditLog('NOTIFICATIONS_ACCESS', userId, 'PATIENT_NOTIFICATIONS', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      notificationCount: paginatedNotifications.length,
      unreadCount
    });

    res.status(200).json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        summary: {
          total: notifications.length,
          unread: unreadCount,
          read: notifications.length - unreadCount
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(notifications.length / limit),
          totalRecords: notifications.length,
          hasNextPage: page * limit < notifications.length,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to get notifications',
      message: 'An error occurred while retrieving notifications'
    });
  }
};

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
const createNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, message, vitalData, timestamp, severity, actionRequired } = req.body;

    // Validate required fields
    if (!type || !message || !severity) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Type, message, and severity are required'
      });
    }

    // Validate severity level
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        error: 'Invalid severity level',
        message: 'Severity must be one of: low, medium, high, critical'
      });
    }

    // Create notification object
    const notification = {
      patientId: userId,
      type,
      message,
      vitalData: vitalData || null,
      timestamp: timestamp || new Date().toISOString(),
      severity,
      actionRequired: actionRequired || false,
      isRead: false,
      createdAt: new Date(),
      createdBy: userId
    };

    // For now, we'll store notifications in the user's profile
    // In a production system, you might want a separate Notification model
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Patient not found'
      });
    }

    // Initialize notifications array if it doesn't exist
    if (!user.notifications) {
      user.notifications = [];
    }

    // Add notification to user's notifications array
    user.notifications.push(notification);

    // Keep only the last 50 notifications to prevent array from growing too large
    if (user.notifications.length > 50) {
      user.notifications = user.notifications.slice(-50);
    }

    await user.save();

    // Clear cache
    await setCache(`patient:${userId}`, null, 0);

    // Audit log
    auditLog('NOTIFICATION_CREATED', userId, 'PATIENT_NOTIFICATION', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      notificationType: type,
      severity,
      actionRequired
    });

    // For critical alerts, you might want to trigger additional actions
    if (severity === 'critical' && actionRequired) {
      // TODO: Implement critical alert actions like:
      // - Send SMS/email to emergency contacts
      // - Notify medical staff
      // - Create emergency appointment
      console.log('🚨 CRITICAL ALERT: Immediate action required for patient', userId);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notification
      }
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      error: 'Failed to create notification',
      message: 'An error occurred while creating the notification'
    });
  }
};

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
 *       404:
 *         description: Notification not found
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Patient not found'
      });
    }

    // Find the notification by its index in the array
    // Since we're storing notifications as an array in the user document,
    // we'll use the index as the ID for simplicity
    const notificationIndex = parseInt(notificationId);
    
    if (isNaN(notificationIndex) || notificationIndex < 0 || notificationIndex >= user.notifications.length) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'The specified notification was not found'
      });
    }

    // Mark notification as read
    user.notifications[notificationIndex].isRead = true;
    user.notifications[notificationIndex].readAt = new Date();

    await user.save();

    // Clear cache
    await setCache(`patient:${userId}`, null, 0);

    // Audit log
    auditLog('NOTIFICATION_READ', userId, 'PATIENT_NOTIFICATION', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      notificationIndex,
      notificationType: user.notifications[notificationIndex].type
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification: user.notifications[notificationIndex]
      }
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: 'An error occurred while marking the notification as read'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMedicalRecords,
  getAppointments,
  bookAppointment,
  updateAppointment,
  cancelAppointment,
  getPrescriptions,
  getBilling,
  getNotifications,
  createNotification,
  markNotificationAsRead
}; 