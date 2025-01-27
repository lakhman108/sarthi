import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../config/config';
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export const fetchComments = async (lectureId) => {
    // console.log(lectureId)
  const response = await axios.get(`${API_URL}/lectures/${lectureId}/comments`,{
    headers: {
      Authorization: `Bearer ${Cookies.get('token')}`
    },
  });
  return response.data;
};

export const postComment = async (lectureId, text) => {


  const response = await axios.post(`${API_URL}/lectures/${lectureId}/comments`, {text : text},
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`
      },
    }
  );
  return response.data;
};

export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
