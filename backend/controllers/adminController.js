const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Department = require('../models/Department');
const Pharmacy = require('../models/Pharmacy');
const Billing = require('../models/Billing');
const { auditLog } = require('../utils/logger');
const { getCache, setCache } = require('../config/redis');

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
const getDashboard = async (req, res) => {
  try {
    const adminId = req.user._id;

    // Get cached dashboard data if available
    let dashboardData = await getCache('admin:dashboard');
    
    if (!dashboardData) {
      // Calculate real-time statistics
      const [
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        totalRevenue,
        monthlyRevenue,
        activeDepartments,
        lowStockItems
      ] = await Promise.all([
        User.countDocuments({ role: 'patient', isActive: true }),
        User.countDocuments({ role: 'doctor', isActive: true }),
        Appointment.countDocuments(),
        Appointment.countDocuments({
          appointmentDate: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999)
          }
        }),
        Appointment.countDocuments({ status: 'scheduled' }),
        Appointment.countDocuments({ status: 'completed' }),
        Billing.aggregate([
          { $match: { status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Billing.aggregate([
          {
            $match: {
              status: 'paid',
              createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Department.countDocuments({ isActive: true }),
        Pharmacy.countDocuments({ 'inventory.quantity': { $lt: 10 } })
      ]);

      // Get recent activities
      const recentAppointments = await Appointment.find()
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentRegistrations = await User.find({ role: 'patient' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email createdAt');

      const recentBills = await Billing.find()
        .populate('patientId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData = {
        statistics: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          todayAppointments,
          pendingAppointments,
          completedAppointments,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
          activeDepartments,
          lowStockItems
        },
        recentActivities: {
          appointments: recentAppointments,
          registrations: recentRegistrations,
          bills: recentBills
        },
        charts: {
          appointmentsByStatus: await getAppointmentsByStatus(),
          revenueByMonth: await getRevenueByMonth(),
          patientsByDepartment: await getPatientsByDepartment()
        }
      };

      // Cache dashboard data for 5 minutes
      await setCache('admin:dashboard', dashboardData, 300);
    }

    // Audit log
    auditLog('DASHBOARD_ACCESS', adminId, 'ADMIN_DASHBOARD', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get dashboard',
      message: 'An error occurred while retrieving dashboard data'
    });
  }
};

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
const getStaff = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { role, department, limit = 10, page = 1 } = req.query;

    const query = { isActive: true };
    if (role) {
      query.role = role;
    }
    if (department) {
      query['profile.department'] = department;
    }

    const skip = (page - 1) * limit;

    const staff = await User.find(query)
      .select('-password -passwordResetToken -emailVerificationToken')
      .populate('profile.department', 'name description')
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Audit log
    auditLog('STAFF_ACCESS', adminId, 'ADMIN_STAFF', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      staffCount: staff.length
    });

    res.status(200).json({
      success: true,
      data: {
        staff,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      error: 'Failed to get staff',
      message: 'An error occurred while retrieving staff members'
    });
  }
};

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
const createStaff = async (req, res) => {
  try {
    const adminId = req.user._id;
    const staffData = {
      ...req.body,
      createdBy: adminId,
      isEmailVerified: true // Admin-created accounts are pre-verified
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: staffData.email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    const staff = new User(staffData);
    await staff.save();

    // Populate department information
    await staff.populate('profile.department', 'name description');

    // Audit log
    auditLog('STAFF_CREATED', adminId, 'ADMIN_STAFF', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      staffId: staff._id,
      role: staff.role
    });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        staff: {
          _id: staff._id,
          email: staff.email,
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: staff.role,
          profile: staff.profile
        }
      }
    });

  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      error: 'Failed to create staff member',
      message: 'An error occurred while creating the staff member'
    });
  }
};

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
const updateStaff = async (req, res) => {
  try {
    const adminId = req.user._id;
    const staffId = req.params.id;
    const updateData = {
      ...req.body,
      updatedBy: adminId
    };

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.email;
    delete updateData.password;
    delete updateData.role;

    const staff = await User.findByIdAndUpdate(
      staffId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({
        error: 'Staff member not found',
        message: 'Staff member not found'
      });
    }

    await staff.populate('profile.department', 'name description');

    // Clear cache
    await setCache(`user:${staffId}`, staff, 900);

    // Audit log
    auditLog('STAFF_UPDATED', adminId, 'ADMIN_STAFF', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      staffId,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        staff
      }
    });

  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      error: 'Failed to update staff member',
      message: 'An error occurred while updating the staff member'
    });
  }
};

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
const deactivateStaff = async (req, res) => {
  try {
    const adminId = req.user._id;
    const staffId = req.params.id;

    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        error: 'Staff member not found',
        message: 'Staff member not found'
      });
    }

    // Check if staff has active appointments
    const activeAppointments = await Appointment.countDocuments({
      doctorId: staffId,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({
        error: 'Cannot deactivate staff',
        message: 'Staff member has active appointments. Please reassign or cancel them first.'
      });
    }

    staff.isActive = false;
    staff.deactivatedBy = adminId;
    staff.deactivatedAt = new Date();
    await staff.save();

    // Clear cache
    await setCache(`user:${staffId}`, staff, 900);

    // Audit log
    auditLog('STAFF_DEACTIVATED', adminId, 'ADMIN_STAFF', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      staffId
    });

    res.status(200).json({
      success: true,
      message: 'Staff member deactivated successfully',
      data: {
        staff: {
          _id: staff._id,
          email: staff.email,
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: staff.role,
          isActive: staff.isActive
        }
      }
    });

  } catch (error) {
    console.error('Deactivate staff error:', error);
    res.status(500).json({
      error: 'Failed to deactivate staff member',
      message: 'An error occurred while deactivating the staff member'
    });
  }
};

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
const getDepartments = async (req, res) => {
  try {
    const adminId = req.user._id;

    const departments = await Department.find({ isActive: true })
      .populate('head', 'firstName lastName email')
      .sort({ name: 1 });

    // Get staff count for each department
    const departmentsWithStaff = await Promise.all(
      departments.map(async (dept) => {
        const staffCount = await User.countDocuments({
          'profile.department': dept._id,
          isActive: true
        });
        return {
          ...dept.toObject(),
          staffCount
        };
      })
    );

    // Audit log
    auditLog('DEPARTMENTS_ACCESS', adminId, 'ADMIN_DEPARTMENTS', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      departmentCount: departments.length
    });

    res.status(200).json({
      success: true,
      data: {
        departments: departmentsWithStaff
      }
    });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      error: 'Failed to get departments',
      message: 'An error occurred while retrieving departments'
    });
  }
};

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
const getInventory = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { lowStock, limit = 10, page = 1 } = req.query;

    const query = {};
    if (lowStock === 'true') {
      query['inventory.quantity'] = { $lt: 10 };
    }

    const skip = (page - 1) * limit;

    const inventory = await Pharmacy.find(query)
      .sort({ 'inventory.quantity': 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Pharmacy.countDocuments(query);

    // Calculate inventory statistics
    const totalItems = await Pharmacy.countDocuments();
    const lowStockItems = await Pharmacy.countDocuments({ 'inventory.quantity': { $lt: 10 } });
    const outOfStockItems = await Pharmacy.countDocuments({ 'inventory.quantity': 0 });

    // Audit log
    auditLog('INVENTORY_ACCESS', adminId, 'ADMIN_INVENTORY', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      itemCount: inventory.length
    });

    res.status(200).json({
      success: true,
      data: {
        inventory,
        statistics: {
          totalItems,
          lowStockItems,
          outOfStockItems
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      error: 'Failed to get inventory',
      message: 'An error occurred while retrieving inventory'
    });
  }
};

// Helper functions for dashboard charts
const getAppointmentsByStatus = async () => {
  const result = await Appointment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return result.map(item => ({
    status: item._id,
    count: item.count
  }));
};

const getRevenueByMonth = async () => {
  const result = await Billing.aggregate([
    {
      $match: {
        status: 'paid',
        createdAt: {
          $gte: new Date(new Date().getFullYear(), 0, 1)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$amount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return result.map(item => ({
    month: item._id,
    revenue: item.revenue
  }));
};

const getPatientsByDepartment = async () => {
  const result = await User.aggregate([
    {
      $match: {
        role: 'patient',
        isActive: true,
        'profile.department': { $exists: true }
      }
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'profile.department',
        foreignField: '_id',
        as: 'department'
      }
    },
    {
      $unwind: '$department'
    },
    {
      $group: {
        _id: '$department.name',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return result.map(item => ({
    department: item._id,
    count: item.count
  }));
};

module.exports = {
  getDashboard,
  getStaff,
  createStaff,
  updateStaff,
  deactivateStaff,
  getDepartments,
  getInventory
}; 