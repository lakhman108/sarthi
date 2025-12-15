import { useState, useEffect } from 'react';

import axios from 'axios';

const useAxiosFetch = (url, options) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (customUrl) => {
        setLoading(true);
        // console.log("Fetching data...");
        try {
            const response = await axios.get(customUrl || url, options);
            setData(response.data);
            // console.log("Data fetched:", response.data);
        } catch (err) {
            setError(err);
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // console.log("Fetching data on mount or URL change");
        fetchData();
    }, [url]);

    return { data, loading, error, refetch: fetchData }; // ensure refetch is returned
};

export default useAxiosFetch;
