import axios from 'axios';
import config from '../../config/config';
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/users/register`, userData);
  return response;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/users/login`, credentials);
  return response;
};

export const verifyOTP = async (email, otp) => {
  const response = await axios.post(`${API_URL}/users/verify-otp`, { email, otp });
  return response;
};

export const resendOTP = async (email) => {
  const response = await axios.post(`${API_URL}/users/resend-otp`, { email });
  return response;
};
