const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Pharmacy = require('../models/Pharmacy');
const { logger } = require('../utils/logger');
const encryptionService = require('../utils/encryption');

/**
 * Seed departments
 */
const seedDepartments = async () => {
  const departments = [
    {
      name: 'Cardiology',
      description: 'Specialized care for heart and cardiovascular conditions',
      location: 'Floor 2, Wing A',
      contactNumber: '+1-555-1001',
      email: 'cardiology@hospital.com',
      head: null, // Will be set after creating doctors
      isActive: true
    },
    {
      name: 'Orthopedics',
      description: 'Treatment of musculoskeletal system, bones, and joints',
      location: 'Floor 3, Wing B',
      contactNumber: '+1-555-1002',
      email: 'orthopedics@hospital.com',
      head: null,
      isActive: true
    },
    {
      name: 'Pediatrics',
      description: 'Specialized medical care for infants, children, and adolescents',
      location: 'Floor 1, Wing C',
      contactNumber: '+1-555-1003',
      email: 'pediatrics@hospital.com',
      head: null,
      isActive: true
    },
    {
      name: 'Emergency Medicine',
      description: '24/7 emergency and trauma care services',
      location: 'Ground Floor, Emergency Wing',
      contactNumber: '+1-555-9111',
      email: 'emergency@hospital.com',
      head: null,
      isActive: true
    },
    {
      name: 'General Medicine',
      description: 'Primary healthcare and internal medicine',
      location: 'Floor 1, Wing A',
      contactNumber: '+1-555-1004',
      email: 'general@hospital.com',
      head: null,
      isActive: true
    },
    {
      name: 'Neurology',
      description: 'Treatment of nervous system disorders',
      location: 'Floor 4, Wing A',
      contactNumber: '+1-555-1005',
      email: 'neurology@hospital.com',
      head: null,
      isActive: true
    },
    {
      name: 'Oncology',
      description: 'Cancer treatment and care',
      location: 'Floor 5, Wing B',
      contactNumber: '+1-555-1006',
      email: 'oncology@hospital.com',
      head: null,
      isActive: true
    },
    {
      name: 'Radiology',
      description: 'Medical imaging and diagnostic services',
      location: 'Floor 2, Wing C',
      contactNumber: '+1-555-1007',
      email: 'radiology@hospital.com',
      head: null,
      isActive: true
    }
  ];

  for (const deptData of departments) {
    const existingDept = await Department.findOne({ name: deptData.name });
    if (!existingDept) {
      const department = new Department(deptData);
      await department.save();
      logger.info(`Department seeded: ${deptData.name}`);
    }
  }

  return await Department.find();
};

/**
 * Seed doctors
 */
