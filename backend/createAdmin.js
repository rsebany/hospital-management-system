// Set required environment variables
process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
process.env.JWT_REFRESH_SECRET = 'your-refresh-secret-key';

const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdminUser() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management');
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@hospital.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      email: 'admin@hospital.com',
      password: 'AdminPass123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phoneNumber: '+1-555-4001',
      isEmailVerified: true,
      isActive: true,
      profile: {
        adminId: 'A000001',
        permissions: ['users:read', 'users:write', 'users:delete', 'departments:manage', 'inventory:manage', 'reports:read', 'system:configure', 'audit:read']
      }
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@hospital.com');
    console.log('Password: AdminPass123!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminUser(); 