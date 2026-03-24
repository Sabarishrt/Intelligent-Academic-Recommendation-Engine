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

export const adminService = {
  getDashboard: async () => {
    // add timestamp to bust caches
    const response = await axios.get(`${API_URL}/admin/dashboard?ts=${Date.now()}`, getAuthHeaders());
    return response.data;
  },

  getAllStudents: async () => {
    const response = await axios.get(`${API_URL}/admin/students`, getAuthHeaders());
    return response.data;
  },

  getStudent: async (id) => {
    const response = await axios.get(`${API_URL}/admin/students/${id}`, getAuthHeaders());
    return response.data;
  },

  createSubject: async (data) => {
    const response = await axios.post(`${API_URL}/api/admin/subjects`, data, getAuthHeaders());
    return response.data;
  },

  getAllSubjects: async () => {
    const response = await axios.get(`${API_URL}/api/admin/subjects`, getAuthHeaders());
    return response.data;
  },

  updateSubject: async (id, data) => {
    const response = await axios.put(`${API_URL}/api/admin/subjects/${id}`, data, getAuthHeaders());
    return response.data;
  },

  deleteSubject: async (id) => {
    const response = await axios.delete(`${API_URL}/api/admin/subjects/${id}`, getAuthHeaders());
    return response.data;
  },

  getAnalytics: async () => {
    const response = await axios.get(`${API_URL}/api/admin/analytics`, getAuthHeaders());
    return response.data;
  },
  getStudentsByYearAndDepartment: async (year, department) => {
  const response = await axios.get(`${API_URL}/api/admin/students-filter?year=${year || ''}&department=${department || ''}`, getAuthHeaders());
  return response.data;
},
};
