import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "../config/config";
export const UserContext = createContext(null);

export const UserProvider = (props) => {
    const [user, setUser] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [requiresVerification, setRequiresVerification] = useState(false);
    const savedToken = Cookies.get('token');

    useEffect(() => {
        const checkAuthStatus = async () => {
            if (savedToken) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
                        headers: {
                            Authorization: `Bearer ${savedToken}`,
                        },
                    });
                    const userData = response.data;
                    setIsAuthenticated(true);
                    setUser(userData);
                    setRequiresVerification(false);
                } catch (error) {
                    console.error('Error fetching user data:', error);

                    // Check if the error is due to unverified account
                    if (error.response?.data?.requiresVerification) {
                        setRequiresVerification(true);
                    } else {
                        setIsAuthenticated(false);
                        setUser({});
                        Cookies.remove('token'); // Remove invalid token
                    }
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
        <UserContext.Provider value={{
            user,
            setUser,
            isAuthenticated,
            setIsAuthenticated,
            loading,
            requiresVerification,
            setRequiresVerification
        }}>
            {props.children}
        </UserContext.Provider>
    );
};
