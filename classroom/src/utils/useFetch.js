import { useState, useEffect, useCallback } from "react";
import Cookies from 'js-cookie';
const useFetch = (url, options) => {
  const [data, setData] = useState(null);
 const savedtoken=Cookies.get('token');
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(url, options,{
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedtoken}`,
        },
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null); // Set data to null on error
    }
  }, [url, JSON.stringify(options)]); // Stringify options to avoid unnecessary re-fetching

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data; // Return the data directly
};

export default useFetch;
