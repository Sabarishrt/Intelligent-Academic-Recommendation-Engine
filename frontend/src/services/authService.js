import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:5000/api/auth';

export const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${AUTH_URL}/login`, { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${AUTH_URL}/register`, userData);
    return response.data;
  },

  getMe: async () => {
    const response = await axios.get(`${AUTH_URL}/me`);
    return response.data;
  },
};
