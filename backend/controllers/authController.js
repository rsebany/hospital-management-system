const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { auditLog, securityLog } = require('../utils/logger');
const { setCache, getCache, deleteCache } = require('../config/redis');
const encryptionService = require('../utils/encryption');
const { sendEmail } = require('../services/emailService');
const { generateOTP, verifyOTP } = require('../services/otpService');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user with role-based registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [patient, doctor, admin]
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
 *               profile:
 *                 type: object
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      profile
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Validate role-specific requirements
    if (role === 'doctor' && (!profile?.licenseNumber || !profile?.specialization)) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Doctors must provide license number and specialization'
      });
    }

    // Create user object
    const userData = {
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role,
      phoneNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      emergencyContact,
      profile: {
        ...profile,
        // Generate role-specific IDs
        ...(role === 'patient' && { patientId: await generatePatientId() }),
        ...(role === 'doctor' && { doctorId: await generateDoctorId() })
      },
      createdBy: req.user?._id // If admin is creating the user
    };

    // Create user
    const user = new User(userData);
    await user.save();

    // Generate email verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Hospital Management System',
      template: 'emailVerification',
      data: {
        name: user.firstName,
        verificationToken,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
      }
    });

    // Send welcome SMS if phone number provided
    if (user.phoneNumber) {
      await sendEmail({
        to: user.phoneNumber,
        subject: 'Welcome to Hospital Management System! Your account has been created successfully. Please verify your email to activate your account.',
        template: 'welcomeSMS',
        data: {
          name: user.firstName,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
        }
      });
    }

    // Audit log
    auditLog('USER_REGISTRATION', user._id, 'ACCOUNT_CREATION', {
      role,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Return success response (without sensitive data)
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with multi-factor authentication
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               otp:
 *                 type: string
 *                 description: OTP for 2FA (if enabled)
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account locked or 2FA required
 */
const login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      securityLog('LOGIN_ATTEMPT', {
        email: email.toLowerCase(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'user_not_found'
      });
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        error: 'Account locked',
        message: 'Your account is temporarily locked due to multiple failed login attempts.'
      });
    }

    // Verify password
    const isPasswordValid = await user.correctPassword(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      }
      
      await user.save();

      securityLog('LOGIN_ATTEMPT', {
        userId: user._id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'invalid_password',
        attempts: user.loginAttempts
      });

      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      if (!otp) {
        // Generate and send OTP
        const otpCode = generateOTP();
        await setCache(`otp:${user._id}`, otpCode, 300); // 5 minutes

        // Send OTP via SMS or email
        if (user.phoneNumber) {
          await sendEmail({
            to: user.phoneNumber,
            subject: 'Your login OTP is: ' + otpCode + '. Valid for 5 minutes.',
            template: 'loginOTP',
            data: { otpCode }
          });
        } else {
          await sendEmail({
            to: user.email,
            subject: 'Login OTP - Hospital Management System',
            template: 'loginOTP',
            data: { otpCode }
          });
        }

        return res.status(200).json({
          success: true,
          message: 'OTP sent successfully',
          requiresOTP: true,
          userId: user._id
        });
      } else {
        // Verify OTP
        const storedOTP = await getCache(`otp:${user._id}`);
        if (!storedOTP || storedOTP !== otp) {
          return res.status(401).json({
            error: 'Invalid OTP',
            message: 'The OTP provided is invalid or expired'
          });
        }
        
        // Clear OTP after successful verification
        await deleteCache(`otp:${user._id}`);
      }
    }

    // Generate tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in Redis
    await setCache(`refresh:${user._id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

    // Cache user data
    await setCache(`user:${user._id}`, {
      _id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      profile: user.profile
    }, 900); // 15 minutes

    // Get role-specific permissions
    const permissions = getRolePermissions(user.role);

    // Audit log
    auditLog('USER_LOGIN', user._id, 'AUTHENTICATION', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      twoFactorUsed: user.twoFactorEnabled
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profile: user.profile
        },
        tokens: {
          accessToken,
          refreshToken
        },
        permissions,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if refresh token exists in Redis
    const storedRefreshToken = await getCache(`refresh:${decoded.userId}`);
    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User not found or account deactivated'
      });
    }

    // Generate new tokens
    const newAccessToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update refresh token in Redis
    await setCache(`refresh:${user._id}`, newRefreshToken, 7 * 24 * 60 * 60);
    await deleteCache(`refresh:${decoded.userId}`); // Remove old refresh token

    // Get role-specific permissions
    const permissions = getRolePermissions(user.role);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        },
        permissions,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh token expired',
        message: 'Please login again'
      });
    }
    
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'An error occurred while refreshing the token'
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user and invalidate tokens
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user._id;

    // Blacklist access token
    await setCache(`blacklist:${req.token}`, true, 24 * 60 * 60); // 24 hours

    // Remove refresh token from Redis
    if (refreshToken) {
      await deleteCache(`refresh:${userId}`);
    }

    // Clear user cache
    await deleteCache(`user:${userId}`);

    // Audit log
    auditLog('USER_LOGOUT', userId, 'AUTHENTICATION', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Email verification token is invalid or expired'
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Audit log
    auditLog('EMAIL_VERIFICATION', user._id, 'ACCOUNT_VERIFICATION', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Email verification failed',
      message: 'An error occurred during email verification'
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with this email address'
      });
    }

    // Generate password reset token
    const resetToken = user.createPasswordResetToken();
    await user.save();

    // Send password reset email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - Hospital Management System',
      template: 'passwordReset',
      data: {
        name: user.firstName,
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });

    // Audit log
    auditLog('PASSWORD_RESET_REQUEST', user._id, 'PASSWORD_MANAGEMENT', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      message: 'An error occurred while processing your request'
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Password reset token is invalid or expired'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.lastPasswordChange = new Date();
    await user.save();

    // Blacklist all existing tokens
    await setCache(`blacklist:user:${user._id}`, true, 24 * 60 * 60);

    // Audit log
    auditLog('PASSWORD_RESET', user._id, 'PASSWORD_MANAGEMENT', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      message: 'An error occurred while resetting your password'
    });
  }
};

// Helper functions
const generatePatientId = async () => {
  const count = await User.countDocuments({ role: 'patient' });
  return `P${String(count + 1).padStart(6, '0')}`;
};

const generateDoctorId = async () => {
  const count = await User.countDocuments({ role: 'doctor' });
  return `D${String(count + 1).padStart(6, '0')}`;
};

const getRolePermissions = (role) => {
  const permissions = {
    patient: [
      'profile:read',
      'profile:update',
      'appointments:read',
      'appointments:create',
      'appointments:cancel',
      'medical-records:read',
      'prescriptions:read',
      'billing:read',
      'billing:pay'
    ],
    doctor: [
      'patients:read',
      'patients:write',
      'appointments:read',
      'appointments:manage',
      'medical-records:read',
      'medical-records:write',
      'prescriptions:read',
      'prescriptions:write',
      'schedule:read',
      'schedule:update'
    ],
    admin: [
      'users:read',
      'users:write',
      'users:delete',
      'departments:manage',
      'inventory:manage',
      'reports:read',
      'system:configure',
      'audit:read'
    ],
    nurse: [
      'patients:read',
      'appointments:read',
      'medical-records:read',
      'prescriptions:read',
      'schedule:read'
    ]
  };

  return permissions[role] || [];
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword
}; 