const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),

  // Daily rotate file transport for all logs
  new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
    level: 'info'
  }),

  // Error log file
  new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: fileFormat,
    level: 'error'
  }),

  // HIPAA Audit log file
  new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '2555d', // 7 years retention for HIPAA
    format: fileFormat,
    level: 'info'
  })
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false
});

// HIPAA-compliant audit logging
const auditLog = (action, userId, resource, details = {}) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    resource,
    details,
    ipAddress: details.ipAddress || 'unknown',
    userAgent: details.userAgent || 'unknown',
    sessionId: details.sessionId || 'unknown'
  };

  logger.info('AUDIT_LOG', auditEntry);
};

// Security event logging
const securityLog = (event, details = {}) => {
  const securityEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity: details.severity || 'medium'
  };

  logger.warn('SECURITY_EVENT', securityEntry);
};

// Performance logging
const performanceLog = (operation, duration, details = {}) => {
  const perfEntry = {
    timestamp: new Date().toISOString(),
    operation,
    duration,
    details
  };

  logger.info('PERFORMANCE', perfEntry);
};

// Database operation logging
const dbLog = (operation, collection, duration, details = {}) => {
  const dbEntry = {
    timestamp: new Date().toISOString(),
    operation,
    collection,
    duration,
    details
  };

  logger.debug('DATABASE', dbEntry);
};

// API request logging
const apiLog = (method, url, statusCode, duration, userId = null) => {
  const apiEntry = {
    timestamp: new Date().toISOString(),
    method,
    url,
    statusCode,
    duration,
    userId
  };

  logger.http('API_REQUEST', apiEntry);
};

// Error logging with context
const errorLog = (error, context = {}) => {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context
  };

  logger.error('ERROR', errorEntry);
};

// Export the logger and utility functions
module.exports = {
  logger,
  auditLog,
  securityLog,
  performanceLog,
  dbLog,
  apiLog,
  errorLog
}; 