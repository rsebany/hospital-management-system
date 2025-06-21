const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     MedicalRecord:
 *       type: object
 *       required:
 *         - patientId
 *         - recordType
 *         - data
 *       properties:
 *         _id:
 *           type: string
 *         patientId:
 *           type: string
 *           description: Reference to patient user
 *         doctorId:
 *           type: string
 *           description: Reference to doctor user
 *         recordType:
 *           type: string
 *           enum: [visit, lab, imaging, prescription, allergy, immunization, surgery, note]
 *         data:
 *           type: object
 *           description: Encrypted medical data
 *         version:
 *           type: number
 *         recordHash:
 *           type: string
 *           description: SHA256 hash of the record for blockchain verification
 *         blockchainTransactionHash:
 *           type: string
 *           description: Blockchain transaction hash where record hash is stored
 *         blockchainBlockNumber:
 *           type: number
 *           description: Blockchain block number where transaction was mined
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recordType: {
    type: String,
    required: true,
    enum: ['visit', 'lab', 'imaging', 'prescription', 'allergy', 'immunization', 'surgery', 'note']
  },
  data: {
    type: String, // Encrypted JSON string
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  // Blockchain integration fields
  recordHash: {
    type: String,
    description: 'SHA256 hash of the record for blockchain verification'
  },
  blockchainTransactionHash: {
    type: String,
    description: 'Blockchain transaction hash where record hash is stored'
  },
  blockchainBlockNumber: {
    type: Number,
    description: 'Blockchain block number where transaction was mined'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

medicalRecordSchema.index({ patientId: 1, recordType: 1 });
medicalRecordSchema.index({ doctorId: 1 });
medicalRecordSchema.index({ isActive: 1 });
medicalRecordSchema.index({ recordHash: 1 }); // Index for blockchain verification

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord; 