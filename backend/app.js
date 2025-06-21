const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { auditLog: auditMiddleware } = require('./middleware/auditLog');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const appointmentRoutes = require('./routes/appointments');
const medicalRecordRoutes = require('./routes/medicalRecords');
const pharmacyRoutes = require('./routes/pharmacy');
const telemedicineRoutes = require('./routes/telemedicine');
const billingRoutes = require('./routes/billing');
const aiRoutes = require('./routes/ai');
const voiceRoutes = require('./routes/voice');
const wearableRoutes = require('./routes/wearables');
const blockchainRoutes = require('./routes/blockchain');

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Management System API',
      version: '1.0.0',
      description: 'A comprehensive Hospital Management System API with role-based authentication, HIPAA compliance, and advanced features',
      contact: {
        name: 'API Support',
        email: 'support@hospital.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['patient', 'doctor', 'admin', 'nurse'] },
            isActive: { type: 'boolean' },
            isEmailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            appointmentId: { type: 'string' },
            patientId: { type: 'string' },
            doctorId: { type: 'string' },
            appointmentDate: { type: 'string', format: 'date' },
            appointmentTime: { type: 'string' },
            status: { type: 'string', enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'] },
            type: { type: 'string' },
            reason: { type: 'string' }
          }
        },
        MedicalRecord: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            patientId: { type: 'string' },
            doctorId: { type: 'string' },
            recordType: { type: 'string' },
            data: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './routes/*/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:4200',
      'http://127.0.0.1:4200',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:4201',
      'http://127.0.0.1:4201'
    ];
    
    // Log the origin for debugging
    console.log('Request origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Add preflight handling for all routes
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.auditLog('HTTP_REQUEST', req.user?._id || 'anonymous', req.url, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id,
      userRole: req.user?.role
    });
  });
  
  next();
});

// Audit logging middleware
app.use(auditMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Hospital Management System API Documentation'
}));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/medicalRecords', medicalRecordRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/telemedicine', telemedicineRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/voice', voiceRoutes);
app.use('/api/v1/wearables', wearableRoutes);
app.use('/api/v1/blockchain', blockchainRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hospital Management System API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      auth: '/api/v1/auth',
      patients: '/api/v1/patients',
      doctors: '/api/v1/doctors',
      admin: '/api/v1/admin',
      public: '/api/v1/public',
      appointments: '/api/v1/appointments',
      medicalRecords: '/api/v1/medicalRecords',
      pharmacy: '/api/v1/pharmacy',
      telemedicine: '/api/v1/telemedicine',
      billing: '/api/v1/billing',
      ai: '/api/v1/ai',
      voice: '/api/v1/voice'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      auth: '/api/v1/auth',
      patients: '/api/v1/patients',
      doctors: '/api/v1/doctors',
      admin: '/api/v1/admin',
      public: '/api/v1/public',
      appointments: '/api/v1/appointments',
      medicalRecords: '/api/v1/medicalRecords',
      pharmacy: '/api/v1/pharmacy',
      telemedicine: '/api/v1/telemedicine',
      billing: '/api/v1/billing',
      ai: '/api/v1/ai',
      voice: '/api/v1/voice',
      docs: '/api-docs'
    }
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app; 