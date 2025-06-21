# AI Features - Hospital Management System

## 🚀 Overview

The Hospital Management System includes advanced AI-powered features designed to enhance patient care, streamline medical processes, and provide intelligent assistance to healthcare professionals. Built with OpenAI's GPT-4, our AI features prioritize medical accuracy, patient privacy, and safety.

## ✨ Features

### 🤖 Core AI Capabilities

1. **Symptom Analysis** - Analyze patient symptoms and provide preliminary assessments
2. **Medical Text Processing** - Process and summarize medical documents
3. **Appointment Assistance** - Provide guidance for appointment preparation
4. **Medical Records Analysis** - Analyze patterns and trends in patient records
5. **Report Summary Generation** - Generate comprehensive medical report summaries
6. **Medication Information** - Provide detailed medication information and interactions
7. **Wellness Recommendations** - Personalized health and wellness guidance
8. **Emergency Triage** - Emergency assessment with severity levels

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 20.0.0 or higher
- MongoDB
- Redis (optional, for caching)
- OpenAI API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment file and configure AI settings:

```bash
cp env.example .env
```

Configure the following AI-related environment variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.3
OPENAI_TIMEOUT=30000

# AI Service Configuration
AI_ENABLED=true
AI_RATE_LIMIT_WINDOW=900000
AI_RATE_LIMIT_MAX=50
AI_CACHE_ENABLED=true
AI_CACHE_TTL=3600
AI_FALLBACK_ENABLED=true

# AI Feature Flags
AI_SYMPTOM_ANALYSIS_ENABLED=true
AI_TEXT_PROCESSING_ENABLED=true
AI_APPOINTMENT_ASSISTANCE_ENABLED=true
AI_RECORD_ANALYSIS_ENABLED=true
AI_REPORT_SUMMARY_ENABLED=true
AI_MEDICATION_INFO_ENABLED=true
AI_WELLNESS_RECOMMENDATIONS_ENABLED=true
AI_EMERGENCY_TRIAGE_ENABLED=true
```

### 3. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1/ai
```

### Authentication
All AI endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🔧 API Endpoints

### 1. Health Check
```http
GET /health
```

### 2. Symptom Analysis
```http
POST /symptoms/analyze
```

**Request Body:**
```json
{
  "symptoms": "Headache, fever, and fatigue for the past 3 days",
  "patientAge": 35,
  "gender": "male",
  "medicalHistory": ["Hypertension", "Diabetes"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "Based on the symptoms described...",
    "timestamp": "2024-01-20T10:30:00.000Z",
    "disclaimer": "This analysis is for informational purposes only..."
  }
}
```

### 3. Medical Text Processing
```http
POST /text/process
```

**Request Body:**
```json
{
  "text": "Patient presents with elevated blood pressure...",
  "type": "diagnosis"
}
```

### 4. Appointment Assistance
```http
POST /appointments/assist
```

**Request Body:**
```json
{
  "appointmentType": "Cardiology Consultation",
  "patientInfo": {
    "age": 45,
    "gender": "female",
    "hasInsurance": true
  },
  "symptoms": "Chest pain and shortness of breath"
}
```

### 5. Medical Records Analysis
```http
POST /records/analyze
```

**Request Body:**
```json
{
  "records": [
    {
      "date": "2024-01-15",
      "type": "appointment",
      "notes": "Patient reported improved symptoms"
    }
  ],
  "analysisType": "general"
}
```

### 6. Report Summary Generation
```http
POST /reports/summary
```

**Request Body:**
```json
{
  "reportData": {
    "patientName": "John Doe",
    "diagnosis": "Hypertension",
    "medications": ["Lisinopril"]
  },
  "reportType": "patient_summary"
}
```

### 7. Medication Information
```http
POST /medications/info
```

**Request Body:**
```json
{
  "medicationName": "Lisinopril",
  "patientMedications": ["Amlodipine", "Metformin"]
}
```

### 8. Wellness Recommendations
```http
POST /wellness/recommendations
```

**Request Body:**
```json
{
  "patientProfile": {
    "age": 40,
    "gender": "male",
    "weight": 75,
    "height": 175,
    "activityLevel": "moderate",
    "medicalConditions": ["Hypertension"]
  },
  "healthGoals": ["Weight management", "Blood pressure control"]
}
```

### 9. Emergency Triage
```http
POST /emergency/triage
```

**Request Body:**
```json
{
  "symptoms": "Severe chest pain, shortness of breath",
  "vitalSigns": {
    "bloodPressure": "180/110",
    "heartRate": 120
  },
  "patientAge": 55,
  "gender": "male"
}
```

## 🧪 Testing

Run the AI feature tests:

