const mongoose = require('mongoose');
const moment = require('moment');

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - patientId
 *         - doctorId
 *         - appointmentDate
 *         - appointmentTime
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique identifier
 *         appointmentId:
 *           type: string
 *           description: Human-readable appointment ID
 *         patientId:
 *           type: string
 *           description: Reference to patient user
 *         doctorId:
 *           type: string
 *           description: Reference to doctor user
 *         appointmentDate:
 *           type: string
 *           format: date
 *           description: Date of appointment
 *         appointmentTime:
 *           type: string
 *           description: Time of appointment (HH:MM format)
 *         type:
 *           type: string
 *           enum: [consultation, follow_up, emergency, surgery, telemedicine]
 *           description: Type of appointment
 *         status:
 *           type: string
 *           enum: [scheduled, confirmed, in_progress, completed, cancelled, no_show]
 *           default: scheduled
 *         duration:
 *           type: number
 *           default: 30
 *           description: Duration in minutes
 *         notes:
 *           type: string
 *           description: Additional notes
 *         symptoms:
 *           type: array
 *           items:
 *             type: string
 *           description: Patient symptoms
 *         diagnosis:
 *           type: string
 *           description: Doctor's diagnosis
 *         treatment:
 *           type: string
 *           description: Treatment plan
 *         prescriptions:
 *           type: array
 *           items:
 *             type: string
 *           description: Prescription IDs
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(v) {
        return v >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: {
      values: ['consultation', 'follow_up', 'emergency', 'surgery', 'telemedicine', 'checkup', 'vaccination'],
      message: 'Appointment type must be consultation, follow_up, emergency, surgery, telemedicine, checkup, or vaccination'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
      message: 'Invalid appointment status'
    },
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  duration: {
    type: Number,
    default: 30,
    min: [15, 'Minimum duration is 15 minutes'],
    max: [240, 'Maximum duration is 4 hours']
  },
  
  // Appointment details
  reason: {
    type: String,
    required: [true, 'Appointment reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  symptoms: [{
    symptom: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    duration: String
  }],
  notes: {
    patient: String,
    doctor: String,
    admin: String
  },
  
  // Medical information
  diagnosis: {
    primary: String,
    secondary: [String],
    icd10Codes: [String]
  },
  treatment: {
    plan: String,
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    procedures: [{
      name: String,
      description: String,
      scheduledDate: Date
    }]
  },
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  
  // Telemedicine specific fields
  telemedicine: {
    isTelemedicine: {
      type: Boolean,
      default: false
    },
    platform: {
      type: String,
      enum: ['zoom', 'teams', 'skype', 'custom'],
      default: 'zoom'
    },
    meetingLink: String,
    meetingId: String,
    meetingPassword: String,
    recordingUrl: String,
    recordingConsent: {
      type: Boolean,
      default: false
    }
  },
  
  // AI-powered features
  aiRecommendations: {
    suggestedDuration: Number,
    suggestedPriority: String,
    conflictWarnings: [String],
    optimalTimeSlots: [{
      date: Date,
      time: String,
      score: Number
    }],
    patientRiskFactors: [String],
    recommendedTests: [String]
  },
  
  // Scheduling and reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'call']
    },
    scheduledAt: Date,
    sentAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'cancelled'],
      default: 'pending'
    }
  }],
  
  // Cancellation and rescheduling
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'completed', 'failed'],
      default: 'pending'
    }
  },
  
  rescheduling: {
    originalDate: Date,
    originalTime: String,
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescheduledAt: Date,
    reason: String
  },
  
  // Billing and insurance
  billing: {
    consultationFee: {
      type: Number,
      default: 0
    },
    insuranceCoverage: {
      type: Number,
      default: 0
    },
    patientResponsibility: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    },
    insuranceClaimId: String
  },
  
  // Follow-up
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    suggestedDate: Date,
    reason: String,
    scheduledFollowUpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata
  tags: [String],
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full appointment datetime
appointmentSchema.virtual('appointmentDateTime').get(function() {
  if (!this.appointmentDate || !this.appointmentTime) return null;
  
  const [hours, minutes] = this.appointmentTime.split(':');
  const datetime = new Date(this.appointmentDate);
  datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return datetime;
});

// Virtual for end time
appointmentSchema.virtual('endTime').get(function() {
  if (!this.appointmentDateTime || !this.duration) return null;
  
  const endTime = new Date(this.appointmentDateTime);
  endTime.setMinutes(endTime.getMinutes() + this.duration);
  
  return endTime;
});

