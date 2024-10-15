import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; 

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/users/register`, userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/users/login`, credentials);
  return response.data;
};

export const getStudentProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/users/student-profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getTeacherProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/users/teacher-profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
