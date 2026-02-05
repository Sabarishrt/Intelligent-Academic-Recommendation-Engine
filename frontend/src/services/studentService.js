import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const studentService = {
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/api/students/profile`, getAuthHeaders());
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axios.put(`${API_URL}/api/students/profile`, data, getAuthHeaders());
    return response.data;
  },

  getMarks: async () => {
    const response = await axios.get(`${API_URL}/api/students/marks`, getAuthHeaders());
    return response.data;
  },

  addMarks: async (data) => {
    const response = await axios.post(`${API_URL}/api/students/marks`, data, getAuthHeaders());
    return response.data;
  },

  getPerformance: async () => {
    const response = await axios.get(`${API_URL}/api/students/performance`, getAuthHeaders());
    return response.data;
  },

  getSkills: async () => {
    const response = await axios.get(`${API_URL}/api/students/skills`, getAuthHeaders());
    return response.data;
  },

  updateSkills: async (data) => {
    const response = await axios.put(`${API_URL}/api/students/skills`, data, getAuthHeaders());
    return response.data;
  },
};
