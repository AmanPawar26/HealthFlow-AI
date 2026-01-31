import { GoogleGenAI, Type } from "@google/genai";
import { Frequency, PrescriptionData, PatientDetails } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Utility to call Gemini API with exponential backoff retry logic
 * Specifically handles 429 (Rate Limit) and 5xx (Server) errors.
 */
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error?.status || error?.error?.code || (error?.message?.includes('429') ? 429 : 0);
      const isQuotaError = error?.message?.toLowerCase().includes('quota') || error?.message?.toLowerCase().includes('exhausted');
      
      // Retry on Rate Limit (429) or Server Errors (500, 503, 504)
      if (status === 429 || (status >= 500 && status <= 504) || isQuotaError) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`API Error ${status}. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      // If it's a different error, throw immediately
      throw error;
    }
  }
  
  // If we exhausted retries, format a helpful error message
  if (lastError?.status === 429 || lastError?.message?.toLowerCase().includes('quota') || lastError?.message?.includes('429')) {
    throw new Error("AI Service Capacity Limit: You have exceeded the free-tier rate limit for the Gemini API. Please wait 60 seconds and try again. This is a limit of the current API key.");
  }
  throw lastError;
}

export const extractPrescription = async (transcription: string) => {
  return await callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract clinical prescription details from this doctor's transcription: "${transcription}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { 
                    type: Type.STRING, 
                    description: "One of: Once Daily (OD), Twice Daily (BD), Thrice Daily (TDS), Four times daily (QID), As needed (PRN), Custom" 
                  },
                  duration: { type: Type.STRING },
                  instructions: { type: Type.STRING }
                },
                required: ["name", "dosage", "frequency", "duration", "instructions"]
              }
            },
            advice: { type: Type.STRING },
            followUp: { type: Type.STRING }
          },
          required: ["diagnosis", "medications", "advice", "followUp"]
        }
      }
    });

    const rawJson = JSON.parse(response.text || '{}');
    
    const mappedMedications = (rawJson.medications || []).map((m: any, index: number) => ({
      ...m,
      id: `med-${Date.now()}-${index}`,
      frequency: Object.values(Frequency).includes(m.frequency) ? m.frequency : Frequency.CUSTOM
    }));

    return {
      ...rawJson,
      medications: mappedMedications
    };
  });
};

export const generateHistorySummary = async (patientName: string, history: PrescriptionData[]) => {
  if (history.length === 0) return "No prior history available for analysis.";

  return await callWithRetry(async () => {
    const historyText = history.map(h => 
      `Date: ${h.date}, Diagnosis: ${h.diagnosis}, Medications: ${h.medications.map(m => m.name).join(', ')}`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the following medical history for patient ${patientName}, provide a concise, professional 3-sentence clinical summary of their progress and recurring issues:\n\n${historyText}`,
    });

    return response.text || "Summary unavailable.";
  });
};

export const sendPrescriptionEmail = async (patient: PatientDetails, prescription: PrescriptionData) => {
  const SENDER_EMAIL = "pawaramanai@gmail.com";
  // Simulation for demonstration. In a real environment, this calls a backend SMTP route.
  await new Promise(resolve => setTimeout(resolve, 2500));
  console.log(`Email Service: Transmission from ${SENDER_EMAIL} to ${patient.email} completed.`);
  return {
    success: true,
    messageID: `msg_${Math.random().toString(36).substr(2, 9)}`,
    sender: SENDER_EMAIL,
    timestamp: new Date().toISOString()
  };
};
