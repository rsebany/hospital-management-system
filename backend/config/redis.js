const redis = require('redis');
const { logger } = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // In development, if Redis is not available, use a mock client
    if (process.env.NODE_ENV === 'development') {
      try {
        redisClient = redis.createClient({
          url: redisUrl,
          password: process.env.REDIS_PASSWORD || undefined,
          socket: {
            connectTimeout: 5000,
            lazyConnect: true,
            reconnectStrategy: (retries) => {
              if (retries > 3) {
                logger.warn('Redis not available, using mock mode');
                return new Error('Redis not available');
              }
              return Math.min(retries * 100, 1000);
            }
          }
        });

        // Event handlers
        redisClient.on('connect', () => {
          logger.info('Redis client connected');
        });

        redisClient.on('ready', () => {
          logger.info('Redis client ready');
        });

        redisClient.on('error', (err) => {
          logger.warn('Redis client error (development mode):', err.message);
        });

        redisClient.on('end', () => {
          logger.warn('Redis client disconnected');
        });

        redisClient.on('reconnecting', () => {
          logger.info('Redis client reconnecting...');
        });

        await redisClient.connect();
        await redisClient.ping();
        logger.info('✅ Redis connected successfully');
        return;
      } catch (error) {
        logger.warn('Redis not available in development, using mock mode');
        redisClient = null;
        return;
      }
    }

    // Production mode - require Redis
    redisClient = redis.createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max retries reached');
            return new Error('Redis max retries reached');
          }
          return Math.min(retries * 100, 3000);
        }
      },
      // HIPAA Compliance - Enable TLS in production
      ...(process.env.NODE_ENV === 'production' && {
        socket: {
          tls: true,
          rejectUnauthorized: false
        }
      })
    });

    // Event handlers
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redisClient.on('end', () => {
      logger.warn('Redis client disconnected');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    await redisClient.connect();
    await redisClient.ping();
    logger.info('✅ Redis connected successfully');

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Redis connection failed in development, continuing without Redis');
      redisClient = null;
    } else {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }
};

const disconnectRedis = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis disconnected successfully');
    }
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
};

// Cache utility functions
const setCache = async (key, value, ttl = 3600) => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    await redisClient.setEx(key, ttl, serializedValue);
    return true;
  } catch (error) {
    logger.error('Error setting cache:', error);
    return false;
  }
};

const getCache = async (key) => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    const value = await redisClient.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    logger.error('Error getting cache:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Error deleting cache:', error);
    return false;
  }
};

const clearCache = async () => {
  try {
    if (!redisClient) {
      throw new Error('Redis client not connected');
    }
    
    await redisClient.flushAll();
    logger.info('Cache cleared successfully');
    return true;
  } catch (error) {
    logger.error('Error clearing cache:', error);
    return false;
  }
};

// Session management
const setSession = async (sessionId, sessionData, ttl = 86400) => {
  return setCache(`session:${sessionId}`, sessionData, ttl);
};

const getSession = async (sessionId) => {
  return getCache(`session:${sessionId}`);
};

const deleteSession = async (sessionId) => {
  return deleteCache(`session:${sessionId}`);
};

module.exports = {
  connectRedis,
  disconnectRedis,
  redisClient: () => redisClient,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  setSession,
  getSession,
  deleteSession
}; 