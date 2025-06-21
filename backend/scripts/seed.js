#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { seedAll } = require('../seeders/seedData');
const { logger } = require('../utils/logger');

/**
 * Database seeding script
 * Usage: node scripts/seed.js
 */

const runSeeding = async () => {
  try {
    // Connect to database
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management';
    
    logger.info('Connecting to database...');
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connected to database successfully');

    // Run seeding
    const results = await seedAll();
    
    // Display results
    console.log('\n🎉 Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   Departments: ${results.departments}`);
    console.log(`   Doctors: ${results.doctors}`);
    console.log(`   Patients: ${results.patients}`);
    console.log(`   Admins: ${results.admins}`);
    console.log(`   Pharmacy Items: ${results.inventory}`);
    console.log(`   Appointments: ${results.appointments}`);
    console.log(`   Medical Records: ${results.medicalRecords}`);
    
    console.log('\n🔑 Default Login Credentials:');
    console.log('   Admin: admin@hospital.com / AdminPass123!');
    console.log('   Super Admin: superadmin@hospital.com / SuperAdminPass123!');
    console.log('   Doctor: dr.smith@hospital.com / DoctorPass123!');
    console.log('   Patient: john.doe@email.com / PatientPass123!');

  } catch (error) {
    logger.error('Seeding failed:', error);
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
if (require.main === module) {
  runSeeding();
}

module.exports = { runSeeding }; 