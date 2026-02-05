import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_URL;

export const authService = {
  login: async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  },

  getMe: async () => {
    const response = await axios.get('/api/auth/me');
    return response.data;
  },
};
