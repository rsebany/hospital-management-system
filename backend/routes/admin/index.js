const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const { authenticateToken, authorizeAdmin } = require('../../middleware/auth');
const { validateRegistration, validateUserUpdate } = require('../../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-specific endpoints
 */

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get('/dashboard', authenticateToken, authorizeAdmin, adminController.getDashboard);

/**
 * @swagger
 * /api/v1/admin/staff:
 *   get:
 *     summary: Get all staff members
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of staff to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Staff members retrieved successfully
 */
router.get('/staff', authenticateToken, authorizeAdmin, adminController.getStaff);

/**
 * @swagger
 * /api/v1/admin/staff:
 *   post:
 *     summary: Create new staff member
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *               role:
 *                 type: string
 *                 enum: [doctor, nurse, admin]
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               profile:
 *                 type: object
 *     responses:
 *       201:
 *         description: Staff member created successfully
 */
router.post('/staff', authenticateToken, authorizeAdmin, validateRegistration, adminController.createStaff);

/**
 * @swagger
 * /api/v1/admin/staff/:id:
 *   put:
 *     summary: Update staff member
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               profile:
 *                 type: object
 *     responses:
 *       200:
 *         description: Staff member updated successfully
 */
router.put('/staff/:id', authenticateToken, authorizeAdmin, validateUserUpdate, adminController.updateStaff);

/**
 * @swagger
 * /api/v1/admin/staff/:id:
 *   delete:
 *     summary: Deactivate staff member
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member deactivated successfully
 */
router.delete('/staff/:id', authenticateToken, authorizeAdmin, adminController.deactivateStaff);

/**
 * @swagger
 * /api/v1/admin/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 */
router.get('/departments', authenticateToken, authorizeAdmin, adminController.getDepartments);

/**
 * @swagger
 * /api/v1/admin/departments:
 *   post:
 *     summary: Create new department
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               head:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created successfully
 */
router.post('/departments', authenticateToken, authorizeAdmin, (req, res) => {
  // TODO: Implement create department
  res.status(501).json({
    error: 'Not implemented',
    message: 'Create department endpoint will be implemented soon'
  });
});

/**
 * @swagger
 * /api/v1/admin/departments/:id:
 *   put:
 *     summary: Update department
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               head:
 *                 type: string
 *     responses:
 *       200:
 *         description: Department updated successfully
 */
router.put('/departments/:id', authenticateToken, authorizeAdmin, (req, res) => {
  // TODO: Implement update department
  res.status(501).json({
    error: 'Not implemented',
    message: 'Update department endpoint will be implemented soon'
  });
});

/**
 * @swagger
 * /api/v1/admin/inventory:
 *   get:
 *     summary: Get pharmacy inventory
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Filter low stock items
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 */
router.get('/inventory', authenticateToken, authorizeAdmin, adminController.getInventory);

/**
 * @swagger
 * /api/v1/admin/inventory:
 *   post:
 *     summary: Add inventory item
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inventory item added successfully
 */
router.post('/inventory', authenticateToken, authorizeAdmin, (req, res) => {
  // TODO: Implement add inventory item
  res.status(501).json({
    error: 'Not implemented',
    message: 'Add inventory item endpoint will be implemented soon'
  });
});

/**
 * @swagger
 * /api/v1/admin/reports:
 *   get:
 *     summary: Get system reports
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Report type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */
router.get('/reports', authenticateToken, authorizeAdmin, (req, res) => {
  // TODO: Implement reports endpoint
  res.status(501).json({
    error: 'Not implemented',
    message: 'Reports endpoint will be implemented soon'
  });
});

/**
 * @swagger
 * /api/v1/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
router.get('/audit-logs', authenticateToken, authorizeAdmin, (req, res) => {
  // TODO: Implement audit logs endpoint
  res.status(501).json({
    error: 'Not implemented',
    message: 'Audit logs endpoint will be implemented soon'
  });
});

/**
 * @swagger
 * /api/v1/admin/system-settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings retrieved successfully
 */
router.get('/system-settings', authenticateToken, authorizeAdmin, (req, res) => {
  // TODO: Implement system settings endpoint
  res.status(501).json({
    error: 'Not implemented',
    message: 'System settings endpoint will be implemented soon'
  });
});

/**
 * @swagger
 * /api/v1/admin/system-settings:
 *   put:
 *     summary: Update system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maintenanceMode:
 *                 type: boolean
 *               appointmentDuration:
 *                 type: number
 *               maxAppointmentsPerDay:
 *                 type: number
 *     responses:
 *       200:
 *         description: System settings updated successfully
 */
router.put('/system-settings', authenticateToken, authorizeAdmin, (req, res) => {
  // TODO: Implement update system settings
  res.status(501).json({
    error: 'Not implemented',
    message: 'Update system settings endpoint will be implemented soon'
  });
});

module.exports = router; 