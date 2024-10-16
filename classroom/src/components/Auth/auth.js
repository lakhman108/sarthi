import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/users/register`, userData);
  return response;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/users/login`, credentials);
  return response;
};
