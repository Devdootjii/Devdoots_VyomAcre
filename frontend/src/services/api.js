import axios from 'axios';

// Auto-switch: Localhost dev uses local FastAPI, Production uses Render cloud
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://devdoots-vyomacre-y0gr.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Phase 1 Spec: Auto-attach JWT Bearer Token to all protected requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vyomacre_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 1. Auth APIs (Divyansh/Balram)
export const signupUser = async (userData) => api.post('/api/auth/signup', userData);
export const loginUser = async (credentials) => api.post('/api/auth/login', credentials);
export const getCurrentUser = async () => api.get('/api/auth/me');

// 2. Owner Portal Endpoints (Harsh)
export const submitRoofDetails = async (roofData) => api.post('/api/roofs/add', roofData);
export const getOwnerRoofs = async (phoneNumber) => api.get(`/api/roofs?owner_id=${phoneNumber}`);

// 3. Marketplace & Radar Endpoints (Ritesh - Day 8 to 16)
export const getAllRoofs = async (params = {}) => api.get('/api/roofs', { params });

// Direct fallback to all roofs so both verified and test listings show up on map
export const getVerifiedRoofs = async () => {
  try {
    const res = await api.get('/api/roofs/verified');
    if (res.data && (Array.isArray(res.data) ? res.data.length > 0 : res.data.data?.length > 0)) {
      return res;
    }
    return await api.get('/api/roofs');
  } catch (err) {
    return await api.get('/api/roofs');
  }
};

// Search & Filter API
export const getFilteredRoofs = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.city && filters.city !== 'ALL') queryParams.append('city', filters.city);
  if (filters.roof_type && filters.roof_type !== 'ALL') queryParams.append('roof_type', filters.roof_type);
  if (filters.min_area) queryParams.append('min_area', filters.min_area);
  if (filters.max_area) queryParams.append('max_area', filters.max_area);
  
  const qs = queryParams.toString();
  const endpoint = qs ? `/api/roofs?${qs}` : '/api/roofs';
  return api.get(endpoint);
};

export const getScannedZones = async () => api.get('/api/zones/scanned');
export const createLeaseRequest = async (payload) => api.post('/api/lease-requests', payload);

// 4. AI Chat Assistant (Balram)
export const askAI = async (question) => api.post('/api/ai/ask', { question });

export default api;