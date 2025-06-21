const express = require('express');
const router = express.Router();
const publicController = require('../../controllers/publicController');
const { validateRegistration } = require('../../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Public
 *   description: Public endpoints (no authentication required)
 */

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
router.get('/info', publicController.getHospitalInfo);

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
router.get('/departments', publicController.getDepartments);

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
router.get('/departments/:id', publicController.getDepartmentDetails);

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
router.get('/doctors', publicController.getDoctors);

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
router.get('/doctors/:id', publicController.getDoctorDetails);

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
router.post('/register', validateRegistration, publicController.registerPatient);

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
router.post('/contact', publicController.submitContactForm);

/**
 * @swagger
 * /api/v1/public/services:
 *   get:
 *     summary: Get hospital services
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 */
router.get('/services', (req, res) => {
  const services = [
    {
      name: 'General Medicine',
      description: 'Primary healthcare services for all ages',
      icon: '🏥',
      features: ['Health Check-ups', 'Chronic Disease Management', 'Preventive Care']
    },
    {
      name: 'Cardiology',
      description: 'Specialized heart and cardiovascular care',
      icon: '❤️',
      features: ['Heart Disease Treatment', 'ECG Testing', 'Cardiac Surgery']
    },
    {
      name: 'Orthopedics',
      description: 'Bone, joint, and musculoskeletal care',
      icon: '🦴',
      features: ['Joint Replacement', 'Sports Medicine', 'Fracture Treatment']
    },
    {
      name: 'Pediatrics',
      description: 'Specialized care for children and infants',
      icon: '👶',
      features: ['Child Health Care', 'Vaccinations', 'Growth Monitoring']
    },
    {
      name: 'Emergency Medicine',
      description: '24/7 emergency and trauma care',
      icon: '🚨',
      features: ['Trauma Care', 'Emergency Surgery', 'Critical Care']
    },
    {
      name: 'Telemedicine',
      description: 'Remote healthcare consultations',
      icon: '💻',
      features: ['Video Consultations', 'Remote Monitoring', 'Digital Prescriptions']
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      services
    }
  });
});

/**
 * @swagger
 * /api/v1/public/insurance:
 *   get:
 *     summary: Get accepted insurance providers
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Insurance providers retrieved successfully
 */
router.get('/insurance', (req, res) => {
  const insuranceProviders = [
    {
      name: 'Blue Cross Blue Shield',
      type: 'Private',
      accepted: true
    },
    {
      name: 'Aetna',
      type: 'Private',
      accepted: true
    },
    {
      name: 'Cigna',
      type: 'Private',
      accepted: true
    },
    {
      name: 'UnitedHealth Group',
      type: 'Private',
      accepted: true
    },
    {
      name: 'Medicare',
      type: 'Government',
      accepted: true
    },
    {
      name: 'Medicaid',
      type: 'Government',
      accepted: true
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      insuranceProviders
    }
  });
});

/**
 * @swagger
 * /api/v1/public/faq:
 *   get:
 *     summary: Get frequently asked questions
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: FAQ retrieved successfully
 */
router.get('/faq', (req, res) => {
  const faq = [
    {
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment through our online portal, by calling our appointment line, or by visiting our hospital in person.'
    },
    {
      question: 'What documents do I need to bring?',
      answer: 'Please bring your ID, insurance card, list of current medications, and any relevant medical records or test results.'
    },
    {
      question: 'Do you accept walk-ins?',
      answer: 'We accept walk-ins for emergency care, but appointments are recommended for routine visits to ensure timely service.'
    },
    {
      question: 'What are your operating hours?',
      answer: 'Our main clinic is open Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 4:00 PM. Emergency services are available 24/7.'
    },
    {
      question: 'How do I access my medical records?',
      answer: 'You can access your medical records through our patient portal or by requesting them from our medical records department.'
    },
    {
      question: 'Do you offer telemedicine services?',
      answer: 'Yes, we offer telemedicine consultations for many types of appointments. You can schedule a virtual visit through our online portal.'
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      faq
    }
  });
});

/**
 * @swagger
 * /api/v1/public/emergency:
 *   get:
 *     summary: Get emergency contact information
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Emergency information retrieved successfully
 */
router.get('/emergency', (req, res) => {
  const emergencyInfo = {
    emergencyNumber: process.env.HOSPITAL_EMERGENCY || '+1-555-911-0000',
    ambulanceNumber: process.env.AMBULANCE_NUMBER || '+1-555-911-0001',
    policeNumber: '+1-555-911-0002',
    fireNumber: '+1-555-911-0003',
    poisonControl: '+1-800-222-1222',
    address: {
      street: process.env.HOSPITAL_ADDRESS_STREET || '123 Healthcare Ave',
      city: process.env.HOSPITAL_ADDRESS_CITY || 'Medical City',
      state: process.env.HOSPITAL_ADDRESS_STATE || 'Health State',
      zipCode: process.env.HOSPITAL_ADDRESS_ZIP || '12345'
    },
    instructions: [
      'Call 911 for life-threatening emergencies',
      'Call our emergency number for medical emergencies',
      'Do not drive yourself if you are experiencing severe symptoms',
      'Bring a list of current medications if possible'
    ]
  };

  res.status(200).json({
    success: true,
    data: emergencyInfo
  });
});

module.exports = router; 