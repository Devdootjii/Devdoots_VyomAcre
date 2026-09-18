import axios from 'axios';

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://devdoots-vyomacre-y0gr.onrender.com';

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

  const responseData = response.data;
  const data = responseData?.data;

  const token = data?.token;
  const user = data?.user;

  if (token) {
    localStorage.setItem('vyomacre_token', token);
  }

  if (user) {
    localStorage.setItem('vyomacre_user', JSON.stringify(user));
  }

  return responseData;
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
  const response = await apiClient.get(
    '/api/roofs/owner/' + encodeURIComponent(phone)
  );

  return response.data;
};

// ============================================================
// OWNER - LEASE REQUESTS
// ============================================================

export const getOwnerLeaseRequests = async () => {
  const response = await apiClient.get('/api/lease-requests');
  return response.data;
};

export const updateLeaseRequest = async (requestId, status) => {
  const response = await apiClient.patch(
    '/api/lease-requests/' + requestId,
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
  const response = await apiClient.get('/api/roofs', {
    params: filters,
  });

  return response.data;
};

export const getScannedZones = async () => {
  const response = await apiClient.get('/api/zones/scanned');
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

export const getSeekerLeaseRequests = async () => {
  const response = await apiClient.get('/api/lease-requests/mine');
  return response.data;
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