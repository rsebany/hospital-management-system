const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Billing:
 *       type: object
 *       required:
 *         - patientId
 *         - amount
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *         patientId:
 *           type: string
 *         appointmentId:
 *           type: string
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, paid, refunded, cancelled, failed]
 *         paymentMethod:
 *           type: string
 *         insuranceClaimId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const billingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'refunded', 'cancelled', 'failed'],
    default: 'pending'
  },
  paymentMethod: String,
  insuranceClaimId: String
}, {
  timestamps: true
});

billingSchema.index({ patientId: 1 });
billingSchema.index({ appointmentId: 1 });
billingSchema.index({ status: 1 });

const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing; 