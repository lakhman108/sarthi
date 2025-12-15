import Cookies from 'js-cookie';
export const fetchCourses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/courses`,{
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  };
