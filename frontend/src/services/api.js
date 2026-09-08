import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Contract A: Roof Owner Onboarding
export const submitRoofDetails = async (roofData) => {
  return await apiClient.post('/api/roofs/add', roofData);
};

// Contract C: Verified Roofs Feed
export const getVerifiedRoofs = async () => {
  return await apiClient.get('/api/roofs/verified');
};