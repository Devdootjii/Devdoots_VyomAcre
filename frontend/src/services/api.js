import axios from 'axios';

/* ============================================================
   Ek hi source of truth: LIVE backend.
   PostgreSQL database, seeded rooftops, admin accounts — sab LIVE
   backend pe hain, isliye local dev frontend bhi wahi use karta hai.
   (Local backend chahiye ho toh neeche wali line se switch kar lena.)
   ============================================================ */
const API_BASE_URL = 'https://devdoots-vyomacre-y0gr.onrender.com';
// const API_BASE_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vyomacre_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// FIX 1: loginUser / signupUser (Token exact data.data.token se)
export const signupUser = async (userData) => {
  const res = await apiClient.post('/api/auth/signup', userData);
  const result = res.data;
  const token = result?.data?.token || result?.token;
  const user = result?.data?.user || result?.user;
  if (token) localStorage.setItem('vyomacre_token', token);
  if (user) localStorage.setItem('vyomacre_user', JSON.stringify(user));
  return result;
};

export const loginUser = async (credentials) => {
  const res = await apiClient.post('/api/auth/login', credentials);
  const result = res.data;
  const token = result?.data?.token || result?.token;
  const user = result?.data?.user || result?.user;
  if (token) localStorage.setItem('vyomacre_token', token);
  if (user) localStorage.setItem('vyomacre_user', JSON.stringify(user));
  return result;
};

export const getCurrentUser = async () => {
  const res = await apiClient.get('/api/auth/me');
  return res.data;
};

// FIX 5: getOwnerRoofs (Query param hata kar Path param banaya)
export const submitRoofDetails = async (roofData) => {
  const res = await apiClient.post('/api/roofs/add', roofData);
  return res.data;
};

export const getOwnerRoofs = async (phone) => {
  const res = await apiClient.get(`/api/roofs/owner/${phone}`);
  return res.data;
};

// FIX 3: getFilteredRoofs (Direct endpoint par params)
export const getFilteredRoofs = async (filters = {}) => {
  const cleanParams = {};
  if (filters.city && filters.city !== 'ALL') cleanParams.city = filters.city;
  if (filters.roof_type && filters.roof_type !== 'ALL') cleanParams.roof_type = filters.roof_type;
  if (filters.min_area) cleanParams.min_area = filters.min_area;
  if (filters.max_area) cleanParams.max_area = filters.max_area;
  const res = await apiClient.get('/api/roofs', { params: cleanParams });
  return res.data;
};

export const getAllRoofs = async (params = {}) => {
  const res = await apiClient.get('/api/roofs', { params });
  return res.data;
};

export const getVerifiedRoofs = async () => {
  const res = await apiClient.get('/api/roofs/verified');
  return res.data;
};

// FIX 4: getScannedZones (Galat endpoint fix)
export const getScannedZones = async () => {
  const res = await apiClient.get('/api/zones/scanned');
  return res.data;
};

// FIX 2: getSeekerLeaseRequests (No Params, only /mine)
export const getSeekerLeaseRequests = async () => {
  const res = await apiClient.get('/api/lease-requests/mine');
  return res.data;
};

// Owner Inbox (No owner_id param)
export const getOwnerLeaseRequests = async () => {
  const res = await apiClient.get('/api/lease-requests');
  return res.data;
};

// Seeker Lease Dispatch
export const createLeaseRequest = async (payload) => {
  const res = await apiClient.post('/api/lease-requests', payload);
  return res.data;
};
// AI chatbot — POST /api/ai/ask (envelope: {status, data: {answer}})
export const askAI = async (question, context = 'landing') => {
  const res = await apiClient.post('/api/ai/ask', { question, context });
  return res.data;
};

// Owner accepts/rejects a lease request — PATCH /api/lease-requests/{id}
export const updateLeaseRequest = async (id, status) => {
  const res = await apiClient.patch(`/api/lease-requests/${id}`, { status });
  return res.data;
};

export default apiClient;