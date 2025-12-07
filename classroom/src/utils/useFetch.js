import { useState, useEffect, useCallback } from "react";
import Cookies from 'js-cookie';

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  
  const fetchData = useCallback(async () => {
    try {
      const savedtoken = Cookies.get('token');
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedtoken}`,
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data;
};

export default useFetch;