// Virtual for is overdue
appointmentSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'scheduled' && this.status !== 'confirmed') return false;
  
  const now = new Date();
  const appointmentEnd = this.endTime;
  
  return appointmentEnd && now > appointmentEnd;
});

// Virtual for is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  if (this.status !== 'scheduled' && this.status !== 'confirmed') return false;
  
  const now = new Date();
  const appointmentStart = this.appointmentDateTime;
  
  return appointmentStart && now < appointmentStart;
});

// Indexes
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ type: 1 });
appointmentSchema.index({ 'telemedicine.isTelemedicine': 1 });
// Compound indexes for efficient queries
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });

// Pre-save middleware
appointmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate appointment ID
    this.appointmentId = await generateAppointmentId();
    
    // Set created by
    if (!this.createdBy) {
      this.createdBy = this.patientId; // Default to patient
    }
  }
  
  // Set updated by
  this.updatedBy = this.patientId; // This should be set by the controller
  
  next();
});

// Pre-save middleware for status changes
appointmentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    // Handle status change logic
    if (this.status === 'cancelled' && !this.cancellation.cancelledAt) {
      this.cancellation.cancelledAt = new Date();
    }
    
    if (this.status === 'rescheduled' && !this.rescheduling.rescheduledAt) {
      this.rescheduling.rescheduledAt = new Date();
    }
  }
  
  next();
});

// Instance methods
appointmentSchema.methods.isConflicting = async function() {
  const startTime = this.appointmentDateTime;
  const endTime = this.endTime;
  
  const conflictingAppointment = await this.constructor.findOne({
    doctorId: this.doctorId,
    _id: { $ne: this._id },
    status: { $in: ['scheduled', 'confirmed'] },
    $or: [
      {
        appointmentDateTime: { $lt: endTime },
        $expr: {
          $gt: [
            { $add: ['$appointmentDateTime', { $multiply: ['$duration', 60000] }] },
            startTime
          ]
        }
      }
    ]
  });
  
  return !!conflictingAppointment;
};

appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentStart = this.appointmentDateTime;
  const hoursUntilAppointment = (appointmentStart - now) / (1000 * 60 * 60);
  
  return this.status === 'scheduled' || 
         this.status === 'confirmed' && hoursUntilAppointment > 24;
};

appointmentSchema.methods.canBeRescheduled = function() {
  const now = new Date();
  const appointmentStart = this.appointmentDateTime;
  const hoursUntilAppointment = (appointmentStart - now) / (1000 * 60 * 60);
  
  return this.status === 'scheduled' || 
         this.status === 'confirmed' && hoursUntilAppointment > 2;
};

// Static methods
appointmentSchema.statics.findByDateRange = function(doctorId, startDate, endDate) {
  return this.find({
    doctorId,
    appointmentDate: {
      $gte: startDate,
      $lte: endDate
    },
    status: { $in: ['scheduled', 'confirmed'] }
  }).sort({ appointmentDate: 1, appointmentTime: 1 });
};

appointmentSchema.statics.findConflicting = function(doctorId, date, time, duration, excludeId = null) {
  const startTime = new Date(date);
  const [hours, minutes] = time.split(':');
  startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  
  const query = {
    doctorId,
    status: { $in: ['scheduled', 'confirmed'] },
    $or: [
      {
        appointmentDateTime: { $lt: endTime },
        $expr: {
          $gt: [
            { $add: ['$appointmentDateTime', { $multiply: ['$duration', 60000] }] },
            startTime
          ]
        }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

appointmentSchema.statics.findUpcoming = function(userId, role, limit = 10) {
  const query = {
    appointmentDate: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  };
  
  if (role === 'patient') {
    query.patientId = userId;
  } else if (role === 'doctor') {
    query.doctorId = userId;
  }
  
  return this.find(query)
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .limit(limit)
    .populate('patientId', 'firstName lastName email phoneNumber')
    .populate('doctorId', 'firstName lastName email specialization');
};

// Helper function to generate appointment ID
async function generateAppointmentId() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const count = await mongoose.model('Appointment').countDocuments({
    appointmentDate: {
      $gte: new Date(year, date.getMonth(), date.getDate()),
      $lt: new Date(year, date.getMonth(), date.getDate() + 1)
    }
  });
  
  return `APT${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
}

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 