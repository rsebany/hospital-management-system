const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { getCache, setCache } = require('../config/redis');
const { logger } = require('../utils/logger');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  /**
   * Initialize Socket.io server
   * @param {Object} server - HTTP server instance
   * @returns {Object} Socket.io server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from cache or database
        let user = await getCache(`user:${decoded.userId}`);
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication failed', { error: error.message });
        next(new Error('Authentication failed'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    logger.info('Socket.io server initialized');
    return this.io;
  }

  /**
   * Handle new socket connection
   * @param {Object} socket - Socket instance
   */
  handleConnection(socket) {
    const userId = socket.user._id.toString();
    const userRole = socket.user.role;

    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    
    // Join role-specific room
    socket.join(`role:${userRole}`);
    
    // Join user-specific room
    socket.join(`user:${userId}`);

    logger.info('User connected to socket', {
      userId,
      userRole,
      socketId: socket.id
    });

    // Send welcome message
    socket.emit('welcome', {
      message: 'Connected to Hospital Management System',
      userId,
      userRole
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Handle join room
    socket.on('join-room', (room) => {
      socket.join(room);
      logger.info('User joined room', { userId, room });
    });

    // Handle leave room
    socket.on('leave-room', (room) => {
      socket.leave(room);
      logger.info('User left room', { userId, room });
    });

    // Handle private message
    socket.on('private-message', (data) => {
      this.handlePrivateMessage(socket, data);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      this.handleTyping(socket, data);
    });

    // Handle stop typing
    socket.on('stop-typing', (data) => {
      this.handleStopTyping(socket, data);
    });
  }

  /**
   * Handle socket disconnection
   * @param {Object} socket - Socket instance
   */
  handleDisconnection(socket) {
    const userId = socket.user._id.toString();
    
    // Remove user from connected users
    this.connectedUsers.delete(userId);
    
    logger.info('User disconnected from socket', {
      userId,
      socketId: socket.id
    });
  }

  /**
   * Send notification to specific user
   * @param {string} userId - User ID
   * @param {Object} notification - Notification data
   */
  sendNotificationToUser(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
      logger.info('Notification sent to user', { userId, notification });
    } else {
      // Store notification for offline user
      this.storeOfflineNotification(userId, notification);
    }
  }

  /**
   * Send notification to all users with specific role
   * @param {string} role - User role
   * @param {Object} notification - Notification data
   */
  sendNotificationToRole(role, notification) {
    this.io.to(`role:${role}`).emit('notification', notification);
    logger.info('Notification sent to role', { role, notification });
  }

  /**
   * Send notification to all connected users
   * @param {Object} notification - Notification data
   */
  sendNotificationToAll(notification) {
    this.io.emit('notification', notification);
    logger.info('Notification sent to all users', { notification });
  }

  /**
   * Send appointment update to patient and doctor
   * @param {string} patientId - Patient ID
   * @param {string} doctorId - Doctor ID
   * @param {Object} appointmentData - Appointment data
   */
  sendAppointmentUpdate(patientId, doctorId, appointmentData) {
    // Send to patient
    this.sendNotificationToUser(patientId, {
      type: 'appointment_update',
      title: 'Appointment Updated',
      message: `Your appointment has been updated: ${appointmentData.appointmentId}`,
      data: appointmentData
    });

    // Send to doctor
    this.sendNotificationToUser(doctorId, {
      type: 'appointment_update',
      title: 'Appointment Updated',
      message: `Appointment updated: ${appointmentData.appointmentId}`,
      data: appointmentData
    });
  }

  /**
   * Send emergency alert
   * @param {Object} emergencyData - Emergency data
   */
  sendEmergencyAlert(emergencyData) {
    // Send to all doctors and nurses
    this.sendNotificationToRole('doctor', {
      type: 'emergency_alert',
      title: '🚨 Emergency Alert',
      message: emergencyData.message,
      data: emergencyData,
      priority: 'high'
    });

    this.sendNotificationToRole('nurse', {
      type: 'emergency_alert',
      title: '🚨 Emergency Alert',
      message: emergencyData.message,
      data: emergencyData,
      priority: 'high'
    });
  }

  /**
   * Send real-time appointment reminder
   * @param {Object} appointmentData - Appointment data
   */
  sendAppointmentReminder(appointmentData) {
    const { patientId, doctorId } = appointmentData;

    // Send reminder to patient
    this.sendNotificationToUser(patientId, {
      type: 'appointment_reminder',
      title: '⏰ Appointment Reminder',
      message: `You have an appointment in 15 minutes with Dr. ${appointmentData.doctorName}`,
      data: appointmentData
    });

    // Send reminder to doctor
    this.sendNotificationToUser(doctorId, {
      type: 'appointment_reminder',
      title: '⏰ Appointment Reminder',
      message: `You have an appointment in 15 minutes with ${appointmentData.patientName}`,
      data: appointmentData
    });
  }

  /**
   * Send prescription update
   * @param {string} patientId - Patient ID
   * @param {Object} prescriptionData - Prescription data
   */
  sendPrescriptionUpdate(patientId, prescriptionData) {
    this.sendNotificationToUser(patientId, {
      type: 'prescription_update',
      title: '💊 New Prescription',
      message: 'You have a new prescription available',
      data: prescriptionData
    });
  }

  /**
   * Send billing notification
   * @param {string} patientId - Patient ID
   * @param {Object} billingData - Billing data
   */
  sendBillingNotification(patientId, billingData) {
    this.sendNotificationToUser(patientId, {
      type: 'billing_notification',
      title: '💰 Billing Update',
      message: `New bill generated: $${billingData.amount}`,
      data: billingData
    });
  }

  /**
   * Handle private message
   * @param {Object} socket - Socket instance
   * @param {Object} data - Message data
   */
  handlePrivateMessage(socket, data) {
    const { recipientId, message } = data;
    const senderId = socket.user._id.toString();

    // Send message to recipient if online
    const recipientSocketId = this.connectedUsers.get(recipientId);
    if (recipientSocketId) {
      this.io.to(recipientSocketId).emit('private-message', {
        senderId,
        message,
        timestamp: new Date().toISOString()
      });
    }

    // Send confirmation to sender
    socket.emit('message-sent', {
      recipientId,
      message,
      timestamp: new Date().toISOString()
    });

    logger.info('Private message sent', { senderId, recipientId });
  }

  /**
   * Handle typing indicator
   * @param {Object} socket - Socket instance
   * @param {Object} data - Typing data
   */
  handleTyping(socket, data) {
    const { recipientId } = data;
    const senderId = socket.user._id.toString();

    const recipientSocketId = this.connectedUsers.get(recipientId);
    if (recipientSocketId) {
      this.io.to(recipientSocketId).emit('typing', { senderId });
    }
  }

  /**
   * Handle stop typing
   * @param {Object} socket - Socket instance
   * @param {Object} data - Stop typing data
   */
  handleStopTyping(socket, data) {
    const { recipientId } = data;
    const senderId = socket.user._id.toString();

    const recipientSocketId = this.connectedUsers.get(recipientId);
    if (recipientSocketId) {
      this.io.to(recipientSocketId).emit('stop-typing', { senderId });
    }
  }

  /**
   * Store notification for offline user
   * @param {string} userId - User ID
   * @param {Object} notification - Notification data
   */
  async storeOfflineNotification(userId, notification) {
    try {
      const key = `notifications:${userId}`;
      const existingNotifications = await getCache(key) || [];
      
      existingNotifications.push({
        ...notification,
        timestamp: new Date().toISOString(),
        read: false
      });

      // Keep only last 50 notifications
      if (existingNotifications.length > 50) {
        existingNotifications.splice(0, existingNotifications.length - 50);
      }

      await setCache(key, existingNotifications, 7 * 24 * 60 * 60); // 7 days
      
      logger.info('Offline notification stored', { userId, notification });
    } catch (error) {
      logger.error('Failed to store offline notification', { error: error.message, userId });
    }
  }

  /**
   * Get offline notifications for user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Notifications
   */
  async getOfflineNotifications(userId) {
    try {
      const key = `notifications:${userId}`;
      const notifications = await getCache(key) || [];
      return notifications;
    } catch (error) {
      logger.error('Failed to get offline notifications', { error: error.message, userId });
      return [];
    }
  }

  /**
   * Mark notification as read
   * @param {string} userId - User ID
   * @param {string} notificationId - Notification ID
   */
  async markNotificationAsRead(userId, notificationId) {
    try {
      const key = `notifications:${userId}`;
      const notifications = await getCache(key) || [];
      
      const updatedNotifications = notifications.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, read: true };
        }
        return notification;
      });

      await setCache(key, updatedNotifications, 7 * 24 * 60 * 60);
      
      logger.info('Notification marked as read', { userId, notificationId });
    } catch (error) {
      logger.error('Failed to mark notification as read', { error: error.message, userId });
    }
  }

  /**
   * Get connected users count
   * @returns {number} Number of connected users
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get connected users by role
   * @param {string} role - User role
   * @returns {Array} Array of user IDs
   */
  getConnectedUsersByRole(role) {
    // This would require additional tracking of user roles
    // For now, return empty array
    return [];
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export function to start socket server
const startSocketServer = (app) => {
  const server = require('http').createServer(app);
  socketService.initialize(server);
  return server;
};

module.exports = {
  socketService,
  startSocketServer
}; 