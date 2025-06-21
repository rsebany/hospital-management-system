const app = require('./app');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ MongoDB connected successfully');

    // Connect to Redis (optional in development)
    try {
      await connectRedis();
      logger.info('✅ Redis connected successfully');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️ Redis not available, continuing without Redis');
      } else {
        throw error;
      }
    }

    // Start HTTP server
    const server = require('http').createServer(app);
    
    // Start Socket.io server (optional in development)
    try {
      const { startSocketServer } = require('./services/socketService');
      startSocketServer(app);
      logger.info('✅ Socket.io server started');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️ Socket.io not available, continuing without WebSocket support');
      } else {
        throw error;
      }
    }

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`🚀 Hospital Management System 2025 is running!`);
      logger.info(`📍 Environment: ${NODE_ENV}`);
      logger.info(`🌐 Server: http://localhost:${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`⏰ Started at: ${new Date().toISOString()}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer(); 