const seedDoctors = async (departments) => {
  const doctors = [
    {
      email: 'dr.smith@hospital.com',
      password: 'DoctorPass123!',
      firstName: 'Dr. John',
      lastName: 'Smith',
      role: 'doctor',
      phoneNumber: '+1-555-2001',
      dateOfBirth: '1975-03-15',
      gender: 'male',
      profile: {
        doctorId: 'D000001',
        licenseNumber: 'MD123456',
        specialization: ['Cardiology', 'Interventional Cardiology'],
        experience: {
          years: 15,
          previousHospitals: ['Massachusetts General Hospital', 'Boston Medical Center']
        },
        education: [
          {
            degree: 'MD',
            institution: 'Harvard Medical School',
            year: 2000
          },
          {
            degree: 'Residency in Cardiology',
            institution: 'Johns Hopkins Hospital',
            year: 2004
          }
        ],
        department: departments.find(d => d.name === 'Cardiology')._id,
        bio: 'Experienced cardiologist specializing in interventional procedures',
        certifications: ['Board Certified in Cardiology', 'Fellow of American College of Cardiology'],
        languages: ['English', 'Spanish']
      },
      isEmailVerified: true,
      isActive: true
    },
    {
      email: 'dr.johnson@hospital.com',
      password: 'DoctorPass123!',
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      role: 'doctor',
      phoneNumber: '+1-555-2002',
      dateOfBirth: '1980-07-22',
      gender: 'female',
      profile: {
        doctorId: 'D000002',
        licenseNumber: 'MD123457',
        specialization: ['Orthopedics', 'Sports Medicine'],
        experience: {
          years: 12,
          previousHospitals: ['Stanford Medical Center', 'UCSF Medical Center']
        },
        education: [
          {
            degree: 'MD',
            institution: 'Stanford Medical School',
            year: 2005
          },
          {
            degree: 'Residency in Orthopedic Surgery',
            institution: 'Stanford Medical Center',
            year: 2009
          }
        ],
        department: departments.find(d => d.name === 'Orthopedics')._id,
        bio: 'Orthopedic surgeon with expertise in sports medicine and joint replacement',
        certifications: ['Board Certified in Orthopedic Surgery', 'Sports Medicine Fellowship'],
        languages: ['English', 'French']
      },
      isEmailVerified: true,
      isActive: true
    },
    {
      email: 'dr.williams@hospital.com',
      password: 'DoctorPass123!',
      firstName: 'Dr. Michael',
      lastName: 'Williams',
      role: 'doctor',
      phoneNumber: '+1-555-2003',
      dateOfBirth: '1978-11-08',
      gender: 'male',
      profile: {
        doctorId: 'D000003',
        licenseNumber: 'MD123458',
        specialization: ['Pediatrics', 'General Pediatrics'],
        experience: {
          years: 18,
          previousHospitals: ['Johns Hopkins Children\'s Center', 'Children\'s Hospital of Philadelphia']
        },
        education: [
          {
            degree: 'MD',
            institution: 'Johns Hopkins Medical School',
            year: 2002
          },
          {
            degree: 'Residency in Pediatrics',
            institution: 'Johns Hopkins Children\'s Center',
            year: 2006
          }
        ],
        department: departments.find(d => d.name === 'Pediatrics')._id,
        bio: 'Pediatrician with extensive experience in child healthcare',
        certifications: ['Board Certified in Pediatrics', 'Pediatric Advanced Life Support'],
        languages: ['English', 'German']
      },
      isEmailVerified: true,
      isActive: true
    },
    {
      email: 'dr.brown@hospital.com',
      password: 'DoctorPass123!',
      firstName: 'Dr. Emily',
      lastName: 'Brown',
      role: 'doctor',
      phoneNumber: '+1-555-2004',
      dateOfBirth: '1982-05-14',
      gender: 'female',
      profile: {
        doctorId: 'D000004',
        licenseNumber: 'MD123459',
        specialization: ['Emergency Medicine', 'Trauma Care'],
        experience: {
          years: 10,
          previousHospitals: ['UCLA Medical Center', 'Cedars-Sinai Medical Center']
        },
        education: [
          {
            degree: 'MD',
            institution: 'UCLA Medical School',
            year: 2008
          },
          {
            degree: 'Residency in Emergency Medicine',
            institution: 'UCLA Medical Center',
            year: 2012
          }
        ],
        department: departments.find(d => d.name === 'Emergency Medicine')._id,
        bio: 'Emergency medicine specialist with trauma care expertise',
        certifications: ['Board Certified in Emergency Medicine', 'Advanced Trauma Life Support'],
        languages: ['English', 'Spanish', 'Portuguese']
      },
      isEmailVerified: true,
      isActive: true
    },
    {
      email: 'dr.davis@hospital.com',
      password: 'DoctorPass123!',
      firstName: 'Dr. Robert',
      lastName: 'Davis',
      role: 'doctor',
      phoneNumber: '+1-555-2005',
      dateOfBirth: '1976-09-30',
      gender: 'male',
      profile: {
        doctorId: 'D000005',
        licenseNumber: 'MD123460',
        specialization: ['General Medicine', 'Internal Medicine'],
        experience: {
          years: 20,
          previousHospitals: ['Mayo Clinic', 'Cleveland Clinic']
        },
        education: [
          {
            degree: 'MD',
            institution: 'Mayo Clinic School of Medicine',
            year: 1998
          },
          {
            degree: 'Residency in Internal Medicine',
            institution: 'Mayo Clinic',
            year: 2002
          }
        ],
        department: departments.find(d => d.name === 'General Medicine')._id,
        bio: 'Experienced general practitioner with expertise in internal medicine',
        certifications: ['Board Certified in Internal Medicine', 'Fellow of American College of Physicians'],
        languages: ['English', 'Italian']
      },
      isEmailVerified: true,
      isActive: true
    }
  ];

  for (const doctorData of doctors) {
    const existingDoctor = await User.findOne({ email: doctorData.email });
    if (!existingDoctor) {
      const doctor = new User(doctorData);
      await doctor.save();
      logger.info(`Doctor seeded: ${doctorData.firstName} ${doctorData.lastName}`);
    }
  }

  return await User.find({ role: 'doctor' });
};

