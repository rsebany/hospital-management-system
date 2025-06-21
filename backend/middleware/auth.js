const jwt = require('jsonwebtoken');
const { getCache, setCache } = require('../config/redis');
const { auditLog, securityLog } = require('../utils/logger');
const User = require('../models/User');

/**
 * Verify JWT token and attach user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔍 AuthMiddleware - JWT_SECRET present:', !!process.env.JWT_SECRET);
    console.log('🔍 AuthMiddleware - JWT_SECRET value:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'undefined');

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    console.log('🔍 AuthMiddleware - Token received:', token.substring(0, 20) + '...');

    // Check if token is blacklisted
    const isBlacklisted = await getCache(`blacklist:${token}`);
    if (isBlacklisted) {
      securityLog('BLACKLISTED_TOKEN_ACCESS', {
        token: token.substring(0, 20) + '...',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token has been revoked'
      });
    }

    // Verify token
    console.log('🔍 AuthMiddleware - Attempting to verify token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 AuthMiddleware - Token verified successfully, userId:', decoded.userId);
    
    // Get user from cache or database
    let user = await getCache(`user:${decoded.userId}`);
    
    if (!user) {
      console.log('🔍 AuthMiddleware - User not in cache, fetching from database...');
      user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        console.log('🔍 AuthMiddleware - User not found in database');
        return res.status(401).json({
          error: 'Access denied',
          message: 'User not found'
        });
      }
      // Cache user for 15 minutes
      await setCache(`user:${decoded.userId}`, user, 900);
      console.log('🔍 AuthMiddleware - User cached');
    } else {
      console.log('🔍 AuthMiddleware - User found in cache');
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Account is deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    console.log('🔍 AuthMiddleware - Authentication successful for user:', user.email);

    // Audit log
    auditLog('AUTHENTICATION', user._id, 'API_ACCESS', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method
    });

    next();
  } catch (error) {
    console.error('🔍 AuthMiddleware - Authentication error:', error);
    console.error('🔍 AuthMiddleware - Error name:', error.name);
    console.error('🔍 AuthMiddleware - Error message:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }

    securityLog('AUTHENTICATION_ERROR', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error'
    });
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      securityLog('UNAUTHORIZED_ACCESS', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      return res.status(403).json({
        error: 'Access forbidden',
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Specific role authorization middleware
 */
const authorizePatient = authorize('patient');
const authorizeDoctor = authorize('doctor');
const authorizeAdmin = authorize('admin');
const authorizeStaff = authorize('doctor', 'admin', 'nurse');

/**
 * Resource ownership middleware (for patients accessing their own data)
 */
const authorizeOwnResource = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin' || req.user.role === 'doctor') {
        return next(); // Admins and doctors can access all resources
      }

      const resourceId = req.params[resourceIdField];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          error: 'Resource not found',
          message: 'The requested resource does not exist'
        });
      }

      // Check if the resource belongs to the authenticated user
      if (resource.patientId?.toString() !== req.user._id.toString() && 
          resource.userId?.toString() !== req.user._id.toString()) {
        
        securityLog('UNAUTHORIZED_RESOURCE_ACCESS', {
          userId: req.user._id,
          resourceId: resourceId,
          resourceType: resourceModel.modelName,
          endpoint: req.originalUrl,
          method: req.method
        });

        return res.status(403).json({
          error: 'Access forbidden',
          message: 'You can only access your own resources'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Authorization error',
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Doctor-patient relationship authorization
 */
const authorizeDoctorPatient = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(); // Admins can access all data
    }

    const patientId = req.params.patientId || req.body.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        error: 'Missing patient ID',
        message: 'Patient ID is required'
      });
    }

    // Check if doctor has access to this patient
    if (req.user.role === 'doctor') {
      const hasAccess = await checkDoctorPatientAccess(req.user._id, patientId);
      
      if (!hasAccess) {
        securityLog('UNAUTHORIZED_PATIENT_ACCESS', {
          doctorId: req.user._id,
          patientId: patientId,
          endpoint: req.originalUrl,
          method: req.method
        });

        return res.status(403).json({
          error: 'Access forbidden',
          message: 'You do not have access to this patient\'s data'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Authorization error',
      message: 'Internal server error'
    });
  }
};

/**
 * Check if doctor has access to patient data
 */
const checkDoctorPatientAccess = async (doctorId, patientId) => {
  // This would typically check against appointments, department assignments, etc.
  // For now, we'll implement a basic check
  const Appointment = require('../models/Appointment');
  
  const appointment = await Appointment.findOne({
    doctorId: doctorId,
    patientId: patientId,
    status: { $in: ['scheduled', 'completed'] }
  });

  return !!appointment;
};

/**
 * Optional authentication middleware
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  authorize,
  authorizePatient,
  authorizeDoctor,
  authorizeAdmin,
  authorizeStaff,
  authorizeOwnResource,
  authorizeDoctorPatient,
  optionalAuth
}; 