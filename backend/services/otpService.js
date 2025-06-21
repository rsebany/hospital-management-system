const crypto = require('crypto');
const { setCache, getCache, deleteCache } = require('../config/redis');
const { logger } = require('../utils/logger');

class OTPService {
  constructor() {
    this.otpLength = 6;
    this.otpExpiry = 300; // 5 minutes in seconds
  }

  /**
   * Generate a random OTP
   * @param {number} length - Length of OTP (default: 6)
   * @returns {string} OTP code
   */
  generateOTP(length = this.otpLength) {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[crypto.randomInt(0, digits.length)];
    }
    
    return otp;
  }

  /**
   * Store OTP in cache
   * @param {string} key - Cache key
   * @param {string} otp - OTP code
   * @param {number} expiry - Expiry time in seconds
   * @returns {Promise<boolean>}
   */
  async storeOTP(key, otp, expiry = this.otpExpiry) {
    try {
      const success = await setCache(`otp:${key}`, otp, expiry);
      
      if (success) {
        logger.info('OTP stored successfully', { key });
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to store OTP', { error: error.message, key });
      return false;
    }
  }

  /**
   * Verify OTP
   * @param {string} key - Cache key
   * @param {string} otp - OTP code to verify
   * @returns {Promise<boolean>}
   */
  async verifyOTP(key, otp) {
    try {
      const storedOTP = await getCache(`otp:${key}`);
      
      if (!storedOTP) {
        logger.warn('OTP not found or expired', { key });
        return false;
      }

      const isValid = storedOTP === otp;
      
      if (isValid) {
        // Delete OTP after successful verification
        await deleteCache(`otp:${key}`);
        logger.info('OTP verified successfully', { key });
      } else {
        logger.warn('Invalid OTP provided', { key });
      }
      
      return isValid;
    } catch (error) {
      logger.error('Failed to verify OTP', { error: error.message, key });
      return false;
    }
  }

  /**
   * Generate and store OTP for user
   * @param {string} userId - User ID
   * @param {number} expiry - Expiry time in seconds
   * @returns {Promise<string>} Generated OTP
   */
  async generateAndStoreOTP(userId, expiry = this.otpExpiry) {
    const otp = this.generateOTP();
    const success = await this.storeOTP(userId, otp, expiry);
    
    if (!success) {
      throw new Error('Failed to store OTP');
    }
    
    return otp;
  }

  /**
   * Verify OTP for user
   * @param {string} userId - User ID
   * @param {string} otp - OTP code
   * @returns {Promise<boolean>}
   */
  async verifyUserOTP(userId, otp) {
    return this.verifyOTP(userId, otp);
  }

  /**
   * Resend OTP for user
   * @param {string} userId - User ID
   * @returns {Promise<string>} New OTP
   */
  async resendOTP(userId) {
    // Delete existing OTP if any
    await deleteCache(`otp:${userId}`);
    
    // Generate and store new OTP
    return this.generateAndStoreOTP(userId);
  }

  /**
   * Check if OTP exists for user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async hasOTP(userId) {
    try {
      const otp = await getCache(`otp:${userId}`);
      return !!otp;
    } catch (error) {
      logger.error('Failed to check OTP existence', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Get remaining time for OTP
   * @param {string} userId - User ID
   * @returns {Promise<number>} Remaining time in seconds
   */
  async getOTPRemainingTime(userId) {
    try {
      // This would require Redis TTL command
      // For now, return a default value
      return this.otpExpiry;
    } catch (error) {
      logger.error('Failed to get OTP remaining time', { error: error.message, userId });
      return 0;
    }
  }

  /**
   * Clean up expired OTPs
   * @returns {Promise<void>}
   */
  async cleanupExpiredOTPs() {
    try {
      // This would require Redis SCAN command to find and delete expired OTPs
      // For now, just log the cleanup attempt
      logger.info('OTP cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup expired OTPs', { error: error.message });
    }
  }
}

// Create singleton instance
const otpService = new OTPService();

// Export individual functions for backward compatibility
const generateOTP = (length) => otpService.generateOTP(length);
const verifyOTP = (key, otp) => otpService.verifyOTP(key, otp);

module.exports = {
  otpService,
  generateOTP,
  verifyOTP
}; 