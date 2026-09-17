<<<<<<< HEAD
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://devdoots-vyomacre-y0gr.onrender.com';

// ============================================================================
// AXIOS CLIENT
// ============================================================================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// JWT AUTHENTICATION
// ============================================================================

// Automatically attach JWT token to authenticated requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vyomacre_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);

  const token = response?.data?.data?.token;
  const user = response?.data?.data?.user;

  if (token) {
    localStorage.setItem('vyomacre_token', token);
  }

  if (user) {
    localStorage.setItem(
      'vyomacre_owner_data',
      JSON.stringify({
        owner_name: user.name,
        phone_number: user.phone,
        email: user.email,
        role: user.role,
      })
    );
  }

  return response;
};

export const getCurrentUser = async () => {
  return await apiClient.get('/api/auth/me');
};

// ============================================================================
// ROOF OWNER ONBOARDING
// ============================================================================

export const submitRoofDetails = async (roofData) => {
  return await apiClient.post('/api/roofs/add', roofData);
};

export const getOwnerRoofs = async (phoneNumber) => {
  return await apiClient.get(`/api/roofs?owner_id=${phoneNumber}`);
};

// ============================================================================
// OWNER LEASE REQUESTS
// ============================================================================

export const getOwnerLeaseRequests = async (ownerPhone) => {
  return await apiClient.get('/api/lease-requests', {
    params: {
      owner_id: ownerPhone,
    },
  });
};

export const updateLeaseRequest = async (requestId, status) => {
  return await apiClient.patch(
    `/api/lease-requests/${requestId}`,
    {
      status: status,
    }
  );
};

// ============================================================================
// MARKETPLACE & ADMIN ENDPOINTS
// ============================================================================

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
// AI CHATBOT
// ============================================================================

export const askAI = async (question) => {
  try {
    const response = await apiClient.post('/api/ai/ask', {
      question: question,
    });

    return response.data;
  } catch (error) {
    console.error('askAI API Request Failed:', error);

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
=======
import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://devdoots-vyomacre-y0gr.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vyomacre_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const signupUser = async (userData) => api.post('/api/auth/signup', userData);
export const loginUser = async (credentials) => api.post('/api/auth/login', credentials);
export const getCurrentUser = async () => api.get('/api/auth/me');

// Owner Portal
export const submitRoofDetails = async (roofData) => api.post('/api/roofs/add', roofData);
export const getOwnerRoofs = async (phoneNumber) => api.get(`/api/roofs?owner_id=${phoneNumber}`);

// Marketplace Endpoints
export const getAllRoofs = async (params = {}) => api.get('/api/roofs', { params });
export const getVerifiedRoofs = async () => api.get('/api/roofs');

export const getFilteredRoofs = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.city && filters.city !== 'ALL') queryParams.append('city', filters.city);
  if (filters.roof_type && filters.roof_type !== 'ALL') queryParams.append('roof_type', filters.roof_type);
  if (filters.min_area) queryParams.append('min_area', filters.min_area);
  if (filters.max_area) queryParams.append('max_area', filters.max_area);

  const qs = queryParams.toString();
  return api.get(qs ? `/api/roofs?${qs}` : '/api/roofs');
};

export const getScannedZones = async () => api.get('/api/zones/scanned');
export const createLeaseRequest = async (payload) => api.post('/api/lease-requests', payload);

// Phase 2: Seeker Dashboard API with Fallback Handling
export const getSeekerLeaseRequests = async () => {
  let company = 'Devdoots CleanTech';
  try {
    const user = JSON.parse(localStorage.getItem('vyomacre_user') || '{}');
    company = user.company_name || company;
  } catch (e) {}

  return api.get(`/api/lease-requests?company_name=${encodeURIComponent(company)}`)
    .catch(() => api.get('/api/lease-requests'));
};

export default api;
>>>>>>> origin/main
