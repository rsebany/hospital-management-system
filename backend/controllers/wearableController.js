const WearableData = require('../models/WearableData');
const logger = require('../utils/logger');

const wearableController = {
  // Ingest wearable data
  async ingestData(req, res) {
    try {
      const { patientId, deviceType, timestamp, data } = req.body;
      const wearable = new WearableData({ patientId, deviceType, timestamp, data });
      await wearable.save();
      res.status(201).json({ success: true, message: 'Wearable data saved', wearable });
    } catch (error) {
      logger.error('Error ingesting wearable data:', error);
      res.status(500).json({ success: false, error: 'Failed to save wearable data', message: error.message });
    }
  },

  // Retrieve wearable data for a patient
  async getPatientData(req, res) {
    try {
      const { patientId } = req.params;
      const data = await WearableData.find({ patientId }).sort({ timestamp: -1 }).limit(100);
      res.status(200).json({ success: true, data });
    } catch (error) {
      logger.error('Error retrieving wearable data:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve wearable data', message: error.message });
    }
  }
};

module.exports = wearableController; 