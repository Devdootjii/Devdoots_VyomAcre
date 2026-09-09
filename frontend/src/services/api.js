import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Contract A: Roof Owner Onboarding (Aryan)
export const submitRoofDetails = async (roofData) => {
  return await apiClient.post('/api/roofs/add', roofData);
};

// Contract C: Fetch All Roofs for Map (Ritesh - Day 3 Update)
// Balram is developing GET /api/roofs endpoint
export const getAllRoofs = async () => {
  return await apiClient.get('/api/roofs');
};