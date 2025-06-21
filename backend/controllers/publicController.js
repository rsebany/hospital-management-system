const Department = require('../models/Department');
const User = require('../models/User');
const { auditLog } = require('../utils/logger');
const { getCache, setCache } = require('../config/redis');

/**
 * @swagger
 * /api/v1/public/info:
 *   get:
 *     summary: Get hospital information
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Hospital information retrieved successfully
 */
const getHospitalInfo = async (req, res) => {
  try {
    // Try to get from cache first
    let hospitalInfo = await getCache('public:hospital-info');
    
    if (!hospitalInfo) {
      // Get hospital statistics
      const [
        totalDoctors,
        totalDepartments,
        totalPatients,
        totalAppointments
      ] = await Promise.all([
        User.countDocuments({ role: 'doctor', isActive: true }),
        Department.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'patient', isActive: true }),
        require('../models/Appointment').countDocuments({ status: 'completed' })
      ]);

      hospitalInfo = {
        name: process.env.HOSPITAL_NAME || 'Hospital Management System',
        description: process.env.HOSPITAL_DESCRIPTION || 'A comprehensive healthcare management system',
        address: {
          street: process.env.HOSPITAL_ADDRESS_STREET || '123 Healthcare Ave',
          city: process.env.HOSPITAL_ADDRESS_CITY || 'Medical City',
          state: process.env.HOSPITAL_ADDRESS_STATE || 'Health State',
          zipCode: process.env.HOSPITAL_ADDRESS_ZIP || '12345',
          country: process.env.HOSPITAL_ADDRESS_COUNTRY || 'USA'
        },
        contact: {
          phone: process.env.HOSPITAL_PHONE || '+1-555-123-4567',
          email: process.env.HOSPITAL_EMAIL || 'info@hospital.com',
          emergency: process.env.HOSPITAL_EMERGENCY || '+1-555-911-0000'
        },
        hours: {
          monday: '8:00 AM - 6:00 PM',
          tuesday: '8:00 AM - 6:00 PM',
          wednesday: '8:00 AM - 6:00 PM',
          thursday: '8:00 AM - 6:00 PM',
          friday: '8:00 AM - 6:00 PM',
          saturday: '9:00 AM - 4:00 PM',
          sunday: 'Emergency Only'
        },
        statistics: {
          totalDoctors,
          totalDepartments,
          totalPatients,
          totalAppointments
        },
        services: [
          'General Medicine',
          'Cardiology',
          'Orthopedics',
          'Pediatrics',
          'Emergency Care',
          'Surgery',
          'Radiology',
          'Laboratory Services',
          'Pharmacy',
          'Telemedicine'
        ],
        features: [
          'Online Appointment Booking',
          'Electronic Health Records',
          'Telemedicine Consultations',
          '24/7 Emergency Services',
          'Multi-specialty Care',
          'Advanced Medical Equipment',
          'HIPAA Compliant',
          'Insurance Accepted'
        ]
      };

      // Cache hospital info for 1 hour
      await setCache('public:hospital-info', hospitalInfo, 3600);
    }

    res.status(200).json({
      success: true,
      data: hospitalInfo
    });

  } catch (error) {
    console.error('Get hospital info error:', error);
    res.status(500).json({
      error: 'Failed to get hospital information',
      message: 'An error occurred while retrieving hospital information'
    });
  }
};

/**
 * @swagger
 * /api/v1/public/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of departments to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 */
const getDepartments = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const departments = await Department.find({ isActive: true })
      .populate('head', 'firstName lastName specialization')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Department.countDocuments({ isActive: true });

    // Get staff count for each department
    const departmentsWithStaff = await Promise.all(
      departments.map(async (dept) => {
        const staffCount = await User.countDocuments({
          'profile.department': dept._id,
          isActive: true
        });
        return {
          ...dept.toObject(),
          staffCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        departments: departmentsWithStaff,
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
    console.error('Get departments error:', error);
    res.status(500).json({
      error: 'Failed to get departments',
      message: 'An error occurred while retrieving departments'
    });
  }
};

/**
 * @swagger
 * /api/v1/public/departments/:id:
 *   get:
 *     summary: Get specific department details
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department details retrieved successfully
 *       404:
 *         description: Department not found
 */
const getDepartmentDetails = async (req, res) => {
  try {
    const departmentId = req.params.id;

    const department = await Department.findById(departmentId)
      .populate('head', 'firstName lastName specialization email phoneNumber');

    if (!department || !department.isActive) {
      return res.status(404).json({
        error: 'Department not found',
        message: 'Department not found or inactive'
      });
    }

    // Get department staff
    const staff = await User.find({
      'profile.department': departmentId,
      isActive: true
    })
    .select('firstName lastName specialization profile.licenseNumber')
    .sort({ firstName: 1, lastName: 1 });

    // Get department services
    const services = getDepartmentServices(department.name);

    res.status(200).json({
      success: true,
      data: {
        department,
        staff,
        services
      }
    });

  } catch (error) {
    console.error('Get department details error:', error);
    res.status(500).json({
      error: 'Failed to get department details',
      message: 'An error occurred while retrieving department details'
    });
  }
};

/**
 * @swagger
 * /api/v1/public/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of doctors to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 */
const getDoctors = async (req, res) => {
  try {
    const { department, specialization, limit = 10, page = 1 } = req.query;

    const query = { role: 'doctor', isActive: true };
    
    if (department) {
      query['profile.department'] = department;
    }
    
    if (specialization) {
      query['profile.specialization'] = { $in: [specialization] };
    }

    const skip = (page - 1) * limit;

    const doctors = await User.find(query)
      .select('firstName lastName email phoneNumber profile.specialization profile.department profile.licenseNumber')
      .populate('profile.department', 'name description')
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        doctors,
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
    console.error('Get doctors error:', error);
    res.status(500).json({
      error: 'Failed to get doctors',
      message: 'An error occurred while retrieving doctors'
    });
  }
};

/**
 * @swagger
 * /api/v1/public/doctors/:id:
 *   get:
 *     summary: Get specific doctor details
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor details retrieved successfully
 *       404:
 *         description: Doctor not found
 */
const getDoctorDetails = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const doctor = await User.findById(doctorId)
      .select('firstName lastName email phoneNumber profile.specialization profile.department profile.licenseNumber profile.experience profile.education profile.bio')
      .populate('profile.department', 'name description');

    if (!doctor || doctor.role !== 'doctor' || !doctor.isActive) {
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'Doctor not found or inactive'
      });
    }

    // Get doctor's availability (simplified)
    const availability = {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '10:00 AM - 2:00 PM',
      sunday: 'Not Available'
    };

    res.status(200).json({
      success: true,
      data: {
        doctor,
        availability
      }
    });

  } catch (error) {
    console.error('Get doctor details error:', error);
    res.status(500).json({
      error: 'Failed to get doctor details',
      message: 'An error occurred while retrieving doctor details'
    });
  }
};

