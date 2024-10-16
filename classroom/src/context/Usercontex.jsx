import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const UserContext = createContext(null);

export const UserProvider = (props) => {
  const [user, setUser] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const savedToken = Cookies.get('token');

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (savedToken) {
        try {
          const response = await axios.get('http://localhost:3000/api/users', {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });
          const userData = response.data;
          console.log(userData);
          setIsAuthenticated(true);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsAuthenticated(false);
          setUser({});
          Cookies.remove('token'); // Remove invalid token
        }
      } else {
        setIsAuthenticated(false);
        setUser({});
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [savedToken]);

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated, loading }}>
      {props.children}
    </UserContext.Provider>
  );
};
