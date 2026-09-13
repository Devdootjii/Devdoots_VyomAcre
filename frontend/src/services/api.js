import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://devdoots-vyomacre-y0gr.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Harsh: Owner Portal Endpoints
export const submitRoofDetails = async (roofData) => {
  return await api.post('/api/roofs/add', roofData);
};

export const getOwnerRoofs = async (phoneNumber) => {
  return await api.get(`/api/roofs?owner_id=${phoneNumber}`);
};

// Ritesh: Company Marketplace & Admin Radar Endpoints
export const getAllRoofs = async (params = {}) => {
  return await api.get('/api/roofs', { params });
};

export const getVerifiedRoofs = async () => {
  return await api.get('/api/roofs/verified');
};

export const getScannedZones = async () => {
  return await api.get('/api/zones/scanned');
};

export const createLeaseRequest = async (payload) => {
  return await api.post('/api/lease-requests', payload);
};

export default api;