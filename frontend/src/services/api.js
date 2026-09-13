import axios from 'axios';

// Environment variable se API Base URL lena, warna localhost default rahega
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Axios ka centralized client jisme base configuration set hai
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// EXISTING ENDPOINTS (DO NOT MODIFY)
// ============================================================================

// Contract A: Roof Owner Onboarding (Aryan / Harsh)
export const submitRoofDetails = async (roofData) => {
  return await apiClient.post('/api/roofs/add', roofData);
};

// Contract C: Balram's Day 3 Verified Endpoint (Ritesh)
export const getAllRoofs = async () => {
  return await apiClient.get('/api/roofs');
};


// ============================================================================
// NEW ENDPOINTS (DAY 10 & 11 TASKS)
// ============================================================================

/**
 * VYOMACRE AI CHATBOT API INTEGRATION (Balram)
 * Ye function Divyansh ke backend endpoint /api/ai/ask ko hit karega.
 * API Contract: Request { "question": "..." } | Response { "status": "...", "data": { "answer": "..." } }
 * @param {string} question - User dwara poocha gaya sawaal.
 * @returns {object} - Backend se aane wala response (success/error state ke sath).
 */
export const askAI = async (question) => {
  try {
    // Axios apiClient ka use karke Divyansh ke endpoint par POST request bhejna
    const response = await apiClient.post('/api/ai/ask', { 
      question: question 
    });
    
    // Axios automatically JSON parse karke response.data me daal deta hai
    return response.data; 
  } catch (error) {
    // Detailed error logging taaki debugging me aasaani ho
    console.error("askAI API Request Failed:", error);
    
    // Standardized Error Envelope (UI crash hone se bachane ke liye fallback)
    return {
      status: "error",
      message: error.response?.data?.message || error.message || "Network error ya VyomAcre backend down hai.",
      data: null
    };
  }
};