```bash
# Run all tests
npm test

# Run only AI tests
npm test -- tests/ai.test.js

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security & Privacy

### HIPAA Compliance
- All AI interactions are logged for audit purposes
- Patient data is encrypted in transit and at rest
- Access controls ensure only authorized personnel can use AI features
- All AI responses include appropriate medical disclaimers

### Rate Limiting
- AI endpoints are rate-limited to prevent abuse
- Configurable limits per user and IP address
- Graceful handling of rate limit exceeded scenarios

### Data Protection
- No patient data is stored by OpenAI
- All requests are anonymized where possible
- Audit logs track all AI interactions
- Automatic data retention policies

## 🚨 Important Disclaimers

### Medical Disclaimer
**⚠️ IMPORTANT:** The AI features in this system are designed to assist healthcare professionals and should never replace professional medical judgment. All AI-generated content includes appropriate medical disclaimers and should be reviewed by qualified healthcare providers.

### Limitations
- AI responses are for informational purposes only
- Not a substitute for professional medical evaluation
- May not include the latest medical research
- Should not be used for emergency situations
- Accuracy depends on the quality of input data

## 🔧 Configuration Options

### Model Settings
```env
OPENAI_MODEL=gpt-4                    # AI model to use
OPENAI_MAX_TOKENS=1000               # Maximum response length
OPENAI_TEMPERATURE=0.3               # Response creativity (0.0-1.0)
OPENAI_TIMEOUT=30000                 # Request timeout in ms
```

### Rate Limiting
```env
AI_RATE_LIMIT_WINDOW=900000          # 15 minutes in ms
AI_RATE_LIMIT_MAX=50                 # Max requests per window
```

### Caching
```env
AI_CACHE_ENABLED=true                # Enable response caching
AI_CACHE_TTL=3600                    # Cache TTL in seconds
```

### Feature Flags
```env
AI_SYMPTOM_ANALYSIS_ENABLED=true
AI_TEXT_PROCESSING_ENABLED=true
AI_APPOINTMENT_ASSISTANCE_ENABLED=true
AI_RECORD_ANALYSIS_ENABLED=true
AI_REPORT_SUMMARY_ENABLED=true
AI_MEDICATION_INFO_ENABLED=true
AI_WELLNESS_RECOMMENDATIONS_ENABLED=true
AI_EMERGENCY_TRIAGE_ENABLED=true
```

## 📊 Monitoring & Analytics

### Logging
All AI interactions are logged with the following information:
- User ID and role
- Request type and parameters
- Response status and timing
- Error details (if any)

### Metrics
- Request volume and success rates
- Response times and performance
- Error rates and types
- Cost tracking for OpenAI API usage

### Health Monitoring
```bash
# Check AI service health
curl http://localhost:3000/api/v1/ai/health
```

## 🔄 Integration Examples

### Frontend Integration (JavaScript)
```javascript
// Symptom Analysis
const analyzeSymptoms = async (symptoms, patientAge, gender) => {
  try {
    const response = await fetch('/api/v1/ai/symptoms/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        symptoms,
        patientAge,
        gender
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AI analysis failed:', error);
    throw error;
  }
};
```

### Backend Integration (Node.js)
```javascript
const aiService = require('./services/aiService');

// Medical Text Processing
const processMedicalText = async (text, type) => {
  try {
    const result = await aiService.processMedicalText(text, type);
    logger.info('Medical text processed successfully', { 
      type, 
      textLength: text.length 
    });
    return result;
  } catch (error) {
    logger.error('Medical text processing failed', error);
    throw new Error('Failed to process medical text');
  }
};
```

## 🚀 Deployment

### Production Considerations
1. **Environment Variables** - Ensure all AI configuration is properly set
2. **API Keys** - Use secure methods to manage OpenAI API keys
3. **Rate Limiting** - Configure appropriate rate limits for production
4. **Monitoring** - Set up comprehensive monitoring and alerting
5. **Backup** - Implement proper backup and recovery procedures

### Docker Deployment
```dockerfile
# Example Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🆘 Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key configuration
   - Verify API key has sufficient credits
   - Check rate limits and quotas

2. **Authentication Errors**
   - Verify JWT token is valid
   - Check user permissions
   - Ensure proper Authorization header

3. **Rate Limiting**
   - Check current usage against limits
   - Implement exponential backoff
   - Consider upgrading API plan

4. **Performance Issues**
   - Monitor response times
   - Check network connectivity
   - Review OpenAI API status

### Debug Mode
Enable debug logging:
```env
LOG_LEVEL=debug
```

## 📞 Support

For AI feature support:

1. **Documentation** - Check the comprehensive API documentation
2. **Testing** - Run the test suite to verify functionality
3. **Logs** - Review application logs for error details
4. **Monitoring** - Check health endpoints and metrics
5. **Community** - Join our developer community for help

## 🔮 Future Enhancements

Planned AI feature improvements:

- [ ] Multi-language support
- [ ] Image analysis capabilities
- [ ] Predictive analytics
- [ ] Voice integration
- [ ] Custom model training
- [ ] Real-time monitoring
- [ ] Enhanced drug interactions
- [ ] Clinical decision support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions to improve the AI features! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

---

**⚠️ Medical Disclaimer:** This AI system is designed to assist healthcare professionals and should never replace professional medical judgment. Always consult with qualified healthcare providers for medical decisions. 