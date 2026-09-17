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