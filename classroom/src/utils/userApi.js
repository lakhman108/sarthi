import axios from 'axios';
import Cookies  from 'js-cookie';
const API_URL = 'https://superb-insight-production.up.railway.app/api/users';

export const updateUserName = async (userId, newName) => {
  const response = await axios.patch(`${API_URL}/${userId}`, { username: newName },{
    headers: {
        Authorization: `Bearer ${Cookies.get('token')}`
      }
  });
  return response;
};

export const updateUserPassword = async (userId, currentPassword, newPassword) => {
  const response = await axios.patch(`${API_URL}/${userId}/password`, { currentPassword, newPassword },{
    headers: {
      Authorization: `Bearer ${Cookies.get('token')}`
    },
  });
  return response.data;
};

export const updateUserProfilePicture = async (formData) => {
  const response = await axios.post(`${API_URL}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${Cookies.get('token')}`
    },
  });
  return response.data;
};
