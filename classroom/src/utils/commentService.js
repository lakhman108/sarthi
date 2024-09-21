import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const fetchComments = async (lectureId) => {
    console.log(lectureId)
  const response = await axios.get(`${API_URL}/lectures/${lectureId}/comments`);
  return response.data;
};

export const postComment = async (lectureId, text) => {


  const response = await axios.post(`${API_URL}/lectures/${lectureId}/comments`, {
   text : text
   });
  return response.data;
};

export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
