import axios from 'axios';
import Cookies  from 'js-cookie';
const API_URL = 'http://localhost:3000/api/users';

export const updateUserName = async (userId, newName) => {
  const response = await axios.patch(`${API_URL}/${userId}`, { username: newName },{
    headers: {
        Authorization: `Bearer ${Cookies.get('token')}`
      }
  });
  return response.data;
};

export const updateUserPassword = async (userId, currentPassword, newPassword) => {
  const response = await axios.patch(`${API_URL}/${userId}/password`, { currentPassword, newPassword },{
    headers: {
      Authorization: `Bearer ${Cookies.get('token')}`
    },
  });
  return response.data;
};

export const updateUserProfilePicture = async (userId, formData) => {
  const response = await axios.patch(`${API_URL}/${userId}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${Cookies.get('token')}`
    },
  });
  return response.data;
};