/**
 * Seed patients
 */
const seedPatients = async () => {
  const patients = [
    {
      email: 'john.doe@email.com',
      password: 'PatientPass123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'patient',
      phoneNumber: '+1-555-3001',
      dateOfBirth: '1985-04-12',
      gender: 'male',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1-555-3002',
        email: 'jane.doe@email.com'
      },
      profile: {
        patientId: 'P000001',
        bloodType: 'A+',
        allergies: [
          { allergen: 'Penicillin', severity: 'severe', reaction: 'Anaphylaxis' },
          { allergen: 'Latex', severity: 'moderate', reaction: 'Skin rash' }
        ],
        insuranceInfo: {
          provider: 'Blue Cross Blue Shield',
          policyNumber: 'BCBS123456',
          expiryDate: '2025-12-31'
        }
      },
      isEmailVerified: true,
      isActive: true
    },
    {
      email: 'jane.smith@email.com',
      password: 'PatientPass123!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'patient',
      phoneNumber: '+1-555-3003',
      dateOfBirth: '1990-08-25',
      gender: 'female',
      address: {
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Mike Smith',
        relationship: 'Brother',
        phone: '+1-555-3004',
        email: 'mike.smith@email.com'
      },
      profile: {
        patientId: 'P000002',
        bloodType: 'O+',
        allergies: [
          { allergen: 'Aspirin', severity: 'mild', reaction: 'Stomach upset' }
        ],
        insuranceInfo: {
          provider: 'Aetna',
          policyNumber: 'AETNA789012',
          expiryDate: '2025-08-15'
        }
      },
      isEmailVerified: true,
      isActive: true
    },
    {
      email: 'mike.wilson@email.com',
      password: 'PatientPass123!',
      firstName: 'Mike',
      lastName: 'Wilson',
      role: 'patient',
      phoneNumber: '+1-555-3005',
      dateOfBirth: '1978-12-03',
      gender: 'male',
      address: {
        street: '789 Pine Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Lisa Wilson',
        relationship: 'Wife',
        phone: '+1-555-3006',
        email: 'lisa.wilson@email.com'
      },
      profile: {
        patientId: 'P000003',
        bloodType: 'B+',
        allergies: [
          { allergen: 'Peanuts', severity: 'severe', reaction: 'Anaphylaxis' },
          { allergen: 'Shellfish', severity: 'moderate', reaction: 'Hives and swelling' }
        ],
        insuranceInfo: {
          provider: 'Cigna',
          policyNumber: 'CIGNA345678',
          expiryDate: '2025-09-15'
        }
      },
      isEmailVerified: true,
      isActive: true
    }
  ];

  for (const patientData of patients) {
    const existingPatient = await User.findOne({ email: patientData.email });
    if (!existingPatient) {
      const patient = new User(patientData);
      await patient.save();
      logger.info(`Patient seeded: ${patientData.firstName} ${patientData.lastName}`);
    }
  }

  return await User.find({ role: 'patient' });
};

/**
 * Seed admin users
 */
