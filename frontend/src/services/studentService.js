import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    const response = await axios.get(`${API_URL}/students/profile`, getAuthHeaders());
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axios.put(`${API_URL}/students/profile`, data, getAuthHeaders());
    return response.data;
  },

  getMarks: async () => {
    const response = await axios.get(`${API_URL}/students/marks`, getAuthHeaders());
    return response.data;
  },

  addMarks: async (data) => {
    const response = await axios.post(`${API_URL}/students/marks`, data, getAuthHeaders());
    return response.data;
  },

  getPerformance: async () => {
    const response = await axios.get(`${API_URL}/students/performance`, getAuthHeaders());
    return response.data;
  },

  getSkills: async () => {
    const response = await axios.get(`${API_URL}/students/skills`, getAuthHeaders());
    return response.data;
  },

  updateSkills: async (data) => {
    const response = await axios.put(`${API_URL}/students/skills`, data, getAuthHeaders());
    return response.data;
  },

  // New course recommendation method
  getCourseRecommendations: async (recommendationData) => {
    const response = await axios.post(`${API_URL}/recommendations/courses`, recommendationData, getAuthHeaders());
    return response.data;
  },
};
