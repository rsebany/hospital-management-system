const { auditLog: logAudit } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * HIPAA-compliant audit logging middleware
 * Tracks all user actions and data access for compliance
 */
const auditLog = (req, res, next) => {
  // Generate unique request ID
  req.id = uuidv4();
  
  // Capture request start time
  req.startTime = Date.now();

  // Store original send method
  const originalSend = res.send;

  // Override send method to capture response
  res.send = function(data) {
    // Calculate request duration
    const duration = Date.now() - req.startTime;
    
    // Capture response data
    let responseData = data;
    try {
      if (typeof data === 'string') {
        responseData = JSON.parse(data);
      }
    } catch (e) {
      // If not JSON, use as is
      responseData = data;
    }

    // Create audit entry
    const auditEntry = {
      requestId: req.id,
      timestamp: new Date().toISOString(),
      userId: req.user?._id || 'anonymous',
      userRole: req.user?.role || 'anonymous',
      action: req.method,
      resource: req.originalUrl,
      statusCode: res.statusCode,
      duration: duration,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      requestBody: sanitizeRequestBody(req.body),
      requestParams: sanitizeRequestParams(req.params),
      requestQuery: sanitizeRequestQuery(req.query),
      responseSize: JSON.stringify(responseData).length,
      success: res.statusCode < 400
    };

    // Log the audit entry
    logAudit('API_ACCESS', req.user?._id || 'anonymous', req.originalUrl, auditEntry);

    // Call original send method
    originalSend.call(this, data);
  };

  next();
};

/**
 * Sanitize request body for audit logging
 * Remove sensitive information like passwords, tokens, etc.
 */
const sanitizeRequestBody = (body) => {
  if (!body) return null;

  const sanitized = { ...body };
  const sensitiveFields = [
    'password',
    'confirmPassword',
    'oldPassword',
    'newPassword',
    'token',
    'refreshToken',
    'accessToken',
    'authorization',
    'secret',
    'key',
    'apiKey',
    'privateKey',
    'creditCard',
    'cardNumber',
    'cvv',
    'ssn',
    'socialSecurityNumber',
    'medicalRecord',
    'diagnosis',
    'treatment',
    'prescription'
  ];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Sanitize request parameters for audit logging
 */
const sanitizeRequestParams = (params) => {
  if (!params) return null;
  return params;
};

/**
 * Sanitize request query for audit logging
 */
const sanitizeRequestQuery = (query) => {
  if (!query) return null;
  
  const sanitized = { ...query };
  const sensitiveFields = ['token', 'key', 'secret', 'password'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Specific audit logging for medical record access
 */
const auditMedicalRecordAccess = (action, recordId, details = {}) => {
  return (req, res, next) => {
    const auditEntry = {
      requestId: req.id,
      timestamp: new Date().toISOString(),
      userId: req.user?._id,
      userRole: req.user?.role,
      action: action,
      resource: `medical-record:${recordId}`,
      recordId: recordId,
      details: details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    logAudit('MEDICAL_RECORD_ACCESS', req.user?._id, `medical-record:${recordId}`, auditEntry);
    next();
  };
};

/**
 * Specific audit logging for patient data access
 */
const auditPatientDataAccess = (action, patientId, details = {}) => {
  return (req, res, next) => {
    const auditEntry = {
      requestId: req.id,
      timestamp: new Date().toISOString(),
      userId: req.user?._id,
      userRole: req.user?.role,
      action: action,
      resource: `patient:${patientId}`,
      patientId: patientId,
      details: details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    logAudit('PATIENT_DATA_ACCESS', req.user?._id, `patient:${patientId}`, auditEntry);
    next();
  };
};

/**
 * Specific audit logging for prescription access
 */
const auditPrescriptionAccess = (action, prescriptionId, details = {}) => {
  return (req, res, next) => {
    const auditEntry = {
      requestId: req.id,
      timestamp: new Date().toISOString(),
      userId: req.user?._id,
      userRole: req.user?.role,
      action: action,
      resource: `prescription:${prescriptionId}`,
      prescriptionId: prescriptionId,
      details: details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    logAudit('PRESCRIPTION_ACCESS', req.user?._id, `prescription:${prescriptionId}`, auditEntry);
    next();
  };
};

/**
 * Specific audit logging for appointment access
 */
const auditAppointmentAccess = (action, appointmentId, details = {}) => {
  return (req, res, next) => {
    const auditEntry = {
      requestId: req.id,
      timestamp: new Date().toISOString(),
      userId: req.user?._id,
      userRole: req.user?.role,
      action: action,
      resource: `appointment:${appointmentId}`,
      appointmentId: appointmentId,
      details: details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    logAudit('APPOINTMENT_ACCESS', req.user?._id, `appointment:${appointmentId}`, auditEntry);
    next();
  };
};

/**
 * Specific audit logging for billing access
 */
const auditBillingAccess = (action, billingId, details = {}) => {
  return (req, res, next) => {
    const auditEntry = {
      requestId: req.id,
      timestamp: new Date().toISOString(),
      userId: req.user?._id,
      userRole: req.user?.role,
      action: action,
      resource: `billing:${billingId}`,
      billingId: billingId,
      details: details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    logAudit('BILLING_ACCESS', req.user?._id, `billing:${billingId}`, auditEntry);
    next();
  };
};

/**
 * Specific audit logging for system configuration changes
 */
const auditSystemConfigChange = (action, configKey, details = {}) => {
  return (req, res, next) => {
    const auditEntry = {
      requestId: req.id,
      timestamp: new Date().toISOString(),
      userId: req.user?._id,
      userRole: req.user?.role,
      action: action,
      resource: `system-config:${configKey}`,
      configKey: configKey,
      details: details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    logAudit('SYSTEM_CONFIG_CHANGE', req.user?._id, `system-config:${configKey}`, auditEntry);
    next();
  };
};

/**
 * Specific audit logging for user management
 */
const auditUserManagement = (action, targetUserId, details = {}) => {
  return (req, res, next) => {
    const auditEntry = {
      requestId: req.id,
      timestamp: new Date().toISOString(),
      userId: req.user?._id,
      userRole: req.user?.role,
      action: action,
      resource: `user:${targetUserId}`,
      targetUserId: targetUserId,
      details: details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    logAudit('USER_MANAGEMENT', req.user?._id, `user:${targetUserId}`, auditEntry);
    next();
  };
};

module.exports = {
  auditLog,
  auditMedicalRecordAccess,
  auditPatientDataAccess,
  auditPrescriptionAccess,
  auditAppointmentAccess,
  auditBillingAccess,
  auditSystemConfigChange,
  auditUserManagement,
  sanitizeRequestBody,
  sanitizeRequestParams,
  sanitizeRequestQuery
}; 