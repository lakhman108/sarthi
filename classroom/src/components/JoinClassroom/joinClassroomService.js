import axios from 'axios';
import config from '../../config/config';
const API_URL = `${process.env.REACT_APP_API_URL}/api/enrollments`;

export const joinClassroom = async (userId, classCode) => {
  try {
    const response = await axios.post(`${API_URL}`, {
      studentId: userId,
      classCode: classCode
    });
    return response.data;
  } catch (error) {
    console.error('Error joining classroom:', error);
    throw error;
  }
};
