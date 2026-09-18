import axios from 'axios';

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://devdoots-vyomacre-y0gr.onrender.com';

// ============================================================
// AXIOS CLIENT
// ============================================================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// JWT INTERCEPTOR
// ============================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vyomacre_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// AUTH
// ============================================================

export const signupUser = async (userData) => {
  const response = await apiClient.post('/api/auth/signup', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);

  const data = response.data;

  if (data.access_token) {
    localStorage.setItem('vyomacre_token', data.access_token);
  }

  if (data.owner_data) {
    localStorage.setItem(
      'vyomacre_owner',
      JSON.stringify(data.owner_data)
    );
  }

  localStorage.setItem('vyomacre_user', JSON.stringify(data));

  return data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};

// ============================================================
// OWNER - ROOF
// ============================================================

export const submitRoofDetails = async (roofData) => {
  const response = await apiClient.post('/api/roofs/add', roofData);
  return response.data;
};

export const getOwnerRoofs = async (phone) => {
  const response = await apiClient.get('/api/roofs/owner', {
    params: {
      phone,
    },
  });

  return response.data;
};

// ============================================================
// OWNER - LEASE REQUESTS
// ============================================================

export const getOwnerLeaseRequests = async (ownerPhone) => {
  const response = await apiClient.get('/api/lease-requests', {
    params: {
      owner_id: ownerPhone,
    },
  });

  return response.data;
};

export const updateLeaseRequest = async (requestId, status) => {
  const response = await apiClient.patch(
    `/api/lease-requests/${requestId}`,
    {
      status,
    }
  );

  return response.data;
};

// ============================================================
// MARKETPLACE - ROOFS
// ============================================================

export const getAllRoofs = async () => {
  const response = await apiClient.get('/api/roofs');
  return response.data;
};

export const getVerifiedRoofs = async () => {
  const response = await apiClient.get('/api/roofs/verified');
  return response.data;
};

export const getFilteredRoofs = async (filters = {}) => {
  const response = await apiClient.get('/api/roofs/filter', {
    params: filters,
  });

  return response.data;
};

export const getScannedZones = async () => {
  const response = await apiClient.get('/api/roofs/scanned-zones');
  return response.data;
};

// ============================================================
// SEEKER - LEASE REQUEST
// ============================================================

export const createLeaseRequest = async (leaseData) => {
  const response = await apiClient.post(
    '/api/lease-requests',
    leaseData
  );

  return response.data;
};

export const getSeekerLeaseRequests = async (seekerPhone) => {
  try {
    const response = await apiClient.get('/api/lease-requests', {
      params: {
        seeker_id: seekerPhone,
      },
    });

    return response.data;
  } catch (error) {
    const response = await apiClient.get('/api/lease-requests', {
      params: {
        phone: seekerPhone,
      },
    });

    return response.data;
  }
};

// ============================================================
// AI
// ============================================================

export const askAI = async (question) => {
  const response = await apiClient.post('/api/ai/ask', {
    question,
  });

  return response.data;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default apiClient; 