/**
 * @swagger
 * /api/v1/public/register:
 *   post:
 *     summary: Public patient registration
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer_not_to_say]
 *               address:
 *                 type: object
 *               emergencyContact:
 *                 type: object
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
const registerPatient = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Create patient object
    const patientData = {
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: 'patient',
      phoneNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      emergencyContact,
      profile: {
        patientId: await generatePatientId()
      },
      isEmailVerified: false // Will be verified via email
    };

    // Create user
    const user = new User(patientData);
    await user.save();

    // Generate email verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Send verification email
    const emailService = require('../services/emailService');
    await emailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Hospital Management System',
      template: 'emailVerification',
      data: {
        name: user.firstName,
        verificationToken,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
      }
    });

    // Send welcome SMS if phone number provided
    if (user.phoneNumber) {
      await emailService.sendEmail({
        to: user.phoneNumber,
        subject: 'Welcome to Hospital Management System! Your account has been created successfully. Please verify your email to activate your account.',
        template: 'welcomeSMS',
        data: {
          name: user.firstName,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
        }
      });
    }

    // Audit log
    auditLog('PUBLIC_REGISTRATION', user._id, 'PUBLIC_REGISTRATION', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Return success response (without sensitive data)
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully. Please check your email to verify your account.',
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Public registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
};

/**
 * @swagger
 * /api/v1/public/contact:
 *   post:
 *     summary: Send contact form
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact form submitted successfully
 */
const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    // Send email to admin
    const emailService = require('../services/emailService');
    await emailService.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@hospital.com',
      subject: `Contact Form: ${subject}`,
      template: 'contactForm',
      data: {
        name,
        email,
        subject,
        message,
        phone,
        timestamp: new Date().toISOString()
      }
    });

    // Send confirmation email to user
    await emailService.sendEmail({
      to: email,
      subject: 'Thank you for contacting us',
      template: 'contactConfirmation',
      data: {
        name,
        subject
      }
    });

    // Audit log
    auditLog('CONTACT_FORM', null, 'PUBLIC_CONTACT', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      email,
      subject
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to submit contact form',
      message: 'An error occurred while submitting your message'
    });
  }
};

// Helper functions
const generatePatientId = async () => {
  const count = await User.countDocuments({ role: 'patient' });
  return `P${String(count + 1).padStart(6, '0')}`;
};

const getDepartmentServices = (departmentName) => {
  const services = {
    'Cardiology': [
      'Heart Disease Treatment',
      'ECG/EKG Testing',
      'Echocardiography',
      'Cardiac Catheterization',
      'Heart Surgery',
      'Cardiac Rehabilitation'
    ],
    'Orthopedics': [
      'Joint Replacement',
      'Sports Medicine',
      'Fracture Treatment',
      'Spine Surgery',
      'Arthroscopy',
      'Physical Therapy'
    ],
    'Pediatrics': [
      'Child Health Care',
      'Vaccinations',
      'Growth Monitoring',
      'Child Development',
      'Pediatric Surgery',
      'Emergency Pediatric Care'
    ],
    'Emergency Medicine': [
      'Trauma Care',
      'Emergency Surgery',
      'Critical Care',
      'Ambulance Services',
      'Emergency Diagnostics',
      '24/7 Emergency Care'
    ],
    'General Medicine': [
      'Primary Care',
      'Health Check-ups',
      'Chronic Disease Management',
      'Preventive Care',
      'Health Counseling',
      'Referral Services'
    ]
  };

  return services[departmentName] || [
    'General Consultation',
    'Diagnostic Services',
    'Treatment Planning',
    'Follow-up Care'
  ];
};

module.exports = {
  getHospitalInfo,
  getDepartments,
  getDepartmentDetails,
  getDoctors,
  getDoctorDetails,
  registerPatient,
  submitContactForm
}; 