import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const churchService = {
  // Get all churches
  getChurches: async (skip = 0, limit = 100) => {
    const response = await api.get(`/churches?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get single church
  getChurch: async (id) => {
    const response = await api.get(`/churches/${id}`);
    return response.data;
  },

  // Create new church
  createChurch: async (churchData) => {
    const response = await api.post('/churches', churchData);
    return response.data;
  },

  // Update church
  updateChurch: async (id, churchData) => {
    const response = await api.put(`/churches/${id}`, churchData);
    return response.data;
  },

  // Delete church
  deleteChurch: async (id) => {
    const response = await api.delete(`/churches/${id}`);
    return response.data;
  },

  // Search churches by text
  searchChurches: async (query, limit = 50) => {
    const response = await api.get(`/churches/search/text?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },

  // Find nearby churches
  findNearbyChurches: async (lat, lng, radius = 10, limit = 50) => {
    const response = await api.get(`/churches/search/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`);
    return response.data;
  },
};

export default api;
