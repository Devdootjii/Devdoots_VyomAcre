import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Harsh: Owner Portal Endpoints ---
export const submitRoofDetails = async (roofData) => {
  return await api.post('/api/roofs/add', roofData);
};

export const getOwnerRoofs = async (phoneNumber) => {
  return await api.get(`/api/roofs?owner_id=${phoneNumber}`);
};

// --- Ritesh: Company Marketplace & Admin Radar Endpoints ---
// Contract B: Saari listings with optional filters
export const getAllRoofs = async (params = {}) => {
  return await api.get('/api/roofs', { params });
};

// Contract C: Sirf verified listings
export const getVerifiedRoofs = async () => {
  return await api.get('/api/roofs/verified');
};

// Contract G: Day 8 Admin Radar - Scanned Zones overlay
export const getScannedZones = async () => {
  return await api.get('/api/zones/scanned');
};

// Contract D: Day 9 Lease Request POST
export const createLeaseRequest = async (payload) => {
  // Expected payload: { roof_id: string, company_name: string }
  return await api.post('/api/lease-requests', payload);
};

export default api;