const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Custom validation functions
const isStrongPassword = (value) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(value)) {
    throw new Error('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character');
  }
  return true;
};

const isValidPhoneNumber = (value) => {
  if (!value) return true; // Optional field
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('Please enter a valid phone number');
  }
  return true;
};

const isValidDateOfBirth = (value) => {
  if (!value) return true; // Optional field
  const date = new Date(value);
  const today = new Date();
  if (date >= today) {
    throw new Error('Date of birth cannot be in the future');
  }
  const age = today.getFullYear() - date.getFullYear();
  if (age > 120) {
    throw new Error('Please enter a valid date of birth');
  }
  return true;
};

const isUniqueEmail = async (value) => {
  if (!value) return true;
  const user = await User.findOne({ email: value.toLowerCase() });
  if (user) {
    throw new Error('Email is already registered');
  }
  return true;
};

// Generic validation request handler
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const validateRoleSpecificFields = (role) => {
  return async (req, res, next) => {
    const { profile } = req.body;
    
    if (role === 'doctor') {
      if (!profile?.licenseNumber) {
        return res.status(400).json({
          error: 'Missing required field',
          message: 'License number is required for doctors'
        });
      }
      if (!profile?.specialization || profile.specialization.length === 0) {
        return res.status(400).json({
          error: 'Missing required field',
          message: 'At least one specialization is required for doctors'
        });
      }
    }
    
    next();
  };
};

// Validation rules
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
    .custom(isUniqueEmail),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom(isStrongPassword),
  
  body('role')
    .isIn(['patient', 'doctor', 'admin', 'nurse'])
    .withMessage('Role must be patient, doctor, admin, or nurse'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phoneNumber')
    .optional()
    .custom(isValidPhoneNumber),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date')
    .custom(isValidDateOfBirth),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be male, female, other, or prefer_not_to_say'),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  
  body('address.zipCode')
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please enter a valid ZIP code'),
  
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters'),
  
  body('emergencyContact.phone')
    .optional()
    .custom(isValidPhoneNumber),
  
  body('emergencyContact.email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address for emergency contact'),
  
  // Role-specific validations
  body('profile.licenseNumber')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('License number is required for doctors')
    .isLength({ min: 5, max: 20 })
    .withMessage('License number must be between 5 and 20 characters'),
  
  body('profile.specialization')
    .if(body('role').equals('doctor'))
    .isArray({ min: 1 })
    .withMessage('At least one specialization is required for doctors'),
  
  body('profile.specialization.*')
    .if(body('role').equals('doctor'))
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Specialization must be between 2 and 50 characters'),
  
  body('profile.insuranceInfo.provider')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Insurance provider cannot exceed 100 characters'),
  
  body('profile.insuranceInfo.policyNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Policy number cannot exceed 50 characters'),
  
  body('profile.insuranceInfo.expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid expiry date'),
  
  // Validation result handler
  validateRequest
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('otp')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  
  validateRequest
];

const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom(isStrongPassword),
  
  validateRequest
];

const validateAppointment = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  
  body('doctorId')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please enter a valid appointment date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  
  body('appointmentTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please enter a valid time in HH:MM format'),
  
  body('type')
    .isIn(['consultation', 'follow_up', 'emergency', 'surgery', 'telemedicine', 'checkup', 'vaccination'])
    .withMessage('Invalid appointment type'),
  
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  
  body('duration')
    .optional()
    .isInt({ min: 15, max: 240 })
    .withMessage('Duration must be between 15 and 240 minutes'),
  
  validateRequest
];

const validateMedicalRecord = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  
  body('recordType')
    .isIn(['visit', 'lab', 'imaging', 'prescription', 'allergy', 'immunization', 'surgery', 'note'])
    .withMessage('Invalid record type'),
  
  body('data')
    .isObject()
    .withMessage('Medical data must be an object'),
  
  validateRequest
];

const validatePrescription = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  
  body('medications')
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  
  body('medications.*.name')
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  
  body('medications.*.dosage')
    .trim()
    .notEmpty()
    .withMessage('Medication dosage is required'),
  
  body('medications.*.frequency')
    .trim()
    .notEmpty()
    .withMessage('Medication frequency is required'),
  
  body('medications.*.duration')
    .trim()
    .notEmpty()
    .withMessage('Medication duration is required'),
  
  validateRequest
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phoneNumber')
    .optional()
    .custom(isValidPhoneNumber),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date')
    .custom(isValidDateOfBirth),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be male, female, other, or prefer_not_to_say'),
  
  validateRequest
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateAppointment,
  validateMedicalRecord,
  validatePrescription,
  validateUserUpdate,
  validateRoleSpecificFields,
  validateRequest
}; 