const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    this.saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    
    // Get encryption key from environment
    this.encryptionKey = process.env.ENCRYPTION_KEY;
    
    if (!this.encryptionKey || this.encryptionKey.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
    }
  }

  /**
   * Encrypt sensitive data (HIPAA compliant)
   * @param {string} data - Data to encrypt
   * @returns {string} - Encrypted data in format: iv:tag:encryptedData
   */
  encrypt(data) {
    try {
      if (!data) return null;

      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('hospital-management-system', 'utf8'));
      
      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Return in format: iv:tag:encryptedData
      return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedData - Data to decrypt in format: iv:tag:encryptedData
   * @returns {string} - Decrypted data
   */
  decrypt(encryptedData) {
    try {
      if (!encryptedData) return null;

      // Split the encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, tagHex, encrypted] = parts;
      
      // Convert hex strings back to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      
      // Create decipher
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from('hospital-management-system', 'utf8'));
      
      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Password to hash
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error(`Password hashing failed: ${error.message}`);
    }
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} - True if passwords match
   */
  async comparePassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Password comparison failed: ${error.message}`);
    }
  }

  /**
   * Generate secure random token
   * @param {number} length - Token length (default: 32)
   * @returns {string} - Random token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate secure random string
   * @param {number} length - String length (default: 16)
   * @returns {string} - Random string
   */
  generateRandomString(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Hash data for integrity checking
   * @param {string} data - Data to hash
   * @returns {string} - SHA-256 hash
   */
  hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Encrypt object (for medical records)
   * @param {Object} obj - Object to encrypt
   * @returns {string} - Encrypted object
   */
  encryptObject(obj) {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  /**
   * Decrypt object (for medical records)
   * @param {string} encryptedData - Encrypted object
   * @returns {Object} - Decrypted object
   */
  decryptObject(encryptedData) {
    const jsonString = this.decrypt(encryptedData);
    return JSON.parse(jsonString);
  }

  /**
   * Generate key pair for asymmetric encryption
   * @returns {Object} - Public and private keys
   */
  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  /**
   * Encrypt with public key
   * @param {string} data - Data to encrypt
   * @param {string} publicKey - Public key in PEM format
   * @returns {string} - Encrypted data
   */
  encryptWithPublicKey(data, publicKey) {
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      Buffer.from(data, 'utf8')
    );
    return encrypted.toString('base64');
  }

  /**
   * Decrypt with private key
   * @param {string} encryptedData - Encrypted data
   * @param {string} privateKey - Private key in PEM format
   * @returns {string} - Decrypted data
   */
  decryptWithPrivateKey(encryptedData, privateKey) {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      Buffer.from(encryptedData, 'base64')
    );
    return decrypted.toString('utf8');
  }
}

// Create singleton instance
const encryptionService = new EncryptionService();

module.exports = encryptionService; 