const seedAdmins = async () => {
  const admins = [
    {
      email: 'admin@hospital.com',
      password: 'AdminPass123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phoneNumber: '+1-555-4001',
      dateOfBirth: '1980-01-01',
      gender: 'male',
      profile: {
        adminId: 'A000001',
        permissions: ['users:read', 'users:write', 'users:delete', 'departments:manage', 'inventory:manage', 'reports:read', 'system:configure', 'audit:read']
      },
      isEmailVerified: true,
      isActive: true
    },
    {
      email: 'superadmin@hospital.com',
      password: 'SuperAdminPass123!',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
      phoneNumber: '+1-555-4002',
      dateOfBirth: '1975-01-01',
      gender: 'male',
      profile: {
        adminId: 'A000002',
        permissions: ['*'] // All permissions
      },
      isEmailVerified: true,
      isActive: true
    }
  ];

  for (const adminData of admins) {
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (!existingAdmin) {
      const admin = new User(adminData);
      await admin.save();
      logger.info(`Admin seeded: ${adminData.firstName} ${adminData.lastName}`);
    }
  }

  return await User.find({ role: 'admin' });
};

/**
 * Seed pharmacy inventory
 */
const seedPharmacyInventory = async () => {
  const inventory = [
    {
      name: 'Aspirin 100mg',
      category: 'Pain Relief',
      description: 'Acetylsalicylic acid tablets for pain relief and fever reduction',
      price: 5.99,
      quantity: 500,
      unit: 'tablets',
      manufacturer: 'Generic Pharma',
      expiryDate: '2026-12-31',
      requiresPrescription: false,
      isActive: true
    },
    {
      name: 'Amoxicillin 500mg',
      category: 'Antibiotics',
      description: 'Broad-spectrum antibiotic for bacterial infections',
      price: 25.99,
      quantity: 200,
      unit: 'capsules',
      manufacturer: 'MedCorp',
      expiryDate: '2025-06-30',
      requiresPrescription: true,
      isActive: true
    },
    {
      name: 'Ibuprofen 400mg',
      category: 'Pain Relief',
      description: 'Non-steroidal anti-inflammatory drug for pain and inflammation',
      price: 8.99,
      quantity: 300,
      unit: 'tablets',
      manufacturer: 'Generic Pharma',
      expiryDate: '2026-08-31',
      requiresPrescription: false,
      isActive: true
    },
    {
      name: 'Omeprazole 20mg',
      category: 'Gastrointestinal',
      description: 'Proton pump inhibitor for acid reflux and ulcers',
      price: 35.99,
      quantity: 150,
      unit: 'capsules',
      manufacturer: 'MedCorp',
      expiryDate: '2025-12-31',
      requiresPrescription: true,
      isActive: true
    },
    {
      name: 'Metformin 500mg',
      category: 'Diabetes',
      description: 'Oral diabetes medication for type 2 diabetes',
      price: 15.99,
      quantity: 100,
      unit: 'tablets',
      manufacturer: 'DiabetesCare',
      expiryDate: '2025-09-30',
      requiresPrescription: true,
      isActive: true
    }
  ];

  for (const itemData of inventory) {
    const existingItem = await Pharmacy.findOne({ name: itemData.name });
    if (!existingItem) {
      const item = new Pharmacy(itemData);
      await item.save();
      logger.info(`Pharmacy item seeded: ${itemData.name}`);
    }
  }

  return await Pharmacy.find();
};

/**
 * Seed sample appointments
 */
const seedAppointments = async (doctors, patients) => {
  const appointments = [
    {
      patientId: patients[0]._id,
      doctorId: doctors[0]._id,
      appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      appointmentTime: '10:00',
      type: 'consultation',
      reason: 'Regular heart checkup',
      status: 'scheduled',
      duration: 30
    },
    {
      patientId: patients[1]._id,
      doctorId: doctors[1]._id,
      appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      appointmentTime: '14:30',
      type: 'follow_up',
      reason: 'Knee pain follow-up',
      status: 'confirmed',
      duration: 45
    },
    {
      patientId: patients[2]._id,
      doctorId: doctors[2]._id,
      appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      appointmentTime: '09:15',
      type: 'consultation',
      reason: 'Child wellness check',
      status: 'scheduled',
      duration: 30
    }
  ];

  for (const appointmentData of appointments) {
    const existingAppointment = await Appointment.findOne({
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime
    });

    if (!existingAppointment) {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
      logger.info(`Appointment seeded: ${appointment.appointmentId}`);
    }
  }

  return await Appointment.find();
};

/**
 * Seed sample medical records
 */
