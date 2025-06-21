const OpenAI = require('openai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.systemPrompts = {
      symptomAnalysis: `You are a medical AI assistant. Analyze patient symptoms and provide preliminary assessments. 
      Always include disclaimers that this is not a substitute for professional medical advice. 
      Focus on common conditions and recommend when to seek immediate medical attention.`,
      
      medicalTextProcessing: `You are a medical AI assistant specializing in processing and summarizing medical text. 
      Extract key information, identify important medical terms, and provide clear summaries. 
      Maintain medical accuracy while making information accessible.`,
      
      appointmentScheduling: `You are an AI assistant for hospital appointment scheduling. 
      Help patients understand appointment types, preparation requirements, and scheduling options. 
      Provide helpful information about what to bring and expect during appointments.`,
      
      medicalRecordAnalysis: `You are a medical AI assistant for analyzing medical records. 
      Extract key information, identify patterns, and provide insights while maintaining patient privacy. 
      Focus on factual information and avoid making definitive diagnoses.`
    };
  }

  /**
   * Analyze patient symptoms and provide preliminary assessment
   */
  async analyzeSymptoms(symptoms, patientAge, gender, medicalHistory = []) {
    try {
      const prompt = `
        Patient Information:
        - Age: ${patientAge}
        - Gender: ${gender}
        - Previous Medical History: ${medicalHistory.join(', ') || 'None provided'}
        
        Reported Symptoms: ${symptoms}
        
        Please provide:
        1. Possible conditions (common and serious)
        2. Red flags that require immediate medical attention
        3. Recommended next steps
        4. General advice for symptom management
        
        IMPORTANT: This is for informational purposes only and should not replace professional medical evaluation.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.systemPrompts.symptomAnalysis },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      return {
        analysis: response.choices[0].message.content,
        timestamp: new Date().toISOString(),
        disclaimer: "This analysis is for informational purposes only and should not replace professional medical evaluation."
      };
    } catch (error) {
      logger.error('Error in symptom analysis:', error);
      throw new Error('Failed to analyze symptoms');
    }
  }

  /**
   * Process and summarize medical text
   */
  async processMedicalText(text, type = 'general') {
    try {
      const prompt = `
        Medical Text Type: ${type}
        Text to Process: ${text}
        
        Please:
        1. Extract key medical information
        2. Identify important medical terms and their meanings
        3. Provide a clear summary
        4. Highlight any critical information
        5. Suggest any follow-up questions or clarifications needed
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.systemPrompts.medicalTextProcessing },
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.2
      });

      return {
        summary: response.choices[0].message.content,
        processedAt: new Date().toISOString(),
        originalLength: text.length
      };
    } catch (error) {
      logger.error('Error in medical text processing:', error);
      throw new Error('Failed to process medical text');
    }
  }

  /**
   * Assist with appointment scheduling
   */
  async assistAppointmentScheduling(appointmentType, patientInfo, symptoms = '') {
    try {
      const prompt = `
        Appointment Type: ${appointmentType}
        Patient Information: ${JSON.stringify(patientInfo)}
        Symptoms: ${symptoms}
        
        Please provide:
        1. What to expect during this type of appointment
        2. Preparation requirements (fasting, medications, etc.)
        3. What to bring (ID, insurance, medical records, etc.)
        4. Estimated duration
        5. Any special instructions
        6. When to arrive before the appointment
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.systemPrompts.appointmentScheduling },
          { role: "user", content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.3
      });

      return {
        guidance: response.choices[0].message.content,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error in appointment scheduling assistance:', error);
      throw new Error('Failed to provide appointment guidance');
    }
  }

  /**
   * Analyze medical records for patterns and insights
   */
  async analyzeMedicalRecords(records, analysisType = 'general') {
    try {
      const prompt = `
        Analysis Type: ${analysisType}
        Medical Records: ${JSON.stringify(records)}
        
        Please analyze and provide:
        1. Key patterns and trends
        2. Important medical events
        3. Medication history and compliance
        4. Risk factors identified
        5. Recommendations for follow-up
        6. Areas requiring attention
        
        Focus on factual information and avoid making definitive diagnoses.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.systemPrompts.medicalRecordAnalysis },
          { role: "user", content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.2
      });

      return {
        analysis: response.choices[0].message.content,
        analyzedAt: new Date().toISOString(),
        recordCount: records.length
      };
    } catch (error) {
      logger.error('Error in medical record analysis:', error);
      throw new Error('Failed to analyze medical records');
    }
  }

  /**
   * Generate medical report summaries
   */
  async generateReportSummary(reportData, reportType) {
    try {
      const prompt = `
        Report Type: ${reportType}
        Report Data: ${JSON.stringify(reportData)}
        
        Please generate a comprehensive summary including:
        1. Executive summary
        2. Key findings
        3. Important metrics
        4. Recommendations
        5. Action items
        
        Make it professional and suitable for medical staff review.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a medical AI assistant specializing in generating professional medical report summaries." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      return {
        summary: response.choices[0].message.content,
        generatedAt: new Date().toISOString(),
        reportType
      };
    } catch (error) {
      logger.error('Error in report summary generation:', error);
      throw new Error('Failed to generate report summary');
    }
  }

  /**
   * Provide medication information and interactions
   */
  async getMedicationInfo(medicationName, patientMedications = []) {
    try {
      const prompt = `
        Medication: ${medicationName}
        Current Patient Medications: ${patientMedications.join(', ') || 'None'}
        
        Please provide:
        1. General information about the medication
        2. Common side effects
        3. Potential drug interactions with current medications
        4. Important warnings and precautions
        5. Storage and administration instructions
        6. When to contact a healthcare provider
        
        IMPORTANT: This is for informational purposes only. Always consult with healthcare providers for medical advice.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a medical AI assistant providing medication information. Always include appropriate disclaimers." },
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.2
      });

      return {
        information: response.choices[0].message.content,
        retrievedAt: new Date().toISOString(),
        disclaimer: "This information is for educational purposes only and should not replace professional medical advice."
      };
    } catch (error) {
      logger.error('Error in medication information retrieval:', error);
      throw new Error('Failed to retrieve medication information');
    }
  }

  /**
   * Health and wellness recommendations
   */
  async getWellnessRecommendations(patientProfile, healthGoals = []) {
    try {
      const prompt = `
        Patient Profile: ${JSON.stringify(patientProfile)}
        Health Goals: ${healthGoals.join(', ') || 'General wellness'}
        
        Please provide personalized recommendations for:
        1. Lifestyle modifications
        2. Diet and nutrition
        3. Exercise and physical activity
        4. Stress management
        5. Preventive care
        6. Health monitoring
        
        Make recommendations practical and achievable.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a wellness AI assistant providing personalized health and wellness recommendations." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.4
      });

      return {
        recommendations: response.choices[0].message.content,
        generatedAt: new Date().toISOString(),
        goals: healthGoals
      };
    } catch (error) {
      logger.error('Error in wellness recommendations:', error);
      throw new Error('Failed to generate wellness recommendations');
    }
  }

  /**
   * Emergency triage assistance
   */
  async emergencyTriage(symptoms, vitalSigns = {}, patientAge, gender) {
    try {
      const prompt = `
        EMERGENCY TRIAGE ASSESSMENT
        
        Symptoms: ${symptoms}
        Vital Signs: ${JSON.stringify(vitalSigns)}
        Patient Age: ${patientAge}
        Patient Gender: ${gender}
        
        Please assess:
        1. Severity level (1-5, where 1 is least severe, 5 is most severe)
        2. Recommended response time
        3. Whether emergency care is needed
        4. Immediate actions to take
        5. Red flags to watch for
        
        IMPORTANT: This is for initial assessment only. When in doubt, seek immediate medical attention.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are an emergency triage AI assistant. Always err on the side of caution and recommend seeking medical attention when appropriate." },
          { role: "user", content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.1
      });

      return {
        triageAssessment: response.choices[0].message.content,
        assessedAt: new Date().toISOString(),
        emergencyDisclaimer: "This assessment is for informational purposes only. In case of emergency, call emergency services immediately."
      };
    } catch (error) {
      logger.error('Error in emergency triage:', error);
      throw new Error('Failed to perform triage assessment');
    }
  }

  /**
   * Suggest optimal appointment slots using AI
   */
  async suggestAppointmentSlots({ patientId, doctorId, preferredDates, timeRange, constraints, doctorSchedule, patientSchedule, hospitalLoad }) {
    try {
      const prompt = `
        You are an AI assistant for hospital appointment scheduling.
        Patient ID: ${patientId}
        Doctor ID: ${doctorId}
        Preferred Dates: ${preferredDates.join(', ')}
        Time Range: ${JSON.stringify(timeRange)}
        Constraints: ${JSON.stringify(constraints)}
        Doctor Schedule: ${JSON.stringify(doctorSchedule)}
        Patient Schedule: ${JSON.stringify(patientSchedule)}
        Hospital Load: ${JSON.stringify(hospitalLoad)}

        Please suggest up to 3 optimal appointment slots (date, startTime, endTime) with a short reason for each suggestion. Avoid conflicts and consider preferences and constraints.
        Respond as a JSON array of objects with keys: date, startTime, endTime, reason.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.systemPrompts.appointmentScheduling },
          { role: "user", content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.3
      });

      // Parse the AI's JSON response
      let suggestions = [];
      try {
        const match = response.choices[0].message.content.match(/\[.*\]/s);
        suggestions = match ? JSON.parse(match[0]) : [];
      } catch (e) {
        suggestions = [{ date: null, startTime: null, endTime: null, reason: 'AI response could not be parsed.' }];
      }

      return { suggestions };
    } catch (error) {
      logger.error('Error in AI appointment slot suggestion:', error);
      throw new Error('Failed to suggest appointment slots');
    }
  }

  /**
   * Analyze wearable data for trends, anomalies, and recommendations
   */
  async analyzeWearableData(wearableData) {
    try {
      const prompt = `
        You are a medical AI assistant. Analyze the following wearable device data for trends, anomalies, and provide health recommendations. Focus on heart rate, steps, sleep, and any other available metrics. Highlight any days with abnormal readings or significant changes. Suggest actionable advice if needed.
        
        Wearable Data (chronological):
        ${JSON.stringify(wearableData, null, 2)}
        
        Please provide:
        1. Key trends and patterns
        2. Any detected anomalies or outliers
        3. Personalized health recommendations
        4. A brief summary for the patient
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a medical AI assistant specializing in wearable health data analysis." },
          { role: "user", content: prompt }
        ],
        max_tokens: 900,
        temperature: 0.3
      });

      return {
        analysis: response.choices[0].message.content
      };
    } catch (error) {
      logger.error('Error in AI wearable data analysis:', error);
      throw new Error('Failed to analyze wearable data');
    }
  }

  /**
   * Predict patient flow using AI
   */
  async predictPatientFlow({ forecastType, timeRange, department, confidenceLevel, historicalData }) {
    try {
      const prompt = `
        You are a hospital operations AI assistant. Analyze the following historical data and predict ${forecastType} for the specified time range.
        
        Forecast Type: ${forecastType}
        Time Range: ${timeRange.startDate} to ${timeRange.endDate}
        Department: ${department || 'All departments'}
        Confidence Level: ${confidenceLevel}
        
        Historical Data:
        ${JSON.stringify(historicalData, null, 2)}
        
        Please provide:
        1. Daily predictions for the specified time range
        2. Confidence intervals for each prediction
        3. Key factors influencing the predictions
        4. A summary of expected trends
        
        Respond with a JSON object containing:
        - predictions: array of daily predictions with date, value, confidence, and factors
        - summary: brief summary of the forecast
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a hospital operations AI assistant specializing in patient flow predictions and resource planning." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.2
      });

      // Parse the AI's JSON response
      let result = { predictions: [], summary: 'Unable to generate predictions.' };
      try {
        const match = response.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (match) {
          result = JSON.parse(match[0]);
        }
      } catch (e) {
        logger.error('Failed to parse AI prediction response:', e);
      }

      return result;
    } catch (error) {
      logger.error('Error in AI patient flow prediction:', error);
      throw new Error('Failed to predict patient flow');
    }
  }
}

module.exports = new AIService(); 