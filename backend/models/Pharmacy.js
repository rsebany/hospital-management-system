const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Pharmacy:
 *       type: object
 *       required:
 *         - name
 *         - stock
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         stock:
 *           type: number
 *         unit:
 *           type: string
 *         price:
 *           type: number
 *         expiryDate:
 *           type: string
 *           format: date
 *         batchNumber:
 *           type: string
 *         manufacturer:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  unit: String,
  price: {
    type: Number,
    min: 0
  },
  expiryDate: Date,
  batchNumber: String,
  manufacturer: String
}, {
  timestamps: true
});

pharmacySchema.index({ name: 1 });
pharmacySchema.index({ batchNumber: 1 });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

module.exports = Pharmacy; 