const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Set required environment variables
process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
process.env.JWT_REFRESH_SECRET = 'your-refresh-secret-key';

async function createAdminDirect() {
  try {
    // Connect to your specific database
    await mongoose.connect('mongodb://localhost:27017/hospital_management_2025');
    console.log('✅ Connected to hospital_management_2025 database');

    // Check if admin already exists
    const existingAdmin = await mongoose.connection.db.collection('users').findOne({ 
      email: 'admin@hospital.com' 
    });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists in database');
      console.log('Email: admin@hospital.com');
      console.log('Password: AdminPass123!');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('AdminPass123!', 12);

    // Create admin user document
    const adminUser = {
      email: 'admin@hospital.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phoneNumber: '+1-555-4001',
      isEmailVerified: true,
      isActive: true,
      isPhoneVerified: false,
      loginAttempts: 0,
      twoFactorEnabled: false,
      dataConsent: true,
      preferences: {
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      },
      profile: {
        adminId: 'A000001',
        adminLevel: 'super_admin',
        permissions: [
          'user_management',
          'system_config',
          'reports',
          'billing',
          'inventory',
          'audit_logs'
        ]
      },
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Admin',
        phone: '+1-555-9999',
        email: 'emergency@hospital.com'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordChangedAt: new Date()
    };

    // Insert admin user directly into the users collection
    const result = await mongoose.connection.db.collection('users').insertOne(adminUser);
    
    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin Details:');
    console.log('   Email: admin@hospital.com');
    console.log('   Password: AdminPass123!');
    console.log('   Role: admin');
    console.log('   Admin Level: super_admin');
    console.log('   User ID:', result.insertedId);
    console.log('   Permissions: All admin permissions granted');
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: admin@hospital.com');
    console.log('   Password: AdminPass123!');
    
    console.log('\n🎯 This admin has full control over:');
    console.log('   - User Management');
    console.log('   - System Configuration');
    console.log('   - Reports & Analytics');
    console.log('   - Billing & Payments');
    console.log('   - Inventory Management');
    console.log('   - Audit Logs');
    console.log('   - All AI Features');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

// Run the function
createAdminDirect(); 