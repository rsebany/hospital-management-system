import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HospitalInfo, Doctor, Department, HospitalService, InsuranceProvider, FAQ, EmergencyInfo } from './public.service';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  // Mock Hospital Info
  getMockHospitalInfo(): HospitalInfo {
    return {
      name: "Hopitaliko Medical Center",
      address: "123 Healthcare Avenue, Medical District, City",
      phone: "(555) 123-4567",
      email: "info@hopitaliko.com",
      website: "https://hopitaliko.com",
      description: "Providing exceptional healthcare services with compassion and excellence for over 25 years.",
      established: "1998",
      accreditation: ["JCI", "ISO 9001", "Joint Commission"],
      emergencyContact: "(555) 911-0000",
      emergencyPhone: "(555) 911-0000",
      visitingHours: "Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM",
      facilities: ["Emergency Department", "ICU", "Operating Rooms", "Laboratory", "Radiology", "Pharmacy"],
      imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800"
    };
  }

  // Mock Doctors
  getMockDoctors(): Doctor[] {
    return [
      {
        id: "1",
        firstName: "Dr. Sarah",
        lastName: "Johnson",
        department: "Cardiology",
        specialization: "Interventional Cardiologist",
        email: "sarah.johnson@hopitaliko.com",
        phone: "(555) 123-4568",
        experience: 15,
        education: "Harvard Medical School",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200",
        availability: "Mon-Fri 9AM-5PM"
      },
      {
        id: "2",
        firstName: "Dr. Michael",
        lastName: "Chen",
        department: "Neurology",
        specialization: "Neurologist",
        email: "michael.chen@hopitaliko.com",
        phone: "(555) 123-4569",
        experience: 12,
        education: "Stanford Medical School",
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200",
        availability: "Mon-Thu 8AM-4PM"
      },
      {
        id: "3",
        firstName: "Dr. Emily",
        lastName: "Rodriguez",
        department: "Pediatrics",
        specialization: "Pediatrician",
        email: "emily.rodriguez@hopitaliko.com",
        phone: "(555) 123-4570",
        experience: 8,
        education: "UCLA Medical School",
        imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200",
        availability: "Mon-Fri 10AM-6PM"
      }
    ];
  }

  // Mock Departments
  getMockDepartments(): Department[] {
    return [
      {
        id: "1",
        name: "Cardiology",
        description: "Comprehensive cardiac care and treatment",
        headDoctor: "Dr. Sarah Johnson",
        phone: "(555) 123-4568",
        email: "cardiology@hopitaliko.com",
        location: "Floor 3, Wing A",
        services: ["EKG", "Echocardiogram", "Cardiac Catheterization", "Stress Test"]
      },
      {
        id: "2",
        name: "Neurology",
        description: "Specialized neurological care and treatment",
        headDoctor: "Dr. Michael Chen",
        phone: "(555) 123-4569",
        email: "neurology@hopitaliko.com",
        location: "Floor 4, Wing B",
        services: ["MRI", "CT Scan", "EEG", "Neurological Consultation"]
      },
      {
        id: "3",
        name: "Pediatrics",
        description: "Comprehensive care for children and adolescents",
        headDoctor: "Dr. Emily Rodriguez",
        phone: "(555) 123-4570",
        email: "pediatrics@hopitaliko.com",
        location: "Floor 2, Wing C",
        services: ["Well-child Visits", "Vaccinations", "Sick Visits", "Developmental Screening"]
      }
    ];
  }

  // Mock Services
  getMockServices(): HospitalService[] {
    return [
      {
        id: "1",
        name: "Cardiac Consultation",
        description: "Comprehensive cardiac evaluation and consultation",
        department: "Cardiology",
        duration: "45 minutes",
        cost: "$150",
        availability: "Mon-Fri 9AM-5PM",
        requirements: ["Referral", "Insurance Card", "Medical History"]
      },
      {
        id: "2",
        name: "MRI Scan",
        description: "Advanced magnetic resonance imaging",
        department: "Radiology",
        duration: "30-60 minutes",
        cost: "$800",
        availability: "Mon-Sat 7AM-8PM",
        requirements: ["Appointment", "Insurance Pre-authorization", "No Metal Objects"]
      },
      {
        id: "3",
        name: "Emergency Care",
        description: "24/7 emergency medical services",
        department: "Emergency",
        duration: "Varies",
        cost: "Varies by treatment",
        availability: "24/7",
        requirements: ["Emergency Situation", "ID", "Insurance Information"]
      }
    ];
  }

  // Mock Insurance Providers
  getMockInsuranceProviders(): InsuranceProvider[] {
    return [
      {
        id: "1",
        name: "Blue Cross Blue Shield",
        logo: "https://via.placeholder.com/150x80/0066CC/FFFFFF?text=BCBS",
        phone: "(800) 521-2227",
        website: "https://www.bcbs.com",
        acceptedPlans: ["PPO", "HMO", "EPO", "Medicare Advantage"],
        coverageDetails: "Comprehensive coverage for medical, surgical, and hospital services"
      },
      {
        id: "2",
        name: "Aetna",
        logo: "https://via.placeholder.com/150x80/FF0000/FFFFFF?text=Aetna",
        phone: "(800) 872-3862",
        website: "https://www.aetna.com",
        acceptedPlans: ["PPO", "HMO", "High Deductible", "Medicare"],
        coverageDetails: "Wide network coverage with competitive rates"
      },
      {
        id: "3",
        name: "Cigna",
        logo: "https://via.placeholder.com/150x80/00A0DC/FFFFFF?text=Cigna",
        phone: "(800) 997-1654",
        website: "https://www.cigna.com",
        acceptedPlans: ["PPO", "HMO", "EPO", "Medicare Supplement"],
        coverageDetails: "Global healthcare solutions with extensive network"
      }
    ];
  }

  // Mock FAQ
  getMockFAQ(): FAQ[] {
    return [
      {
        id: "1",
        question: "How do I schedule an appointment?",
        answer: "You can schedule an appointment by calling our main number, using our online booking system, or visiting our patient portal.",
        category: "Appointments",
        tags: ["scheduling", "appointments", "booking"]
      },
      {
        id: "2",
        question: "What insurance plans do you accept?",
        answer: "We accept most major insurance plans including Blue Cross Blue Shield, Aetna, Cigna, and Medicare. Please contact our billing department for specific coverage details.",
        category: "Insurance",
        tags: ["insurance", "coverage", "billing"]
      },
      {
        id: "3",
        question: "What are your visiting hours?",
        answer: "Our visiting hours are Monday to Friday 8AM-8PM and Saturday to Sunday 9AM-6PM. Emergency department visitors are allowed 24/7.",
        category: "Visiting",
        tags: ["visiting", "hours", "visitors"]
      },
      {
        id: "4",
        question: "How do I get my medical records?",
        answer: "You can request your medical records by filling out a release form at our medical records department or through our patient portal.",
        category: "General",
        tags: ["records", "medical history", "documentation"]
      }
    ];
  }

  // Mock Emergency Info
  getMockEmergencyInfo(): EmergencyInfo {
    return {
      emergencyNumber: "(555) 911-0000",
      ambulanceNumber: "(555) 911-0001",
      policeNumber: "(555) 911-0002",
      fireNumber: "(555) 911-0003",
      emergencyDepartments: ["Emergency Department", "Trauma Center", "Cardiac Emergency"],
      emergencyInstructions: "In case of emergency, call 911 immediately. For medical emergencies, proceed to our Emergency Department located on the ground floor. Please bring identification and insurance information if possible.",
      nearestHospitals: [
        {
          name: "City General Hospital",
          address: "456 Medical Blvd, City",
          phone: "(555) 123-4000",
          distance: "2.5 miles"
        },
        {
          name: "Regional Medical Center",
          address: "789 Health Street, City",
          phone: "(555) 123-4001",
          distance: "4.1 miles"
        }
      ]
    };
  }
} 