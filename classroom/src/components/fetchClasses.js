import { useState, useEffect } from 'react';
import axios from 'axios';

const useAxiosFetch = (url, options) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url, options);
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("fetched")
    console.log(data);
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
};

export default useAxiosFetch;
