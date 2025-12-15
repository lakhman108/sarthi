import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import config from '../config/config';


export const handleNoteSave = async (id,note) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/enrollments/${id}/notes`, { "notes":note }, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      toast.success('Note saved successfully',{
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
        toast.error('Error saving note',{
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
      console.error("Error saving note:", error);

    }
  };
