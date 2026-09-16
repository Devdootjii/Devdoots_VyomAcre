import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://devdoots-vyomacre-y0gr.onrender.com';

// Axios ka centralized client jisme base configuration set hai
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// EXISTING ENDPOINTS
// ============================================================================

// Contract A: Roof Owner Onboarding (Aryan / Harsh)
export const submitRoofDetails = async (roofData) => {
  return await apiClient.post('/api/roofs/add', roofData);
};

export const getOwnerRoofs = async (phoneNumber) => {
  return await apiClient.get(`/api/roofs?owner_id=${phoneNumber}`);
};

// Ritesh: Company Marketplace & Admin Radar Endpoints
export const getAllRoofs = async (params = {}) => {
  return await apiClient.get('/api/roofs', { params });
};

export const getVerifiedRoofs = async () => {
  return await apiClient.get('/api/roofs/verified');
};

export const getScannedZones = async () => {
  return await apiClient.get('/api/zones/scanned');
};

export const createLeaseRequest = async (payload) => {
  return await apiClient.post('/api/lease-requests', payload);
};

// ============================================================================
// NEW ENDPOINTS (DAY 10 & 11 TASKS)
// ============================================================================

/**
 * VYOMACRE AI CHATBOT API INTEGRATION (Balram)
 * Ye function Divyansh ke backend endpoint /api/ai/ask ko hit karega.
 *
 * API Contract:
 * Request  -> { "question": "..." }
 * Response -> { "status": "...", "data": { "answer": "..." } }
 *
 * @param {string} question - User dwara poocha gaya sawaal.
 * @returns {object} Backend se aane wala response.
 */
export const askAI = async (question) => {
  try {
    // Axios apiClient ka use karke Divyansh ke endpoint par POST request bhejna
    const response = await apiClient.post('/api/ai/ask', {
      question: question,
    });

    // Axios automatically JSON parse karke response.data me daal deta hai
    return response.data;
  } catch (error) {
    // Detailed error logging taaki debugging me aasaani ho
    console.error('askAI API Request Failed:', error);

    // Standardized Error Envelope
    return {
      status: 'error',
      message:
        error.response?.data?.message ||
        error.message ||
        'Network error ya VyomAcre backend down hai.',
      data: null,
    };
  }
};
