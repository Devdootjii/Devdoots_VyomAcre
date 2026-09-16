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

// Direct database sync for Marketplace listings
export const getFilteredRoofs = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.city && filters.city !== 'ALL') queryParams.append('city', filters.city);
  if (filters.roof_type && filters.roof_type !== 'ALL') queryParams.append('roof_type', filters.roof_type);
  if (filters.min_area) queryParams.append('min_area', filters.min_area);
  if (filters.max_area) queryParams.append('max_area', filters.max_area);

  const qs = queryParams.toString();
  // Call /api/roofs to get all submitted properties
  return api.get(qs ? `/api/roofs?${qs}` : '/api/roofs');
};

export const getScannedZones = async () => api.get('/api/zones/scanned');
export const createLeaseRequest = async (payload) => api.post('/api/lease-requests', payload);

export default api;