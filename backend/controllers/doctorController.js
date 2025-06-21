const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Department = require('../models/Department');
const { auditLog } = require('../utils/logger');
const encryptionService = require('../utils/encryption');
const { getCache, setCache } = require('../config/redis');

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
const getSchedule = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { date, startDate, endDate } = req.query;

    let query = { doctorId, status: { $in: ['scheduled', 'confirmed'] } };

    if (date) {
      const targetDate = new Date(date);
      query.appointmentDate = {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      };
    } else if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to today and next 7 days
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      query.appointmentDate = {
        $gte: today,
        $lte: nextWeek
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName email phoneNumber profile.patientId')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    // Group appointments by date
    const scheduleByDate = appointments.reduce((acc, appointment) => {
      const dateKey = appointment.appointmentDate.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(appointment);
      return acc;
    }, {});

    // Audit log
    auditLog('SCHEDULE_ACCESS', doctorId, 'DOCTOR_SCHEDULE', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      appointmentCount: appointments.length
    });

    res.status(200).json({
      success: true,
      data: {
        schedule: scheduleByDate,
        totalAppointments: appointments.length,
        dateRange: {
          startDate: startDate || new Date().toISOString().split('T')[0],
          endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }
    });

  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      error: 'Failed to get schedule',
      message: 'An error occurred while retrieving your schedule'
    });
  }
};

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
const getPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    // Get unique patients who have appointments with this doctor
    const appointments = await Appointment.find({ doctorId })
      .distinct('patientId');

    const patients = await User.find({
      _id: { $in: appointments },
      role: 'patient',
      isActive: true
    })
    .select('firstName lastName email phoneNumber profile.patientId dateOfBirth gender')
    .sort({ firstName: 1, lastName: 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Appointment.find({ doctorId }).distinct('patientId').countDocuments();

    // Audit log
    auditLog('PATIENTS_ACCESS', doctorId, 'DOCTOR_PATIENTS', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      patientCount: patients.length
    });

    res.status(200).json({
      success: true,
      data: {
        patients,
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
    console.error('Get patients error:', error);
    res.status(500).json({
      error: 'Failed to get patients',
      message: 'An error occurred while retrieving your patients'
    });
  }
};

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
const getPatientDetails = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.id;

    // Check if doctor has access to this patient
    const hasAccess = await Appointment.findOne({
      doctorId,
      patientId,
      status: { $in: ['scheduled', 'confirmed', 'completed'] }
    });

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this patient\'s information'
      });
    }

    const patient = await User.findById(patientId)
      .select('-password -passwordResetToken -emailVerificationToken')
      .populate('profile.department', 'name description');

    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'Patient not found'
      });
    }

    // Get patient's medical records
    const medicalRecords = await MedicalRecord.find({
      patientId,
      isActive: true
    })
    .populate('doctorId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);

    // Decrypt medical data
    const decryptedRecords = medicalRecords.map(record => {
      const decryptedData = encryptionService.decryptObject(record.data);
      return {
        ...record.toObject(),
        data: decryptedData
      };
    });

    // Get recent appointments
    const recentAppointments = await Appointment.find({
      patientId,
      doctorId
    })
    .sort({ appointmentDate: -1 })
    .limit(5);

    // Get recent prescriptions
    const recentPrescriptions = await Prescription.find({
      patientId,
      doctorId
    })
    .sort({ issuedAt: -1 })
    .limit(5);

    // Audit log
    auditLog('PATIENT_DETAILS_ACCESS', doctorId, 'DOCTOR_PATIENT_DETAILS', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      patientId
    });

    res.status(200).json({
      success: true,
      data: {
        patient,
        medicalRecords: decryptedRecords,
        recentAppointments,
        recentPrescriptions
      }
    });

  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      error: 'Failed to get patient details',
      message: 'An error occurred while retrieving patient details'
    });
  }
};

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
const getPatientRecords = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.id;
    const { type, limit = 10, page = 1 } = req.query;

    // Check if doctor has access to this patient
    const hasAccess = await Appointment.findOne({
      doctorId,
      patientId,
      status: { $in: ['scheduled', 'confirmed', 'completed'] }
    });

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this patient\'s records'
      });
    }

    const query = { patientId, isActive: true };
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
    auditLog('PATIENT_RECORDS_ACCESS', doctorId, 'DOCTOR_PATIENT_RECORDS', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      patientId,
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
    console.error('Get patient records error:', error);
    res.status(500).json({
      error: 'Failed to get patient records',
      message: 'An error occurred while retrieving patient records'
    });
  }
};

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
const addMedicalRecord = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.id;
    const { recordType, data } = req.body;

    // Check if doctor has access to this patient
    const hasAccess = await Appointment.findOne({
      doctorId,
      patientId,
      status: { $in: ['scheduled', 'confirmed', 'completed'] }
    });

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this patient\'s records'
      });
    }

    // Encrypt medical data
    const encryptedData = encryptionService.encryptObject(data);

    const medicalRecord = new MedicalRecord({
      patientId,
      doctorId,
      recordType,
      data: encryptedData,
      createdBy: doctorId
    });

    await medicalRecord.save();

    // Audit log
    auditLog('MEDICAL_RECORD_CREATED', doctorId, 'DOCTOR_MEDICAL_RECORD', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      patientId,
      recordType
    });

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: {
        medicalRecord: {
          ...medicalRecord.toObject(),
          data: data // Return decrypted data in response
        }
      }
    });

  } catch (error) {
    console.error('Add medical record error:', error);
    res.status(500).json({
      error: 'Failed to add medical record',
      message: 'An error occurred while adding the medical record'
    });
  }
};

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
const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId, appointmentId, medications, notes } = req.body;

    // Check if doctor has access to this patient
    const hasAccess = await Appointment.findOne({
      doctorId,
      patientId,
      status: { $in: ['scheduled', 'confirmed', 'completed'] }
    });

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this patient'
      });
    }

    const prescription = new Prescription({
      patientId,
      doctorId,
      appointmentId,
      medications,
      notes,
      issuedAt: new Date()
    });

    await prescription.save();

    // Populate patient and appointment information
    await prescription.populate('patientId', 'firstName lastName email');
    await prescription.populate('appointmentId', 'appointmentDate appointmentTime');

    // Audit log
    auditLog('PRESCRIPTION_CREATED', doctorId, 'DOCTOR_PRESCRIPTION', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      patientId,
      appointmentId,
      medicationCount: medications.length
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        prescription
      }
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      error: 'Failed to create prescription',
      message: 'An error occurred while creating the prescription'
    });
  }
};

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
const updateAppointmentStatus = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const appointmentId = req.params.id;
    const { status, notes, diagnosis, treatment } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId
    });

    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'Appointment not found or you do not have permission to modify it'
      });
    }

    // Update appointment
    appointment.status = status;
    appointment.notes = { ...appointment.notes, doctor: notes };
    appointment.diagnosis = diagnosis;
    appointment.treatment = treatment;
    appointment.updatedBy = doctorId;

    await appointment.save();

    await appointment.populate('patientId', 'firstName lastName email phoneNumber');

    // Audit log
    auditLog('APPOINTMENT_STATUS_UPDATED', doctorId, 'DOCTOR_APPOINTMENT', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      appointmentId: appointment.appointmentId,
      status,
      patientId: appointment.patientId._id
    });

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      error: 'Failed to update appointment status',
      message: 'An error occurred while updating the appointment status'
    });
  }
};

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
const getProfile = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Try to get from cache first
    let doctor = await getCache(`doctor:${doctorId}`);
    
    if (!doctor) {
      doctor = await User.findById(doctorId)
        .select('-password -passwordResetToken -emailVerificationToken')
        .populate('profile.department', 'name description');
      
      if (!doctor) {
        return res.status(404).json({
          error: 'Doctor not found',
          message: 'Doctor profile not found'
        });
      }

      // Cache doctor data for 15 minutes
      await setCache(`doctor:${doctorId}`, doctor, 900);
    }

    // Audit log
    auditLog('PROFILE_ACCESS', doctorId, 'DOCTOR_PROFILE', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: {
        doctor
      }
    });

  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'An error occurred while retrieving your profile'
    });
  }
};

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
const updateProfile = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.email;
    delete updateData.role;
    delete updateData.password;
    delete updateData.isActive;

    const doctor = await User.findByIdAndUpdate(
      doctorId,
      { ...updateData, updatedBy: doctorId },
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'Doctor profile not found'
      });
    }

    // Clear cache
    await setCache(`doctor:${doctorId}`, doctor, 900);

    // Audit log
    auditLog('PROFILE_UPDATE', doctorId, 'DOCTOR_PROFILE', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        doctor
      }
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating your profile'
    });
  }
};

module.exports = {
  getSchedule,
  getPatients,
  getPatientDetails,
  getPatientRecords,
  addMedicalRecord,
  createPrescription,
  updateAppointmentStatus,
  getProfile,
  updateProfile
}; 