const seedMedicalRecords = async (doctors, patients) => {
  const medicalRecords = [
    {
      patientId: patients[0]._id,
      doctorId: doctors[0]._id,
      recordType: 'visit',
      data: encryptionService.encryptObject({
        symptoms: ['Chest pain', 'Shortness of breath'],
        diagnosis: 'Hypertension',
        treatment: 'Prescribed blood pressure medication',
        notes: 'Patient shows signs of high blood pressure. Recommended lifestyle changes and medication.',
        vitalSigns: {
          bloodPressure: '140/90',
          heartRate: '85',
          temperature: '98.6',
          weight: '75kg'
        }
      }),
      isActive: true
    },
    {
      patientId: patients[1]._id,
      doctorId: doctors[1]._id,
      recordType: 'visit',
      data: encryptionService.encryptObject({
        symptoms: ['Knee pain', 'Swelling'],
        diagnosis: 'Knee sprain',
        treatment: 'Rest, ice, compression, elevation (RICE)',
        notes: 'Patient injured knee during sports activity. Recommended physical therapy.',
        vitalSigns: {
          bloodPressure: '120/80',
          heartRate: '72',
          temperature: '98.4',
          weight: '65kg'
        }
      }),
      isActive: true
    }
  ];

  for (const recordData of medicalRecords) {
    const existingRecord = await MedicalRecord.findOne({
      patientId: recordData.patientId,
      doctorId: recordData.doctorId,
      recordType: recordData.recordType
    });

    if (!existingRecord) {
      const record = new MedicalRecord(recordData);
      await record.save();
      logger.info(`Medical record seeded for patient: ${recordData.patientId}`);
    }
  }

  return await MedicalRecord.find();
};

/**
 * Update department heads
 */
const updateDepartmentHeads = async (doctors, departments) => {
  const departmentHeadMap = {
    'Cardiology': 'Dr. John Smith',
    'Orthopedics': 'Dr. Sarah Johnson',
    'Pediatrics': 'Dr. Michael Williams',
    'Emergency Medicine': 'Dr. Emily Brown',
    'General Medicine': 'Dr. Robert Davis'
  };

  for (const [deptName, doctorName] of Object.entries(departmentHeadMap)) {
    const department = departments.find(d => d.name === deptName);
    const doctor = doctors.find(d => `${d.firstName} ${d.lastName}` === doctorName);
    
    if (department && doctor) {
      department.head = doctor._id;
      await department.save();
      logger.info(`Department head updated: ${deptName} -> ${doctorName}`);
    }
  }
};

/**
 * Main seeding function
 */
const seedAll = async () => {
  try {
    logger.info('Starting database seeding...');

    // Seed departments first
    const departments = await seedDepartments();
    logger.info(`Seeded ${departments.length} departments`);

    // Seed doctors
    const doctors = await seedDoctors(departments);
    logger.info(`Seeded ${doctors.length} doctors`);

    // Update department heads
    await updateDepartmentHeads(doctors, departments);

    // Seed patients
    const patients = await seedPatients();
    logger.info(`Seeded ${patients.length} patients`);

    // Seed admins
    const admins = await seedAdmins();
    logger.info(`Seeded ${admins.length} admins`);

    // Seed pharmacy inventory
    const inventory = await seedPharmacyInventory();
    logger.info(`Seeded ${inventory.length} pharmacy items`);

    // Seed appointments
    const appointments = await seedAppointments(doctors, patients);
    logger.info(`Seeded ${appointments.length} appointments`);

    // Seed medical records
    const medicalRecords = await seedMedicalRecords(doctors, patients);
    logger.info(`Seeded ${medicalRecords.length} medical records`);

    logger.info('Database seeding completed successfully!');
    
    return {
      departments: departments.length,
      doctors: doctors.length,
      patients: patients.length,
      admins: admins.length,
      inventory: inventory.length,
      appointments: appointments.length,
      medicalRecords: medicalRecords.length
    };

  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
};

module.exports = {
  seedAll,
  seedDepartments,
  seedDoctors,
  seedPatients,
  seedAdmins,
  seedPharmacyInventory,
  seedAppointments,
  seedMedicalRecords
}; 