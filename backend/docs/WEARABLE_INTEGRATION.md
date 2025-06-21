# Wearable Device Integration

## Overview

The Hospital Management System includes comprehensive wearable device integration capabilities designed to collect, store, and analyze health data from various wearable devices (Fitbit, Apple Watch, etc.). This feature enables continuous patient monitoring, trend analysis, and AI-powered health insights.

## Features

### 1. Data Ingestion
**Endpoint:** `POST /api/v1/wearables/data`

Ingest health data from wearable devices and associate it with patient records.

**Use Cases:**
- Real-time health monitoring
- Continuous data collection
- Integration with third-party wearable APIs
- Batch data uploads

**Example Request:**
```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "deviceType": "fitbit",
  "timestamp": "2024-01-20T10:00:00Z",
  "data": {
    "heartRate": 75,
    "steps": 8000,
    "sleep": {
      "duration": 420,
      "quality": "good",
      "deepSleep": 120,
      "lightSleep": 240,
      "remSleep": 60
    },
    "calories": 2100,
    "distance": 5.2,
    "activeMinutes": 45
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Wearable data saved",
  "wearable": {
    "_id": "507f1f77bcf86cd799439012",
    "patientId": "507f1f77bcf86cd799439011",
    "deviceType": "fitbit",
    "timestamp": "2024-01-20T10:00:00.000Z",
    "data": {
      "heartRate": 75,
      "steps": 8000,
      "sleep": {
        "duration": 420,
        "quality": "good"
      }
    },
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

### 2. Data Retrieval
**Endpoint:** `GET /api/v1/wearables/:patientId`

Retrieve wearable data for a specific patient.

**Example Request:**
```http
GET /api/v1/wearables/507f1f77bcf86cd799439011
Authorization: Bearer <jwt-token>
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "patientId": "507f1f77bcf86cd799439011",
      "deviceType": "fitbit",
      "timestamp": "2024-01-20T10:00:00.000Z",
      "data": {
        "heartRate": 75,
        "steps": 8000,
        "sleep": {
          "duration": 420,
          "quality": "good"
        }
      }
    }
  ]
}
```

### 3. AI-Powered Analysis
**Endpoint:** `POST /api/v1/ai/wearables/analyze`

Analyze wearable data using AI to identify trends, anomalies, and provide health recommendations.

**Example Request:**
```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-07T23:59:59Z"
}
```

**Example Response:**
```json
{
  "success": true,
  "analysis": "Based on the wearable data analysis:\n\n1. Key Trends and Patterns:\n- Heart rate shows consistent patterns with average of 72 BPM\n- Daily step count averages 7,500 steps\n- Sleep quality has improved over the past week\n\n2. Anomalies Detected:\n- Elevated heart rate on January 3rd (95 BPM) - may need attention\n- Reduced sleep duration on January 5th (5.5 hours)\n\n3. Health Recommendations:\n- Continue current exercise routine\n- Consider stress management techniques\n- Maintain consistent sleep schedule\n\n4. Summary:\nOverall health metrics are within normal ranges with some minor fluctuations that are typical."
}
```

## Data Model

### WearableData Schema
```javascript
{
  patientId: ObjectId,        // Reference to User model
  deviceType: String,         // e.g., "fitbit", "apple_watch", "garmin"
  timestamp: Date,           // When the data was recorded
  data: Mixed,               // Flexible object containing health metrics
  createdAt: Date,           // When record was created
  updatedAt: Date            // When record was last updated
}
```

### Supported Data Types
- **Heart Rate:** BPM measurements
- **Steps:** Daily step count
- **Sleep:** Duration, quality, sleep stages
- **Calories:** Active and total calories
- **Distance:** Traveled distance
- **Active Minutes:** Exercise time
- **Custom Metrics:** Any additional health data

## Authentication & Security

All wearable endpoints require authentication using JWT tokens. The system includes:

- **Role-based access control** - Patients can only access their own data
- **Audit logging** - All data access is logged for compliance
- **Data encryption** - Sensitive health data is encrypted at rest
- **Input validation** - Comprehensive validation of all inputs
- **Rate limiting** - Prevents abuse of data ingestion endpoints

## Integration Examples

### Frontend Integration (JavaScript)
```javascript
// Ingest wearable data
const ingestWearableData = async (patientId, deviceType, data) => {
  try {
    const response = await fetch('/api/v1/wearables/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        patientId,
        deviceType,
        timestamp: new Date().toISOString(),
        data
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to ingest wearable data:', error);
    throw error;
  }
};

// Get patient wearable data
const getWearableData = async (patientId) => {
  try {
    const response = await fetch(`/api/v1/wearables/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to get wearable data:', error);
    throw error;
  }
};

// Analyze wearable data with AI
const analyzeWearableData = async (patientId, startDate, endDate) => {
  try {
    const response = await fetch('/api/v1/ai/wearables/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        patientId,
        startDate,
        endDate
      })
    });
    
    const result = await response.json();
    return result.analysis;
  } catch (error) {
    console.error('Failed to analyze wearable data:', error);
    throw error;
  }
};
```

### Backend Integration (Node.js)
```javascript
const WearableData = require('../models/WearableData');
const aiService = require('../services/aiService');

// Ingest data from wearable device
const ingestData = async (patientId, deviceType, data) => {
  try {
    const wearable = new WearableData({
      patientId,
      deviceType,
      timestamp: new Date(),
      data
    });
    
    await wearable.save();
    logger.info('Wearable data ingested successfully', { patientId, deviceType });
    return wearable;
  } catch (error) {
    logger.error('Failed to ingest wearable data:', error);
    throw error;
  }
};

// Analyze data with AI
const analyzeData = async (patientId, startDate, endDate) => {
  try {
    const query = { patientId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const wearableData = await WearableData.find(query).sort({ timestamp: 1 });
    const analysis = await aiService.analyzeWearableData(wearableData);
    
    return analysis;
  } catch (error) {
    logger.error('Failed to analyze wearable data:', error);
    throw error;
  }
};
```

## Third-Party Integration

### Fitbit Integration
```javascript
// Example: Webhook endpoint for Fitbit data
app.post('/api/v1/wearables/fitbit/webhook', async (req, res) => {
  try {
    const { patientId, data } = req.body;
    
    // Verify webhook signature
    if (!verifyFitbitWebhook(req)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    
    // Ingest the data
    await ingestData(patientId, 'fitbit', data);
    
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Fitbit webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

### Apple Health Integration
```javascript
// Example: Apple Health data import
const importAppleHealthData = async (patientId, healthData) => {
  try {
    for (const record of healthData) {
      await ingestData(patientId, 'apple_health', {
        type: record.type,
        value: record.value,
        unit: record.unit,
        startDate: record.startDate,
        endDate: record.endDate
      });
    }
    
    logger.info('Apple Health data imported successfully', { patientId });
  } catch (error) {
    logger.error('Failed to import Apple Health data:', error);
    throw error;
  }
};
```

## Monitoring & Analytics

The wearable integration includes comprehensive monitoring:

1. **Data Quality Metrics** - Track data completeness and accuracy
2. **Device Usage Analytics** - Monitor which devices are most popular
3. **Performance Metrics** - Response times and throughput
4. **Error Tracking** - Monitor and alert on data ingestion failures
5. **Compliance Monitoring** - Track data retention and access patterns

## Best Practices

### For Developers
1. **Validate data format** before ingestion
2. **Implement proper error handling** for device-specific data
3. **Use appropriate rate limiting** to prevent abuse
4. **Log all data access** for audit purposes
5. **Encrypt sensitive health data**

### For Healthcare Providers
1. **Verify data accuracy** before making clinical decisions
2. **Use AI analysis as guidance** - not definitive diagnosis
3. **Maintain patient privacy** - follow HIPAA guidelines
4. **Document data sources** in patient records
5. **Regular data quality reviews**

## Limitations & Considerations

### Technical Limitations
1. **Data accuracy depends on device quality**
2. **Not all devices provide the same metrics**
3. **Data synchronization may have delays**
4. **Battery life affects data collection**
5. **Network connectivity required for real-time updates**

### Privacy & Security
1. **Patient consent required** for data collection
2. **Data encryption** at rest and in transit
3. **Access controls** based on user roles
4. **Audit trails** for compliance
5. **Data retention policies** must be followed

## Future Enhancements

Planned wearable integration improvements:

1. **Real-time Alerts** - Immediate notifications for critical health events
2. **Predictive Analytics** - Forecast health trends and potential issues
3. **Device Management** - Centralized device registration and management
4. **Advanced Analytics** - Machine learning for pattern recognition
5. **Integration APIs** - Standardized APIs for third-party devices
6. **Mobile App** - Native mobile app for data viewing
7. **Telemedicine Integration** - Share data during virtual consultations
8. **Family Monitoring** - Allow family members to view patient data (with consent)

## Support & Maintenance

For wearable integration support:

1. **Documentation** - Comprehensive API documentation
2. **Testing** - Automated test suites for all endpoints
3. **Monitoring** - Real-time service monitoring
4. **Updates** - Regular feature and security updates
5. **Training** - User training and best practices

## Compliance & Regulations

The wearable integration complies with:

1. **HIPAA** - Patient privacy protection
2. **FDA Guidelines** - Medical device data regulations
3. **GDPR** - Data protection and privacy
4. **Medical Ethics** - Professional medical standards
5. **Audit Requirements** - Healthcare audit standards 