import axios from 'axios';

const API_URL = 'http://localhost:3000/api/enrollments';

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
